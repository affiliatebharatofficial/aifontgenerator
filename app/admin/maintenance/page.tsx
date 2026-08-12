import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { MaintenanceForm } from './MaintenanceForm';

export const metadata: Metadata = {
  title: 'Maintenance Mode — Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminMaintenancePage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: flagRecord } = await supabase
    .from('feature_flags')
    .select('enabled')
    .eq('key', 'maintenance_mode')
    .single();

  const { data: infoRecord } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'maintenance_info')
    .single();

  const enabled = Boolean(flagRecord?.enabled ?? false);
  const value = (infoRecord?.value as Record<string, unknown> | null) ?? {};

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-6 border-b border-slate-800 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          System Maintenance Control
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Enable global maintenance mode to temporarily restrict public access during upgrades.
        </p>
      </div>

      <MaintenanceForm
        initialEnabled={enabled}
        initialMessage={String(
          value.message ||
            'AI Font Generator is currently undergoing scheduled maintenance. Please check back shortly.'
        )}
      />
    </div>
  );
}
