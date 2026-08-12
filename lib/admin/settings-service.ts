import { createClient } from '@/lib/supabase/server';
import { logAdminAction } from './service';

export interface SiteSetting {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}

/**
 * Default fallback values for system configuration keys
 */
export const DEFAULT_SITE_SETTINGS: Record<string, unknown> = {
  // Launch Monetization Mode (Default: free)
  monetization_mode: 'free',

  // Generation Limits & Timeouts
  daily_generation_limit: 10,
  max_prompt_length: 500,
  max_character_set_count: 250,
  max_concurrent_jobs: 2,
  generation_timeout_seconds: 60,
  max_provider_attempts: 3,

  // Font Importer Controls
  max_import_file_size_mb: 15,
  allowed_import_formats: ['ttf', 'otf', 'woff', 'woff2'],

  // Handwriting Controls
  max_handwriting_upload_size_mb: 10,
  allowed_handwriting_image_formats: ['png', 'jpg', 'jpeg', 'webp'],

  // Storage Limits
  max_generated_file_size_mb: 25,

  // Homepage Content
  site_name: 'AI Font Generator',
  hero_eyebrow: 'NEXT-GENERATION TYPOGRAPHY ENGINE',
  hero_title: 'CREATE BESPOKE TYPEFACES WITH ARTIFICIAL INTELLIGENCE',
  hero_description: 'Transform textual descriptions into complete production-ready OpenType and TrueType font binaries in seconds.',
  primary_cta_label: 'Start Generating',
  primary_cta_url: '/generate',
  secondary_cta_label: 'Explore Library',
  secondary_cta_url: '/dashboard/library',

  // Announcement Bar
  announcement_enabled: false,
  announcement_message: '✨ AI Font Generator Phase 16 Live — Free Launch Edition',
  announcement_link_text: 'Try Generator',
  announcement_link_url: '/generate',

  // SEO & Meta
  seo_site_title: 'AI Font Generator — Create Custom Fonts with AI',
  seo_default_description: 'Generate custom OpenType, TrueType, and WOFF2 fonts with AI. Type custom prompts, preview character specimens, and download font binaries.',
  seo_canonical_domain: 'https://ai-fontgenerator.com',
  seo_default_og_image: '/og-image.png',
  seo_sitemap_enabled: true,

  // Contact Info
  support_email: 'support@ai-fontgenerator.com',
  contact_email: 'hello@ai-fontgenerator.com',

  // Ads & AdSense
  ads_enabled: false,
  ads_provider: 'google_adsense',
  adsense_publisher_id: '',
  adsense_header_slot: '',
  adsense_content_slot: '',
  adsense_sidebar_slot: '',
  adsense_footer_slot: '',

  // Analytics
  google_analytics_id: '',

  // Authentication
  registration_enabled: true,
  email_login_enabled: true,

  // Maintenance Mode
  maintenance_enabled: false,
  maintenance_title: 'System Maintenance in Progress',
  maintenance_message: 'AI Font Generator is currently undergoing scheduled infrastructure maintenance. Please check back shortly.',
};

/**
 * Fetch a typed site setting with safe fallback
 */
export async function getSiteSetting<T>(key: string, defaultValue?: T): Promise<T> {
  const fallback = defaultValue !== undefined ? defaultValue : (DEFAULT_SITE_SETTINGS[key] as T);
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (data && data.value !== undefined && data.value !== null) {
      return data.value as T;
    }
  } catch (err) {
    console.warn(`Failed to fetch setting [${key}], returning fallback:`, err);
  }
  return fallback;
}

/**
 * Update or insert a site setting and log admin action
 */
export async function setSiteSetting(
  adminUserId: string,
  key: string,
  value: unknown,
  description?: string
): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Fetch existing value for audit log
    const { data: existing } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    const { error } = await (supabase.from('site_settings') as unknown as {
      upsert: (data: Record<string, unknown>, opts: { onConflict: string }) => Promise<{ error: { message: string } | null }>;
    }).upsert(
      {
        key,
        value: JSON.parse(JSON.stringify(value)),
        description: description || null,
        updated_by: adminUserId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

    if (error) {
      console.error(`Failed to update setting [${key}]:`, error.message);
      return false;
    }

    await logAdminAction(adminUserId, 'site_setting_updated', 'setting', key, {
      key,
      oldValue: existing?.value,
      newValue: value,
    });

    return true;
  } catch (err) {
    console.error(`Failed to set setting [${key}]:`, err);
    return false;
  }
}

/**
 * Check if a feature flag is enabled server-side (default: true)
 */
export async function isFeatureEnabled(key: string, defaultState = true): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('feature_flags')
      .select('enabled')
      .eq('key', key)
      .maybeSingle();

    if (data && typeof data.enabled === 'boolean') {
      return data.enabled;
    }
  } catch (err) {
    console.warn(`Failed to fetch feature flag [${key}], using default state:`, err);
  }
  return defaultState;
}

/**
 * Set a feature flag enabled state and log admin action
 */
export async function setFeatureFlag(
  adminUserId: string,
  key: string,
  enabled: boolean,
  description?: string
): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from('feature_flags')
      .select('enabled')
      .eq('key', key)
      .maybeSingle();

    const { error } = await (supabase.from('feature_flags') as unknown as {
      upsert: (data: Record<string, unknown>, opts: { onConflict: string }) => Promise<{ error: { message: string } | null }>;
    }).upsert(
      {
        key,
        enabled,
        description: description || null,
        updated_by: adminUserId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

    if (error) {
      console.error(`Failed to update feature flag [${key}]:`, error.message);
      return false;
    }

    await logAdminAction(adminUserId, 'feature_flag_updated', 'feature_flag', key, {
      key,
      oldState: existing?.enabled ?? true,
      newState: enabled,
    });

    return true;
  } catch (err) {
    console.error(`Failed to update feature flag [${key}]:`, err);
    return false;
  }
}

/**
 * Fetch all site settings for admin settings view
 */
export async function getAllSiteSettings(): Promise<SiteSetting[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .order('key', { ascending: true });
  return (data as SiteSetting[] | null) ?? [];
}

/**
 * Fetch all feature flags for admin features view
 */
export async function getAllFeatureFlags(): Promise<FeatureFlag[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('feature_flags')
    .select('*')
    .order('key', { ascending: true });
  return (data as FeatureFlag[] | null) ?? [];
}
