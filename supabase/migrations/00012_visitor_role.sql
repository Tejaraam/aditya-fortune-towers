-- Update the trigger function to assign 'Visitor' instead of 'Member' by default
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, tower, flat_number, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'tower', 'Unassigned'),
    COALESCE(new.raw_user_meta_data->>'flat_number', 'Unassigned'),
    'Visitor'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
