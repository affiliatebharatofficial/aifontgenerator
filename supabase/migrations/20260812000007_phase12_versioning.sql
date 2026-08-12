-- AI Font Generator Phase 12 Schema Migration
-- Extend font_generations table with versioning relationships

ALTER TABLE public.font_generations
  ADD COLUMN IF NOT EXISTS parent_generation_id UUID REFERENCES public.font_generations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version_number INTEGER NOT NULL DEFAULT 1 CHECK (version_number >= 1),
  ADD COLUMN IF NOT EXISTS generation_type TEXT NOT NULL DEFAULT 'initial' CHECK (generation_type IN ('initial', 'regeneration', 'handwriting'));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_font_generations_parent ON public.font_generations(parent_generation_id);
CREATE INDEX IF NOT EXISTS idx_font_generations_version ON public.font_generations(version_number);
