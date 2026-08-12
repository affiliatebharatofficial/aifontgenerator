import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { getFontVersionFamily } from '@/lib/generations/service';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Download, Sliders, RotateCcw } from 'lucide-react';
import { FontPreviewStage } from '@/components/font/FontPreviewStage';
import { CharacterInspector } from '@/components/font/CharacterInspector';
import { FontDownloadCard } from '@/components/font/FontDownloadCard';
import { FontQualityReportCard } from '@/components/font/versioning/FontQualityReportCard';
import { VersionHistoryCard } from '@/components/font/versioning/VersionHistoryCard';
import type { GeneratedFile, CharacterSetConfig } from '@/types/database';

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

  const fontName = generation.font_name || 'AIFont';
  const charSet = generation.character_set as unknown as CharacterSetConfig;
  const versionNum = generation.version_number || 1;

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

        {/* Font Specimen Header */}
        <div className="border border-[#27272a] bg-[#121215] rounded-lg p-8 sm:p-12 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#27272a]">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
                  TYPE SPECIMEN NO. {generation.id.substring(0, 8)}
                </span>
                <span className="text-[10px] font-bold uppercase bg-[#e05638]/10 text-[#e05638] border border-[#e05638]/30 px-2 py-0.5 rounded">
                  VERSION {versionNum}
                </span>
              </div>

              <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase">
                {fontName}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold uppercase bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>COMPILED &amp; READY</span>
              </span>

              <Link
                href={`/generate?parentGenerationId=${generation.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono font-bold uppercase border border-[#e05638]/50 bg-[#e05638]/10 text-[#e05638] hover:bg-[#e05638] hover:text-white transition-all cursor-pointer shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Regenerate / New Version</span>
              </Link>

              <Link
                href={`/font/${generation.id}/test`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono font-bold uppercase bg-[#e05638] text-white hover:bg-[#c8462a] transition-all cursor-pointer shadow-lg"
              >
                <Sliders className="w-4 h-4" />
                <span>Test Studio</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-[#a1a1aa]">
            <div>
              <span className="text-[#71717a] uppercase block text-[10px]">CATEGORY</span>
              <p className="font-bold text-[#f4f4f5] mt-0.5">{generation.category}</p>
            </div>
            <div>
              <span className="text-[#71717a] uppercase block text-[10px]">WEIGHT / STYLE</span>
              <p className="font-bold text-[#f4f4f5] mt-0.5">{generation.weight} • {generation.style}</p>
            </div>
            <div>
              <span className="text-[#71717a] uppercase block text-[10px]">WIDTH</span>
              <p className="font-bold text-[#f4f4f5] mt-0.5">{generation.width}</p>
            </div>
            <div>
              <span className="text-[#71717a] uppercase block text-[10px]">CREATED DATE</span>
              <p className="font-bold text-[#f4f4f5] mt-0.5">{new Date(generation.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Dynamic @font-face Specimen Stage */}
        <section className="space-y-4">
          <div className="pb-3 border-b border-[#27272a]">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-bold">
              01 • INTERACTIVE TYPE WORKSPACE
            </h2>
          </div>
          <FontPreviewStage generationId={generation.id} />
        </section>

        {/* Font Quality & Validation Report */}
        <section className="space-y-4">
          <div className="pb-3 border-b border-[#27272a]">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-bold">
              02 • QUALITY &amp; VALIDATION REPORT
            </h2>
          </div>
          <FontQualityReportCard generation={generation} files={files} />
        </section>

        {/* Version History Timeline */}
        <section className="space-y-4">
          <div className="pb-3 border-b border-[#27272a]">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-bold">
              03 • VERSION HISTORY FAMILY
            </h2>
          </div>
          <VersionHistoryCard
            currentGenerationId={generation.id}
            familyGenerations={familyGenerations}
          />
        </section>

        {/* Character Inspector Grid */}
        <section className="space-y-4">
          <div className="pb-3 border-b border-[#27272a]">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-bold">
              04 • GLYPH &amp; UNICODE INSPECTOR
            </h2>
          </div>
          <CharacterInspector characterSet={charSet} />
        </section>

        {/* Binary Download Section */}
        <section className="space-y-4">
          <div className="pb-3 border-b border-[#27272a] flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-bold flex items-center gap-2">
              <Download className="w-4 h-4 text-[#e05638]" />
              <span>05 • PRODUCTION FORMAT DOWNLOADS</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {files.map((file) => (
              <FontDownloadCard key={file.id} file={file} fontName={fontName} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
