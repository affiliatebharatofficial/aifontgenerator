'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { logAdminAction } from './service';
import { revalidatePath } from 'next/cache';
import type { UserRole } from '@/types/database';

export interface AdminActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Updates a user's access role with protection against removing the last admin.
 */
export async function updateUserRoleAction(
  targetUserId: string,
  newRole: UserRole
): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();
  const supabase = await createClient();

  // Fetch target user's current role
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', targetUserId)
    .single();

  if (!targetProfile) {
    return { success: false, error: 'Target user profile not found.' };
  }

  // Prevent demoting the final active administrator
  if (targetProfile.role === 'admin' && newRole === 'user') {
    const { count: adminCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin');

    if ((adminCount ?? 0) <= 1) {
      return {
        success: false,
        error: 'At least one administrator must remain.',
      };
    }
  }

  // Update target user role
  const { error } = await (supabase.from('profiles') as unknown as {
    update: (data: { role: string; updated_at: string }) => {
      eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
    };
  })
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', targetUserId);

  if (error) {
    return { success: false, error: error.message };
  }

  await logAdminAction(currentAdmin.id, 'user_role_updated', 'profile', targetUserId, {
    oldRole: targetProfile.role,
    newRole,
    targetEmail: targetProfile.email,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${targetUserId}`);
  return { success: true, message: `Updated user role to ${newRole}.` };
}

/**
 * Updates AI Provider configuration (model, priority, enabled status, masked key).
 */
export async function updateAIProviderAction(
  provider: 'openai' | 'gemini' | 'openrouter' | 'deepseek',
  enabled: boolean,
  model: string,
  priority: number,
  apiKeyMasked?: string
): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();
  const supabase = await createClient();

  const updatePayload: Record<string, unknown> = {
    enabled,
    model: model.trim(),
    priority: Math.max(1, priority),
    updated_at: new Date().toISOString(),
  };

  if (apiKeyMasked && apiKeyMasked.trim().length > 0) {
    updatePayload.api_key_masked = apiKeyMasked.trim();
  }

  const { error } = await (supabase.from('ai_providers') as unknown as {
    upsert: (
      data: Record<string, unknown>,
      options?: { onConflict: string }
    ) => Promise<{ error: { message: string } | null }>;
  }).upsert(
    {
      provider,
      ...updatePayload,
    },
    { onConflict: 'provider' }
  );

  if (error) {
    return { success: false, error: error.message };
  }

  await logAdminAction(currentAdmin.id, 'ai_provider_updated', 'ai_provider', provider, {
    enabled,
    model,
    priority,
  });

  revalidatePath('/admin/ai-providers');
  return { success: true, message: `Updated configuration for ${provider.toUpperCase()}.` };
}

/**
 * Performs a real server-side connection test against the AI provider API.
 */
export async function testAIProviderConnectionAction(
  provider: 'openai' | 'gemini' | 'openrouter' | 'deepseek',
  model: string
): Promise<AdminActionResult> {
  await requireAdmin();

  // Test OpenAI
  if (provider === 'openai') {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return { success: false, error: 'OPENAI_API_KEY environment variable is unconfigured.' };
    }

    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
      });

      if (res.ok) {
        return { success: true, message: `Connected successfully to OpenAI (${model}).` };
      }
      return { success: false, error: `OpenAI API returned status ${res.status}.` };
    } catch (err: unknown) {
      return { success: false, error: `OpenAI connection failed: ${err instanceof Error ? err.message : String(err)}` };
    }
  }

  // Test Gemini
  if (provider === 'gemini') {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return { success: false, error: 'GEMINI_API_KEY environment variable is unconfigured.' };
    }

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
      );

      if (res.ok) {
        return { success: true, message: `Connected successfully to Gemini API (${model}).` };
      }
      return { success: false, error: `Gemini API returned status ${res.status}.` };
    } catch (err: unknown) {
      return { success: false, error: `Gemini connection failed: ${err instanceof Error ? err.message : String(err)}` };
    }
  }

  return { success: false, error: `Provider ${provider} is not configured for connection test.` };
}

/**
 * Updates daily generation limits and prompt constraints.
 */
export async function updateGenerationLimitsAction(
  dailyLimit: number,
  maxPromptLength: number
): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();
  const supabase = await createClient();

  const value = {
    dailyLimit: Math.max(1, dailyLimit),
    maxPromptLength: Math.max(100, maxPromptLength),
    timeoutSeconds: 60,
    maxRetries: 2,
  };

  const { error } = await (supabase.from('site_settings') as unknown as {
    upsert: (
      data: Record<string, unknown>,
      options?: { onConflict: string }
    ) => Promise<{ error: { message: string } | null }>;
  }).upsert(
    {
      key: 'generation_limits',
      value,
      type: 'json',
      updated_at: new Date().toISOString(),
      updated_by: currentAdmin.id,
    },
    { onConflict: 'key' }
  );

  if (error) {
    return { success: false, error: error.message };
  }

  await logAdminAction(currentAdmin.id, 'generation_limits_updated', 'site_setting', 'generation_limits', value);

  revalidatePath('/admin/generation-limits');
  return { success: true, message: 'Generation limits updated.' };
}

/**
 * Updates site branding, support email, and announcement bar.
 */
export async function updateSiteSettingsAction(
  siteName: string,
  supportEmail: string,
  announcementEnabled: boolean,
  announcementMessage: string
): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();
  const supabase = await createClient();

  const value = {
    siteName: siteName.trim(),
    supportEmail: supportEmail.trim(),
    announcementEnabled,
    announcementMessage: announcementMessage.trim(),
  };

  const { error } = await (supabase.from('site_settings') as unknown as {
    upsert: (
      data: Record<string, unknown>,
      options?: { onConflict: string }
    ) => Promise<{ error: { message: string } | null }>;
  }).upsert(
    {
      key: 'site_info',
      value,
      type: 'json',
      updated_at: new Date().toISOString(),
      updated_by: currentAdmin.id,
    },
    { onConflict: 'key' }
  );

  if (error) {
    return { success: false, error: error.message };
  }

  await logAdminAction(currentAdmin.id, 'site_settings_updated', 'site_setting', 'site_info', value);

  revalidatePath('/', 'layout');
  revalidatePath('/admin/site-settings');
  return { success: true, message: 'Site settings updated.' };
}

/**
 * Updates AdSense configuration.
 */
export async function updateAdsConfigAction(
  enabled: boolean,
  publisherId: string,
  headerSlot: string,
  sidebarSlot: string,
  footerSlot: string
): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();
  const supabase = await createClient();

  const value = {
    enabled,
    publisherId: publisherId.trim(),
    headerSlot: headerSlot.trim(),
    sidebarSlot: sidebarSlot.trim(),
    footerSlot: footerSlot.trim(),
  };

  const { error } = await (supabase.from('site_settings') as unknown as {
    upsert: (
      data: Record<string, unknown>,
      options?: { onConflict: string }
    ) => Promise<{ error: { message: string } | null }>;
  }).upsert(
    {
      key: 'ads_config',
      value,
      type: 'json',
      updated_at: new Date().toISOString(),
      updated_by: currentAdmin.id,
    },
    { onConflict: 'key' }
  );

  if (error) {
    return { success: false, error: error.message };
  }

  await logAdminAction(currentAdmin.id, 'ads_config_updated', 'site_setting', 'ads_config', value);

  revalidatePath('/admin/ads');
  return { success: true, message: 'Ads configuration updated.' };
}

/**
 * Updates SEO meta tags configuration.
 */
export async function updateSEOConfigAction(
  title: string,
  description: string,
  canonical: string
): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();
  const supabase = await createClient();

  const value = {
    title: title.trim(),
    description: description.trim(),
    canonical: canonical.trim(),
  };

  const { error } = await (supabase.from('site_settings') as unknown as {
    upsert: (
      data: Record<string, unknown>,
      options?: { onConflict: string }
    ) => Promise<{ error: { message: string } | null }>;
  }).upsert(
    {
      key: 'seo_config',
      value,
      type: 'json',
      updated_at: new Date().toISOString(),
      updated_by: currentAdmin.id,
    },
    { onConflict: 'key' }
  );

  if (error) {
    return { success: false, error: error.message };
  }

  await logAdminAction(currentAdmin.id, 'seo_config_updated', 'site_setting', 'seo_config', value);

  revalidatePath('/admin/seo');
  return { success: true, message: 'SEO configuration updated.' };
}

/**
 * Toggles system Maintenance Mode with admin bypass capability.
 */
export async function updateMaintenanceModeAction(
  enabled: boolean,
  message: string
): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();
  const supabase = await createClient();

  const { error: flagError } = await (supabase.from('feature_flags') as unknown as {
    upsert: (
      data: Record<string, unknown>,
      options?: { onConflict: string }
    ) => Promise<{ error: { message: string } | null }>;
  }).upsert(
    {
      key: 'maintenance_mode',
      enabled,
      description: 'Global system maintenance mode',
      updated_at: new Date().toISOString(),
      updated_by: currentAdmin.id,
    },
    { onConflict: 'key' }
  );

  if (flagError) {
    return { success: false, error: flagError.message };
  }

  await (supabase.from('site_settings') as unknown as {
    upsert: (
      data: Record<string, unknown>,
      options?: { onConflict: string }
    ) => Promise<{ error: { message: string } | null }>;
  }).upsert(
    {
      key: 'maintenance_info',
      value: { message: message.trim() },
      type: 'json',
      updated_at: new Date().toISOString(),
      updated_by: currentAdmin.id,
    },
    { onConflict: 'key' }
  );

  await logAdminAction(currentAdmin.id, 'maintenance_mode_toggled', 'feature_flag', 'maintenance_mode', {
    enabled,
    message,
  });

  revalidatePath('/', 'layout');
  revalidatePath('/admin/maintenance');
  return {
    success: true,
    message: enabled ? 'Maintenance mode ENABLED.' : 'Maintenance mode DISABLED.',
  };
}
