'use client';

import { useState } from 'react';
import { Sparkles, Check, Loader2, Layers, LayoutGrid } from 'lucide-react';
import { createVariationAction } from '@/lib/generations/actions';
import type { FontGeneration } from '@/types/database';

interface VariationGalleryProps {
  currentGen: FontGeneration;
  familyGenerations: FontGeneration[];
  onSelectVariation: (gen: FontGeneration) => void;
  selectedGenId: string;
}

export function VariationGallery({
  currentGen,
  familyGenerations,
  onSelectVariation,
  selectedGenId,
}: VariationGalleryProps) {
  const [generations, setGenerations] = useState<FontGeneration[]>(familyGenerations);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareText, setCompareText] = useState('Typeface Variation');

  const rootGen = generations.find((g) => !g.parent_generation_id) || currentGen;
  const variations = generations.filter((g) => g.id !== rootGen.id);

  async function handleGenerateNextVariation() {
    if (isGenerating) return;
    if (generations.length >= 5) {
      setError('Maximum 4 variations per generation session reached.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    const nextIndex = variations.length + 1;

    try {
      const res = await createVariationAction(currentGen.id, nextIndex);
      if (!res.success) {
        setError(res.error || 'Failed to generate variation.');
      } else if (res.generationId) {
        // Construct lightweight synthetic generation object for live UI gallery
        const newVarGen: FontGeneration = {
          ...currentGen,
          id: res.generationId,
          font_name: `${currentGen.font_name || 'AI Font'} Var ${nextIndex}`,
          parent_generation_id: currentGen.id,
          seed: (currentGen.seed || 42) + nextIndex * 1337 + 77,
          status: 'completed',
          created_at: new Date().toISOString(),
        };
        setGenerations([...generations, newVarGen]);
        onSelectVariation(newVarGen);
      }
    } catch {
      setError('An error occurred while creating the variation.');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-6 border border-[#27272a] bg-[#121215] rounded-lg p-6 sm:p-8 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272a]">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#f4f4f5] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#e05638]" />
            <span>Variation Gallery &amp; Multi-Seed Explorer</span>
          </h2>
          <p className="text-[11px] text-[#71717a] mt-0.5">
            Same family design intent with controlled micro-geometry variations ({generations.length}/5 Cards)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCompareMode(!compareMode)}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase border transition-all flex items-center gap-1.5 cursor-pointer ${
              compareMode
                ? 'bg-[#e05638] text-white border-[#e05638]'
                : 'bg-[#09090b] text-[#a1a1aa] border-[#27272a] hover:text-[#f4f4f5]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{compareMode ? 'Exit Compare Mode' : 'Side-by-Side Compare'}</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateNextVariation}
            disabled={isGenerating || generations.length >= 5}
            className="px-4 py-1.5 rounded text-xs font-bold uppercase bg-[#e05638]/10 text-[#e05638] border border-[#e05638]/40 hover:bg-[#e05638] hover:text-white transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e05638]" />
                <span>Compiling Seed...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Variation ({variations.length + 1}/4)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Compare Mode View */}
      {compareMode ? (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between gap-4 p-3 bg-[#09090b] border border-[#27272a] rounded">
            <span className="text-[11px] text-[#a1a1aa] uppercase font-bold">Compare Specimen Text:</span>
            <input
              type="text"
              value={compareText}
              onChange={(e) => setCompareText(e.target.value)}
              className="flex-1 px-3 py-1 bg-[#121215] border border-[#27272a] rounded text-xs text-[#f4f4f5] font-sans"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generations.map((gen, idx) => {
              const fontFam = `GeneratedFont_${gen.id.replace(/[^a-zA-Z0-9]/g, '')}`;
              return (
                <div
                  key={gen.id}
                  className={`p-5 rounded-md border bg-[#09090b] space-y-3 ${
                    gen.id === selectedGenId ? 'border-[#e05638] ring-1 ring-[#e05638]' : 'border-[#27272a]'
                  }`}
                >
                  <style>{`
                    @font-face {
                      font-family: "${fontFam}";
                      src: url("/api/fonts/preview/${gen.id}") format("woff2");
                      font-display: swap;
                    }
                  `}</style>

                  <div className="flex items-center justify-between text-[11px] text-[#a1a1aa]">
                    <span className="font-bold text-[#f4f4f5]">
                      {idx === 0 ? 'Original Baseline' : `Variation ${idx}`}
                    </span>
                    <span className="text-[10px] bg-[#18181b] px-2 py-0.5 rounded text-[#71717a]">
                      SEED {gen.seed || 42}
                    </span>
                  </div>

                  <div
                    style={{ fontFamily: fontFam, fontSize: '32px', lineHeight: '1.2' }}
                    className="p-4 bg-[#121215] border border-[#27272a] rounded text-[#f4f4f5] font-specimen truncate"
                  >
                    {compareText || 'Specimen Text'}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectVariation(gen)}
                    className={`w-full py-1.5 rounded text-xs font-bold uppercase border transition-all cursor-pointer ${
                      gen.id === selectedGenId
                        ? 'bg-[#e05638] text-white border-[#e05638]'
                        : 'bg-[#18181b] text-[#a1a1aa] border-[#27272a] hover:text-[#f4f4f5]'
                    }`}
                  >
                    {gen.id === selectedGenId ? 'Active Selected Variation' : 'Select This Variation'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Compact Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {generations.map((gen, idx) => {
            const fontFam = `GeneratedFont_${gen.id.replace(/[^a-zA-Z0-9]/g, '')}`;
            const isSelected = gen.id === selectedGenId;
            return (
              <div
                key={gen.id}
                onClick={() => onSelectVariation(gen)}
                className={`p-4 rounded-md border bg-[#09090b] hover:border-[#e05638]/60 transition-all cursor-pointer space-y-3 flex flex-col justify-between ${
                  isSelected ? 'border-[#e05638] bg-[#e05638]/5 ring-1 ring-[#e05638]' : 'border-[#27272a]'
                }`}
              >
                <style>{`
                  @font-face {
                    font-family: "${fontFam}";
                    src: url("/api/fonts/preview/${gen.id}") format("woff2");
                    font-display: swap;
                  }
                `}</style>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-[#a1a1aa]">
                    <span className="font-bold text-[#e05638] uppercase">
                      {idx === 0 ? 'Original Base' : `Variation 0${idx}`}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <Check className="w-3 h-3" /> ACTIVE
                      </span>
                    )}
                  </div>

                  <div
                    style={{ fontFamily: fontFam, fontSize: '24px' }}
                    className="h-16 flex items-center justify-center p-2 bg-[#121215] border border-[#27272a] rounded text-[#f4f4f5] font-specimen text-center truncate"
                  >
                    Aa Bb Cc 123
                  </div>

                  <div className="text-[10px] text-[#71717a] flex justify-between">
                    <span>{gen.category}</span>
                    <span>SEED #{gen.seed || 42}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectVariation(gen);
                  }}
                  className={`w-full py-1 rounded text-[11px] font-bold uppercase transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#e05638] text-white'
                      : 'bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#f4f4f5]'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
