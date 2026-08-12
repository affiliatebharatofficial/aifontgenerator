-- AI Font Generator Phase 15 Performance Indexes Migration
-- Composite indexes for high-frequency query patterns

-- 1. Composite index for user's completed generations library query
CREATE INDEX IF NOT EXISTS idx_font_generations_user_status_created 
  ON public.font_generations(user_id, status, created_at DESC);

-- 2. Composite index for fast format lookup on generated files
CREATE INDEX IF NOT EXISTS idx_generated_files_gen_format 
  ON public.generated_files(generation_id, format);

-- 3. Composite index for user imported fonts list
CREATE INDEX IF NOT EXISTS idx_imported_fonts_user_created 
  ON public.imported_fonts(user_id, created_at DESC);

-- 4. Composite index for collection items mapping
CREATE INDEX IF NOT EXISTS idx_collection_items_col_gen 
  ON public.font_collection_items(collection_id, generation_id);
