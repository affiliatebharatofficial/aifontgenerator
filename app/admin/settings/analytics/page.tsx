import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { getSiteSetting } from '@/lib/admin/settings-service';
import { BarChart3, Save } from 'lucide-react';
import { setSiteSetting } from '@/lib/admin/settings-service';
import { revalidatePath } from 'next/cache';

export const metadata: Metadata = {
  title: 'Analytics Configuration — Admin Control',
  robots: { index: false, follow: false },
};

export default async function AdminAnalyticsSettingsPage() {
  const { user: currentAdmin } = await requireAdmin();

  const gaId = await getSiteSetting<string>('google_analytics_id', '');

  return (
    <div className="space-y-8 font-mono text-xs text-slate-300 max-w-4xl">
      <div className="space-y-1 pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-950/80 text-rose-400 border border-rose-800/60">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>REAL-TIME MEASUREMENT</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 uppercase font-display">
          ANALYTICS CONFIGURATION
        </h1>
        <p className="text-xs text-slate-400">
          Configure Google Analytics Measurement ID (G-XXXXXXX). Analytics scripts load non-blocking only when configured.
        </p>
      </div>

      <form
        action={async (formData: FormData) => {
          'use server';
          const { user } = await requireAdmin();
          const id = (formData.get('google_analytics_id') as string)?.trim() || '';
          await setSiteSetting(user.id, 'google_analytics_id', id, 'Google Analytics Measurement ID');
          revalidatePath('/', 'layout');
        }}
        className="space-y-6 border border-slate-800 bg-slate-900 rounded-2xl p-6 sm:p-8"
      >
        <div className="space-y-2">
          <label className="block text-slate-400 font-bold uppercase text-[10px]">
            Google Analytics Measurement ID
          </label>
          <input
            type="text"
            name="google_analytics_id"
            defaultValue={gaId}
            placeholder="e.g. G-XXXXXXXXXX"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-bold text-xs outline-none focus:border-rose-500"
          />
          <span className="text-[10px] text-slate-500 block">
            {gaId ? `Configured ID: ${gaId}` : 'Not configured. Leave blank to disable analytics scripts.'}
          </span>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>Save Analytics Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
