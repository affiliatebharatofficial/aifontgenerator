import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { getSiteSetting, isFeatureEnabled } from '@/lib/admin/settings-service';
import { Lock, Save, AlertTriangle } from 'lucide-react';
import { updateAuthenticationSettingsAction } from '@/lib/admin/settings-actions';

export const metadata: Metadata = {
  title: 'Authentication Controls — Admin Control',
  robots: { index: false, follow: false },
};

export default async function AdminAuthenticationSettingsPage() {
  await requireAdmin();

  const registrationEnabled = await getSiteSetting<boolean>('registration_enabled', true);
  const googleLoginEnabled = await isFeatureEnabled('google_login', true);
  const emailLoginEnabled = await getSiteSetting<boolean>('email_login_enabled', true);

  return (
    <div className="space-y-8 font-mono text-xs text-slate-300 max-w-4xl">
      <div className="space-y-1 pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-950/80 text-rose-400 border border-rose-800/60">
          <Lock className="w-3.5 h-3.5" />
          <span>SECURITY &amp; USER REGISTRATION</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 uppercase font-display">
          AUTHENTICATION CONTROLS
        </h1>
        <p className="text-xs text-slate-400">
          Control user self-registration, OAuth provider availability, and login mechanisms.
        </p>
      </div>

      {!registrationEnabled && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-xs uppercase">⚠️ USER REGISTRATION IS CURRENTLY DISABLED</span>
            <p className="text-[11px] leading-relaxed">
              New users cannot create accounts. Existing authenticated users can continue logging in normally.
            </p>
          </div>
        </div>
      )}

      <form
        action={async (formData: FormData) => {
          'use server';
          const reg = formData.get('registration_enabled') === 'true';
          const google = formData.get('google_login') === 'on';
          const email = formData.get('email_login') === 'on';
          await updateAuthenticationSettingsAction(reg, google, email);
        }}
        className="space-y-6 border border-slate-800 bg-slate-900 rounded-2xl p-6 sm:p-8"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-100 uppercase block text-sm">New User Registration</span>
              <span className="text-[10px] text-slate-500">Allow new users to sign up for accounts (/signup)</span>
            </div>
            <select
              name="registration_enabled"
              defaultValue={registrationEnabled ? 'true' : 'false'}
              className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-100 font-bold text-xs"
            >
              <option value="true">ENABLED</option>
              <option value="false">DISABLED</option>
            </select>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-100 uppercase block text-sm">Email / Password Login</span>
              <span className="text-[10px] text-slate-500">Standard email credentials authentication</span>
            </div>
            <input
              type="checkbox"
              name="email_login"
              defaultChecked={emailLoginEnabled}
              className="w-5 h-5 accent-rose-600 cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-100 uppercase block text-sm">Google OAuth Provider</span>
              <span className="text-[10px] text-slate-500">Enable Google Single Sign-On button</span>
            </div>
            <input
              type="checkbox"
              name="google_login"
              defaultChecked={googleLoginEnabled}
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
            <span>Save Authentication Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
