-- ==========================================
-- Migration 00005: Personal Events
-- ==========================================

-- 1. Create personal_events table
CREATE TABLE public.personal_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  event_date DATE NOT NULL,
  reminder_days_before INTEGER DEFAULT 1,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_personal_events_user_id ON public.personal_events(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_events_date ON public.personal_events(event_date);

-- 3. Enable RLS
ALTER TABLE public.personal_events ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Users can only SELECT their own rows
CREATE POLICY "Users can view own personal events" 
  ON public.personal_events FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can only INSERT their own rows
CREATE POLICY "Users can create own personal events" 
  ON public.personal_events FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can only UPDATE their own rows
CREATE POLICY "Users can update own personal events" 
  ON public.personal_events FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can only DELETE their own rows
CREATE POLICY "Users can delete own personal events" 
  ON public.personal_events FOR DELETE 
  USING (auth.uid() = user_id);
