-- ==========================================
-- Migration 00007: Seed Mock Financial Data
-- ==========================================
-- This script generates 2 years of mock data for the financial management system.
-- It inserts flats, monthly cycles, payments, and expenditures.
-- Triggers created in 00006 will automatically calculate the rollups!

DO $$
DECLARE
  v_flat_ids UUID[] := '{}';
  v_flat_id UUID;
  v_m_id UUID;
  v_month INT;
  v_year INT;
  v_category TEXT;
  v_categories TEXT[] := ARRAY['Security Salary', 'Housekeeping Salary', 'Electricity Bill', 'Water Bill', 'Lift Maintenance', 'Miscellaneous'];
BEGIN
  -- 0. Wipe existing conflicting financial data
  TRUNCATE public.monthly_maintenance CASCADE;
  TRUNCATE public.flats CASCADE;

  -- 1. Create Mock Flats (Tower A & Tower B, 10 flats total)
  FOR t IN 1..2 LOOP
    FOR f IN 1..5 LOOP
      INSERT INTO public.flats (flat_number, tower, monthly_maintenance_fee, is_active)
      VALUES ((f * 100 + t)::TEXT, CHR(64 + t), 3500, true)
      RETURNING id INTO v_flat_id;
      v_flat_ids := array_append(v_flat_ids, v_flat_id);
    END LOOP;
  END LOOP;

  -- 2. Generate 24 Months of Data (from July 2024 to June 2026)
  v_year := 2024;
  v_month := 7;
  
  FOR i IN 1..24 LOOP
    -- Initialize the monthly cycle or fetch existing one
    SELECT id INTO v_m_id FROM public.monthly_maintenance WHERE month = v_month AND year = v_year;
    
    IF NOT FOUND THEN
      INSERT INTO public.monthly_maintenance (month, year)
      VALUES (v_month, v_year)
      RETURNING id INTO v_m_id;
    END IF;

    -- Insert Maintenance Payments for this month
    -- Simulating that about 90% of flats pay on time.
    FOREACH v_flat_id IN ARRAY v_flat_ids LOOP
      -- Ensure specifically two flats are pending in the current (last) month
      IF i = 24 AND (v_flat_id = v_flat_ids[4] OR v_flat_id = v_flat_ids[8]) THEN
        CONTINUE;
      END IF;

      IF random() > 0.1 THEN
        INSERT INTO public.maintenance_payments (maintenance_id, flat_id, amount, payment_date, status, payment_mode)
        VALUES (
          v_m_id, 
          v_flat_id, 
          3500, 
          make_date(v_year, v_month, (random() * 10 + 1)::INT), 
          'Paid', 
          'UPI'
        );
      END IF;
    END LOOP;

    -- Insert Expenditures for this month
    -- Simulating 4 to 6 random expenses per month
    FOR j IN 1..((random() * 2 + 4)::INT) LOOP
      v_category := v_categories[(random() * 5 + 1)::INT];
      INSERT INTO public.expenditures (maintenance_id, expense_date, category, amount, vendor_name, description, payment_mode)
      VALUES (
        v_m_id, 
        make_date(v_year, v_month, (random() * 20 + 1)::INT), 
        v_category, 
        (random() * 5000 + 1000)::INT, 
        'Mock Vendor ' || CHR((random() * 25 + 65)::INT), 
        'Regular monthly expense for ' || v_category,
        'Bank Transfer'
      );
    END LOOP;

    -- Increment Month and Year
    v_month := v_month + 1;
    IF v_month > 12 THEN
      v_month := 1;
      v_year := v_year + 1;
    END IF;
  END LOOP;
END $$;
