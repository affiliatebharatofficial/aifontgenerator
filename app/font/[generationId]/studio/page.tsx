import type { Metadata } from 'next';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { FontStudioService } from '@/lib/font/studio/studioService';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { FontStudioWorkspace } from '@/components/font/studio/FontStudioWorkspace';
import type { GeneratedFile } from '@/types/database';

export const metadata: Metadata = {
  title: 'Font Studio & AI Glyph Editor — AI Font Generator',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FontStudioPage({
  params,
}: {
  params: Promise<{ generationId: string }>;
}) {
  const { generationId } = await params;
  const { user } = await getCurrentUserProfile();

  if (!user) {
    redirect(`/login?redirect=/font/${generationId}/studio`);
  }

  try {
    const data = await FontStudioService.getStudioGenerationData(generationId, user.id);
    const devanagariDebug = FontStudioService.getDevanagariShapingDebugData();

    const supabase = await createClient();
    const { data: filesData } = await supabase
      .from('generated_files')
      .select('*')
      .eq('generation_id', generationId);

    const files = (filesData as GeneratedFile[] | null) ?? [];

    return (
      <FontStudioWorkspace
        generation={data.generation}
        files={files}
        initialGlyphs={data.glyphs}
        initialQualityScore={data.qualityScore}
        initialConsistencyReport={data.consistencyReport}
        devanagariDebugItems={devanagariDebug}
      />
    );
  } catch (err) {
    console.error('Error loading Font Studio:', err);
    notFound();
  }
}
