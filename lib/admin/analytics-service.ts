import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

export interface ProviderBreakdownItem {
  provider: string;
  requests: number;
  tokens: number;
  costUsd: number;
  successRate: number;
  avgLatencyMs: number;
}

export interface ModelBreakdownItem {
  provider: string;
  model: string;
  requests: number;
  tokens: number;
  costUsd: number;
}

export interface TopDownloadedFontItem {
  generationId: string;
  fontName: string;
  category: string;
  downloads: number;
  createdAt: string;
}

export interface DailyTrendItem {
  date: string;
  completed: number;
  failed: number;
  users: number;
}

export interface AnalyticsSummary {
  period: '7d' | '30d' | '90d' | 'all';
  totalUsers: number;
  newUsersPeriod: number;
  activeUsersPeriod: number; // Authenticated users performing at least 1 product action
  totalGenerations: number;
  completedGenerations: number;
  failedGenerations: number;
  pendingGenerations: number;
  successRate: number | null; // N/A if zero terminal generations
  totalDownloads: number;
  ttfDownloads: number;
  otfDownloads: number;
  woff2Downloads: number;
  totalAIRequests: number;
  successfulAIRequests: number;
  failedAIRequests: number;
  totalAITokens: number;
  totalAICostUsd: number;
  avgAILatencyMs: number;
  importedFontsCount: number;
  versionsCreatedCount: number;
  handwritingAttemptsCount: number;
  providerBreakdown: ProviderBreakdownItem[];
  modelBreakdown: ModelBreakdownItem[];
  topDownloadedFonts: TopDownloadedFontItem[];
  errorBreakdown: Record<string, number>;
  dailyTrends: DailyTrendItem[];
}

