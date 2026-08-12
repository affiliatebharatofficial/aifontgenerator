import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { SiteSettingsForm } from './SiteSettingsForm';

export const metadata: Metadata = {
  title: 'Site Settings — Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminSiteSettingsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: settingRecord } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'site_info')
    .single();

  const value = (settingRecord?.value as Record<string, unknown> | null) ?? {};

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-6 border-b border-slate-800 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Site Identity & Announcements
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage branding metadata, support contacts, and public notification banners.
        </p>
      </div>

      <SiteSettingsForm
        initialSiteName={String(value.siteName || 'AI Font Generator')}
        initialSupportEmail={String(value.supportEmail || 'support@ai-fontgenerator.com')}
        initialAnnouncementEnabled={Boolean(value.announcementEnabled ?? false)}
        initialAnnouncementMessage={String(value.announcementMessage || '')}
      />
    </div>
  );
}
