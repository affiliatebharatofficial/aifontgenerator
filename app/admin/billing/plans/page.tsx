import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { getSiteSetting } from '@/lib/admin/settings-service';
import { CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Billing & Plan Architecture — Admin Control',
  robots: { index: false, follow: false },
};

export interface SubscriptionPlanRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  is_default: boolean;
  monthly_price: number;
  yearly_price: number;
  currency: string;
  generation_limit: number;
  storage_limit_mb: number;
  created_at: string;
  updated_at: string;
}

export default async function AdminBillingPlansPage() {
  await requireAdmin();
  const supabase = await createClient();

  const monetizationMode = await getSiteSetting<string>('monetization_mode', 'free');
  const dailyLimit = await getSiteSetting<number>('daily_generation_limit', 10);

  let plans: SubscriptionPlanRecord[] = [];

  try {
    const fromPlans = supabase.from.bind(supabase) as unknown as (relation: string) => {
      select: (cols: string) => {
        order: (col: string, opts: { ascending: boolean }) => Promise<{ data: SubscriptionPlanRecord[] | null }>;
      };
    };

    const { data: rawPlans } = await fromPlans('subscription_plans')
      .select('*')
      .order('monthly_price', { ascending: true });

    if (rawPlans && rawPlans.length > 0) {
      plans = rawPlans;
    }
  } catch {
    // Fallback default launch plan if table query fails
  }

  if (plans.length === 0) {
    plans = [
      {
        id: 'default-free-plan',
        name: 'Free Plan',
        slug: 'free',
        description: 'Canonical free launch plan with daily AI font generation quotas.',
        is_active: true,
        is_default: true,
        monthly_price: 0,
        yearly_price: 0,
        currency: 'USD',
        generation_limit: dailyLimit,
        storage_limit_mb: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  return (
    <div className="space-y-8 font-mono text-xs text-slate-300 max-w-4xl">
      <div className="space-y-1 pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-950/80 text-rose-400 border border-rose-800/60">
          <CreditCard className="w-3.5 h-3.5" />
          <span>MONETIZATION ARCHITECTURE</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 uppercase font-display">
          SUBSCRIPTION PLANS &amp; BILLING CONFIGURATION
        </h1>
        <p className="text-xs text-slate-400">
          Inspect subscription plan records and monetization settings.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="font-bold text-slate-100 uppercase text-xs block">Active Launch Mode</span>
          <span className="text-[10px] text-slate-400">
            System is configured to run in FREE launch mode using admin generation limits.
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold uppercase text-[10px] flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{monetizationMode.toUpperCase()} MODE</span>
        </span>
      </div>

      {monetizationMode === 'paid' && (
        <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-800 text-amber-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-xs uppercase">⚠️ Billing is not configured</span>
            <p className="text-[11px] leading-relaxed">
              Payment gateways are not connected. Free launch limits remain active to prevent service interruption.
            </p>
          </div>
        </div>
      )}

      {/* Subscription Plans List */}
      <div className="space-y-4">
        <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
          REGISTERED SUBSCRIPTION PLANS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="p-6 rounded-2xl border border-slate-800 bg-slate-900 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-100 text-base uppercase font-display">{plan.name}</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">slug: {plan.slug}</span>
                </div>
                {plan.is_default && (
                  <span className="px-2.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-950 text-rose-400 border border-rose-800">
                    DEFAULT LAUNCH PLAN
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{plan.description}</p>

              <div className="pt-3 border-t border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Price:</span>
                  <span className="font-bold text-slate-100">${Number(plan.monthly_price).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Daily Generation Quota:</span>
                  <span className="font-bold text-emerald-400">{dailyLimit} / user / day</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
