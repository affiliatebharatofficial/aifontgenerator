-- AI Font Generator Phase 7 Schema Migration
-- AI Engine Usage Logs & Model Pricing Tables

-- 1. Table: ai_usage_logs
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  generation_id UUID REFERENCES public.font_generations(id) ON DELETE SET NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'gemini', 'openrouter', 'deepseek')),
  model TEXT NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'font_specification' CHECK (request_type IN ('font_specification', 'font_naming', 'connection_test')),
  input_tokens INTEGER CHECK (input_tokens >= 0),
  output_tokens INTEGER CHECK (output_tokens >= 0),
  total_tokens INTEGER CHECK (total_tokens >= 0),
  latency_ms INTEGER NOT NULL CHECK (latency_ms >= 0),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error_code TEXT,
  estimated_cost_usd NUMERIC(10, 6) CHECK (estimated_cost_usd >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Table: model_pricing
CREATE TABLE IF NOT EXISTS public.model_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input_price_per_1k NUMERIC(10, 6) NOT NULL CHECK (input_price_per_1k >= 0),
  output_price_per_1k NUMERIC(10, 6) NOT NULL CHECK (output_price_per_1k >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  effective_from TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_provider_model UNIQUE (provider, model)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON public.ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_generation_id ON public.ai_usage_logs(generation_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_provider ON public.ai_usage_logs(provider);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_model ON public.ai_usage_logs(model);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_status ON public.ai_usage_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON public.ai_usage_logs(created_at);

-- Enable RLS
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_pricing ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all ai_usage_logs or users view own"
  ON public.ai_usage_logs
  FOR SELECT
  USING (
    user_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "Authenticated users and service can insert ai_usage_logs"
  ON public.ai_usage_logs
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' OR public.is_admin()
  );

CREATE POLICY "Anyone can view model_pricing"
  ON public.model_pricing
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage model_pricing"
  ON public.model_pricing
  FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Seed default model pricing ($ per 1,000 tokens)
INSERT INTO public.model_pricing (provider, model, input_price_per_1k, output_price_per_1k)
VALUES
  ('openai', 'gpt-4o-mini', 0.000150, 0.000600),
  ('gemini', 'gemini-1.5-flash', 0.000075, 0.000300),
  ('openrouter', 'anthropic/claude-3-haiku', 0.000250, 0.001250),
  ('deepseek', 'deepseek-chat', 0.000140, 0.000280)
ON CONFLICT (provider, model) DO NOTHING;
