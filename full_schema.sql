-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create uploads table
CREATE TABLE IF NOT EXISTS public.uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  woreda_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  subcategory_code TEXT NOT NULL,
  year TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  uploader_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_uploads_woreda_id ON public.uploads(woreda_id);
CREATE INDEX IF NOT EXISTS idx_uploads_category ON public.uploads(category_id, subcategory_code);
CREATE INDEX IF NOT EXISTS idx_uploads_year ON public.uploads(year);
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON public.uploads(created_at DESC);

ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can do everything" ON public.uploads;
CREATE POLICY "Service role can do everything" ON public.uploads
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create qr_requests table
CREATE TABLE IF NOT EXISTS public.qr_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  woreda_id TEXT NOT NULL,
  code TEXT NOT NULL,
  ip_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  temporary_access_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create temporary_access table
CREATE TABLE IF NOT EXISTS public.temporary_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.qr_requests(id) ON DELETE CASCADE,
  woreda_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_requests_woreda_id ON public.qr_requests(woreda_id);
CREATE INDEX IF NOT EXISTS idx_qr_requests_code ON public.qr_requests(code);
CREATE INDEX IF NOT EXISTS idx_qr_requests_status ON public.qr_requests(status);
CREATE INDEX IF NOT EXISTS idx_qr_requests_created_at ON public.qr_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_temporary_access_token ON public.temporary_access(token);
CREATE INDEX IF NOT EXISTS idx_temporary_access_woreda_id ON public.temporary_access(woreda_id);
CREATE INDEX IF NOT EXISTS idx_temporary_access_expires_at ON public.temporary_access(expires_at);

ALTER TABLE public.qr_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporary_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage qr_requests" ON public.qr_requests;
CREATE POLICY "Service role can manage qr_requests" ON public.qr_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage temporary_access" ON public.temporary_access;
CREATE POLICY "Service role can manage temporary_access" ON public.temporary_access FOR ALL USING (true) WITH CHECK (true);

-- Create news table
CREATE TABLE IF NOT EXISTS public.news (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    woreda_id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    summary text,
    cover_image_url text,
    youtube_url text,
    published boolean DEFAULT false NOT NULL,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage news" ON public.news;
CREATE POLICY "Service role can manage news" ON public.news FOR ALL USING (true) WITH CHECK (true);

-- Create leaders table
CREATE TABLE IF NOT EXISTS public.leaders (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    woreda_id text NOT NULL,
    name text NOT NULL,
    title text NOT NULL,
    speech text,
    name_am text,
    title_am text,
    speech_am text,
    name_or text,
    title_or text,
    speech_or text,
    category text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    photo_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.leaders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage leaders" ON public.leaders;
CREATE POLICY "Service role can manage leaders" ON public.leaders FOR ALL USING (true) WITH CHECK (true);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    woreda_id text NOT NULL,
    unique_code text NOT NULL UNIQUE,
    requester_name text NOT NULL,
    requester_email text,
    requester_phone text,
    reason text NOT NULL,
    requested_date_ethiopian text NOT NULL,
    requested_date_gregorian text,
    requested_time text,
    status text DEFAULT 'pending'::text NOT NULL,
    admin_reason text,
    rescheduled_date_ethiopian text,
    rescheduled_date_gregorian text,
    rescheduled_time text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage appointments" ON public.appointments;
CREATE POLICY "Service role can manage appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

-- Functions and Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_qr_requests_updated_at ON public.qr_requests;
CREATE TRIGGER update_qr_requests_updated_at BEFORE UPDATE ON public.qr_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_news_updated_at ON public.news;
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leaders_updated_at ON public.leaders;
CREATE TRIGGER update_leaders_updated_at BEFORE UPDATE ON public.leaders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage Buckets
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
('news', 'news', true, false, 10485760, ARRAY['image/jpeg','image/png','image/gif','image/webp']),
('documents', 'documents', true, false, 52428800, ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','image/jpeg','image/png','image/gif','text/plain'])
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- News Bucket
DROP POLICY IF EXISTS "Authenticated users can delete news images" ON storage.objects;
CREATE POLICY "Authenticated users can delete news images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'news');

DROP POLICY IF EXISTS "Authenticated users can update news images" ON storage.objects;
CREATE POLICY "Authenticated users can update news images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'news');

DROP POLICY IF EXISTS "Authenticated users can upload news images" ON storage.objects;
CREATE POLICY "Authenticated users can upload news images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'news');

DROP POLICY IF EXISTS "Public can read news images" ON storage.objects;
CREATE POLICY "Public can read news images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'news');

-- Documents Bucket
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;
CREATE POLICY "Authenticated users can delete documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Authenticated users can update documents" ON storage.objects;
CREATE POLICY "Authenticated users can update documents" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "Public can read documents" ON storage.objects;
CREATE POLICY "Public can read documents" ON storage.objects FOR SELECT TO public USING (bucket_id = 'documents');
