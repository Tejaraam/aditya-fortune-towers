-- 00002_accounts_and_rbac.sql

-- 1. Create Financial Transactions Table
CREATE TABLE public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('Income', 'Expense')),
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  description TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  receipt_url TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for financial queries
CREATE INDEX idx_fin_tx_date ON public.financial_transactions(transaction_date DESC);
CREATE INDEX idx_fin_tx_type ON public.financial_transactions(type);

-- 2. First-Admin Bootstrapper (Auto-assign Admin role to the first user ever created)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  is_first_user BOOLEAN;
  assigned_role TEXT;
BEGIN
  -- Check if this is the very first user in the system
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1) INTO is_first_user;
  
  IF is_first_user THEN
    assigned_role := 'Admin';
  ELSE
    assigned_role := 'Member';
  END IF;

  INSERT INTO public.profiles (id, name, tower, flat_number, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'tower', 'Unassigned'),
    COALESCE(new.raw_user_meta_data->>'flat_number', 'Unassigned'),
    assigned_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Stricter RBAC Policies Definitions

-- Enable RLS for the new table
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Helper Functions for Role Checking
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_committee_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Committee Member')
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_member_or_above()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Committee Member', 'Member')
  );
$$ LANGUAGE sql SECURITY DEFINER;


-- Drop all previously defined loose policies from 00001
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Events viewable by authenticated" ON public.events;
DROP POLICY IF EXISTS "Events creatable by authenticated" ON public.events;
DROP POLICY IF EXISTS "Events updatable by organizer" ON public.events;
DROP POLICY IF EXISTS "Events deletable by organizer" ON public.events;

DROP POLICY IF EXISTS "Event attendees viewable by authenticated" ON public.event_attendees;
DROP POLICY IF EXISTS "Users can manage their own attendance" ON public.event_attendees;

DROP POLICY IF EXISTS "Event comments viewable by authenticated" ON public.event_comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.event_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.event_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.event_comments;

DROP POLICY IF EXISTS "Notices viewable by authenticated" ON public.notices;
DROP POLICY IF EXISTS "Notices creatable by authenticated" ON public.notices;
DROP POLICY IF EXISTS "Notices updatable by author" ON public.notices;
DROP POLICY IF EXISTS "Notices deletable by author" ON public.notices;

DROP POLICY IF EXISTS "Communications viewable by authenticated" ON public.communications;
DROP POLICY IF EXISTS "Communications creatable by authenticated" ON public.communications;
DROP POLICY IF EXISTS "Communications updatable by author" ON public.communications;
DROP POLICY IF EXISTS "Communications deletable by author" ON public.communications;

DROP POLICY IF EXISTS "Pictures viewable by everyone" ON public.pictures;
DROP POLICY IF EXISTS "Pictures creatable by authenticated" ON public.pictures;
DROP POLICY IF EXISTS "Pictures updatable by uploader" ON public.pictures;
DROP POLICY IF EXISTS "Pictures deletable by uploader" ON public.pictures;

DROP POLICY IF EXISTS "Complaints viewable by creator or committee" ON public.complaints;
DROP POLICY IF EXISTS "Complaints creatable by authenticated" ON public.complaints;
DROP POLICY IF EXISTS "Complaints updatable by creator or committee" ON public.complaints;


-- RECREATE STRICT POLICIES

-- PROFILES
-- Members/Committee/Admins can view all profiles (Members directory). Visitors can't.
CREATE POLICY "Profiles viewable by members" ON public.profiles FOR SELECT USING (public.is_member_or_above());
CREATE POLICY "Users update own profile, Admins update any" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- EVENTS
-- Members/Committee/Admins can view events
CREATE POLICY "Events viewable by members" ON public.events FOR SELECT USING (public.is_member_or_above());
-- ONLY Committee/Admins can create/update/delete events
CREATE POLICY "Events managed by committee" ON public.events FOR ALL USING (public.is_committee_or_admin());

-- EVENT ATTENDEES (RSVP)
CREATE POLICY "Attendees viewable by members" ON public.event_attendees FOR SELECT USING (public.is_member_or_above());
CREATE POLICY "Members can manage own RSVP" ON public.event_attendees FOR ALL USING (auth.uid() = user_id AND public.is_member_or_above());

-- EVENT COMMENTS
CREATE POLICY "Comments viewable by members" ON public.event_comments FOR SELECT USING (public.is_member_or_above());
CREATE POLICY "Members can post comments" ON public.event_comments FOR INSERT WITH CHECK (auth.uid() = owner_id AND public.is_member_or_above());
CREATE POLICY "Members can delete own comments, Admins delete any" ON public.event_comments FOR DELETE USING (auth.uid() = owner_id OR public.is_admin());

-- COMPLAINTS
-- Members view own. Committee/Admins view all.
CREATE POLICY "Complaints view" ON public.complaints FOR SELECT USING (auth.uid() = user_id OR public.is_committee_or_admin());
-- Members can create complaints
CREATE POLICY "Complaints create" ON public.complaints FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_member_or_above());
-- Committee/Admins can update complaints (status). Users can't alter once submitted unless we explicitly allow.
CREATE POLICY "Complaints update" ON public.complaints FOR UPDATE USING (public.is_committee_or_admin());

-- NOTICES & COMMUNICATIONS (Broadcasts / Documents)
CREATE POLICY "Notices viewable by members" ON public.notices FOR SELECT USING (public.is_member_or_above());
CREATE POLICY "Notices managed by committee" ON public.notices FOR ALL USING (public.is_committee_or_admin());

CREATE POLICY "Communications viewable by members" ON public.communications FOR SELECT USING (public.is_member_or_above());
CREATE POLICY "Communications managed by committee" ON public.communications FOR ALL USING (public.is_committee_or_admin());

-- PICTURES
-- Pictures viewable by members
CREATE POLICY "Pictures viewable by members" ON public.pictures FOR SELECT USING (public.is_member_or_above());
-- ONLY Committee/Admins can publish pictures
CREATE POLICY "Pictures managed by committee" ON public.pictures FOR ALL USING (public.is_committee_or_admin());

-- FINANCIAL TRANSACTIONS
-- Viewable by members (transparency)
CREATE POLICY "Financials viewable by members" ON public.financial_transactions FOR SELECT USING (public.is_member_or_above());
-- Managed ONLY by Committee/Admins
CREATE POLICY "Financials managed by committee" ON public.financial_transactions FOR ALL USING (public.is_committee_or_admin());
