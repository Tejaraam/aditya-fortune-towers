-- ==========================================
-- Safe Seed Script
-- ==========================================
-- This script looks up the REAL users you created via the UI
-- and binds the flats and payment history to them safely.

DO $$
DECLARE
  v_john_id UUID;
  v_smith_id UUID;
  v_admin_id UUID;
  
  v_john_flat_1 UUID := 'a1111111-1111-1111-1111-111111111111';
  v_john_flat_2 UUID := 'a1111111-1111-1111-1111-111111111112';
  v_smith_flat UUID := 'b2222222-2222-2222-2222-222222222222';

  v_m_id UUID;
  v_month INT;
  v_year INT;
  v_amount DECIMAL := 3500;
BEGIN

  -- 1. Grab the REAL UUIDs generated securely by Supabase Auth
  SELECT id INTO v_john_id FROM auth.users WHERE email = 'john@gmail.com' LIMIT 1;
  SELECT id INTO v_smith_id FROM auth.users WHERE email = 'smith@gmail.com' LIMIT 1;
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin_demo@gmail.com' LIMIT 1;

  -- Ensure they exist
  IF v_john_id IS NULL OR v_smith_id IS NULL OR v_admin_id IS NULL THEN
     RAISE EXCEPTION 'Users not found! Please register john@gmail.com, smith@gmail.com, and admin_demo@gmail.com using the "Join AFTOWA" button on your website first.';
  END IF;

  -- 2. Update their automatically generated profiles
  UPDATE public.profiles SET role = 'Member', tower = 'Tower A', flat_number = '101' WHERE id = v_john_id;
  UPDATE public.profiles SET role = 'Member', tower = 'Tower B', flat_number = '101' WHERE id = v_smith_id;
  UPDATE public.profiles SET role = 'Admin' WHERE id = v_admin_id;

  -- 3. Cleanup these SPECIFIC flats/payments if they exist to prevent duplicates
  DELETE FROM public.maintenance_payments WHERE flat_id IN (
    v_john_flat_1, v_john_flat_2, v_smith_flat
  ) OR flat_id IN (
    SELECT id FROM public.flats WHERE (tower IN ('A', 'Tower A') AND flat_number IN ('101', '102')) OR (tower IN ('B', 'Tower B') AND flat_number = '101')
  );
  
  DELETE FROM public.flats WHERE id IN (
    v_john_flat_1, v_john_flat_2, v_smith_flat
  ) OR (tower IN ('A', 'Tower A') AND flat_number IN ('101', '102')) OR (tower IN ('B', 'Tower B') AND flat_number = '101');

  -- 4. Create specific Flats tied to the real users
  INSERT INTO public.flats (id, flat_number, tower, monthly_maintenance_fee, is_active, owner_profile_id)
  VALUES 
    (v_john_flat_1, '101', 'Tower A', v_amount, true, v_john_id),
    (v_john_flat_2, '102', 'Tower A', v_amount, true, v_john_id),
    (v_smith_flat, '101', 'Tower B', v_amount, true, v_smith_id);

  -- 5. Generate 13 Months of mathematical Data for these flats
  v_year := extract(year from current_date)::INT - 1;
  v_month := extract(month from current_date)::INT;
  
  FOR i IN 1..13 LOOP
    -- Initialize or fetch the monthly cycle
    SELECT id INTO v_m_id FROM public.monthly_maintenance WHERE month = v_month AND year = v_year LIMIT 1;
    IF NOT FOUND THEN
      INSERT INTO public.monthly_maintenance (month, year) VALUES (v_month, v_year) RETURNING id INTO v_m_id;
    END IF;

    -- John always pays on time for both flats!
    INSERT INTO public.maintenance_payments (
        maintenance_id, flat_id, amount, payment_date, status, payment_mode, 
        receipt_number, billing_month, billing_year, transaction_reference
    )
    VALUES (
      v_m_id, v_john_flat_1, v_amount, make_date(v_year, v_month, 5), 'Paid', 'UPI',
      'REC-' || v_year || '-' || lpad(v_month::text, 2, '0') || '-A101', v_month, v_year, 'TXN-A101-' || v_month || v_year
    ),
    (
      v_m_id, v_john_flat_2, v_amount, make_date(v_year, v_month, 5), 'Paid', 'Bank Transfer',
      'REC-' || v_year || '-' || lpad(v_month::text, 2, '0') || '-A102', v_month, v_year, 'TXN-A102-' || v_month || v_year
    );

    -- Smith pays for the first 11 months, but misses the last 2 months!
    IF i <= 11 THEN
      INSERT INTO public.maintenance_payments (
          maintenance_id, flat_id, amount, payment_date, status, payment_mode, 
          receipt_number, billing_month, billing_year, transaction_reference
      )
      VALUES (
        v_m_id, v_smith_flat, v_amount, make_date(v_year, v_month, 10), 'Paid', 'UPI',
        'REC-' || v_year || '-' || lpad(v_month::text, 2, '0') || '-B101', v_month, v_year, 'TXN-B101-' || v_month || v_year
      );
    END IF;

    v_month := v_month + 1;
    IF v_month > 12 THEN
      v_month := 1;
      v_year := v_year + 1;
    END IF;
  END LOOP;
END $$;
