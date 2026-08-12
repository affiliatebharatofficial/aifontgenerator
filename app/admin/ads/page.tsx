import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { AdsForm } from './AdsForm';

export const metadata: Metadata = {
  title: 'Ads Management — Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminAdsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: settingRecord } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'ads_config')
    .single();

  const value = (settingRecord?.value as Record<string, unknown> | null) ?? {};

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-6 border-b border-slate-800 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          AdSense & Monetization
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Configure advertising slots, publisher IDs, and layout placement rules.
        </p>
      </div>

      <AdsForm
        initialEnabled={Boolean(value.enabled ?? false)}
        initialPublisherId={String(value.publisherId || '')}
        initialHeaderSlot={String(value.headerSlot || '')}
        initialSidebarSlot={String(value.sidebarSlot || '')}
        initialFooterSlot={String(value.footerSlot || '')}
      />
    </div>
  );
}
