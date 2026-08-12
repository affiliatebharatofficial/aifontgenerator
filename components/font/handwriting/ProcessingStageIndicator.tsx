'use client';

import React from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import type { HandwritingProcessStage } from '@/lib/font/handwriting/types';

interface ProcessingStageIndicatorProps {
  currentStage: HandwritingProcessStage;
  errorMessage?: string | null;
}

const STAGES: Array<{ id: HandwritingProcessStage; label: string }> = [
  { id: 'uploaded', label: 'Sample Uploaded' },
  { id: 'analyzing', label: 'Analyzing Characters' },
  { id: 'review', label: 'Character Review' },
  { id: 'vectorizing', label: 'Vectorizing Contours' },
  { id: 'compiling', label: 'Compiling OpenType Font' },
  { id: 'validating', label: 'Validating Font Table' },
  { id: 'completed', label: 'Font Ready' },
];

export function ProcessingStageIndicator({
  currentStage,
  errorMessage,
}: ProcessingStageIndicatorProps) {
  if (currentStage === 'failed') {
    return (
      <div className="p-4 rounded-lg border border-rose-800 bg-rose-950/40 text-rose-300 flex items-start gap-3 font-mono text-xs">
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-rose-200">Handwriting Processing Failed</p>
          <p className="text-rose-300/80">{errorMessage || 'An unexpected error occurred during processing.'}</p>
        </div>
      </div>
    );
  }

  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className="border border-[#27272a] bg-[#121215] rounded-lg p-6 space-y-4 font-mono text-xs text-[#a1a1aa]">
      <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
        <span className="font-bold uppercase tracking-widest text-[#f4f4f5] text-[10px]">
          ACTIVE PIPELINE STAGE
        </span>
        <span className="text-[10px] text-[#e05638] uppercase font-bold flex items-center gap-1.5">
          {currentStage === 'completed' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">COMPLETED</span>
            </>
          ) : (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e05638]" />
              <span>{currentStage.toUpperCase()}</span>
            </>
          )}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {STAGES.map((s, idx) => {
          const isDone = currentIndex > idx || currentStage === 'completed';
          const isCurrent = currentIndex === idx && currentStage !== 'completed';

          return (
            <div
              key={s.id}
              className={`p-2.5 rounded border flex flex-col justify-between space-y-2 transition-all ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300'
                  : isCurrent
                  ? 'bg-[#e05638]/10 border-[#e05638] text-[#f4f4f5] font-bold shadow-md'
                  : 'bg-[#09090b] border-[#27272a] text-[#71717a]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold">0{idx + 1}</span>
                {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                {isCurrent && <Loader2 className="w-3 h-3 animate-spin text-[#e05638]" />}
              </div>
              <span className="text-[11px] leading-tight font-bold tracking-tight">
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
