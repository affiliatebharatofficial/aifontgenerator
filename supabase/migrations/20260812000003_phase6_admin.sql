-- AI Font Generator Phase 6 Schema Migration
-- Admin Panel & Centralized Control System Tables

-- 1. Table: site_settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  type TEXT NOT NULL DEFAULT 'json',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by UUID REFERENCES public.profiles(id)
);

-- 2. Table: feature_flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by UUID REFERENCES public.profiles(id)
);

-- 3. Table: ai_providers
CREATE TABLE IF NOT EXISTS public.ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT UNIQUE NOT NULL CHECK (provider IN ('openai', 'gemini', 'openrouter', 'deepseek')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  model TEXT NOT NULL,
  api_key_masked TEXT,
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Table: admin_activity_logs
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_ai_providers_priority ON public.ai_providers(priority);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin ON public.admin_activity_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action ON public.admin_activity_logs(action);

-- Enable RLS on all admin tables
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Only public.is_admin() can manage admin tables)
CREATE POLICY "Admins can manage site_settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage feature_flags"
  ON public.feature_flags FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage ai_providers"
  ON public.ai_providers FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage admin_activity_logs"
  ON public.admin_activity_logs FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Seed default initial AI provider records
INSERT INTO public.ai_providers (provider, enabled, model, priority)
VALUES
  ('openai', true, 'gpt-4o-mini', 1),
  ('gemini', true, 'gemini-1.5-flash', 2),
  ('openrouter', false, 'anthropic/claude-3-haiku', 3),
  ('deepseek', false, 'deepseek-chat', 4)
ON CONFLICT (provider) DO NOTHING;

-- Seed default feature flags
INSERT INTO public.feature_flags (key, enabled, description)
VALUES
  ('ai_font_generation', true, 'Enable AI Font Generation engine'),
  ('font_downloads', true, 'Enable TTF, OTF, and WOFF2 downloads'),
  ('user_signup', true, 'Allow new user registration'),
  ('maintenance_mode', false, 'Global system maintenance mode')
ON CONFLICT (key) DO NOTHING;

-- Seed default site settings
INSERT INTO public.site_settings (key, value, type)
VALUES
  ('site_info', '{"siteName":"AI Font Generator","supportEmail":"support@ai-fontgenerator.com","announcementEnabled":false,"announcementMessage":"New AI Typography engine online!"}'::jsonb, 'json'),
  ('generation_limits', '{"dailyLimit":3,"maxPromptLength":2000,"timeoutSeconds":60,"maxRetries":2}'::jsonb, 'json'),
  ('ads_config', '{"enabled":false,"publisherId":"","headerSlot":"","sidebarSlot":"","footerSlot":""}'::jsonb, 'json'),
  ('seo_config', '{"title":"AI Font Generator — Create Custom Fonts with Artificial Intelligence","description":"Generate real custom vector fonts using AI. Export TTF, OTF, and WOFF2 font files directly from text prompts.","canonical":"https://ai-fontgenerator.com"}'::jsonb, 'json')
ON CONFLICT (key) DO NOTHING;
