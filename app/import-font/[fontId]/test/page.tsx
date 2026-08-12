import type { Metadata } from 'next';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { redirect, notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getImportedFontDetails } from '@/lib/font/importer/service';
import { FontTestingStudio } from '@/components/font/studio/FontTestingStudio';
import type { FontGeneration, GeneratedFile } from '@/types/database';

export const metadata: Metadata = {
  title: 'Imported Font Testing Studio — AI Font Generator',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ImportedFontTestStudioPage({
  params,
}: {
  params: Promise<{ fontId: string }>;
}) {
  const { fontId } = await params;
  const { user } = await getCurrentUserProfile();

  if (!user) {
    redirect(`/login?redirect=/import-font/${fontId}/test`);
  }

  const { font } = await getImportedFontDetails(fontId, user.id);

  if (!font) {
    notFound();
  }

  const fontName = font.family_name || font.original_filename.replace(/\.[^/.]+$/, '');

  const syntheticGen: FontGeneration = {
    id: font.id,
    user_id: font.user_id,
    font_name: fontName,
    prompt: font.original_filename,
    category: 'Display',
    weight: 'Regular',
    width: 'Normal',
    style: 'Modern',
    character_set: {} as unknown as import('@/types/database').CharacterSetConfig,
    advanced_settings: {} as unknown as import('@/types/database').AdvancedSettingsConfig,
    status: 'completed',
    error_message: null,
    created_at: font.created_at,
    updated_at: font.updated_at,
    completed_at: font.created_at,
  };

  const syntheticFiles: GeneratedFile[] = [
    {
      id: font.id,
      generation_id: font.id,
      format: (font.format === 'woff' ? 'woff2' : font.format) as import('@/types/database').FontFileFormat,
      storage_path: font.storage_path,
      file_size: font.file_size,
      download_count: 0,
      created_at: font.created_at,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
        <FontTestingStudio generation={syntheticGen} files={syntheticFiles} />
      </main>

      <Footer />
    </div>
  );
}
