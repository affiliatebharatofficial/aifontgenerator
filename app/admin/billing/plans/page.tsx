import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { getSiteSetting } from '@/lib/admin/settings-service';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { PlansManager } from './PlansManager';
import type { SubscriptionPlan } from '@/types/database';

export const metadata: Metadata = {
  title: 'Subscription Plans & Quota Management — Admin Control',
  robots: { index: false, follow: false },
};

export default async function AdminBillingPlansPage() {
  await requireAdmin();
  const supabase = await createClient();

  const monetizationMode = await getSiteSetting<string>('monetization_mode', 'free');
  const dailyLimit = await getSiteSetting<number>('daily_generation_limit', 10);

  let plans: SubscriptionPlan[] = [];
  const subscriberCounts: Record<string, number> = {};

  try {
    const fromPlans = supabase.from.bind(supabase) as unknown as (relation: string) => {
      select: (cols: string) => {
        order: (col: string, opts: { ascending: boolean }) => Promise<{ data: SubscriptionPlan[] | null }>;
      };
    };

    const { data: rawPlans } = await fromPlans('subscription_plans')
      .select('*')
      .order('monthly_price', { ascending: true });

    if (rawPlans && rawPlans.length > 0) {
      plans = rawPlans;
    }

    // Fetch subscriber counts per plan
    const boundSubs = supabase.from.bind(supabase) as unknown as (relation: string) => {
      select: (cols: string) => Promise<{ data: Array<{ plan_id: string }> | null }>;
    };

    const { data: allSubs } = await boundSubs('user_subscriptions').select('plan_id');
    if (allSubs) {
      allSubs.forEach((s) => {
        if (s.plan_id) {
          subscriberCounts[s.plan_id] = (subscriberCounts[s.plan_id] || 0) + 1;
        }
      });
    }
  } catch {
    // Fallback default launch plan if query fails
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
    <div className="space-y-8 font-mono text-xs text-slate-300 max-w-6xl">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-950/80 text-rose-400 border border-rose-800/60">
          <CreditCard className="w-3.5 h-3.5" />
          <span>MONETIZATION &amp; QUOTA ARCHITECTURE</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 uppercase font-display">
          SUBSCRIPTION PLANS &amp; QUOTA MANAGEMENT
        </h1>
        <p className="text-xs text-slate-400">
          Add, edit, remove, and configure subscription plans, daily generation limits, and storage quotas.
        </p>
      </div>

      {/* Mode Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="font-bold text-slate-100 uppercase text-xs block">Active Launch Mode</span>
          <span className="text-[10px] text-slate-400">
            System is running in {monetizationMode.toUpperCase()} mode. You can define custom plans and assign them to users anytime.
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold uppercase text-[10px] flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{monetizationMode.toUpperCase()} MODE</span>
        </span>
      </div>

      {/* Interactive Plans Manager Grid & Modal */}
      <PlansManager initialPlans={plans} subscriberCounts={subscriberCounts} />
    </div>
  );
}
