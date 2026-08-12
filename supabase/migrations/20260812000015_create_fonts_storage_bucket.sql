-- Migration: Create 'fonts' storage bucket and configure public access policies
-- Fixes error: {"statusCode":"404","error":"Bucket not found","message":"Bucket not found","code":"NoSuchBucket"}

-- 1. Create 'fonts' bucket in storage.buckets table
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fonts',
  'fonts',
  true,
  10485760, -- 10MB file limit
  ARRAY[
    'font/ttf',
    'font/otf',
    'font/woff2',
    'font/woff',
    'application/x-font-ttf',
    'application/x-font-opentype',
    'application/font-woff2',
    'application/octet-stream'
  ]
)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- 2. Storage Policies for 'fonts' bucket
DROP POLICY IF EXISTS "Public Read Access to Fonts Bucket" ON storage.objects;
CREATE POLICY "Public Read Access to Fonts Bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'fonts');

DROP POLICY IF EXISTS "Authenticated Users Insert Fonts" ON storage.objects;
CREATE POLICY "Authenticated Users Insert Fonts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'fonts');

DROP POLICY IF EXISTS "Authenticated Users Update Fonts" ON storage.objects;
CREATE POLICY "Authenticated Users Update Fonts"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'fonts');

DROP POLICY IF EXISTS "Authenticated Users Delete Fonts" ON storage.objects;
CREATE POLICY "Authenticated Users Delete Fonts"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'fonts');
