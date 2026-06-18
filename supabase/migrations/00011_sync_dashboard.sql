-- ==========================================
-- Sync Dashboard Totals
-- ==========================================
-- This script safely recalculates the `expected_collection` and 
-- `collected_amount` for all months to perfectly match the 
-- current number of active flats in the database.

DO $$
DECLARE
    m RECORD;
    v_total_expected NUMERIC;
    v_total_collected NUMERIC;
BEGIN
    -- 1. Get the true expected collection from all currently active flats (e.g. 12 flats * 3500 = 42,000)
    SELECT COALESCE(SUM(monthly_maintenance_fee), 0) INTO v_total_expected 
    FROM public.flats WHERE is_active = TRUE;

    -- 2. Loop through every month cycle and sync its numbers
    FOR m IN SELECT * FROM public.monthly_maintenance LOOP
        
        -- Recalculate exactly how much was paid this month
        SELECT COALESCE(SUM(amount), 0) INTO v_total_collected 
        FROM public.maintenance_payments 
        WHERE maintenance_id = m.id AND status IN ('Paid', 'Partially Paid', 'Advance Paid');

        -- Update the month cycle
        UPDATE public.monthly_maintenance
        SET expected_collection = v_total_expected,
            collected_amount = v_total_collected,
            pending_amount = GREATEST(v_total_expected - v_total_collected, 0)
        WHERE id = m.id;
        
    END LOOP;
END $$;