export async function getAdminAnalytics(
  period: '7d' | '30d' | '90d' | 'all' = '30d'
): Promise<AnalyticsSummary> {
  await requireAdmin();
  const supabase = await createClient();

  // 1. Calculate Date Cutoff
  let startDate: Date | null = null;
  const now = new Date();

  if (period === '7d') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === '30d') {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (period === '90d') {
    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  }

  const startIso = startDate ? startDate.toISOString() : null;

  // 2. Fetch Profiles (Users)
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true });

  let newUsersQuery = supabase.from('profiles').select('id, created_at');
  if (startIso) newUsersQuery = newUsersQuery.gte('created_at', startIso);
  const { data: newProfiles } = await newUsersQuery;
  const newUsersPeriod = newProfiles?.length ?? 0;

  // 3. Fetch Generations
  let genQuery = supabase
    .from('font_generations')
    .select('id, user_id, font_name, category, status, generation_type, parent_generation_id, created_at');
  if (startIso) genQuery = genQuery.gte('created_at', startIso);
  const { data: rawGenerations } = await genQuery;
  const generations = rawGenerations ?? [];

  const totalGenerations = generations.length;
  const completedGenerations = generations.filter((g) => g.status === 'completed').length;
  const failedGenerations = generations.filter((g) => g.status === 'failed').length;
  const pendingGenerations = generations.filter((g) => g.status === 'pending' || g.status === 'processing').length;

  const terminalCount = completedGenerations + failedGenerations;
  const successRate = terminalCount > 0 ? (completedGenerations / terminalCount) * 100 : null;

  const versionsCreatedCount = generations.filter((g) => g.parent_generation_id !== null).length;
  const handwritingAttemptsCount = generations.filter((g) => g.generation_type === 'handwriting').length;

  // 4. Fetch Generated Files & Downloads
  const { data: rawFiles } = await supabase
    .from('generated_files')
    .select('id, generation_id, format, download_count, created_at');
  const files = rawFiles ?? [];

  const totalDownloads = files.reduce((acc, f) => acc + (f.download_count || 0), 0);
  const ttfDownloads = files.filter((f) => f.format === 'ttf').reduce((acc, f) => acc + (f.download_count || 0), 0);
  const otfDownloads = files.filter((f) => f.format === 'otf').reduce((acc, f) => acc + (f.download_count || 0), 0);
  const woff2Downloads = files.filter((f) => f.format === 'woff2').reduce((acc, f) => acc + (f.download_count || 0), 0);

  // Top Downloaded Fonts
  const downloadsMap: Record<string, number> = {};
  files.forEach((f) => {
    downloadsMap[f.generation_id] = (downloadsMap[f.generation_id] || 0) + (f.download_count || 0);
  });

  const topDownloadedFonts: TopDownloadedFontItem[] = generations
    .filter((g) => (downloadsMap[g.id] || 0) > 0)
    .map((g) => ({
      generationId: g.id,
      fontName: g.font_name || 'AI Font Specimen',
      category: g.category || 'Display',
      downloads: downloadsMap[g.id] || 0,
      createdAt: g.created_at,
    }))
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 10);

  // 5. Fetch Imported Fonts Count
  let importedQuery = supabase.from('imported_fonts').select('id, created_at');
  if (startIso) importedQuery = importedQuery.gte('created_at', startIso);
  const { data: importedData } = await importedQuery;
  const importedFontsCount = importedData?.length ?? 0;

  // 6. Fetch AI Usage Logs (using safe generic query cast)
  type AiLogRecord = {
    id: string;
    user_id: string | null;
    generation_id: string | null;
    provider: string;
    model: string;
    status: string;
    error_code: string | null;
    prompt_tokens: number | null;
    completion_tokens: number | null;
    total_tokens: number | null;
    estimated_cost_usd: number | null;
    latency_ms: number | null;
    created_at: string;
  };

  const fromAiLogs = supabase.from as unknown as (relation: string) => {
    select: (cols: string) => {
      gte: (col: string, val: string) => Promise<{ data: AiLogRecord[] | null }>;
      then: (onfulfilled?: (value: { data: AiLogRecord[] | null }) => unknown) => Promise<unknown>;
    };
  };

  const aiQuery = fromAiLogs('ai_usage_logs')
    .select('id, user_id, generation_id, provider, model, status, error_code, prompt_tokens, completion_tokens, total_tokens, estimated_cost_usd, latency_ms, created_at');
  const { data: rawAiLogs } = startIso ? await aiQuery.gte('created_at', startIso) : await aiQuery;
  const aiLogs: AiLogRecord[] = rawAiLogs ?? [];

  const totalAIRequests = aiLogs.length;
  const successfulAIRequests = aiLogs.filter((l) => l.status === 'success').length;
  const failedAIRequests = aiLogs.filter((l) => l.status === 'failed').length;
  const totalAITokens = aiLogs.reduce((acc, l) => acc + (l.total_tokens || 0), 0);
  const totalAICostUsd = aiLogs.reduce((acc, l) => acc + Number(l.estimated_cost_usd || 0), 0);

  const latencies = aiLogs.filter((l) => l.status === 'success' && l.latency_ms && l.latency_ms > 0).map((l) => l.latency_ms!);
  const avgAILatencyMs = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;

  // Provider Breakdown
  const providerGroup: Record<string, { requests: number; tokens: number; cost: number; successCount: number; latencies: number[] }> = {};
  aiLogs.forEach((l) => {
    const prov = l.provider || 'unknown';
    if (!providerGroup[prov]) {
      providerGroup[prov] = { requests: 0, tokens: 0, cost: 0, successCount: 0, latencies: [] };
    }
    providerGroup[prov].requests++;
    providerGroup[prov].tokens += l.total_tokens || 0;
    providerGroup[prov].cost += Number(l.estimated_cost_usd || 0);
    if (l.status === 'success') {
      providerGroup[prov].successCount++;
      if (l.latency_ms) providerGroup[prov].latencies.push(l.latency_ms);
    }
  });

  const providerBreakdown: ProviderBreakdownItem[] = Object.entries(providerGroup).map(([prov, stats]) => {
    const sRate = stats.requests > 0 ? (stats.successCount / stats.requests) * 100 : 0;
    const avgLat = stats.latencies.length > 0 ? Math.round(stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length) : 0;
    return {
      provider: prov.toUpperCase(),
      requests: stats.requests,
      tokens: stats.tokens,
      costUsd: stats.cost,
      successRate: Math.round(sRate),
      avgLatencyMs: avgLat,
    };
  });

  // Model Breakdown
  const modelGroup: Record<string, { provider: string; model: string; requests: number; tokens: number; cost: number }> = {};
  aiLogs.forEach((l) => {
    const key = `${l.provider}_${l.model}`;
    if (!modelGroup[key]) {
      modelGroup[key] = { provider: (l.provider || 'unknown').toUpperCase(), model: l.model || 'default', requests: 0, tokens: 0, cost: 0 };
    }
    modelGroup[key].requests++;
    modelGroup[key].tokens += l.total_tokens || 0;
    modelGroup[key].cost += Number(l.estimated_cost_usd || 0);
  });
  const modelBreakdown: ModelBreakdownItem[] = Object.values(modelGroup).map((m) => ({
    provider: m.provider,
    model: m.model,
    requests: m.requests,
    tokens: m.tokens,
    costUsd: m.cost,
  }));

  // Error Breakdown
  const errorBreakdown: Record<string, number> = {};
  aiLogs.filter((l) => l.status === 'failed' && l.error_code).forEach((l) => {
    const code = l.error_code || 'UNKNOWN_ERROR';
    errorBreakdown[code] = (errorBreakdown[code] || 0) + 1;
  });

  // 7. Active Users Period
  const fromEvents = supabase.from as unknown as (relation: string) => {
    select: (cols: string) => {
      gte: (col: string, val: string) => Promise<{ data: Array<{ user_id: string | null }> | null }>;
      then: (onfulfilled?: (value: { data: Array<{ user_id: string | null }> | null }) => unknown) => Promise<unknown>;
    };
  };

  const eventsQuery = fromEvents('analytics_events').select('user_id');
  const { data: rawEvents } = startIso ? await eventsQuery.gte('created_at', startIso) : await eventsQuery;
  const activeUserSet = new Set<string>();
  (rawEvents ?? []).forEach((e) => {
    if (e.user_id) activeUserSet.add(e.user_id);
  });
  // Add users who generated or imported fonts
  generations.forEach((g) => {
    if (g.user_id) activeUserSet.add(g.user_id);
  });
  (importedData ?? []).forEach((imp: { id: string }) => activeUserSet.add(imp.id));
  const activeUsersPeriod = activeUserSet.size;

  // 8. Daily Trends Aggregation
  const daysMap: Record<string, { completed: number; failed: number; users: number }> = {};
  generations.forEach((g) => {
    const day = g.created_at.split('T')[0];
    if (!daysMap[day]) daysMap[day] = { completed: 0, failed: 0, users: 0 };
    if (g.status === 'completed') daysMap[day].completed++;
    if (g.status === 'failed') daysMap[day].failed++;
  });

  (newProfiles ?? []).forEach((p) => {
    const day = p.created_at.split('T')[0];
    if (!daysMap[day]) daysMap[day] = { completed: 0, failed: 0, users: 0 };
    daysMap[day].users++;
  });

  const dailyTrends: DailyTrendItem[] = Object.entries(daysMap)
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    period,
    totalUsers: totalUsers ?? 0,
    newUsersPeriod,
    activeUsersPeriod,
    totalGenerations,
    completedGenerations,
    failedGenerations,
    pendingGenerations,
    successRate,
    totalDownloads,
    ttfDownloads,
    otfDownloads,
    woff2Downloads,
    totalAIRequests,
    successfulAIRequests,
    failedAIRequests,
    totalAITokens,
    totalAICostUsd,
    avgAILatencyMs,
    importedFontsCount,
    versionsCreatedCount,
    handwritingAttemptsCount,
    providerBreakdown,
    modelBreakdown,
    topDownloadedFonts,
    errorBreakdown,
    dailyTrends,
  };
}
