import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { getSiteSetting } from '@/lib/admin/settings-service';
import { Gauge, Save, AlertCircle } from 'lucide-react';
import { updateGenerationSettingsAction } from '@/lib/admin/settings-actions';

export const metadata: Metadata = {
  title: 'Generation Settings — Admin Control',
  robots: { index: false, follow: false },
};

export default async function AdminGenerationSettingsPage() {
  await requireAdmin();

  const dailyLimit = await getSiteSetting<number>('daily_generation_limit', 10);
  const maxPromptLength = await getSiteSetting<number>('max_prompt_length', 500);
  const maxCharacterSet = await getSiteSetting<number>('max_character_set_count', 250);
  const timeoutSeconds = await getSiteSetting<number>('generation_timeout_seconds', 60);
  const maxProviderAttempts = await getSiteSetting<number>('max_provider_attempts', 3);
  const monetizationMode = await getSiteSetting<string>('monetization_mode', 'free');

  return (
    <div className="space-y-8 font-mono text-xs text-slate-300 max-w-4xl">
      <div className="space-y-1 pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-950/80 text-rose-400 border border-rose-800/60">
          <Gauge className="w-3.5 h-3.5" />
          <span>PRODUCT ENGINE CONFIGURATION</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 uppercase font-display">
          GENERATION &amp; LIMITS CONTROL
        </h1>
        <p className="text-xs text-slate-400">
          Configure server-enforced limits, timeouts, and monetization launch mode.
        </p>
      </div>

      {monetizationMode === 'paid' && (
        <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-800/80 text-amber-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-xs">⚠️ LAUNCH WARNING: Paid Monetization Mode Selected</span>
            <p className="text-[11px] leading-relaxed">
              Billing &amp; subscription gateways are not configured for initial launch. Free generation limits are active.
            </p>
          </div>
        </div>
      )}

      <form
        action={async (formData: FormData) => {
          'use server';
          await updateGenerationSettingsAction(formData);
        }}
        className="space-y-6 border border-slate-800 bg-slate-900 rounded-2xl p-6 sm:p-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-slate-400 font-bold uppercase text-[10px]">
              Daily Generation Limit (Per User)
            </label>
            <input
              type="number"
              name="daily_generation_limit"
              defaultValue={dailyLimit}
              min={1}
              max={500}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-bold text-xs outline-none focus:border-rose-500"
            />
            <span className="text-[10px] text-slate-500 block">Atomic server-side counter limit.</span>
          </div>

          <div className="space-y-2">
            <label className="block text-slate-400 font-bold uppercase text-[10px]">
              Max Prompt Length (Characters)
            </label>
            <input
              type="number"
              name="max_prompt_length"
              defaultValue={maxPromptLength}
              min={50}
              max={2000}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-bold text-xs outline-none focus:border-rose-500"
            />
            <span className="text-[10px] text-slate-500 block">Limits prompt input size.</span>
          </div>

          <div className="space-y-2">
            <label className="block text-slate-400 font-bold uppercase text-[10px]">
              Max Character Set Count
            </label>
            <input
              type="number"
              name="max_character_set_count"
              defaultValue={maxCharacterSet}
              min={50}
              max={1000}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-bold text-xs outline-none focus:border-rose-500"
            />
            <span className="text-[10px] text-slate-500 block">Maximum glyphs generated per font.</span>
          </div>

          <div className="space-y-2">
            <label className="block text-slate-400 font-bold uppercase text-[10px]">
              Generation Timeout (Seconds)
            </label>
            <input
              type="number"
              name="generation_timeout_seconds"
              defaultValue={timeoutSeconds}
              min={10}
              max={300}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-bold text-xs outline-none focus:border-rose-500"
            />
            <span className="text-[10px] text-slate-500 block">Serverless job execution timeout.</span>
          </div>

          <div className="space-y-2">
            <label className="block text-slate-400 font-bold uppercase text-[10px]">
              Max Provider Fallback Attempts
            </label>
            <input
              type="number"
              name="max_provider_attempts"
              defaultValue={maxProviderAttempts}
              min={1}
              max={5}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-bold text-xs outline-none focus:border-rose-500"
            />
            <span className="text-[10px] text-slate-500 block">Fallback retries on AI failure.</span>
          </div>

          <div className="space-y-2">
            <label className="block text-slate-400 font-bold uppercase text-[10px]">
              Monetization Mode (Launch Edition)
            </label>
            <select
              name="monetization_mode"
              defaultValue={monetizationMode}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-bold text-xs outline-none focus:border-rose-500"
            >
              <option value="free">FREE LAUNCH MODE (Active)</option>
              <option value="paid">PAID MODE (Future Architecture)</option>
            </select>
            <span className="text-[10px] text-slate-500 block">Default launch setting is FREE.</span>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>Save Generation Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
