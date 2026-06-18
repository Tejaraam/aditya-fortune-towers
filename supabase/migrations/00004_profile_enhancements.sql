-- ==========================================
-- Migration 00004: Profile Enhancements
-- ==========================================

-- 1. Alter the profiles table to add new columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS marriage_anniversary DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS occupation TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS profile_visibility BOOLEAN DEFAULT TRUE;

-- 2. committee_role is already nullable, but we just want to mark it as legacy conceptually.
-- No schema change required for committee_role since it's already optional.

-- 3. Update existing RLS policies for profiles if necessary
-- The existing policy "Users update own profile, Admins update any" already covers the new columns
-- since it grants UPDATE on the whole table.

-- Create an index for profile_visibility as it will be used for filtering in the directory
CREATE INDEX IF NOT EXISTS idx_profiles_visibility ON public.profiles(profile_visibility);
