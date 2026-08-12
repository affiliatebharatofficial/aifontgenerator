-- Phase 21: AI Typography Director & Style DNA
-- Adds style_dna JSONB column to public.font_generations to persist complete validated typography DNA

ALTER TABLE public.font_generations
  ADD COLUMN IF NOT EXISTS style_dna JSONB DEFAULT NULL;

-- Create GIN index for efficient JSON queries on style DNA attributes
CREATE INDEX IF NOT EXISTS idx_font_generations_style_dna 
  ON public.font_generations USING GIN (style_dna);

COMMENT ON COLUMN public.font_generations.style_dna IS 
  'Structured FontStyleDNA containing typographic family, stroke model, curvature, proportion, and visual complexity parameters.';
