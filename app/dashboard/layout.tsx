import type { Metadata } from 'next';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

export const metadata: Metadata = {
  title: 'Dashboard Workspace — AI Font Generator',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentUserProfile();

  if (!user) {
    redirect('/login?redirect=/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#09090b] text-[#f4f4f5]">
      <DashboardSidebar
        userEmail={user.email || ''}
        fullName={profile?.full_name || null}
        role={profile?.role || 'user'}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
