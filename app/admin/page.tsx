import type { Metadata } from 'next';
import { getAdminMetrics } from '@/lib/admin/service';
import { getSiteSetting, isFeatureEnabled } from '@/lib/admin/settings-service';
import {
  Users,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  HardDrive,
  Download,
  ShieldCheck,
  Cpu,
  Activity,
  DollarSign,
  Check,
  X,
  Megaphone,
  Wrench,
  Gauge,
  Lock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Control Overview — AI Font Generator',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardPage() {
  const metrics = await getAdminMetrics();

  const mbStorage = (metrics.totalStorageBytes / (1024 * 1024)).toFixed(2);

  // Real database configuration health checks
  const monetizationMode = await getSiteSetting<string>('monetization_mode', 'free');
  const dailyLimit = await getSiteSetting<number>('daily_generation_limit', 10);
  const aiGenEnabled = await isFeatureEnabled('ai_font_generation', true);
  const handwritingEnabled = await isFeatureEnabled('handwriting_to_font', true);
  const importEnabled = await isFeatureEnabled('font_import', true);
  const downloadsEnabled = await isFeatureEnabled('font_downloads', true);
  const adsEnabled = await getSiteSetting<boolean>('ads_enabled', false);
  const adsensePubId = await getSiteSetting<string>('adsense_publisher_id', '');
  const maintenanceActive = await getSiteSetting<boolean>('maintenance_enabled', false);
  const registrationEnabled = await getSiteSetting<boolean>('registration_enabled', true);

  return (
    <div className="max-w-7xl mx-auto space-y-10 font-mono text-xs text-slate-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-display uppercase">
            CENTRAL SYSTEM OVERVIEW
          </h1>
          <p className="text-xs text-slate-400">
            Real-time platform metrics and active operational configuration.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold shrink-0">
          <ShieldCheck className="w-4 h-4" />
          <span>SERVER AUTHENTICATED ADMIN</span>
        </div>
      </div>

      {/* Configuration Health Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            01 • SYSTEM CONFIGURATION HEALTH
          </h2>
          <span className="text-[10px] text-rose-400 font-bold uppercase border border-rose-800/60 bg-rose-950/40 px-2 py-0.5 rounded">
            LAUNCH MODE: {monetizationMode.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-100 block text-xs">AI Generation</span>
              <span className="text-[10px] text-slate-500">{dailyLimit} / user / day</span>
            </div>
            {aiGenEnabled ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-rose-400" />}
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-100 block text-xs">Handwriting Engine</span>
              <span className="text-[10px] text-slate-500">Vector pipeline</span>
            </div>
            {handwritingEnabled ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-rose-400" />}
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-100 block text-xs">Font Importer</span>
              <span className="text-[10px] text-slate-500">Private workspace</span>
            </div>
            {importEnabled ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-rose-400" />}
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-100 block text-xs">Font Downloads</span>
              <span className="text-[10px] text-slate-500">TTF / OTF / WOFF2</span>
            </div>
            {downloadsEnabled ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-rose-400" />}
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-100 block text-xs">AdSense Ads</span>
              <span className="text-[10px] text-slate-500">{adsensePubId ? 'Configured' : 'No Pub ID'}</span>
            </div>
            {adsEnabled && adsensePubId ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-slate-500" />}
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-100 block text-xs">Registration</span>
              <span className="text-[10px] text-slate-500">User signups</span>
            </div>
            {registrationEnabled ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-rose-400" />}
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-between col-span-2">
            <div>
              <span className="font-bold text-slate-100 block text-xs">Maintenance Mode</span>
              <span className="text-[10px] text-slate-500">Public app lock</span>
            </div>
            {maintenanceActive ? (
              <span className="text-[10px] font-bold text-rose-400 bg-rose-950 border border-rose-800 px-2 py-0.5 rounded">
                ACTIVE
              </span>
            ) : (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                OFF
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Real Statistics Grid */}
      <div className="space-y-4">
        <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
          02 • DATABASE METRICS &amp; TELEMETRY
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Registered Users</span>
              <Users className="w-4.5 h-4.5 text-rose-400" />
            </div>
            <p className="text-3xl font-bold text-slate-100 mt-3 font-mono">{metrics.totalUsers}</p>
          </Card>

          <Card className="p-5 bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Font Generations</span>
              <Layers className="w-4.5 h-4.5 text-rose-400" />
            </div>
            <p className="text-3xl font-bold text-slate-100 mt-3 font-mono">{metrics.totalGenerations}</p>
          </Card>

          <Card className="p-5 bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Completed Fonts</span>
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-emerald-400 mt-3 font-mono">
              {metrics.completedGenerations}
            </p>
          </Card>

          <Card className="p-5 bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Processing / Pending</span>
              <Clock className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-amber-400 mt-3 font-mono">
              {metrics.processingGenerations}
            </p>
          </Card>

          <Card className="p-5 bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Failed Jobs</span>
              <AlertCircle className="w-4.5 h-4.5 text-rose-400" />
            </div>
            <p className="text-3xl font-bold text-rose-400 mt-3 font-mono">
              {metrics.failedGenerations}
            </p>
          </Card>

          <Card className="p-5 bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Binary Files</span>
              <HardDrive className="w-4.5 h-4.5 text-rose-400" />
            </div>
            <p className="text-3xl font-bold text-slate-100 mt-3 font-mono">{metrics.totalFiles}</p>
          </Card>

          <Card className="p-5 bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Downloads Executed</span>
              <Download className="w-4.5 h-4.5 text-rose-400" />
            </div>
            <p className="text-3xl font-bold text-slate-100 mt-3 font-mono">{metrics.totalDownloads}</p>
          </Card>

          <Card className="p-5 bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Storage Utilization</span>
              <HardDrive className="w-4.5 h-4.5 text-rose-400" />
            </div>
            <p className="text-3xl font-bold text-slate-100 mt-3 font-mono">{mbStorage} <span className="text-xs text-slate-400 font-normal">MB</span></p>
          </Card>

          <Card className="p-5 bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">AI Requests Today</span>
              <Cpu className="w-4.5 h-4.5 text-rose-400" />
            </div>
            <p className="text-3xl font-bold text-slate-100 mt-3 font-mono">{metrics.aiRequestsToday}</p>
          </Card>

          <Card className="p-5 bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">AI Tokens Today</span>
              <Activity className="w-4.5 h-4.5 text-rose-400" />
            </div>
            <p className="text-3xl font-bold text-slate-100 mt-3 font-mono">{metrics.aiTokensToday}</p>
          </Card>

          <Card className="p-5 bg-slate-900 border-slate-800 col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">AI Cost Today (USD)</span>
              <DollarSign className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-emerald-400 mt-3 font-mono">${metrics.aiCostToday.toFixed(4)}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
