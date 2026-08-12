import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { getFontVersionFamily } from '@/lib/generations/service';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FontResultClientView } from '@/components/font/FontResultClientView';

export const metadata: Metadata = {
  title: 'Font Specimen — AI Font Generator',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FontResultPage({
  params,
}: {
  params: Promise<{ generationId: string }>;
}) {
  const { generationId } = await params;
  const { user } = await getCurrentUserProfile();

  if (!user) {
    redirect(`/login?redirect=/font/${generationId}`);
  }

  // Fetch generation & version family
  const { targetGen: generation, familyGenerations, filesMap } = await getFontVersionFamily(
    generationId,
    user.id
  );

  if (!generation) {
    notFound();
  }

  if (generation.status !== 'completed') {
    redirect(`/generate/status/${generation.id}`);
  }

  const files = filesMap[generation.id] || [];

  if (files.length === 0) {
    redirect(`/generate/status/${generation.id}`);
  }

  return (

    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        <div>
          <Link
            href="/dashboard/library"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Type Library</span>
          </Link>
        </div>

        <FontResultClientView
          generation={generation}
          familyGenerations={familyGenerations}
          files={files}
        />

      </main>

      <Footer />
    </div>
  );
}
