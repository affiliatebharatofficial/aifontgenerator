-- AI Font Generator Phase 3 Schema Migration
-- Table: generated_files

CREATE TABLE IF NOT EXISTS public.generated_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id UUID NOT NULL REFERENCES public.font_generations(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('ttf', 'otf', 'woff2')),
  storage_path TEXT NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  download_count INTEGER NOT NULL DEFAULT 0 CHECK (download_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_generation_format UNIQUE (generation_id, format)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_generated_files_generation_id ON public.generated_files(generation_id);
CREATE INDEX IF NOT EXISTS idx_generated_files_format ON public.generated_files(format);

-- Enable RLS
ALTER TABLE public.generated_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own generated files or admin view all"
  ON public.generated_files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.font_generations fg
      WHERE fg.id = generation_id AND (fg.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can insert own generated files"
  ON public.generated_files
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.font_generations fg
      WHERE fg.id = generation_id AND (fg.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can delete own generated files"
  ON public.generated_files
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.font_generations fg
      WHERE fg.id = generation_id AND (fg.user_id = auth.uid() OR public.is_admin())
    )
  );
