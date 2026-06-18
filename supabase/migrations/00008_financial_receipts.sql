-- ==========================================
-- Migration 00008: Receipt Management & Pending Dues
-- ==========================================

-- 1. Extend maintenance_payments table
-- Drop the unique constraint to allow partial multiple payments per month
ALTER TABLE public.maintenance_payments DROP CONSTRAINT IF EXISTS maintenance_payments_maintenance_id_flat_id_key;

-- Drop the old status check constraint and add the new one
ALTER TABLE public.maintenance_payments DROP CONSTRAINT IF EXISTS maintenance_payments_status_check;
ALTER TABLE public.maintenance_payments ADD CONSTRAINT maintenance_payments_status_check CHECK (status IN ('Paid', 'Partially Paid', 'Pending', 'Advance Paid'));

-- Add new columns
ALTER TABLE public.maintenance_payments
ADD COLUMN IF NOT EXISTS receipt_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS billing_month INTEGER,
ADD COLUMN IF NOT EXISTS billing_year INTEGER,
ADD COLUMN IF NOT EXISTS transaction_reference TEXT,
ADD COLUMN IF NOT EXISTS collected_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS remarks TEXT,
ADD COLUMN IF NOT EXISTS generated_receipt_url TEXT;

-- 2. Create receipts table
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES public.maintenance_payments(id) ON DELETE CASCADE,
  receipt_number TEXT UNIQUE NOT NULL,
  receipt_pdf_url TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on receipts
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- Receipts viewable by members (who own the flat) or admins
CREATE POLICY "Receipts viewable by flat owners" ON public.receipts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.maintenance_payments mp
    JOIN public.flats f ON f.id = mp.flat_id
    WHERE mp.id = receipts.payment_id AND (f.owner_profile_id = auth.uid() OR public.is_committee_or_admin())
  )
);
CREATE POLICY "Receipts managed by admin" ON public.receipts FOR ALL USING (public.is_committee_or_admin());


-- 3. Create view for pending dues calculation
-- This view calculates the total billed, total paid, pending dues, and advance paid for each flat.
CREATE OR REPLACE VIEW public.vw_flat_dues_summary AS
WITH TotalBilled AS (
  SELECT 
    f.id AS flat_id,
    f.flat_number,
    f.tower,
    f.monthly_maintenance_fee,
    (SELECT COUNT(*) FROM public.monthly_maintenance) AS total_months_initialized,
    ((SELECT COUNT(*) FROM public.monthly_maintenance) * f.monthly_maintenance_fee) AS total_billed_amount
  FROM public.flats f
  WHERE f.is_active = TRUE
),
TotalPaid AS (
  SELECT 
    flat_id,
    COALESCE(SUM(amount), 0) AS total_paid_amount
  FROM public.maintenance_payments
  WHERE status IN ('Paid', 'Partially Paid', 'Advance Paid')
  GROUP BY flat_id
)
SELECT 
  b.flat_id,
  b.flat_number,
  b.tower,
  b.monthly_maintenance_fee AS current_month_charge,
  b.total_months_initialized,
  b.total_billed_amount,
  COALESCE(p.total_paid_amount, 0) AS total_paid_amount,
  GREATEST(b.total_billed_amount - COALESCE(p.total_paid_amount, 0), 0) AS pending_dues,
  GREATEST(COALESCE(p.total_paid_amount, 0) - b.total_billed_amount, 0) AS advance_paid
FROM TotalBilled b
LEFT JOIN TotalPaid p ON b.flat_id = p.flat_id;

-- 4. Update the rollup_payments_to_month function to handle the new status strings
CREATE OR REPLACE FUNCTION public.rollup_payments_to_month()
RETURNS TRIGGER AS $$
DECLARE
    m_id UUID;
    total_col NUMERIC;
BEGIN
    IF TG_OP = 'DELETE' THEN
        m_id := OLD.maintenance_id;
    ELSE
        m_id := NEW.maintenance_id;
    END IF;

    -- Sum all 'Paid', 'Partially Paid', or 'Advance Paid' payments for this month
    SELECT COALESCE(SUM(amount), 0) INTO total_col 
    FROM public.maintenance_payments 
    WHERE maintenance_id = m_id AND status IN ('Paid', 'Partially Paid', 'Advance Paid');

    UPDATE public.monthly_maintenance 
    SET collected_amount = total_col 
    WHERE id = m_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
