-- AI Font Generator Phase 2 Schema Migration
-- Tables: font_generations & generation_usage

-- 1. Create font_generations table
CREATE TABLE IF NOT EXISTS public.font_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  font_name TEXT,
  prompt TEXT NOT NULL,
  category TEXT NOT NULL,
  weight TEXT NOT NULL,
  width TEXT NOT NULL,
  style TEXT NOT NULL,
  character_set JSONB NOT NULL DEFAULT '{"uppercase": true, "lowercase": true, "numbers": true, "punctuation": true}'::jsonb,
  advanced_settings JSONB NOT NULL DEFAULT '{"letterSpacing": 0, "contrast": "medium", "cornerStyle": "sharp", "strokeStyle": "solid"}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ
);

-- 2. Create generation_usage table (daily user generation tracking)
CREATE TABLE IF NOT EXISTS public.generation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  generation_count INTEGER NOT NULL DEFAULT 0 CHECK (generation_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_daily_usage UNIQUE (user_id, usage_date)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_font_generations_user_id ON public.font_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_font_generations_status ON public.font_generations(status);
CREATE INDEX IF NOT EXISTS idx_font_generations_created_at ON public.font_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_usage_user_date ON public.generation_usage(user_id, usage_date);

-- 4. Enable RLS
ALTER TABLE public.font_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for font_generations
CREATE POLICY "Users can view own font generations or admin view all"
  ON public.font_generations
  FOR SELECT
  USING (
    auth.uid() = user_id OR public.is_admin()
  );

CREATE POLICY "Users can insert own pending font generations"
  ON public.font_generations
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND status = 'pending'
  );

CREATE POLICY "Users can delete own font generations"
  ON public.font_generations
  FOR DELETE
  USING (
    auth.uid() = user_id OR public.is_admin()
  );

-- RLS Policies for generation_usage
CREATE POLICY "Users can view own usage"
  ON public.generation_usage
  FOR SELECT
  USING (
    auth.uid() = user_id OR public.is_admin()
  );

CREATE POLICY "Users can insert/update own usage"
  ON public.generation_usage
  FOR ALL
  USING (
    auth.uid() = user_id OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = user_id OR public.is_admin()
  );

-- Triggers for updated_at
CREATE TRIGGER tr_font_generations_updated_at
  BEFORE UPDATE ON public.font_generations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tr_generation_usage_updated_at
  BEFORE UPDATE ON public.generation_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
