import { createClient } from '@/lib/supabase/server';
import type {
  FontGeneration,
  FontCategory,
  FontWeight,
  FontWidth,
  FontStyle,
  CharacterSetConfig,
  AdvancedSettingsConfig,
} from '@/types/database';
import { DAILY_GENERATION_LIMIT } from './constants';

import type { GenerationControls } from '@/lib/font/specification/generationControls';

export interface CreateGenerationInput {
  userId: string;
  prompt: string;
  fontName?: string;
  category: FontCategory;
  weight: FontWeight;
  width: FontWidth;
  style: FontStyle;
  characterSet: CharacterSetConfig;
  advancedSettings: AdvancedSettingsConfig;
  parentGenerationId?: string;
  generationControls?: GenerationControls;
  seed?: number;
}


export interface CreateGenerationResult {
  success: boolean;
  generationId?: string;
  status?: 'pending';
  error?: string;
  code?: 'AUTH_REQUIRED' | 'INVALID_PROMPT' | 'INVALID_CONFIGURATION' | 'GENERATION_LIMIT_REACHED' | 'SERVER_ERROR';
}

import { getSiteSetting, isFeatureEnabled } from '@/lib/admin/settings-service';
import { trackAnalyticsEvent } from '@/lib/analytics/service';

/**
 * Service: Resolves the effective daily generation limit for a user
 * Priority: 1. User custom entitlement override -> 2. User subscription plan limit -> 3. Global site setting -> 4. Fallback default
 */
export async function getUserEffectiveDailyLimit(userId: string): Promise<number> {
  const supabase = await createClient();

  // 1. Check user-specific limit override in user_entitlements
  try {
    const boundEntitlements = supabase.from.bind(supabase) as unknown as (relation: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => {
            order: (col: string, opts: { ascending: boolean }) => {
              limit: (n: number) => {
                maybeSingle: () => Promise<{ data: { limit_override: number | null; enabled: boolean; expires_at: string | null } | null }>;
              };
            };
          };
        };
      };
    };

    const { data: entitlement } = await boundEntitlements('user_entitlements')
      .select('limit_override, enabled, expires_at')
      .eq('user_id', userId)
      .eq('feature', 'daily_generation_limit')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (entitlement && entitlement.enabled && entitlement.limit_override !== null) {
      if (!entitlement.expires_at || new Date(entitlement.expires_at) > new Date()) {
        return Math.max(0, entitlement.limit_override);
      }
    }
  } catch {
    // Fallthrough if table or record unavailable
  }

  // 2. Check user's assigned subscription plan limit
  try {
    const boundSub = supabase.from.bind(supabase) as unknown as (relation: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => {
            maybeSingle: () => Promise<{ data: { subscription_plans?: { generation_limit?: number } } | null }>;
          };
        };
      };
    };

    const { data: sub } = await boundSub('user_subscriptions')
      .select('subscription_plans(generation_limit)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (sub && sub.subscription_plans && typeof sub.subscription_plans.generation_limit === 'number') {
      return Math.max(0, sub.subscription_plans.generation_limit);
    }
  } catch {
    // Fallthrough if table or record unavailable
  }

  // 3. Global site setting
  try {
    const globalLimit = await getSiteSetting<number>('daily_generation_limit', DAILY_GENERATION_LIMIT);
    return Math.max(1, globalLimit);
  } catch {
    return DAILY_GENERATION_LIMIT;
  }
}

/**
 * Service: Check current user daily generation usage with dynamic limit resolution
 */
export async function getUserDailyUsage(userId: string): Promise<{ count: number; limit: number; isLimitReached: boolean }> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('generation_usage')
    .select('generation_count')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .single();

  const currentCount = data?.generation_count ?? 0;
  const effectiveLimit = await getUserEffectiveDailyLimit(userId);

  return {
    count: currentCount,
    limit: effectiveLimit,
    isLimitReached: currentCount >= effectiveLimit,
  };
}

/**
 * Service: Create a real database generation job (status = 'pending')
 * Increments usage exactly once upon successful insertion.
 */
