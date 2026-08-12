'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
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

  const { data: existing } = await (supabase.from('ai_providers') as unknown as {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        maybeSingle: () => Promise<{ data: { id: string } | null }>;
      };
    };
  })
    .select('id')
    .eq('provider', provider)
    .maybeSingle();

  let error: { message: string } | null = null;

  if (existing) {
    const { error: updateErr } = await (supabase.from('ai_providers') as unknown as {
      update: (data: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
      };
    })
      .update(updatePayload)
      .eq('provider', provider);
    error = updateErr;
  } else {
    const { error: insertErr } = await (supabase.from('ai_providers') as unknown as {
      insert: (data: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
    }).insert({
      provider,
      ...updatePayload,
    });
    error = insertErr;
  }

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

  // Test DeepSeek
  if (provider === 'deepseek') {
    const key = process.env.DEEPSEEK_API_KEY;
    if (!key) {
      return { success: false, error: 'DEEPSEEK_API_KEY environment variable is unconfigured in .env file.' };
    }

    try {
      const res = await fetch('https://api.deepseek.com/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
      });

      if (res.ok) {
        return { success: true, message: `Connected successfully to DeepSeek API (${model}).` };
      }
      return { success: false, error: `DeepSeek API returned status ${res.status}. Please check your DEEPSEEK_API_KEY.` };
    } catch (err: unknown) {
      return { success: false, error: `DeepSeek connection failed: ${err instanceof Error ? err.message : String(err)}` };
    }
  }

  // Test OpenRouter
  if (provider === 'openrouter') {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      return { success: false, error: 'OPENROUTER_API_KEY environment variable is unconfigured in .env file.' };
    }

    try {
      const res = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
      });

      if (res.ok) {
        return { success: true, message: `Connected successfully to OpenRouter API (${model}).` };
      }
      return { success: false, error: `OpenRouter API returned status ${res.status}. Please check your OPENROUTER_API_KEY.` };
    } catch (err: unknown) {
      return { success: false, error: `OpenRouter connection failed: ${err instanceof Error ? err.message : String(err)}` };
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

/**
 * Admin Action: Set or remove custom daily generation limit override for a specific user.
 * If limitOverride is null, the custom override is removed and the user inherits their plan default.
 */
export async function adminSetUserLimitOverrideAction(
  targetUserId: string,
  limitOverride: number | null,
  reason: string = 'Admin manual adjustment'
): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();
  const supabase = await createAdminClient();

  // Verify target user exists
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('id', targetUserId)
    .single();

  if (!targetProfile) {
    return { success: false, error: 'Target user profile not found.' };
  }

  const boundEntitlements = supabase.from.bind(supabase) as unknown as (relation: string) => {
    delete: () => {
      eq: (col: string, val: string) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
      };
    };
    insert: (data: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  };

  if (limitOverride === null || limitOverride < 0) {
    // Remove custom override
    const { error } = await boundEntitlements('user_entitlements')
      .delete()
      .eq('user_id', targetUserId)
      .eq('feature', 'daily_generation_limit');

    if (error) {
      return { success: false, error: error.message };
    }

    await logAdminAction(currentAdmin.id, 'user_limit_override_cleared', 'user_entitlements', targetUserId, {
      targetEmail: targetProfile.email,
      reason,
    });
  } else {
    // Delete existing override first, then insert new one
    await boundEntitlements('user_entitlements')
      .delete()
      .eq('user_id', targetUserId)
      .eq('feature', 'daily_generation_limit');

    const { error } = await boundEntitlements('user_entitlements').insert({
      user_id: targetUserId,
      feature: 'daily_generation_limit',
      enabled: true,
      limit_override: Math.max(0, limitOverride),
      reason: reason.trim(),
      created_at: new Date().toISOString(),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    await logAdminAction(currentAdmin.id, 'user_limit_override_updated', 'user_entitlements', targetUserId, {
      limitOverride,
      targetEmail: targetProfile.email,
      reason,
    });
  }

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${targetUserId}`);
  revalidatePath('/dashboard');
  revalidatePath('/generate');
  return {
    success: true,
    message: limitOverride !== null
      ? `Set daily limit to ${limitOverride} for ${targetProfile.email}.`
      : `Reset daily limit to plan default for ${targetProfile.email}.`,
  };
}

/**
 * Admin Action: Assign, upgrade, or change a user's subscription plan directly.
 */
export async function adminAssignUserPlanAction(
  targetUserId: string,
  planId: string,
  status: string = 'active',
  durationMonths: number = 12
): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();
  const supabase = await createAdminClient();

  // Verify target user exists
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('id', targetUserId)
    .single();

  if (!targetProfile) {
    return { success: false, error: 'Target user profile not found.' };
  }

  // Verify plan exists
  const boundPlans = supabase.from.bind(supabase) as unknown as (relation: string) => {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        maybeSingle: () => Promise<{ data: { id: string; name: string; slug: string; generation_limit: number } | null }>;
      };
    };
  };

  const { data: plan } = await boundPlans('subscription_plans')
    .select('id, name, slug, generation_limit')
    .eq('id', planId)
    .maybeSingle();

  if (!plan) {
    return { success: false, error: 'Selected subscription plan not found.' };
  }

  const periodStart = new Date().toISOString();
  const periodEnd = new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString();

  const boundSubs = supabase.from.bind(supabase) as unknown as (relation: string) => {
    upsert: (
      data: Record<string, unknown>,
      options?: { onConflict: string }
    ) => Promise<{ error: { message: string } | null }>;
  };

  const { error } = await boundSubs('user_subscriptions').upsert(
    {
      user_id: targetUserId,
      plan_id: plan.id,
      provider: 'admin_manual',
      status,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    return { success: false, error: error.message };
  }

  await logAdminAction(currentAdmin.id, 'user_plan_assigned', 'user_subscriptions', targetUserId, {
    targetEmail: targetProfile.email,
    planId: plan.id,
    planName: plan.name,
    planSlug: plan.slug,
    status,
    periodEnd,
  });

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${targetUserId}`);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/billing');
  revalidatePath('/generate');
  return {
    success: true,
    message: `Assigned ${plan.name} to ${targetProfile.email} (${status}).`,
  };
}

/**
 * Admin Action: Adjust user credit balance.
 */
export async function adminAdjustUserCreditBalanceAction(
  targetUserId: string,
  amount: number,
  type: string = 'grant',
  description: string = 'Admin manual credit adjustment'
): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();
  const supabase = await createAdminClient();

  const boundCredits = supabase.from.bind(supabase) as unknown as (relation: string) => {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        maybeSingle: () => Promise<{ data: { balance: number } | null }>;
      };
    };
    upsert: (
      data: Record<string, unknown>,
      options?: { onConflict: string }
    ) => Promise<{ error: { message: string } | null }>;
    insert: (data: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  };

  // Get current balance
  const { data: current } = await boundCredits('credit_balances')
    .select('balance')
    .eq('user_id', targetUserId)
    .maybeSingle();

  const currentBalance = current?.balance ?? 0;
  const newBalance = Math.max(0, currentBalance + amount);

  const { error: upsertErr } = await boundCredits('credit_balances').upsert(
    {
      user_id: targetUserId,
      balance: newBalance,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (upsertErr) {
    return { success: false, error: upsertErr.message };
  }

  // Record transaction
  await boundCredits('credit_transactions').insert({
    user_id: targetUserId,
    amount,
    type,
    description: description.trim(),
    created_at: new Date().toISOString(),
  });

  await logAdminAction(currentAdmin.id, 'user_credits_adjusted', 'credit_balances', targetUserId, {
    amount,
    oldBalance: currentBalance,
    newBalance,
    type,
  });

  revalidatePath(`/admin/users/${targetUserId}`);
  revalidatePath('/dashboard');
  return { success: true, message: `Updated credit balance to ${newBalance}.` };
}

/**
 * Admin Action: Create a new Subscription Plan.
 */
export async function createSubscriptionPlanAction(formData: FormData): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();
  const supabase = await createAdminClient();

  const name = (formData.get('name') as string)?.trim() || '';
  const slug = (formData.get('slug') as string)?.trim().toLowerCase() || '';
  const description = (formData.get('description') as string)?.trim() || null;
  const monthlyPrice = parseFloat((formData.get('monthly_price') as string) || '0');
  const yearlyPrice = parseFloat((formData.get('yearly_price') as string) || '0');
  const currency = (formData.get('currency') as string)?.trim().toUpperCase() || 'USD';
  const generationLimit = parseInt((formData.get('generation_limit') as string) || '10', 10);
  const storageLimitMb = parseInt((formData.get('storage_limit_mb') as string) || '100', 10);
  const isActive = formData.get('is_active') === 'true';
  const isDefault = formData.get('is_default') === 'true';

  if (!name || !slug) {
    return { success: false, error: 'Plan name and slug are required.' };
  }

  const boundPlans = supabase.from.bind(supabase) as unknown as (relation: string) => {
    insert: (data: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  };

  const { error } = await boundPlans('subscription_plans').insert({
    name,
    slug,
    description,
    monthly_price: Math.max(0, monthlyPrice),
    yearly_price: Math.max(0, yearlyPrice),
    currency,
    generation_limit: Math.max(0, generationLimit),
    storage_limit_mb: Math.max(0, storageLimitMb),
    is_active: isActive,
    is_default: isDefault,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  await logAdminAction(currentAdmin.id, 'subscription_plan_created', 'subscription_plans', slug, {
    name,
    slug,
    monthlyPrice,
    generationLimit,
  });

  revalidatePath('/admin/billing/plans');
  revalidatePath('/admin/users');
  return { success: true, message: `Created subscription plan "${name}".` };
}

/**
 * Admin Action: Update an existing Subscription Plan.
 */
export async function updateSubscriptionPlanAction(formData: FormData): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();
  const supabase = await createAdminClient();

  const id = (formData.get('id') as string)?.trim();
  const name = (formData.get('name') as string)?.trim() || '';
  const description = (formData.get('description') as string)?.trim() || null;
  const monthlyPrice = parseFloat((formData.get('monthly_price') as string) || '0');
  const yearlyPrice = parseFloat((formData.get('yearly_price') as string) || '0');
  const currency = (formData.get('currency') as string)?.trim().toUpperCase() || 'USD';
  const generationLimit = parseInt((formData.get('generation_limit') as string) || '10', 10);
  const storageLimitMb = parseInt((formData.get('storage_limit_mb') as string) || '100', 10);
  const isActive = formData.get('is_active') === 'true';
  const isDefault = formData.get('is_default') === 'true';

  if (!id || !name) {
    return { success: false, error: 'Plan ID and name are required.' };
  }

  const boundPlans = supabase.from.bind(supabase) as unknown as (relation: string) => {
    update: (data: Record<string, unknown>) => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
    };
  };

  const { error } = await boundPlans('subscription_plans')
    .update({
      name,
      description,
      monthly_price: Math.max(0, monthlyPrice),
      yearly_price: Math.max(0, yearlyPrice),
      currency,
      generation_limit: Math.max(0, generationLimit),
      storage_limit_mb: Math.max(0, storageLimitMb),
      is_active: isActive,
      is_default: isDefault,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  await logAdminAction(currentAdmin.id, 'subscription_plan_updated', 'subscription_plans', id, {
    name,
    monthlyPrice,
    generationLimit,
    isActive,
  });

  revalidatePath('/admin/billing/plans');
  revalidatePath('/admin/users');
  revalidatePath('/dashboard/billing');
  return { success: true, message: `Updated plan "${name}".` };
}

/**
 * Admin Action: Delete or deactivate a Subscription Plan.
 */
export async function deleteSubscriptionPlanAction(planId: string): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();
  const supabase = await createAdminClient();

  // Check if any active user subscriptions are linked to this plan
  const boundSubs = supabase.from.bind(supabase) as unknown as (relation: string) => {
    select: (cols: string, opts?: { count?: string; head?: boolean }) => {
      eq: (col: string, val: string) => Promise<{ count: number | null }>;
    };
  };

  const { count: subscriberCount } = await boundSubs('user_subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('plan_id', planId);

  const boundPlans = supabase.from.bind(supabase) as unknown as (relation: string) => {
    delete: () => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
    };
    update: (data: Record<string, unknown>) => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
    };
  };

  if ((subscriberCount ?? 0) > 0) {
    // Plan has subscribers; deactivate instead of hard delete to preserve referential integrity
    const { error } = await boundPlans('subscription_plans')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', planId);

    if (error) {
      return { success: false, error: error.message };
    }

    await logAdminAction(currentAdmin.id, 'subscription_plan_deactivated', 'subscription_plans', planId, {
      reason: 'Has active subscribers; deactivated instead of deleted.',
    });

    revalidatePath('/admin/billing/plans');
    return {
      success: true,
      message: `Plan has ${subscriberCount} subscriber(s); marked as INACTIVE instead of deleting.`,
    };
  }

  // Hard delete if zero subscribers
  const { error } = await boundPlans('subscription_plans')
    .delete()
    .eq('id', planId);

  if (error) {
    return { success: false, error: error.message };
  }

  await logAdminAction(currentAdmin.id, 'subscription_plan_deleted', 'subscription_plans', planId);

  revalidatePath('/admin/billing/plans');
  revalidatePath('/admin/users');
  return { success: true, message: 'Subscription plan deleted successfully.' };
}

/**
 * Admin Action: Toggle a Subscription Plan active / inactive.
 */
export async function toggleSubscriptionPlanActiveAction(
  planId: string,
  isActive: boolean
): Promise<AdminActionResult> {
  const { user: currentAdmin } = await requireAdmin();
  const supabase = await createAdminClient();

  const boundPlans = supabase.from.bind(supabase) as unknown as (relation: string) => {
    update: (data: Record<string, unknown>) => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
    };
  };

  const { error } = await boundPlans('subscription_plans')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', planId);

  if (error) {
    return { success: false, error: error.message };
  }

  await logAdminAction(currentAdmin.id, 'subscription_plan_toggled', 'subscription_plans', planId, {
    isActive,
  });

  revalidatePath('/admin/billing/plans');
  revalidatePath('/admin/users');
  return {
    success: true,
    message: isActive ? 'Plan activated.' : 'Plan deactivated.',
  };
}
