import { createClient } from '@/lib/supabase/server';
import { getSiteSetting, isFeatureEnabled } from '@/lib/admin/settings-service';
import { getUserDailyUsage } from '@/lib/generations/service';

export interface UserEntitlements {
  planSlug: string;
  planName: string;
  dailyGenerationLimit: number;
  dailyUsageCount: number;
  remainingGenerations: number;
  isLimitReached: boolean;
  canGenerate: boolean;
  canUseHandwriting: boolean;
  canImportFonts: boolean;
  canDownloadFonts: boolean;
  allowedFormats: string[];
}

/**
 * Centralized Entitlement Service: Source of truth for what a user is authorized to do
 */
export async function getUserEntitlements(userId: string): Promise<UserEntitlements> {
  const supabase = await createClient();

  // 1. Daily Usage & Quota Counter
  const dailyLimit = await getSiteSetting<number>('daily_generation_limit', 10);
  const usageInfo = await getUserDailyUsage(userId);

  const remaining = Math.max(0, dailyLimit - usageInfo.count);
  const isLimitReached = usageInfo.count >= dailyLimit;

  // 2. Feature Flags Server-Side
  const aiGenEnabled = await isFeatureEnabled('ai_font_generation', true);
  const handwritingEnabled = await isFeatureEnabled('handwriting_to_font', true);
  const importEnabled = await isFeatureEnabled('font_import', true);
  const downloadsEnabled = await isFeatureEnabled('font_downloads', true);

  const ttfEnabled = await isFeatureEnabled('format_ttf', true);
  const otfEnabled = await isFeatureEnabled('format_otf', true);
  const woff2Enabled = await isFeatureEnabled('format_woff2', true);

  const allowedFormats: string[] = [];
  if (ttfEnabled) allowedFormats.push('ttf');
  if (otfEnabled) allowedFormats.push('otf');
  if (woff2Enabled) allowedFormats.push('woff2');

  // 3. User Active Plan (Defaults to Free Plan)
  let planSlug = 'free';
  let planName = 'Free Launch Plan';

  try {
    const boundFrom = supabase.from.bind(supabase) as unknown as (relation: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          maybeSingle: () => Promise<{ data: { subscription_plans?: { slug?: string; name?: string } } | null }>;
        };
      };
    };

    const { data: sub } = await boundFrom('user_subscriptions')
      .select('subscription_plans(slug, name)')
      .eq('user_id', userId)
      .maybeSingle();

    if (sub && sub.subscription_plans) {
      planSlug = sub.subscription_plans.slug || 'free';
      planName = sub.subscription_plans.name || 'Free Launch Plan';
    }
  } catch {
    // Default fallback to Free plan
  }

  const canGenerate = aiGenEnabled && !isLimitReached;

  return {
    planSlug,
    planName,
    dailyGenerationLimit: dailyLimit,
    dailyUsageCount: usageInfo.count,
    remainingGenerations: remaining,
    isLimitReached,
    canGenerate,
    canUseHandwriting: handwritingEnabled,
    canImportFonts: importEnabled,
    canDownloadFonts: downloadsEnabled,
    allowedFormats,
  };
}

/**
 * Server-side entitlement check for font generation
 */
export async function canGenerateFont(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const entitlements = await getUserEntitlements(userId);
  if (!entitlements.canGenerate) {
    if (entitlements.isLimitReached) {
      return {
        allowed: false,
        reason: `You have used ${entitlements.dailyUsageCount} of ${entitlements.dailyGenerationLimit} daily free font generations. Limit resets tomorrow.`,
      };
    }
    return { allowed: false, reason: 'AI Font Generation feature is currently disabled by administrator.' };
  }
  return { allowed: true };
}

/**
 * Server-side entitlement check for handwriting feature
 */
export async function canUseHandwriting(): Promise<boolean> {
  return await isFeatureEnabled('handwriting_to_font', true);
}

/**
 * Server-side entitlement check for font importer
 */
export async function canImportFont(): Promise<boolean> {
  return await isFeatureEnabled('font_import', true);
}

/**
 * Server-side entitlement check for binary font downloads
 */
export async function canDownloadFont(format: 'ttf' | 'otf' | 'woff2'): Promise<boolean> {
  const downloadsEnabled = await isFeatureEnabled('font_downloads', true);
  if (!downloadsEnabled) return false;

  const formatFlagKey = format === 'ttf' ? 'format_ttf' : format === 'otf' ? 'format_otf' : 'format_woff2';
  return await isFeatureEnabled(formatFlagKey, true);
}
