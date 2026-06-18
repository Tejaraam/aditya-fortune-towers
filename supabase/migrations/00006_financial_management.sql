-- ==========================================
-- Migration 00006: Advanced Financial Management System
-- ==========================================

-- 1. Flats Master Data
CREATE TABLE IF NOT EXISTS public.flats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flat_number TEXT NOT NULL,
  tower TEXT NOT NULL,
  owner_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  monthly_maintenance_fee NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tower, flat_number)
);

-- 2. Monthly Maintenance Cycle
CREATE TABLE IF NOT EXISTS public.monthly_maintenance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  opening_balance NUMERIC DEFAULT 0,
  expected_collection NUMERIC DEFAULT 0,
  collected_amount NUMERIC DEFAULT 0,
  pending_amount NUMERIC DEFAULT 0,
  total_expenditure NUMERIC DEFAULT 0,
  closing_balance NUMERIC DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month, year)
);

-- 3. Payment Tracking
CREATE TABLE IF NOT EXISTS public.maintenance_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  maintenance_id UUID REFERENCES public.monthly_maintenance(id) ON DELETE CASCADE,
  flat_id UUID REFERENCES public.flats(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Paid', 'Partial', 'Pending')),
  payment_mode TEXT,
  receipt_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(maintenance_id, flat_id)
);

-- 4. Expenditure Management
CREATE TABLE IF NOT EXISTS public.expenditures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  maintenance_id UUID REFERENCES public.monthly_maintenance(id) ON DELETE CASCADE,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  vendor_name TEXT,
  payment_mode TEXT,
  receipt_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Audit Trail
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- Triggers and Functions for Automatic Calculations
-- ==========================================

-- Function to handle monthly_maintenance calculation logic (pending_amount, closing_balance)
CREATE OR REPLACE FUNCTION update_monthly_maintenance_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- This trigger executes BEFORE INSERT or UPDATE on monthly_maintenance
    NEW.pending_amount = NEW.expected_collection - NEW.collected_amount;
    NEW.closing_balance = NEW.opening_balance + NEW.collected_amount - NEW.total_expenditure;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_monthly_maintenance_totals
BEFORE INSERT OR UPDATE ON public.monthly_maintenance
FOR EACH ROW EXECUTE FUNCTION update_monthly_maintenance_totals();

-- Function to auto-populate expected_collection and opening_balance when a new month is created
CREATE OR REPLACE FUNCTION initialize_new_month()
RETURNS TRIGGER AS $$
DECLARE
    prev_closing NUMERIC;
    total_expected NUMERIC;
BEGIN
    -- 1. Calculate Expected Collection from active flats
    SELECT COALESCE(SUM(monthly_maintenance_fee), 0) INTO total_expected 
    FROM public.flats WHERE is_active = TRUE;
    NEW.expected_collection = total_expected;

    -- 2. Fetch Previous Month's Closing Balance
    -- Find the chronologically preceding month (ignoring day)
    SELECT closing_balance INTO prev_closing
    FROM public.monthly_maintenance
    WHERE (year < NEW.year) OR (year = NEW.year AND month < NEW.month)
    ORDER BY year DESC, month DESC
    LIMIT 1;

    NEW.opening_balance = COALESCE(prev_closing, 0);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_initialize_new_month
BEFORE INSERT ON public.monthly_maintenance
FOR EACH ROW EXECUTE FUNCTION initialize_new_month();

-- Function to roll up collected amount from payments to monthly_maintenance
CREATE OR REPLACE FUNCTION rollup_payments_to_month()
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

    -- Sum all 'Paid' or 'Partial' payments for this month
    SELECT COALESCE(SUM(amount), 0) INTO total_col 
    FROM public.maintenance_payments 
    WHERE maintenance_id = m_id AND status IN ('Paid', 'Partial');

    UPDATE public.monthly_maintenance 
    SET collected_amount = total_col 
    WHERE id = m_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rollup_payments_to_month
AFTER INSERT OR UPDATE OR DELETE ON public.maintenance_payments
FOR EACH ROW EXECUTE FUNCTION rollup_payments_to_month();

-- Function to roll up expenditures to monthly_maintenance
CREATE OR REPLACE FUNCTION rollup_expenditures_to_month()
RETURNS TRIGGER AS $$
DECLARE
    m_id UUID;
    total_exp NUMERIC;
BEGIN
    IF TG_OP = 'DELETE' THEN
        m_id := OLD.maintenance_id;
    ELSE
        m_id := NEW.maintenance_id;
    END IF;

    SELECT COALESCE(SUM(amount), 0) INTO total_exp 
    FROM public.expenditures 
    WHERE maintenance_id = m_id;

    UPDATE public.monthly_maintenance 
    SET total_expenditure = total_exp 
    WHERE id = m_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rollup_expenditures_to_month
AFTER INSERT OR UPDATE OR DELETE ON public.expenditures
FOR EACH ROW EXECUTE FUNCTION rollup_expenditures_to_month();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all new tables
ALTER TABLE public.flats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenditures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Flats: Members can view, Admins/Committee can manage
CREATE POLICY "Flats viewable by members" ON public.flats FOR SELECT USING (public.is_member_or_above());
CREATE POLICY "Flats managed by committee" ON public.flats FOR ALL USING (public.is_committee_or_admin());

-- Monthly Maintenance: Members can view, Admins/Committee can manage
CREATE POLICY "Monthly viewable by members" ON public.monthly_maintenance FOR SELECT USING (public.is_member_or_above());
CREATE POLICY "Monthly managed by committee" ON public.monthly_maintenance FOR ALL USING (public.is_committee_or_admin());

-- Maintenance Payments: Members can view, Admins/Committee can manage
CREATE POLICY "Payments viewable by members" ON public.maintenance_payments FOR SELECT USING (public.is_member_or_above());
CREATE POLICY "Payments managed by committee" ON public.maintenance_payments FOR ALL USING (public.is_committee_or_admin());

-- Expenditures: Members can view, Admins/Committee can manage
CREATE POLICY "Expenditures viewable by members" ON public.expenditures FOR SELECT USING (public.is_member_or_above());
CREATE POLICY "Expenditures managed by committee" ON public.expenditures FOR ALL USING (public.is_committee_or_admin());

-- Audit Logs: Only Admins and Committee can view. Cannot be modified directly by app users, only by triggers/admin.
CREATE POLICY "Audit logs viewable by committee" ON public.audit_logs FOR SELECT USING (public.is_committee_or_admin());
CREATE POLICY "Audit logs insertable by committee" ON public.audit_logs FOR INSERT WITH CHECK (public.is_committee_or_admin());

-- Recreate indexing for performance
CREATE INDEX IF NOT EXISTS idx_payments_maintenance_id ON public.maintenance_payments(maintenance_id);
CREATE INDEX IF NOT EXISTS idx_expenditures_maintenance_id ON public.expenditures(maintenance_id);
CREATE INDEX IF NOT EXISTS idx_flats_owner_profile_id ON public.flats(owner_profile_id);
