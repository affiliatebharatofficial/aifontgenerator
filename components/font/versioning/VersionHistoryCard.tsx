'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ArrowRight, Sliders, ExternalLink, CheckCircle2, RotateCcw } from 'lucide-react';
import type { FontGeneration } from '@/types/database';

interface VersionHistoryCardProps {
  currentGenerationId: string;
  familyGenerations: FontGeneration[];
}

export function VersionHistoryCard({
  currentGenerationId,
  familyGenerations,
}: VersionHistoryCardProps) {
  if (!familyGenerations || familyGenerations.length === 0) return null;

  return (
    <div className="border border-[#27272a] bg-[#121215] rounded-xl p-6 sm:p-8 space-y-6 text-xs font-mono text-[#a1a1aa]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#e05638]" />
          <h3 className="font-bold text-[#f4f4f5] uppercase tracking-wider text-xs">
            VERSION HISTORY ({familyGenerations.length} {familyGenerations.length === 1 ? 'VERSION' : 'VERSIONS'})
          </h3>
        </div>

        {familyGenerations.length > 1 && (
          <Link
            href={`/font/${currentGenerationId}/versions`}
            className="flex items-center gap-1 text-[11px] text-[#e05638] hover:underline font-bold uppercase"
          >
            <span>Compare Versions</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Version Timeline List */}
      <div className="space-y-3">
        {familyGenerations.map((g) => {
          const isCurrent = g.id === currentGenerationId;
          const verNum = g.version_number || 1;

          return (
            <div
              key={g.id}
              className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                isCurrent
                  ? 'border-[#e05638] bg-[#09090b] shadow-md'
                  : 'border-[#27272a] bg-[#09090b]/60 hover:border-[#3f3f46]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    isCurrent
                      ? 'bg-[#e05638] text-white'
                      : 'bg-[#18181b] border border-[#27272a] text-[#a1a1aa]'
                  }`}
                >
                  V{verNum}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#f4f4f5] text-sm">
                      {g.font_name || 'AI Font'}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] font-bold text-emerald-400 uppercase bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.5 rounded">
                        CURRENT VIEW
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#71717a]">
                    Created {new Date(g.created_at).toLocaleDateString()} • {g.category} ({g.weight})
                  </span>
                </div>
              </div>

              {/* Version Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#27272a]">
                {!isCurrent && (
                  <Link
                    href={`/font/${g.id}`}
                    className="p-1.5 rounded border border-[#27272a] bg-[#121215] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open V{verNum}</span>
                  </Link>
                )}

                <Link
                  href={`/generate?parentGenerationId=${g.id}`}
                  className="p-1.5 rounded border border-[#27272a] bg-[#121215] text-[#e05638] hover:bg-[#e05638] hover:text-white transition-all text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  title="Use this version's settings to generate a new version"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Use as Base</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
