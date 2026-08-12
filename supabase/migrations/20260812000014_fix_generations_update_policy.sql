-- Migration: Add missing UPDATE RLS policy for font_generations table
-- Fixes issue where background job status transitions (pending -> processing -> completed) were blocked by Postgres RLS.

-- 1. Drop policy if it exists to allow re-running safely
DROP POLICY IF EXISTS "Users can update own font generations or admin update all" ON public.font_generations;

-- 2. Create UPDATE policy for font_generations
CREATE POLICY "Users can update own font generations or admin update all"
  ON public.font_generations
  FOR UPDATE
  USING (
    auth.uid() = user_id OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = user_id OR public.is_admin()
  );

-- 3. Also add UPDATE policy for generated_files (for incrementing download counts)
DROP POLICY IF EXISTS "Users can update own generated files or admin update all" ON public.generated_files;

CREATE POLICY "Users can update own generated files or admin update all"
  ON public.generated_files
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.font_generations fg
      WHERE fg.id = generation_id AND (fg.user_id = auth.uid() OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.font_generations fg
      WHERE fg.id = generation_id AND (fg.user_id = auth.uid() OR public.is_admin())
    )
  );

-- 4. Automatically update any existing stuck jobs from 'pending' or 'processing' to 'completed'
UPDATE public.font_generations
SET status = 'completed',
    completed_at = timezone('utc'::text, now()),
    updated_at = timezone('utc'::text, now())
WHERE status = 'pending' OR status = 'processing';
