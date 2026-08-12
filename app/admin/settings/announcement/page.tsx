import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { getSiteSetting } from '@/lib/admin/settings-service';
import { BellRing, Save } from 'lucide-react';
import { updateAnnouncementSettingsAction } from '@/lib/admin/settings-actions';

export const metadata: Metadata = {
  title: 'Announcement Bar — Admin Control',
  robots: { index: false, follow: false },
};

export default async function AdminAnnouncementSettingsPage() {
  await requireAdmin();

  const enabled = await getSiteSetting<boolean>('announcement_enabled', false);
  const message = await getSiteSetting<string>('announcement_message', '✨ AI Font Generator Phase 16 Live — Free Launch Edition');
  const linkText = await getSiteSetting<string>('announcement_link_text', 'Try Generator');
  const linkUrl = await getSiteSetting<string>('announcement_link_url', '/generate');

  return (
    <div className="space-y-8 font-mono text-xs text-slate-300 max-w-4xl">
      <div className="space-y-1 pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-950/80 text-rose-400 border border-rose-800/60">
          <BellRing className="w-3.5 h-3.5" />
          <span>GLOBAL SITE BANNER</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 uppercase font-display">
          ANNOUNCEMENT BAR CONTROL
        </h1>
        <p className="text-xs text-slate-400">
          Toggle and customize the global top announcement banner rendered across public pages.
        </p>
      </div>

      <form
        action={async (formData: FormData) => {
          'use server';
          await updateAnnouncementSettingsAction(formData);
        }}
        className="space-y-6 border border-slate-800 bg-slate-900 rounded-2xl p-6 sm:p-8"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-100 uppercase block text-sm">Announcement Bar Enabled</span>
              <span className="text-[10px] text-slate-500">Render top notification banner across public pages</span>
            </div>
            <select
              name="announcement_enabled"
              defaultValue={enabled ? 'true' : 'false'}
              className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-100 font-bold text-xs"
            >
              <option value="true">ENABLED</option>
              <option value="false">DISABLED</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-400 font-bold uppercase text-[10px]">
              Announcement Message
            </label>
            <input
              type="text"
              name="announcement_message"
              defaultValue={message}
              placeholder="e.g. ✨ Free AI Font Generator launch edition live"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-slate-400 font-bold uppercase text-[10px]">
                Link Text (Optional)
              </label>
              <input
                type="text"
                name="announcement_link_text"
                defaultValue={linkText}
                placeholder="e.g. Try Generator"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-bold text-xs outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-400 font-bold uppercase text-[10px]">
                Link Destination URL
              </label>
              <input
                type="text"
                name="announcement_link_url"
                defaultValue={linkUrl}
                placeholder="e.g. /generate"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>Save Announcement</span>
          </button>
        </div>
      </form>
    </div>
  );
}
