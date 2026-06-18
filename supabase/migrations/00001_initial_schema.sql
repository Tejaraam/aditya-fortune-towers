-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, tower, flat_number, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'tower', 'Unassigned'),
    COALESCE(new.raw_user_meta_data->>'flat_number', 'Unassigned'),
    'Member'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

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

-- RLS POLICIES --
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pictures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated can read all profiles. Only the user themselves or an Admin can update.
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Events: Viewable by authenticated users. Creatable by authenticated users.
CREATE POLICY "Events viewable by authenticated" ON public.events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Events creatable by authenticated" ON public.events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Events updatable by organizer" ON public.events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Events deletable by organizer" ON public.events FOR DELETE USING (auth.uid() = organizer_id);

-- Event Attendees:
CREATE POLICY "Event attendees viewable by authenticated" ON public.event_attendees FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage their own attendance" ON public.event_attendees FOR ALL USING (auth.uid() = user_id);

-- Event Comments:
CREATE POLICY "Event comments viewable by authenticated" ON public.event_comments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can create comments" ON public.event_comments FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own comments" ON public.event_comments FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own comments" ON public.event_comments FOR DELETE USING (auth.uid() = owner_id);

-- Notices:
CREATE POLICY "Notices viewable by authenticated" ON public.notices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Notices creatable by authenticated" ON public.notices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Notices updatable by author" ON public.notices FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Notices deletable by author" ON public.notices FOR DELETE USING (auth.uid() = author_id);

-- Communications:
CREATE POLICY "Communications viewable by authenticated" ON public.communications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Communications creatable by authenticated" ON public.communications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Communications updatable by author" ON public.communications FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Communications deletable by author" ON public.communications FOR DELETE USING (auth.uid() = author_id);

-- Pictures:
CREATE POLICY "Pictures viewable by everyone" ON public.pictures FOR SELECT USING (true);
CREATE POLICY "Pictures creatable by authenticated" ON public.pictures FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Pictures updatable by uploader" ON public.pictures FOR UPDATE USING (auth.uid() = uploaded_by_id);
CREATE POLICY "Pictures deletable by uploader" ON public.pictures FOR DELETE USING (auth.uid() = uploaded_by_id);

-- Complaints:
CREATE POLICY "Complaints viewable by creator or committee" ON public.complaints FOR SELECT USING (auth.uid() = user_id OR EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Committee Member')));
CREATE POLICY "Complaints creatable by authenticated" ON public.complaints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Complaints updatable by creator or committee" ON public.complaints FOR UPDATE USING (auth.uid() = user_id OR EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Committee Member')));

-- Storage Buckets Creation (Assuming supabase_admin role or equivalent allows this. If not, needs to be done via dashboard)
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- Gallery
CREATE POLICY "Gallery viewable by everyone" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Gallery updatable by authenticated" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');
-- Documents
CREATE POLICY "Documents viewable by everyone" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Documents updatable by authenticated" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
-- Profile Photos
CREATE POLICY "Profile photos viewable by everyone" ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos');
CREATE POLICY "Profile photos updatable by owner" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-photos' AND auth.role() = 'authenticated');
-- Receipts
CREATE POLICY "Receipts viewable by authenticated" ON storage.objects FOR SELECT USING (bucket_id = 'receipts' AND auth.role() = 'authenticated');
CREATE POLICY "Receipts updatable by authenticated" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');
