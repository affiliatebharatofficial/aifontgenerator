-- Phase 24: Font Generation Experience & Advanced Controls
-- Adds generation_controls JSONB and seed BIGINT to font_generations table

ALTER TABLE public.font_generations
  ADD COLUMN IF NOT EXISTS generation_controls JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS seed BIGINT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_font_generations_controls 
  ON public.font_generations USING GIN (generation_controls);

COMMENT ON COLUMN public.font_generations.generation_controls IS 
  'Fine-grained user generation controls (styleStrength, variation, weight, width, slant, spacing, variationSeed).';

COMMENT ON COLUMN public.font_generations.seed IS 
  'Deterministic numeric seed used for reproducible glyph vector compilation.';
