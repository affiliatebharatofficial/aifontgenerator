-- AI Font Generator Phase 13 Schema Migration
-- Tables: imported_fonts, font_licenses

-- 1. Create imported_fonts table
CREATE TABLE IF NOT EXISTS public.imported_fonts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('ttf', 'otf', 'woff', 'woff2')),
  storage_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'analyzing', 'ready', 'failed')),
  family_name TEXT,
  subfamily TEXT,
  full_name TEXT,
  postscript_name TEXT,
  version TEXT,
  units_per_em INTEGER DEFAULT 1000,
  glyph_count INTEGER DEFAULT 0,
  ascender INTEGER DEFAULT 800,
  descender INTEGER DEFAULT -200,
  line_gap INTEGER DEFAULT 0,
  extracted_metadata JSONB DEFAULT '{}'::jsonb,
  glyph_cmap JSONB DEFAULT '{}'::jsonb,
  table_records JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create font_licenses table
CREATE TABLE IF NOT EXISTS public.font_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  font_id UUID NOT NULL REFERENCES public.imported_fonts(id) ON DELETE CASCADE,
  license_name TEXT,
  license_url TEXT,
  license_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_imported_font_license UNIQUE (font_id)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_imported_fonts_user ON public.imported_fonts(user_id);
CREATE INDEX IF NOT EXISTS idx_imported_fonts_status ON public.imported_fonts(status);
CREATE INDEX IF NOT EXISTS idx_font_licenses_font ON public.font_licenses(font_id);

-- Enable RLS
ALTER TABLE public.imported_fonts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.font_licenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for imported_fonts
CREATE POLICY "Users can manage their own imported_fonts"
  ON public.imported_fonts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for font_licenses
CREATE POLICY "Users can manage their own font_licenses"
  ON public.font_licenses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.imported_fonts f
      WHERE f.id = font_id AND f.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.imported_fonts f
      WHERE f.id = font_id AND f.user_id = auth.uid()
    )
  );
