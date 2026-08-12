import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { HandwritingWorkflow } from '@/components/font/handwriting/HandwritingWorkflow';

export const metadata: Metadata = {
  title: 'Handwriting to Font Generator — AI Font Generator',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function HandwritingToFontPage() {
  const { user } = await getCurrentUserProfile();

  if (!user) {
    redirect('/login?redirect=/handwriting-to-font');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <HandwritingWorkflow />
      </main>

      <Footer />
    </div>
  );
}
