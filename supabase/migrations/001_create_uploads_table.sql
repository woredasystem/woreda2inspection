-- Create uploads table for document metadata
-- Note: This migration has been updated to use storage_url instead of r2_url
-- The actual table creation is handled by the create_all_tables migration
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_uploads_woreda_id ON public.uploads(woreda_id);
CREATE INDEX IF NOT EXISTS idx_uploads_category ON public.uploads(category_id, subcategory_code);
CREATE INDEX IF NOT EXISTS idx_uploads_year ON public.uploads(year);
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON public.uploads(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to do everything
DROP POLICY IF EXISTS "Service role can do everything" ON public.uploads;
CREATE POLICY "Service role can do everything" ON public.uploads
  FOR ALL
  USING (true)
  WITH CHECK (true);

