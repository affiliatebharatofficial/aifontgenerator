'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Sliders, RotateCcw, CheckCircle2 } from 'lucide-react';
import { FontPreviewStage } from '@/components/font/FontPreviewStage';
import { CharacterInspector } from '@/components/font/CharacterInspector';
import { FontDownloadCard } from '@/components/font/FontDownloadCard';
import { FontQualityReportCard } from '@/components/font/versioning/FontQualityReportCard';
import { VersionHistoryCard } from '@/components/font/versioning/VersionHistoryCard';
import { VariationGallery } from '@/components/font/variation/VariationGallery';
import type { FontGeneration, GeneratedFile, CharacterSetConfig } from '@/types/database';

interface FontResultClientViewProps {
  generation: FontGeneration;
  familyGenerations: FontGeneration[];
  files: GeneratedFile[];
}

export function FontResultClientView({
  generation,
  familyGenerations,
  files,
}: FontResultClientViewProps) {
  const [selectedGen, setSelectedGen] = useState<FontGeneration>(generation);

  const activeFontName = selectedGen.font_name || generation.font_name || 'AIFont';
  const charSet = (selectedGen.character_set || generation.character_set) as unknown as CharacterSetConfig;
  const versionNum = selectedGen.version_number || generation.version_number || 1;

  // Derive file paths for selected variation if different from base
  const activeFiles: GeneratedFile[] = files.map((f) => ({
    ...f,
    generation_id: selectedGen.id,
  }));

  return (
    <div className="space-y-12">
      {/* Specimen Header */}
      <div className="border border-[#27272a] bg-[#121215] rounded-lg p-8 sm:p-12 space-y-6 font-mono">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#27272a]">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-[#e05638] font-bold">
                TYPE SPECIMEN NO. {selectedGen.id.substring(0, 8)}
              </span>
              <span className="text-[10px] font-bold uppercase bg-[#e05638]/10 text-[#e05638] border border-[#e05638]/30 px-2 py-0.5 rounded">
                VERSION {versionNum}
              </span>
              {selectedGen.id !== generation.id && (
                <span className="text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                  SELECTED VARIATION
                </span>
              )}
            </div>

            <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase">
              {activeFontName}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase bg-emerald-950/80 border border-emerald-800 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>COMPILED &amp; READY</span>
            </span>

            <Link
              href={`/generate?parentGenerationId=${selectedGen.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase border border-[#e05638]/50 bg-[#e05638]/10 text-[#e05638] hover:bg-[#e05638] hover:text-white transition-all cursor-pointer shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Remix / New Version</span>
            </Link>

            <Link
              href={`/font/${selectedGen.id}/test`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase bg-[#e05638] text-white hover:bg-[#c8462a] transition-all cursor-pointer shadow-lg"
            >
              <Sliders className="w-4 h-4" />
              <span>Test Studio</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#a1a1aa]">
          <div>
            <span className="text-[#71717a] uppercase block text-[10px]">CATEGORY</span>
            <p className="font-bold text-[#f4f4f5] mt-0.5">{selectedGen.category}</p>
          </div>
          <div>
            <span className="text-[#71717a] uppercase block text-[10px]">WEIGHT / STYLE</span>
            <p className="font-bold text-[#f4f4f5] mt-0.5">{selectedGen.weight} • {selectedGen.style}</p>
          </div>
          <div>
            <span className="text-[#71717a] uppercase block text-[10px]">WIDTH</span>
            <p className="font-bold text-[#f4f4f5] mt-0.5">{selectedGen.width}</p>
          </div>
          <div>
            <span className="text-[#71717a] uppercase block text-[10px]">CREATED DATE</span>
            <p className="font-bold text-[#f4f4f5] mt-0.5">{new Date(selectedGen.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Multi-Seed Variation Gallery */}
      <section className="space-y-4">
        <VariationGallery
          currentGen={generation}
          familyGenerations={familyGenerations}
          onSelectVariation={(v) => setSelectedGen(v)}
          selectedGenId={selectedGen.id}
        />
      </section>

      {/* Dynamic @font-face Specimen Stage */}
      <section className="space-y-4">
        <div className="pb-3 border-b border-[#27272a] font-mono">
          <h2 className="text-xs uppercase tracking-widest text-[#a1a1aa] font-bold">
            01 • INTERACTIVE TYPE WORKSPACE
          </h2>
        </div>
        <FontPreviewStage key={selectedGen.id} generationId={selectedGen.id} />
      </section>

      {/* Font Quality & Validation Report */}
      <section className="space-y-4 font-mono">
        <div className="pb-3 border-b border-[#27272a]">
          <h2 className="text-xs uppercase tracking-widest text-[#a1a1aa] font-bold">
            02 • QUALITY &amp; VALIDATION REPORT
          </h2>
        </div>
        <FontQualityReportCard generation={selectedGen} files={activeFiles} />
      </section>

      {/* Version History Timeline */}
      <section className="space-y-4 font-mono">
        <div className="pb-3 border-b border-[#27272a]">
          <h2 className="text-xs uppercase tracking-widest text-[#a1a1aa] font-bold">
            03 • VERSION HISTORY FAMILY
          </h2>
        </div>
        <VersionHistoryCard
          currentGenerationId={selectedGen.id}
          familyGenerations={familyGenerations}
        />
      </section>

      {/* Character Inspector Grid */}
      <section className="space-y-4 font-mono">
        <div className="pb-3 border-b border-[#27272a]">
          <h2 className="text-xs uppercase tracking-widest text-[#a1a1aa] font-bold">
            04 • GLYPH &amp; UNICODE INSPECTOR
          </h2>
        </div>
        <CharacterInspector characterSet={charSet} />
      </section>

      {/* Binary Download Section */}
      <section className="space-y-4 font-mono">
        <div className="pb-3 border-b border-[#27272a] flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-widest text-[#a1a1aa] font-bold flex items-center gap-2">
            <Download className="w-4 h-4 text-[#e05638]" />
            <span>05 • PRODUCTION FORMAT DOWNLOADS FOR SELECTED VARIATION</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeFiles.map((file) => (
            <FontDownloadCard key={file.id} file={file} fontName={activeFontName} />
          ))}
        </div>
      </section>
    </div>
  );
}
