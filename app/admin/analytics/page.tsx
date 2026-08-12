import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { getAdminAnalytics } from '@/lib/admin/analytics-service';
import {
  BarChart3,
  Users,
  Layers,
  Download,
  Cpu,
  DollarSign,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileType,
  Sparkles,
  FileCheck,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Analytics & BI — Admin Control Center',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;
  const rawPeriod = params.period;
  const period = rawPeriod === '7d' || rawPeriod === '90d' || rawPeriod === 'all' ? rawPeriod : '30d';

  const data = await getAdminAnalytics(period);

  const periodLabels: Record<string, string> = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    all: 'All Time',
  };

  return (
    <div className="space-y-10 font-mono text-xs text-slate-300 max-w-7xl mx-auto">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-950/80 text-rose-400 border border-rose-800/60">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>REAL DATABASE BI &amp; TELEMETRY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 uppercase font-display tracking-tight">
            ANALYTICS &amp; BUSINESS INTELLIGENCE
          </h1>
          <p className="text-xs text-slate-400">
            Platform usage metrics calculated strictly from live database records. No fabricated data.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
          {(['7d', '30d', '90d', 'all'] as const).map((p) => (
            <Link
              key={p}
              href={`/admin/analytics?period=${p}`}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all ${
                period === p
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-950/60'
              }`}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : 'All Time'}
            </Link>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Total / New Users</span>
            <Users className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-100 font-mono">{data.totalUsers}</span>
            <span className="text-xs text-emerald-400 font-bold">+{data.newUsersPeriod} new</span>
          </div>
          <p className="text-[10px] text-slate-500">
            Active in period: <span className="text-slate-300 font-bold">{data.activeUsersPeriod}</span> (authenticated actions)
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Total Font Generations</span>
            <Layers className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-100 font-mono">{data.totalGenerations}</span>
            <span className="text-xs text-rose-400 font-bold">
              {data.successRate !== null ? `${data.successRate.toFixed(1)}% success` : 'N/A'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            {data.completedGenerations} completed, {data.failedGenerations} failed
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Binary Downloads Executed</span>
            <Download className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-100 font-mono">{data.totalDownloads}</span>
            <span className="text-[10px] text-slate-400">
              WOFF2: <span className="font-bold text-slate-200">{data.woff2Downloads}</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            TTF: {data.ttfDownloads} | OTF: {data.otfDownloads}
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">AI Telemetry &amp; Cost</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-emerald-400 font-mono">
              ${data.totalAICostUsd.toFixed(4)}
            </span>
            <span className="text-[10px] text-slate-400">
              {data.avgAILatencyMs > 0 ? `${data.avgAILatencyMs}ms avg` : '—'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            {data.totalAIRequests} requests ({data.totalAITokens.toLocaleString()} tokens)
          </p>
        </div>
      </div>

      {/* SECTION 1: GENERATIONS & STATUS BREAKDOWN */}
      <div className="space-y-4">
        <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
          01 • GENERATION PIPELINE STATUS ({periodLabels[period]})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="font-bold uppercase text-[10px]">Completed Fonts</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 font-mono">{data.completedGenerations}</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1">
            <div className="flex items-center justify-between text-rose-400">
              <span className="font-bold uppercase text-[10px]">Failed Jobs</span>
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-rose-400 font-mono">{data.failedGenerations}</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1">
            <div className="flex items-center justify-between text-amber-400">
              <span className="font-bold uppercase text-[10px]">Processing / Pending</span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-amber-400 font-mono">{data.pendingGenerations}</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1">
            <div className="flex items-center justify-between text-indigo-400">
              <span className="font-bold uppercase text-[10px]">Terminal Success Rate</span>
              <Zap className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-indigo-300 font-mono">
              {data.successRate !== null ? `${data.successRate.toFixed(1)}%` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: AI ENGINE PROVIDER & MODEL BREAKDOWN */}
      <div className="space-y-4">
        <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
          02 • AI PROVIDER &amp; MODEL BREAKDOWN
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Provider Breakdown Table */}
          <div className="border border-slate-800 bg-slate-900 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 uppercase text-xs">AI Providers Performance</span>
              <Cpu className="w-4 h-4 text-rose-400" />
            </div>

            {data.providerBreakdown.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono">
                No AI usage records recorded in this period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 pb-2">
                      <th className="pb-2">Provider</th>
                      <th className="pb-2 text-right">Requests</th>
                      <th className="pb-2 text-right">Success</th>
                      <th className="pb-2 text-right">Latency</th>
                      <th className="pb-2 text-right">Cost (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {data.providerBreakdown.map((p) => (
                      <tr key={p.provider} className="text-slate-200">
                        <td className="py-2.5 font-bold text-rose-400">{p.provider}</td>
                        <td className="py-2.5 text-right">{p.requests}</td>
                        <td className="py-2.5 text-right text-emerald-400">{p.successRate}%</td>
                        <td className="py-2.5 text-right text-slate-400">{p.avgLatencyMs}ms</td>
                        <td className="py-2.5 text-right font-bold text-emerald-400">
                          ${p.costUsd.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Model Breakdown Table */}
          <div className="border border-slate-800 bg-slate-900 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 uppercase text-xs">Active AI Models</span>
              <Activity className="w-4 h-4 text-rose-400" />
            </div>

            {data.modelBreakdown.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono">
                No model telemetry recorded in this period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 pb-2">
                      <th className="pb-2">Model</th>
                      <th className="pb-2">Provider</th>
                      <th className="pb-2 text-right">Requests</th>
                      <th className="pb-2 text-right">Tokens</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {data.modelBreakdown.map((m) => (
                      <tr key={`${m.provider}_${m.model}`} className="text-slate-200">
                        <td className="py-2.5 font-bold text-slate-100">{m.model}</td>
                        <td className="py-2.5 text-slate-400">{m.provider}</td>
                        <td className="py-2.5 text-right">{m.requests}</td>
                        <td className="py-2.5 text-right text-slate-400">{m.tokens.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: TOP DOWNLOADED TYPEFACES & FORMAT BREAKDOWN */}
      <div className="space-y-4">
        <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
          03 • TOP DOWNLOADED TYPEFACES &amp; FORMAT SPECIMENS
        </h2>

        <div className="border border-slate-800 bg-slate-900 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-100 uppercase text-xs">Most Downloaded User Typefaces</span>
            <FileType className="w-4 h-4 text-rose-400" />
          </div>

          {data.topDownloadedFonts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono">
              No font downloads executed in this period yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                    <th className="p-3">Typeface Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Downloads</th>
                    <th className="p-3 text-right">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {data.topDownloadedFonts.map((font) => (
                    <tr key={font.generationId} className="hover:bg-slate-950/30">
                      <td className="p-3 font-bold text-slate-100">{font.fontName}</td>
                      <td className="p-3 text-slate-400 uppercase text-[10px]">{font.category}</td>
                      <td className="p-3 text-right font-bold text-emerald-400">{font.downloads}</td>
                      <td className="p-3 text-right text-slate-500 text-[10px]">
                        {new Date(font.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: FEATURE USAGE & PIPELINE TELEMETRY */}
      <div className="space-y-4">
        <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
          04 • FEATURE USAGE &amp; PIPELINE METRICS
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-bold uppercase text-[10px]">Private Font Imports</span>
              <FileCheck className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-3xl font-bold text-slate-100 font-mono">{data.importedFontsCount}</p>
            <p className="text-[10px] text-slate-500">TTF, OTF, WOFF, WOFF2 workspace uploads</p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-bold uppercase text-[10px]">Handwriting Font Jobs</span>
              <Sparkles className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-3xl font-bold text-slate-100 font-mono">{data.handwritingAttemptsCount}</p>
            <p className="text-[10px] text-slate-500">Sample vector glyph conversions</p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-bold uppercase text-[10px]">Font Versions Created</span>
              <Layers className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-3xl font-bold text-slate-100 font-mono">{data.versionsCreatedCount}</p>
            <p className="text-[10px] text-slate-500">Regenerations V1 → V2 → V3</p>
          </div>
        </div>
      </div>
    </div>
  );
}
