-- ==========================================
-- Migration 00010: Explicit Test Users & Data
-- ==========================================
-- This script safely inserts known test users WITHOUT DELETING existing users.
-- It creates specific flats and consistent payment histories for them.
-- You can log in with:
-- 1. john@gmail.com / user123 (Resident with 2 fully paid flats)
-- 2. smith@gmail.com / user123 (Resident with 1 flat, pending dues)
-- 3. admin_demo@gmail.com / user123 (Admin user)

DO $$
DECLARE
  v_john_id UUID := '11111111-1111-1111-1111-111111111111';
  v_smith_id UUID := '22222222-2222-2222-2222-222222222222';
  v_admin_id UUID := '33333333-3333-3333-3333-333333333333';
  
  v_john_flat_1 UUID := 'a1111111-1111-1111-1111-111111111111';
  v_john_flat_2 UUID := 'a1111111-1111-1111-1111-111111111112';
  v_smith_flat UUID := 'b2222222-2222-2222-2222-222222222222';

  v_m_id UUID;
  v_month INT;
  v_year INT;
  v_amount DECIMAL := 3500;
BEGIN

  -- 1. Create Users in auth.users if they don't exist
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
  VALUES 
    (v_john_id, '00000000-0000-0000-0000-000000000000', 'john@gmail.com', crypt('user123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"John Doe"}', now(), now(), 'authenticated', 'authenticated'),
    (v_smith_id, '00000000-0000-0000-0000-000000000000', 'smith@gmail.com', crypt('user123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Smith Reddy"}', now(), now(), 'authenticated', 'authenticated'),
    (v_admin_id, '00000000-0000-0000-0000-000000000000', 'admin_demo@gmail.com', crypt('user123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin User"}', now(), now(), 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;

  -- 1b. Create the identities required by Supabase Auth (GoTrue)
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), v_john_id, v_john_id::text, format('{"sub":"%s","email":"%s"}', v_john_id::text, 'john@gmail.com')::jsonb, 'email', now(), now(), now()),
    (gen_random_uuid(), v_smith_id, v_smith_id::text, format('{"sub":"%s","email":"%s"}', v_smith_id::text, 'smith@gmail.com')::jsonb, 'email', now(), now(), now()),
    (gen_random_uuid(), v_admin_id, v_admin_id::text, format('{"sub":"%s","email":"%s"}', v_admin_id::text, 'admin_demo@gmail.com')::jsonb, 'email', now(), now(), now())
  ON CONFLICT DO NOTHING;
  
  -- The trigger automatically creates profiles, let's update them
  UPDATE public.profiles SET role = 'Member', tower = 'Tower A', flat_number = '101' WHERE id = v_john_id;
  UPDATE public.profiles SET role = 'Member', tower = 'Tower B', flat_number = '101' WHERE id = v_smith_id;
  UPDATE public.profiles SET role = 'Admin' WHERE id = v_admin_id;

  -- 2. Cleanup these SPECIFIC flats/payments if they exist (allows safe reruns)
  -- Delete by BOTH specific IDs AND tower/flat_number (handling both 'A' and 'Tower A' formats) to guarantee no collisions
  DELETE FROM public.maintenance_payments WHERE flat_id IN (
    v_john_flat_1, v_john_flat_2, v_smith_flat
  ) OR flat_id IN (
    SELECT id FROM public.flats WHERE (tower IN ('A', 'Tower A') AND flat_number IN ('101', '102')) OR (tower IN ('B', 'Tower B') AND flat_number = '101')
  );
  
  DELETE FROM public.flats WHERE id IN (
    v_john_flat_1, v_john_flat_2, v_smith_flat
  ) OR (tower IN ('A', 'Tower A') AND flat_number IN ('101', '102')) OR (tower IN ('B', 'Tower B') AND flat_number = '101');

  -- 3. Create specific Flats
  INSERT INTO public.flats (id, flat_number, tower, monthly_maintenance_fee, is_active, owner_profile_id)
  VALUES 
    (v_john_flat_1, '101', 'Tower A', v_amount, true, v_john_id),
    (v_john_flat_2, '102', 'Tower A', v_amount, true, v_john_id),
    (v_smith_flat, '101', 'Tower B', v_amount, true, v_smith_id);

  -- 4. Generate 13 Months of Data for these flats
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
