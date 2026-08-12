'use server';

import { requireAdmin } from '@/lib/auth/admin';
import { setSiteSetting, setFeatureFlag } from './settings-service';
import { revalidatePath } from 'next/cache';

export interface AdminActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Updates Generation settings (limit, timeout, prompt length, max attempts)
 */
export async function updateGenerationSettingsAction(formData: FormData): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();

  const dailyLimit = Math.max(1, Math.min(500, Number(formData.get('daily_generation_limit')) || 10));
  const maxPromptLength = Math.max(50, Math.min(2000, Number(formData.get('max_prompt_length')) || 500));
  const maxCharacterSet = Math.max(50, Math.min(1000, Number(formData.get('max_character_set_count')) || 250));
  const timeoutSeconds = Math.max(10, Math.min(300, Number(formData.get('generation_timeout_seconds')) || 60));
  const maxProviderAttempts = Math.max(1, Math.min(5, Number(formData.get('max_provider_attempts')) || 3));
  const monetizationMode = (formData.get('monetization_mode') as string) || 'free';

  await setSiteSetting(currentAdmin.id, 'daily_generation_limit', dailyLimit, 'Maximum generations per user per day');
  await setSiteSetting(currentAdmin.id, 'max_prompt_length', maxPromptLength, 'Maximum character length of user prompt');
  await setSiteSetting(currentAdmin.id, 'max_character_set_count', maxCharacterSet, 'Maximum character count in generated font');
  await setSiteSetting(currentAdmin.id, 'generation_timeout_seconds', timeoutSeconds, 'Server-side font generation job timeout');
  await setSiteSetting(currentAdmin.id, 'max_provider_attempts', maxProviderAttempts, 'Maximum provider fallback attempts');
  await setSiteSetting(currentAdmin.id, 'monetization_mode', monetizationMode, 'System launch monetization mode (free/paid)');

  revalidatePath('/admin');
  revalidatePath('/admin/settings/generation');
  revalidatePath('/generate');
  return { success: true, message: 'Generation settings updated successfully.' };
}

/**
 * Updates Font Format Controls (TTF, OTF, WOFF2 enabled flags)
 */
export async function updateFormatSettingsAction(
  ttfEnabled: boolean,
  otfEnabled: boolean,
  woff2Enabled: boolean
): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();

  await setFeatureFlag(currentAdmin.id, 'format_ttf', ttfEnabled, 'TTF output format enabled');
  await setFeatureFlag(currentAdmin.id, 'format_otf', otfEnabled, 'OTF output format enabled');
  await setFeatureFlag(currentAdmin.id, 'format_woff2', woff2Enabled, 'WOFF2 output format enabled');

  revalidatePath('/admin');
  revalidatePath('/admin/settings/formats');
  revalidatePath('/generate');
  return { success: true, message: 'Font format controls updated successfully.' };
}

/**
 * Updates Import Settings (enabled flag, max file size)
 */
export async function updateImportSettingsAction(formData: FormData): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();

  const enabled = formData.get('import_enabled') === 'true';
  const maxSizeMb = Math.max(1, Math.min(50, Number(formData.get('max_import_file_size_mb')) || 15));

  await setFeatureFlag(currentAdmin.id, 'font_import', enabled, 'Font import feature enabled');
  await setSiteSetting(currentAdmin.id, 'max_import_file_size_mb', maxSizeMb, 'Maximum allowed import file size in MB');

  revalidatePath('/admin');
  revalidatePath('/import-font');
  revalidatePath('/dashboard/library');
  return { success: true, message: 'Font importer settings updated successfully.' };
}

/**
 * Updates Handwriting settings (enabled flag, max upload size)
 */
