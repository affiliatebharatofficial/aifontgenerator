import type { Metadata } from 'next';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { ProfileForm } from './ProfileForm';

export const metadata: Metadata = {
  title: 'Profile Settings — AI Font Generator',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfilePage() {
  const { user, profile } = await getCurrentUserProfile();

  if (!user) {
    redirect('/login?redirect=/dashboard/profile');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-6 border-b border-slate-800 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Account Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your personal account details and public workspace profile.
        </p>
      </div>

      <ProfileForm
        userEmail={user.email || ''}
        fullName={profile?.full_name || ''}
        avatarUrl={profile?.avatar_url || ''}
        role={profile?.role || 'user'}
        createdAt={profile?.created_at || (user as { created_at?: string }).created_at || new Date().toISOString()}
      />
    </div>
  );
}
