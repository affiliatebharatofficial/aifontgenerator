import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { getGenerationStatus } from '@/lib/generations/service';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { FontTestingStudio } from '@/components/font/studio/FontTestingStudio';
import type { GeneratedFile } from '@/types/database';

export const metadata: Metadata = {
  title: 'Font Testing Studio — AI Font Generator',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FontTestingStudioPage({
  params,
}: {
  params: Promise<{ generationId: string }>;
}) {
  const { generationId } = await params;
  const { user } = await getCurrentUserProfile();

  if (!user) {
    redirect(`/login?redirect=/font/${generationId}/test`);
  }

  // 1. Fetch generation job status
  const generation = await getGenerationStatus(generationId, user.id);

  if (!generation) {
    notFound();
  }

  // Only completed generations can enter the full testing studio
  if (generation.status !== 'completed') {
    redirect(`/generate/status/${generation.id}`);
  }

  // 2. Fetch compiled generated files
  const supabase = await createClient();
  const { data: filesData } = await supabase
    .from('generated_files')
    .select('*')
    .eq('generation_id', generation.id);

  const files = (filesData as GeneratedFile[] | null) ?? [];

  if (files.length === 0) {
    redirect(`/generate/status/${generation.id}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <FontTestingStudio generation={generation} files={files} />
      </main>

      <Footer />
    </div>
  );
}
