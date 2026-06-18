-- ==========================================
-- Migration 00009: Better Mock Financial Data
-- ==========================================
-- This wipes the old mock data and recreates it with explicit owner bindings
-- and new receipt fields so the user sees proper ledger data.

DO $$
DECLARE
  v_flat_ids UUID[] := '{}';
  v_flat_id UUID;
  v_m_id UUID;
  v_month INT;
  v_year INT;
  v_category TEXT;
  v_categories TEXT[] := ARRAY['Security Salary', 'Housekeeping Salary', 'Electricity Bill', 'Water Bill', 'Lift Maintenance', 'Miscellaneous'];
  v_profiles UUID[];
  v_owner_id UUID;
  v_index INT := 1;
BEGIN
  -- 0. Wipe existing conflicting financial data
  TRUNCATE public.receipts CASCADE;
  TRUNCATE public.maintenance_payments CASCADE;
  TRUNCATE public.monthly_maintenance CASCADE;
  TRUNCATE public.expenditures CASCADE;
  TRUNCATE public.flats CASCADE;

  -- Get all available profile IDs (so we can assign flats to actual users!)
  SELECT array_agg(id) INTO v_profiles FROM public.profiles;

  -- 1. Create Mock Flats (Tower A & Tower B, 10 flats total)
  FOR t IN 1..2 LOOP
    FOR f IN 1..5 LOOP
      
      -- Assign an owner if we have profiles available
      v_owner_id := NULL;
      IF array_length(v_profiles, 1) > 0 THEN
        v_owner_id := v_profiles[((v_index - 1) % array_length(v_profiles, 1)) + 1];
      END IF;

      INSERT INTO public.flats (flat_number, tower, monthly_maintenance_fee, is_active, owner_profile_id)
      VALUES ((f * 100 + t)::TEXT, CHR(64 + t), 3500, true, v_owner_id)
      RETURNING id INTO v_flat_id;
      
      v_flat_ids := array_append(v_flat_ids, v_flat_id);
      v_index := v_index + 1;
    END LOOP;
  END LOOP;

  -- 2. Generate 12 Months of Data (Up to current month)
  v_year := extract(year from current_date)::INT - 1;
  v_month := extract(month from current_date)::INT;
  
  FOR i IN 1..13 LOOP
    -- Initialize the monthly cycle
    INSERT INTO public.monthly_maintenance (month, year)
    VALUES (v_month, v_year)
    RETURNING id INTO v_m_id;

    -- Insert Maintenance Payments for this month
    FOREACH v_flat_id IN ARRAY v_flat_ids LOOP
      -- Make a flat "pending" for the current month if i=13 (the latest month)
      IF i = 13 AND (v_flat_id = v_flat_ids[1] OR v_flat_id = v_flat_ids[2]) THEN
        CONTINUE;
      END IF;

      IF random() > 0.05 THEN
        INSERT INTO public.maintenance_payments (
            maintenance_id, flat_id, amount, payment_date, status, payment_mode, 
            receipt_number, billing_month, billing_year, transaction_reference
        )
        VALUES (
          v_m_id, 
          v_flat_id, 
          3500, 
          make_date(v_year, v_month, (random() * 10 + 1)::INT), 
          'Paid', 
          'UPI',
          'REC-' || v_year || '-' || lpad(v_month::text, 2, '0') || '-' || substr(md5(random()::text), 1, 6),
          v_month,
          v_year,
          'TXN' || floor(random() * 1000000000)
        );
      END IF;
    END LOOP;

    -- Insert Expenditures
    FOR j IN 1..3 LOOP
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