export async function createGenerationJob(input: CreateGenerationInput): Promise<CreateGenerationResult> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  // 0. Feature Flag Check
  const genEnabled = await isFeatureEnabled('ai_font_generation', true);
  if (!genEnabled) {
    return {
      success: false,
      code: 'SERVER_ERROR',
      error: 'AI Font Generation feature is currently disabled by administrator.',
    };
  }

  // 1. Atomic Quota Check & Increment using effective dynamic limit
  const usageInfo = await getUserDailyUsage(input.userId);
  const effectiveLimit = usageInfo.limit;

  const boundRpc = supabase.rpc.bind(supabase) as unknown as (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: Array<{ success: boolean; current_count: number; is_limit_reached: boolean }> | null; error: { message: string } | null }>;

  const { data: rpcRes, error: rpcError } = await boundRpc('increment_daily_usage', {
    p_user_id: input.userId,
    p_usage_date: today,
    p_daily_limit: effectiveLimit,
  });

  if (rpcError) {
    // Fallback: Read current count if RPC function is not created yet
    if (usageInfo.isLimitReached) {
      return {
        success: false,
        code: 'GENERATION_LIMIT_REACHED',
        error: `You have reached your daily generation limit of ${effectiveLimit} fonts. Limit resets tomorrow.`,
      };
    }
  } else if (rpcRes && Array.isArray(rpcRes) && rpcRes.length > 0) {
    const { success } = rpcRes[0];
    if (!success) {
      return {
        success: false,
        code: 'GENERATION_LIMIT_REACHED',
        error: `You have reached your daily generation limit of ${effectiveLimit} fonts. Limit resets tomorrow.`,
      };
    }
  }

  // 2. Determine parent generation and version number if regenerating
  let parentId: string | null = null;
  let versionNumber = 1;
  let generationType = 'initial';

  if (input.parentGenerationId) {
    const { data: parentGen } = await supabase
      .from('font_generations')
      .select('id, user_id, parent_generation_id, version_number, status')
      .eq('id', input.parentGenerationId)
      .eq('user_id', input.userId)
      .single();

    if (parentGen && parentGen.status === 'completed') {
      const rootId = parentGen.parent_generation_id || parentGen.id;
      parentId = rootId;
      generationType = 'regeneration';

      // Query max version in family
      const { data: family } = await supabase
        .from('font_generations')
        .select('version_number')
        .or(`id.eq.${rootId},parent_generation_id.eq.${rootId}`);

      const maxVer = (family || []).reduce(
        (max, f) => Math.max(max, f.version_number || 1),
        1
      );
      versionNumber = maxVer + 1;
    }
  }

  // 3. Insert font_generations record with status: 'pending'
  const primaryPayload: Record<string, unknown> = {
    user_id: input.userId,
    font_name: input.fontName ? input.fontName.trim() : null,
    prompt: input.prompt.trim(),
    category: input.category,
    weight: input.weight,
    width: input.width,
    style: input.style,
    character_set: input.characterSet,
    advanced_settings: input.advancedSettings,
    parent_generation_id: parentId,
    version_number: versionNumber,
    generation_type: generationType,
    status: 'pending',
  };

  if (input.generationControls) {
    primaryPayload.generation_controls = input.generationControls;
  }
  if (input.seed !== undefined) {
    primaryPayload.seed = input.seed;
  }

  let job: Record<string, unknown> | null = null;
  let insertError: { message?: string; details?: string; hint?: string } | null = null;

  const firstAttempt = await supabase
    .from('font_generations')
    .insert([primaryPayload] as any)
    .select()
    .single();

  job = firstAttempt.data as Record<string, unknown> | null;
  insertError = firstAttempt.error;

  // Fallback: If remote Supabase schema has not run Phase 24 migration yet (missing generation_controls/seed column)
  if (insertError && (insertError.message?.includes('generation_controls') || insertError.message?.includes('seed'))) {
    console.warn('Supabase DB missing generation_controls/seed columns. Retrying with legacy schema insert...');
    delete primaryPayload.generation_controls;
    delete primaryPayload.seed;

    const retryAttempt = await supabase
      .from('font_generations')
      .insert([primaryPayload] as any)
      .select()
      .single();

    job = retryAttempt.data as Record<string, unknown> | null;
    insertError = retryAttempt.error;
  }

  if (insertError || !job) {
    console.error('Failed to insert generation record:', insertError?.message, insertError?.details, insertError?.hint);
    return {
      success: false,
      code: 'SERVER_ERROR',
      error: `Failed to record font generation request in database: ${insertError?.message || 'Database insert error'}`,
    };
  }


  trackAnalyticsEvent({
    eventName: parentId ? 'version_created' : 'generation_started',
    userId: input.userId,
    entityType: 'font_generation',
    entityId: String(job.id || ''),
    metadata: {
      category: input.category,
      generationType,
      versionNumber,
    },
  }).catch(() => {});

  return {
    success: true,
    generationId: String(job.id || ''),
    status: 'pending',
  };
}

/**
 * Service: Fetch status and details for a single font generation
 */
