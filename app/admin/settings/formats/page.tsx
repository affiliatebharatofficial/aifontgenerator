import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { isFeatureEnabled } from '@/lib/admin/settings-service';
import { FileType, Save } from 'lucide-react';
import { updateFormatSettingsAction } from '@/lib/admin/settings-actions';

export const metadata: Metadata = {
  title: 'Font Formats Control — Admin Control',
  robots: { index: false, follow: false },
};

export default async function AdminFormatsPage() {
  await requireAdmin();

  const ttfEnabled = await isFeatureEnabled('format_ttf', true);
  const otfEnabled = await isFeatureEnabled('format_otf', true);
  const woff2Enabled = await isFeatureEnabled('format_woff2', true);

  return (
    <div className="space-y-8 font-mono text-xs text-slate-300 max-w-4xl">
      <div className="space-y-1 pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-950/80 text-rose-400 border border-rose-800/60">
          <FileType className="w-3.5 h-3.5" />
          <span>OUTPUT BINARY FORMATS</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 uppercase font-display">
          FONT FORMAT CONTROLS
        </h1>
        <p className="text-xs text-slate-400">
          Enable or disable binary output formats supported by the engine compiler.
        </p>
      </div>

      <form
        action={async (formData: FormData) => {
          'use server';
          const ttf = formData.get('format_ttf') === 'on';
          const otf = formData.get('format_otf') === 'on';
          const woff2 = formData.get('format_woff2') === 'on';
          await updateFormatSettingsAction(ttf, otf, woff2);
        }}
        className="space-y-6 border border-slate-800 bg-slate-900 rounded-2xl p-6 sm:p-8"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-100 uppercase block text-sm">TTF — TrueType Font</span>
              <span className="text-[10px] text-slate-500">Universal desktop format (.ttf)</span>
            </div>
            <input
              type="checkbox"
              name="format_ttf"
              defaultChecked={ttfEnabled}
              className="w-5 h-5 accent-rose-600 cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-100 uppercase block text-sm">OTF — OpenType Font</span>
              <span className="text-[10px] text-slate-500">PostScript outline desktop format (.otf)</span>
            </div>
            <input
              type="checkbox"
              name="format_otf"
              defaultChecked={otfEnabled}
              className="w-5 h-5 accent-rose-600 cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-100 uppercase block text-sm">WOFF2 — Web Open Font Format 2</span>
              <span className="text-[10px] text-slate-500">Compressed browser web font format (.woff2)</span>
            </div>
            <input
              type="checkbox"
              name="format_woff2"
              defaultChecked={woff2Enabled}
              className="w-5 h-5 accent-rose-600 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>Save Format Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
