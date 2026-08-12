import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

export interface AdminMetrics {
  totalUsers: number;
  totalGenerations: number;
  completedGenerations: number;
  processingGenerations: number;
  failedGenerations: number;
  totalFiles: number;
  totalDownloads: number;
  totalStorageBytes: number;
  aiRequestsToday: number;
  aiTokensToday: number;
  aiCostToday: number;
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  await requireAdmin();
  const supabase = await createClient();

  // 1. Total Users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true });

  // 2. Generations Counts
  const { data: genStatusData } = await supabase
    .from('font_generations')
    .select('status');

  const totalGenerations = genStatusData?.length ?? 0;
  const completedGenerations = genStatusData?.filter((g) => g.status === 'completed').length ?? 0;
  const processingGenerations =
    genStatusData?.filter((g) => g.status === 'processing' || g.status === 'pending').length ?? 0;
  const failedGenerations = genStatusData?.filter((g) => g.status === 'failed').length ?? 0;

  // 3. Generated Files & Downloads Metrics
  const { data: filesData } = await supabase
    .from('generated_files')
    .select('file_size, download_count');

  const totalFiles = filesData?.length ?? 0;
  const totalDownloads = filesData?.reduce((acc, f) => acc + (f.download_count || 0), 0) ?? 0;
  const totalStorageBytes = filesData?.reduce((acc, f) => acc + Number(f.file_size || 0), 0) ?? 0;

  // 4. AI Engine Today Metrics
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const { data: aiLogsToday } = await supabase
    .from('ai_usage_logs')
    .select('total_tokens, estimated_cost_usd')
    .gte('created_at', startOfDay);

  const aiRequestsToday = aiLogsToday?.length ?? 0;
  const aiTokensToday = aiLogsToday?.reduce((acc, l) => acc + (l.total_tokens || 0), 0) ?? 0;
  const aiCostToday = aiLogsToday?.reduce((acc, l) => acc + Number(l.estimated_cost_usd || 0), 0) ?? 0;

  return {
    totalUsers: totalUsers ?? 0,
    totalGenerations,
    completedGenerations,
    processingGenerations,
    failedGenerations,
    totalFiles,
    totalDownloads,
    totalStorageBytes,
    aiRequestsToday,
    aiTokensToday,
    aiCostToday,
  };
}

export async function logAdminAction(
  adminUserId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = await createClient();
  await (supabase.from('admin_activity_logs') as unknown as {
    insert: (data: {
      admin_user_id: string;
      action: string;
      target_type: string | null;
      target_id: string | null;
      metadata: Record<string, unknown>;
    }) => Promise<unknown>;
  }).insert({
    admin_user_id: adminUserId,
    action,
    target_type: targetType || null,
    target_id: targetId || null,
    metadata: metadata || {},
  });
}