export async function getGenerationStatus(generationId: string, userId: string): Promise<FontGeneration | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('font_generations')
    .select('*')
    .eq('id', generationId)
    .eq('user_id', userId)
    .single();

  return (data as unknown as FontGeneration | null);
}

/**
 * Service: Fetch list of generations for user (with optional status filter, search, sorting)
 */
export async function getUserGenerations(
  userId: string,
  options?: {
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<{ data: FontGeneration[]; totalCount: number }> {
  const supabase = await createClient();
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('font_generations')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status as FontGeneration['status']);
  }

  if (options?.search && options.search.trim().length > 0) {
    const safeSearch = options.search.trim().replace(/[,()]/g, '');
    if (safeSearch.length > 0) {
      const searchTerm = `%${safeSearch}%`;
      query = query.or(`font_name.ilike.${searchTerm},prompt.ilike.${searchTerm}`);
    }
  }

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, count, error } = await query;

  const rawList = (data as unknown as FontGeneration[]) ?? [];
  const pendingJobs = rawList.filter((g) => g.status === 'pending' || g.status === 'processing');

  if (pendingJobs.length > 0) {
    try {
      const { GenerationJobService } = await import('@/lib/font/generation/jobProcessor');
      await Promise.all(pendingJobs.map((j) => GenerationJobService.processJob(j.id)));

      const { data: refreshed } = await supabase
        .from('font_generations')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (refreshed) {
        return {
          data: (refreshed as unknown as FontGeneration[]) ?? [],
          totalCount: count ?? refreshed.length,
        };
      }
    } catch (e) {
      console.error('Auto-processing pending jobs failed:', e);
    }
  }

  return {
    data: rawList,
    totalCount: count ?? 0,
  };
}

/**
 * Service: Delete a pending or failed generation record
 */
export async function deleteGenerationJob(generationId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Safety check: ensure user owns job
  const { data: job } = await supabase
    .from('font_generations')
    .select('status')
    .eq('id', generationId)
    .eq('user_id', userId)
    .single();

  if (!job) {
    return { success: false, error: 'Generation record not found.' };
  }

  const { error } = await supabase
    .from('font_generations')
    .delete()
    .eq('id', generationId)
    .eq('user_id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Service: Fetch full version history family for a font generation
 */
export async function getFontVersionFamily(
  generationId: string,
  userId: string
): Promise<{
  targetGen: FontGeneration | null;
  familyGenerations: FontGeneration[];
  filesMap: Record<string, import('@/types/database').GeneratedFile[]>;
}> {
  const supabase = await createClient();

  // 1. Fetch target generation
  const { data: targetData } = await supabase
    .from('font_generations')
    .select('*')
    .eq('id', generationId)
    .eq('user_id', userId)
    .single();

  const targetGen = (targetData as unknown as FontGeneration | null);
  if (!targetGen) {
    return { targetGen: null, familyGenerations: [], filesMap: {} };
  }

  // Determine root parent ID
  const rootId = targetGen.parent_generation_id || targetGen.id;

  // 2. Fetch all versions in family (root or parent_generation_id = root)
  const { data: familyData } = await supabase
    .from('font_generations')
    .select('*')
    .eq('user_id', userId)
    .or(`id.eq.${rootId},parent_generation_id.eq.${rootId}`)
    .order('version_number', { ascending: true });

  const familyGenerations = (familyData as unknown as FontGeneration[]) ?? [];

  // 3. Fetch files for completed versions
  const completedIds = familyGenerations.filter((g) => g.status === 'completed').map((g) => g.id);
  let filesMap: Record<string, import('@/types/database').GeneratedFile[]> = {};

  if (completedIds.length > 0) {
    const { data: filesData } = await supabase
      .from('generated_files')
      .select('*')
      .in('generation_id', completedIds);

    const files = (filesData as import('@/types/database').GeneratedFile[] | null) ?? [];
    filesMap = files.reduce((acc, f) => {
      if (!acc[f.generation_id]) acc[f.generation_id] = [];
      acc[f.generation_id].push(f);
      return acc;
    }, {} as Record<string, import('@/types/database').GeneratedFile[]>);
  }

  return {
    targetGen,
    familyGenerations,
    filesMap,
  };
}

/**
 * AI Engine Worker execution boundary (Phase 3)
 * Intentionally unimplemented in Phase 2 — does NOT simulate processing or mark completed.
 */
export async function processGenerationJob(): Promise<never> {
  throw new Error('AI Font Generation Engine worker will be implemented in Phase 3.');
}

