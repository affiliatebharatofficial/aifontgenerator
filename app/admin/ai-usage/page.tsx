import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { Cpu, CheckCircle2, AlertCircle, Clock, DollarSign, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'AI Usage & Failover Analytics — Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminAIUsagePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; provider?: string; status?: string }>;
}) {
  await requireAdmin();
  const resolvedParams = await searchParams;

  const range = resolvedParams.range || '7d';
  const providerFilter = resolvedParams.provider || 'all';
  const statusFilter = resolvedParams.status || 'all';

  const supabase = await createClient();

  let query = supabase.from('ai_usage_logs').select('*');

  // Apply date range filter
  const now = new Date();
  if (range === 'today') {
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    query = query.gte('created_at', startOfDay);
  } else if (range === '7d') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte('created_at', sevenDaysAgo);
  } else if (range === '30d') {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte('created_at', thirtyDaysAgo);
  }

  if (providerFilter !== 'all') {
    query = query.eq('provider', providerFilter);
  }

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data: rawLogs } = await query.order('created_at', { ascending: false }).limit(100);

  const logs =
    (rawLogs as unknown as Array<{
      id: string;
      user_id: string | null;
      generation_id: string | null;
      provider: string;
      model: string;
      request_type: string;
      input_tokens: number | null;
      output_tokens: number | null;
      total_tokens: number | null;
      latency_ms: number;
      status: string;
      error_code: string | null;
      estimated_cost_usd: number | null;
      created_at: string;
    }>) ?? [];

  const totalRequests = logs.length;
  const successRequests = logs.filter((l) => l.status === 'success').length;
  const failedRequests = logs.filter((l) => l.status === 'failed').length;

  const totalTokens = logs.reduce((acc, l) => acc + (l.total_tokens || 0), 0);
  const totalCost = logs.reduce((acc, l) => acc + Number(l.estimated_cost_usd || 0), 0);
  const avgLatency =
    totalRequests > 0
      ? Math.round(logs.reduce((acc, l) => acc + (l.latency_ms || 0), 0) / totalRequests)
      : 0;

  // Provider health calculation
  const providersList = ['openai', 'gemini', 'openrouter', 'deepseek'];
  const providerHealthMap = providersList.map((pName) => {
    const pLogs = logs.filter((l) => l.provider === pName);
    if (pLogs.length === 0) {
      return { provider: pName, health: 'unknown', total: 0, success: 0, fail: 0, avgLatency: 0 };
    }
    const succ = pLogs.filter((l) => l.status === 'success').length;
    const fail = pLogs.filter((l) => l.status === 'failed').length;
    const successRate = succ / pLogs.length;

    let health = 'healthy';
    if (successRate < 0.5) health = 'failed';
    else if (successRate < 0.9) health = 'degraded';

    const pLatency = Math.round(pLogs.reduce((acc, l) => acc + (l.latency_ms || 0), 0) / pLogs.length);

    return { provider: pName, health, total: pLogs.length, success: succ, fail, avgLatency: pLatency };
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            AI Engine Usage & Health Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real request tracking, token consumption, model costs, and provider health metrics.
          </p>
        </div>

        {/* Filter Controls */}
        <form method="get" className="flex items-center gap-2">
          <select
            name="range"
            defaultValue={range}
            className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>

          <select
            name="provider"
            defaultValue={providerFilter}
            className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Providers</option>
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
            <option value="openrouter">OpenRouter</option>
            <option value="deepseek">DeepSeek</option>
          </select>

          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Primary Real Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="p-5 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total AI Requests</span>
            <Cpu className="w-4.5 h-4.5 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold text-slate-100 mt-2 font-mono">{totalRequests}</p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium font-mono">Successful</span>
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-emerald-400 mt-2 font-mono">{successRequests}</p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Failed / Failover</span>
            <AlertCircle className="w-4.5 h-4.5 text-rose-400" />
          </div>
          <p className="text-3xl font-bold text-rose-400 mt-2 font-mono">{failedRequests}</p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Average Latency</span>
            <Clock className="w-4.5 h-4.5 text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-slate-100 mt-2 font-mono">
            {avgLatency} <span className="text-xs text-slate-400 font-normal">ms</span>
          </p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Tokens Consumed</span>
            <Activity className="w-4.5 h-4.5 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold text-slate-100 mt-2 font-mono">{totalTokens}</p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Estimated Cost (USD)</span>
            <DollarSign className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-emerald-400 mt-2 font-mono">
            ${totalCost.toFixed(4)}
          </p>
        </Card>
      </div>

      {/* Provider Health Indicators Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Real Provider Health & Performance Indicators</span>
          </CardTitle>
          <CardDescription>Calculated live from recent request executions in ai_usage_logs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {providerHealthMap.map((ph) => (
              <div
                key={ph.provider}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase font-mono text-slate-200">
                    {ph.provider}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      ph.health === 'healthy'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : ph.health === 'degraded'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : ph.health === 'failed'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {ph.health}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                  <p>Requests: {ph.total} (Pass: {ph.success} | Fail: {ph.fail})</p>
                  <p>Avg Latency: {ph.avgLatency} ms</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Recent AI Request Execution Stream ({logs.length})</span>
          </CardTitle>
          <CardDescription>Raw attempt records inserted during font generation jobs.</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No AI usage records found for selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-500">
                    <th className="py-3 px-4">Provider / Model</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Tokens (In / Out)</th>
                    <th className="py-3 px-4">Latency</th>
                    <th className="py-3 px-4">Est. Cost</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-200">
                        {log.provider} <span className="text-slate-500 font-normal">({log.model})</span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            log.status === 'success'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {log.total_tokens !== null
                          ? `${log.total_tokens} (${log.input_tokens} / ${log.output_tokens})`
                          : 'Unavailable'}
                      </td>

                      <td className="py-3 px-4 text-slate-400">{log.latency_ms} ms</td>

                      <td className="py-3 px-4 text-emerald-400">
                        {log.estimated_cost_usd !== null
                          ? `$${Number(log.estimated_cost_usd).toFixed(5)}`
                          : 'Unavailable'}
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
