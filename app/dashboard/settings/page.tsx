import type { Metadata } from 'next';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { SettingsForm } from './SettingsForm';

export const metadata: Metadata = {
  title: 'Workspace Settings — AI Font Generator',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SettingsPage() {
  const { user } = await getCurrentUserProfile();

  if (!user) {
    redirect('/login?redirect=/dashboard/settings');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-6 border-b border-slate-800 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Workspace Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Configure your editor preview preferences, UI theme, and localization options.
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}
