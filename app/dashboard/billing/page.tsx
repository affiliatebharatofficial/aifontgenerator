import type { Metadata } from 'next';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { getUserEntitlements } from '@/lib/auth/entitlement-service';
import { CreditCard, Check, ShieldCheck, Zap, Layers, Lock } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Billing & Plan Entitlements — AI Font Generator',
  robots: { index: false, follow: false },
};

export default async function UserBillingPage() {
  const { user } = await getCurrentUserProfile();
  if (!user) {
    redirect('/login?redirectTo=/dashboard/billing');
  }
  const entitlements = await getUserEntitlements(user.id);

  const usagePercent = Math.min(
    100,
    Math.round((entitlements.dailyUsageCount / entitlements.dailyGenerationLimit) * 100)
  );

  return (
    <div className="space-y-8 font-mono text-xs text-[#f4f4f5] max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-[#27272a]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#e05638]/10 text-[#e05638] border border-[#e05638]/30">
          <CreditCard className="w-3.5 h-3.5" />
          <span>LAUNCH EDITION ENTITLEMENTS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-normal text-[#f4f4f5] uppercase font-display tracking-tight">
          PLAN &amp; USAGE QUOTAS
        </h1>
        <p className="text-xs text-[#a1a1aa]">
          Manage your current plan, check daily generation quotas, and inspect feature entitlements.
        </p>
      </div>

      {/* Current Active Plan Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[#27272a] bg-[#121215] space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272a] pb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-[#e05638] tracking-widest block">
              ACTIVE MEMBERSHIP
            </span>
            <h2 className="text-2xl font-bold text-[#f4f4f5] font-display uppercase">
              {entitlements.planName}
            </h2>
            <p className="text-xs text-[#a1a1aa]">
              Standard free launch tier with daily AI font generation quotas.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 font-bold uppercase text-xs shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>ACTIVE (FREE EDITION)</span>
          </div>
        </div>

        {/* Daily Generation Quota Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#f4f4f5] uppercase flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#e05638]" />
              Daily Font Generation Quota
            </span>
            <span className="font-mono text-[#e05638]">
              {entitlements.dailyUsageCount} of {entitlements.dailyGenerationLimit} used today
            </span>
          </div>

          <div className="w-full bg-[#18181b] border border-[#27272a] h-3 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                entitlements.isLimitReached ? 'bg-rose-500' : 'bg-[#e05638]'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#71717a]">
            <span>Resets daily at 00:00 UTC</span>
            <span>{entitlements.remainingGenerations} generations remaining</span>
          </div>
        </div>

        {/* Feature Entitlements Checklist */}
        <div className="pt-4 border-t border-[#27272a] space-y-3">
          <span className="text-[10px] font-bold uppercase text-[#a1a1aa] block tracking-wider">
            INCLUDED FEATURE ENTITLEMENTS
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-[#f4f4f5]">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>AI Font Generation Engine</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#f4f4f5]">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Font Testing Studio Specimen Canvas</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#f4f4f5]">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Private Font Workspace Importer</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#f4f4f5]">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Handwriting to Vector Font Generator</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#f4f4f5]">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Font Versioning (V1, V2, V3 timeline)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#f4f4f5]">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>TTF, OTF, and WOFF2 Binary Downloads</span>
            </div>
          </div>
        </div>
      </div>

      {/* Future Pro Tier Preview (Coming Soon) */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[#27272a] bg-[#121215]/50 space-y-4 opacity-85">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#a1a1aa]" />
            <span className="font-bold text-sm text-[#f4f4f5] uppercase font-display">
              FUTURE PRO TIER ARCHITECTURE
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#27272a] text-[#a1a1aa] font-bold text-[10px] uppercase border border-[#3f3f46]">
            COMING SOON — FREE LAUNCH EDITION
          </span>
        </div>

        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          AI Font Generator is currently in 100% Free Launch Mode. Higher volume tier limits and commercial credit systems will be introduced in future platform upgrades.
        </p>

        <div className="pt-2 flex justify-start">
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#27272a] text-[#f4f4f5] font-bold text-xs uppercase hover:bg-[#3f3f46] transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Continue Free Generation</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
