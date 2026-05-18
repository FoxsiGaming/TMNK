-- ============================================
-- TMNK Admin Panel - Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  date TIMESTAMPTZ NOT NULL,
  location TEXT,
  image_url TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  role_en TEXT,
  bio TEXT,
  bio_en TEXT,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery table
CREATE TABLE gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  caption_en TEXT,
  album TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can do everything
CREATE POLICY "Authenticated users can manage events"
  ON events FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage members"
  ON members FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage gallery"
  ON gallery FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: anyone can read published events (for the public site)
CREATE POLICY "Public can read published events"
  ON events FOR SELECT
  USING (published = TRUE);

-- Policy: anyone can read active members (for the public site)
CREATE POLICY "Public can read active members"
  ON members FOR SELECT
  USING (active = TRUE);

-- Policy: anyone can read gallery (for the public site)
CREATE POLICY "Public can read gallery"
  ON gallery FOR SELECT
  USING (TRUE);

-- ============================================
-- Storage Buckets
-- Run these one at a time in the SQL Editor
-- OR create them via the Supabase Dashboard > Storage
-- ============================================

-- Create storage buckets (you may need to do this via Dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('events', 'events', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('members', 'members', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated users can upload
CREATE POLICY "Authenticated users can upload event images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('events', 'members', 'gallery') AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their uploads"
  ON storage.objects FOR UPDATE
  USING (bucket_id IN ('events', 'members', 'gallery') AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete uploads"
  ON storage.objects FOR DELETE
  USING (bucket_id IN ('events', 'members', 'gallery') AND auth.role() = 'authenticated');

CREATE POLICY "Public can view uploaded images"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('events', 'members', 'gallery'));

-- ============================================
-- Auto-update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
