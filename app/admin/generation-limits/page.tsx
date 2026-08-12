import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { LimitsForm } from './LimitsForm';

export const metadata: Metadata = {
  title: 'Generation Limits — Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLimitsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: settingRecord } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'generation_limits')
    .single();

  const value = (settingRecord?.value as Record<string, unknown> | null) ?? {};

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-6 border-b border-slate-800 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Generation Limits & Quotas
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Configure application-wide daily limits, maximum prompt lengths, and execution thresholds.
        </p>
      </div>

      <LimitsForm
        initialDailyLimit={Number(value.dailyLimit || 3)}
        initialMaxPromptLength={Number(value.maxPromptLength || 2000)}
      />
    </div>
  );
}
