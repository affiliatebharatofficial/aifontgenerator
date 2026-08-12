import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { UserRoleButton } from '../UserRoleButton';
import { UserPlanQuotaManager } from './UserPlanQuotaManager';
import { getUserDailyUsage } from '@/lib/generations/service';
import type {
  Profile,
  UserRole,
  FontGeneration,
  SubscriptionPlan,
  UserEntitlementOverride,
} from '@/types/database';

export const metadata: Metadata = {
  title: 'User Details & Quota Management — Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireAdmin();
  const { userId } = await params;
  const supabase = await createClient();

  // 1. Fetch target profile
  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const profile = rawProfile as Profile | null;

  if (!profile) {
    notFound();
  }

  // 2. Fetch all available subscription plans
  const boundPlans = supabase.from.bind(supabase) as unknown as (relation: string) => {
    select: (cols: string) => {
      order: (col: string, opts: { ascending: boolean }) => Promise<{ data: SubscriptionPlan[] | null }>;
    };
  };

  const { data: rawPlans } = await boundPlans('subscription_plans')
    .select('*')
    .order('monthly_price', { ascending: true });

  let availablePlans: SubscriptionPlan[] = rawPlans ?? [];

  if (availablePlans.length === 0) {
    availablePlans = [
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
        generation_limit: 10,
        storage_limit_mb: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  // 3. Fetch user active subscription
  const boundSubs = supabase.from.bind(supabase) as unknown as (relation: string) => {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        maybeSingle: () => Promise<{ data: { plan_id: string; subscription_plans?: SubscriptionPlan } | null }>;
      };
    };
  };

  const { data: subData } = await boundSubs('user_subscriptions')
    .select('plan_id, subscription_plans(*)')
    .eq('user_id', userId)
    .maybeSingle();

  const currentPlan: SubscriptionPlan | null =
    subData?.subscription_plans ||
    availablePlans.find((p) => p.is_default) ||
    availablePlans[0] ||
    null;

  // 4. Fetch custom daily limit override from user_entitlements
  const boundEntitlements = supabase.from.bind(supabase) as unknown as (relation: string) => {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        eq: (col: string, val: string) => {
          order: (col: string, opts: { ascending: boolean }) => {
            limit: (n: number) => {
              maybeSingle: () => Promise<{ data: UserEntitlementOverride | null }>;
            };
          };
        };
      };
    };
  };

  const { data: entitlementData } = await boundEntitlements('user_entitlements')
    .select('*')
    .eq('user_id', userId)
    .eq('feature', 'daily_generation_limit')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const currentOverride: UserEntitlementOverride | null = entitlementData ?? null;

  // 5. Fetch effective daily usage & dynamic limit
  const dailyUsage = await getUserDailyUsage(userId);

  // 6. Fetch credit balance
  const boundCredits = supabase.from.bind(supabase) as unknown as (relation: string) => {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        maybeSingle: () => Promise<{ data: { balance: number } | null }>;
      };
    };
  };

  const { data: creditData } = await boundCredits('credit_balances')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();

  const creditBalance = creditData?.balance ?? 0;

  // 7. Fetch target user's generations
  const { data: rawGenerations } = await supabase
    .from('font_generations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const generations = (rawGenerations as unknown as FontGeneration[]) ?? [];

  const completedCount = generations.filter((g) => g.status === 'completed').length;
  const failedCount = generations.filter((g) => g.status === 'failed').length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to User Directory</span>
        </Link>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-8">
        {/* User Identity Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-slate-500 font-semibold">User Details</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
              {profile.full_name || 'No Name Provided'}
            </h1>
            <p className="font-mono text-xs text-indigo-400">{profile.email}</p>
          </div>

          <UserRoleButton userId={profile.id} currentRole={profile.role as UserRole} />
        </div>

        {/* Plan & Generation Quota Management Component */}
        <UserPlanQuotaManager
          userId={profile.id}
          userEmail={profile.email}
          currentPlan={currentPlan}
          currentOverride={currentOverride}
          dailyUsage={dailyUsage}
          availablePlans={availablePlans}
          creditBalance={creditBalance}
        />

        {/* Generation Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <Card className="p-4 bg-slate-950 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Generations</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-slate-100 mt-2 font-mono">{generations.length}</p>
          </Card>

          <Card className="p-4 bg-slate-950 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium font-mono">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-2 font-mono">{completedCount}</p>
          </Card>

          <Card className="p-4 bg-slate-950 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Failed</span>
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-rose-400 mt-2 font-mono">{failedCount}</p>
          </Card>
        </div>

        {/* User Generation History */}
        <Card className="border-slate-800">
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400">
              User Font Generations ({generations.length})
            </CardTitle>
            <CardDescription>Real font generation jobs submitted by this user.</CardDescription>
          </CardHeader>
          <CardContent>
            {generations.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">User has zero font generations.</p>
            ) : (
              <div className="divide-y divide-slate-800 text-xs">
                {generations.map((g) => (
                  <div key={g.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <span className="font-semibold text-slate-200 block truncate">
                        {g.font_name || 'AI Font'}
                      </span>
                      <p className="text-[11px] text-slate-400 truncate">{g.prompt}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          g.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : g.status === 'failed'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {g.status}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {new Date(g.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