export async function updateHandwritingSettingsAction(formData: FormData): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();

  const enabled = formData.get('handwriting_enabled') === 'true';
  const maxSizeMb = Math.max(1, Math.min(25, Number(formData.get('max_handwriting_upload_size_mb')) || 10));

  await setFeatureFlag(currentAdmin.id, 'handwriting_to_font', enabled, 'Handwriting to font feature enabled');
  await setSiteSetting(currentAdmin.id, 'max_handwriting_upload_size_mb', maxSizeMb, 'Maximum allowed handwriting image upload size in MB');

  revalidatePath('/admin');
  revalidatePath('/handwriting-to-font');
  return { success: true, message: 'Handwriting generator settings updated successfully.' };
}

/**
 * Updates Authentication & User Registration settings
 */
export async function updateAuthenticationSettingsAction(
  registrationEnabled: boolean,
  googleLoginEnabled: boolean,
  emailLoginEnabled: boolean
): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();

  await setSiteSetting(currentAdmin.id, 'registration_enabled', registrationEnabled, 'User self-registration enabled');
  await setFeatureFlag(currentAdmin.id, 'google_login', googleLoginEnabled, 'Google OAuth login enabled');
  await setSiteSetting(currentAdmin.id, 'email_login_enabled', emailLoginEnabled, 'Email/password login enabled');

  revalidatePath('/admin');
  revalidatePath('/login');
  revalidatePath('/signup');
  return { success: true, message: 'Authentication settings updated successfully.' };
}

/**
 * Updates Homepage CMS Content (Hero Eyebrow, Title, Description, CTA labels)
 */
export async function updateHomepageSettingsAction(formData: FormData): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();

  const siteName = (formData.get('site_name') as string)?.trim() || 'AI Font Generator';
  const heroEyebrow = (formData.get('hero_eyebrow') as string)?.trim() || 'NEXT-GENERATION TYPOGRAPHY ENGINE';
  const heroTitle = (formData.get('hero_title') as string)?.trim() || 'CREATE BESPOKE TYPEFACES WITH ARTIFICIAL INTELLIGENCE';
  const heroDescription = (formData.get('hero_description') as string)?.trim() || '';
  const primaryCtaLabel = (formData.get('primary_cta_label') as string)?.trim() || 'Start Generating';
  const primaryCtaUrl = (formData.get('primary_cta_url') as string)?.trim() || '/generate';

  await setSiteSetting(currentAdmin.id, 'site_name', siteName, 'Public site brand name');
  await setSiteSetting(currentAdmin.id, 'hero_eyebrow', heroEyebrow, 'Homepage hero eyebrow line');
  await setSiteSetting(currentAdmin.id, 'hero_title', heroTitle, 'Homepage main H1 heading text');
  await setSiteSetting(currentAdmin.id, 'hero_description', heroDescription, 'Homepage main hero description paragraph');
  await setSiteSetting(currentAdmin.id, 'primary_cta_label', primaryCtaLabel, 'Homepage primary CTA button label');
  await setSiteSetting(currentAdmin.id, 'primary_cta_url', primaryCtaUrl, 'Homepage primary CTA button destination URL');

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true, message: 'Homepage content updated successfully.' };
}

/**
 * Updates Announcement Bar settings
 */
export async function updateAnnouncementSettingsAction(formData: FormData): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();

  const enabled = formData.get('announcement_enabled') === 'true';
  const message = (formData.get('announcement_message') as string)?.trim() || '';
  const linkText = (formData.get('announcement_link_text') as string)?.trim() || '';
  const linkUrl = (formData.get('announcement_link_url') as string)?.trim() || '/generate';

  await setSiteSetting(currentAdmin.id, 'announcement_enabled', enabled, 'Global top announcement bar enabled state');
  await setSiteSetting(currentAdmin.id, 'announcement_message', message, 'Global top announcement bar message text');
  await setSiteSetting(currentAdmin.id, 'announcement_link_text', linkText, 'Global top announcement bar link label');
  await setSiteSetting(currentAdmin.id, 'announcement_link_url', linkUrl, 'Global top announcement bar link URL');

  revalidatePath('/', 'layout');
  return { success: true, message: 'Announcement bar updated successfully.' };
}

/**
 * Updates SEO & Metadata settings
 */
