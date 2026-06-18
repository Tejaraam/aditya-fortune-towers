-- =========================================================================
-- AFTOWA DIGITAL PORTAL: MASTER DATABASE SCHEMA
-- This file contains all SQL commands needed to bootstrap the entire
-- project database from scratch, combining all migrations into one script.
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- TABLES & TRIGGERS
-- =========================================================================

-- 1. Profiles (Extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  tower TEXT NOT NULL,
  flat_number TEXT NOT NULL,
  phone TEXT,
  resident_type TEXT CHECK (resident_type IN ('Owner Resident', 'Owner (Rented Out)', 'Tenant')),
  move_in_date DATE,
  profession TEXT,
  interests TEXT[],
  avatar_url TEXT,
  committee_role TEXT,
  role TEXT DEFAULT 'Member' CHECK (role IN ('Admin', 'Committee Member', 'Member', 'Visitor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for profiles
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_tower ON public.profiles(tower);

-- First-Admin Bootstrapper (Auto-assign Admin role to the first user ever created)
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

-- 2. Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  organizer_id UUID REFERENCES public.profiles(id),
  image_url TEXT,
  is_ai_stitched BOOLEAN DEFAULT FALSE,
  ai_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for events
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_category ON public.events(category);

-- Event Attendees Mapping Table
CREATE TABLE public.event_attendees (
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

-- Event Comments
CREATE TABLE public.event_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for event_comments
CREATE INDEX idx_event_comments_event_id ON public.event_comments(event_id);

-- 3. Notices
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  notice_date TIMESTAMPTZ DEFAULT NOW(),
  priority TEXT CHECK (priority IN ('Urgent', 'High', 'Normal')),
  author_id UUID REFERENCES public.profiles(id),
  department TEXT CHECK (department IN ('Maintenance', 'Security', 'Management', 'Finance')),
  content TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for notices
CREATE INDEX idx_notices_date ON public.notices(notice_date DESC);
CREATE INDEX idx_notices_priority ON public.notices(priority);

-- 4. Communications (Documents)
CREATE TABLE public.communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  doc_date TIMESTAMPTZ DEFAULT NOW(),
  doc_type TEXT CHECK (doc_type IN ('Minutes of Meeting', 'Communication', 'Letter to Authority')),
  author_id UUID REFERENCES public.profiles(id),
  summary TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for communications
CREATE INDEX idx_communications_type ON public.communications(doc_type);
CREATE INDEX idx_communications_date ON public.communications(doc_date DESC);

-- 5. Pictures (Gallery)
CREATE TABLE public.pictures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  pic_date TIMESTAMPTZ DEFAULT NOW(),
  category TEXT CHECK (category IN ('Event Photos', 'Project Drawings', 'Approvals & Documents', 'Infrastructure')),
  uploaded_by_id UUID REFERENCES public.profiles(id),
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for pictures
CREATE INDEX idx_pictures_category ON public.pictures(category);
CREATE INDEX idx_pictures_date ON public.pictures(pic_date DESC);

-- 6. Complaints
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  flat TEXT NOT NULL,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
  description TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for complaints
CREATE INDEX idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX idx_complaints_status ON public.complaints(status);

-- 7. Financial Transactions
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


-- =========================================================================
-- HELPER FUNCTIONS & RLS ENABLEMENT
-- =========================================================================

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

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pictures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- STRICT ROW LEVEL SECURITY (RBAC) POLICIES
-- =========================================================================

-- PROFILES
CREATE POLICY "Profiles viewable by members" ON public.profiles FOR SELECT USING (public.is_member_or_above());
CREATE POLICY "Users update own profile, Admins update any" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- EVENTS
CREATE POLICY "Events viewable by members" ON public.events FOR SELECT USING (public.is_member_or_above());
CREATE POLICY "Events managed by committee" ON public.events FOR ALL USING (public.is_committee_or_admin());

-- EVENT ATTENDEES (RSVP)
CREATE POLICY "Attendees viewable by members" ON public.event_attendees FOR SELECT USING (public.is_member_or_above());
CREATE POLICY "Members can manage own RSVP" ON public.event_attendees FOR ALL USING (auth.uid() = user_id AND public.is_member_or_above());

-- EVENT COMMENTS
CREATE POLICY "Comments viewable by members" ON public.event_comments FOR SELECT USING (public.is_member_or_above());
CREATE POLICY "Members can post comments" ON public.event_comments FOR INSERT WITH CHECK (auth.uid() = owner_id AND public.is_member_or_above());
CREATE POLICY "Members can delete own comments, Admins delete any" ON public.event_comments FOR DELETE USING (auth.uid() = owner_id OR public.is_admin());

-- COMPLAINTS
CREATE POLICY "Complaints view" ON public.complaints FOR SELECT USING (auth.uid() = user_id OR public.is_committee_or_admin());
CREATE POLICY "Complaints create" ON public.complaints FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_member_or_above());
CREATE POLICY "Complaints update" ON public.complaints FOR UPDATE USING (public.is_committee_or_admin());

-- NOTICES & COMMUNICATIONS
CREATE POLICY "Notices viewable by members" ON public.notices FOR SELECT USING (public.is_member_or_above());
CREATE POLICY "Notices managed by committee" ON public.notices FOR ALL USING (public.is_committee_or_admin());

CREATE POLICY "Communications viewable by members" ON public.communications FOR SELECT USING (public.is_member_or_above());
CREATE POLICY "Communications managed by committee" ON public.communications FOR ALL USING (public.is_committee_or_admin());

-- PICTURES
CREATE POLICY "Pictures viewable by members" ON public.pictures FOR SELECT USING (public.is_member_or_above());
CREATE POLICY "Pictures managed by committee" ON public.pictures FOR ALL USING (public.is_committee_or_admin());

-- FINANCIAL TRANSACTIONS
CREATE POLICY "Financials viewable by members" ON public.financial_transactions FOR SELECT USING (public.is_member_or_above());
CREATE POLICY "Financials managed by committee" ON public.financial_transactions FOR ALL USING (public.is_committee_or_admin());

-- =========================================================================
-- STORAGE BUCKETS & POLICIES
-- =========================================================================

-- Storage Buckets Creation
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true) ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies: Gallery
CREATE POLICY "Gallery viewable by everyone" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Gallery updatable by authenticated" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');

-- Storage Policies: Documents
CREATE POLICY "Documents viewable by everyone" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Documents updatable by authenticated" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Storage Policies: Profile Photos
CREATE POLICY "Profile photos viewable by everyone" ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos');
CREATE POLICY "Profile photos updatable by owner" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-photos' AND auth.role() = 'authenticated');

-- Storage Policies: Receipts
CREATE POLICY "Public Receipt Access" ON storage.objects FOR SELECT USING (bucket_id = 'receipts');
CREATE POLICY "Authenticated users can upload receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update receipts" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');
