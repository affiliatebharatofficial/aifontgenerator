import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { redirect, notFound } from 'next/navigation';
import { getFontVersionFamily } from '@/lib/generations/service';
import { VersionComparisonView } from '@/components/font/versioning/VersionComparisonView';

export const metadata: Metadata = {
  title: 'Compare Font Versions — AI Font Generator',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function VersionComparisonPage({
  params,
}: {
  params: Promise<{ generationId: string }>;
}) {
  const { generationId } = await params;
  const { user } = await getCurrentUserProfile();

  if (!user) {
    redirect(`/login?redirect=/font/${generationId}/versions`);
  }

  const { targetGen, familyGenerations, filesMap } = await getFontVersionFamily(
    generationId,
    user.id
  );

  if (!targetGen) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <VersionComparisonView
          currentGen={targetGen}
          familyGenerations={familyGenerations}
          filesMap={filesMap}
        />
      </main>

      <Footer />
    </div>
  );
}