export async function updateSEOSettingsAction(formData: FormData): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();

  const siteTitle = (formData.get('seo_site_title') as string)?.trim() || 'AI Font Generator';
  const defaultDescription = (formData.get('seo_default_description') as string)?.trim() || '';
  const canonicalDomain = (formData.get('seo_canonical_domain') as string)?.trim() || 'https://ai-fontgenerator.com';
  const sitemapEnabled = formData.get('seo_sitemap_enabled') === 'true';

  await setSiteSetting(currentAdmin.id, 'seo_site_title', siteTitle, 'Default SEO site title');
  await setSiteSetting(currentAdmin.id, 'seo_default_description', defaultDescription, 'Default SEO meta description');
  await setSiteSetting(currentAdmin.id, 'seo_canonical_domain', canonicalDomain, 'Canonical domain for SEO metadata');
  await setSiteSetting(currentAdmin.id, 'seo_sitemap_enabled', sitemapEnabled, 'Dynamic sitemap generation enabled');

  revalidatePath('/', 'layout');
  revalidatePath('/sitemap.xml');
  return { success: true, message: 'SEO settings updated successfully.' };
}

/**
 * Updates Ads & AdSense configuration
 */
export async function updateAdsSettingsAction(formData: FormData): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();

  const enabled = formData.get('ads_enabled') === 'true';
  const publisherId = (formData.get('adsense_publisher_id') as string)?.trim() || '';
  const headerSlot = (formData.get('adsense_header_slot') as string)?.trim() || '';
  const contentSlot = (formData.get('adsense_content_slot') as string)?.trim() || '';
  const sidebarSlot = (formData.get('adsense_sidebar_slot') as string)?.trim() || '';
  const footerSlot = (formData.get('adsense_footer_slot') as string)?.trim() || '';

  await setSiteSetting(currentAdmin.id, 'ads_enabled', enabled, 'Global ads display enabled flag');
  await setSiteSetting(currentAdmin.id, 'adsense_publisher_id', publisherId, 'Google AdSense publisher ID (ca-pub-...)');
  await setSiteSetting(currentAdmin.id, 'adsense_header_slot', headerSlot, 'Header ad slot ID');
  await setSiteSetting(currentAdmin.id, 'adsense_content_slot', contentSlot, 'Main content ad slot ID');
  await setSiteSetting(currentAdmin.id, 'adsense_sidebar_slot', sidebarSlot, 'Sidebar ad slot ID');
  await setSiteSetting(currentAdmin.id, 'adsense_footer_slot', footerSlot, 'Footer ad slot ID');

  revalidatePath('/', 'layout');
  return { success: true, message: 'AdSense settings updated successfully.' };
}

/**
 * Updates System Maintenance Mode (enabled state, title, message)
 */
export async function updateMaintenanceModeAction(formData: FormData): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();

  const enabled = formData.get('maintenance_enabled') === 'true';
  const title = (formData.get('maintenance_title') as string)?.trim() || 'System Maintenance';
  const message = (formData.get('maintenance_message') as string)?.trim() || '';

  await setSiteSetting(currentAdmin.id, 'maintenance_enabled', enabled, 'System maintenance mode active status');
  await setSiteSetting(currentAdmin.id, 'maintenance_title', title, 'Maintenance mode page title');
  await setSiteSetting(currentAdmin.id, 'maintenance_message', message, 'Maintenance mode explanation message');

  revalidatePath('/', 'layout');
  return { success: true, message: `Maintenance mode ${enabled ? 'ACTIVATED' : 'DEACTIVATED'}.` };
}

/**
 * Toggles an arbitrary feature flag on/off by key
 */
export async function toggleFeatureFlagAction(key: string, enabled: boolean): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();

  const success = await setFeatureFlag(currentAdmin.id, key, enabled);
  if (!success) {
    return { success: false, error: `Failed to update feature flag [${key}].` };
  }

  revalidatePath('/', 'layout');
  revalidatePath('/admin');
  return { success: true, message: `Feature [${key}] set to ${enabled ? 'ENABLED' : 'DISABLED'}.` };
}
