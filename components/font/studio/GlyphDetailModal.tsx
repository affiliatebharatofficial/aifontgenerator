'use client';

import React, { useEffect } from 'react';
import { X, Search } from 'lucide-react';
import type { ExtractedGlyph } from './types';

interface GlyphDetailModalProps {
  glyph: ExtractedGlyph | null;
  fontFamilyName: string;
  onClose: () => void;
}

export function GlyphDetailModal({
  glyph,
  fontFamilyName,
  onClose,
}: GlyphDetailModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!glyph) return null;

  const advanceWidthText =
    glyph.advanceWidth !== null ? `${glyph.advanceWidth} units` : 'Not available';
  const bboxText =
    glyph.xMin !== null && glyph.yMin !== null && glyph.xMax !== null && glyph.yMax !== null
      ? `[${glyph.xMin}, ${glyph.yMin}, ${glyph.xMax}, ${glyph.yMax}]`
      : 'Not available';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="border border-[#27272a] bg-[#121215] rounded-xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-xs font-mono text-[#a1a1aa] shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#e05638]" />
            <h3 className="font-bold text-[#f4f4f5] uppercase tracking-wider text-xs">
              GLYPH &amp; UNICODE METRICS
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#27272a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Large Glyph Visualizer Box */}
        <div className="flex items-center justify-center h-40 border border-[#27272a] bg-[#09090b] rounded-lg relative overflow-hidden type-grid-pattern">
          <span
            style={{ fontFamily: `"${fontFamilyName}", sans-serif` }}
            className="text-8xl text-[#f4f4f5] font-specimen select-none"
          >
            {glyph.char}
          </span>
          <span className="absolute bottom-2 right-3 text-[10px] text-[#71717a] uppercase font-bold">
            {glyph.category}
          </span>
        </div>

        {/* Real Metrics Grid */}
        <div className="space-y-3 border-t border-[#27272a] pt-4">
          <div className="flex justify-between items-center py-1 border-b border-[#27272a]/50">
            <span className="uppercase text-[10px] text-[#71717a] font-bold">Character</span>
            <span className="font-bold text-[#f4f4f5] text-sm">&ldquo;{glyph.char}&rdquo;</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-[#27272a]/50">
            <span className="uppercase text-[10px] text-[#71717a] font-bold">Unicode Value</span>
            <div className="text-right">
              <span className="font-bold text-[#e05638]">{glyph.unicodeHex}</span>
              <span className="text-[10px] text-[#71717a] ml-2">(Decimal {glyph.unicode})</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-[#27272a]/50">
            <span className="uppercase text-[10px] text-[#71717a] font-bold">Glyph Name</span>
            <span className="font-bold text-[#f4f4f5]">{glyph.name}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-[#27272a]/50">
            <span className="uppercase text-[10px] text-[#71717a] font-bold">Advance Width</span>
            <span className="font-bold text-[#f4f4f5]">{advanceWidthText}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="uppercase text-[10px] text-[#71717a] font-bold">Bounding Box</span>
            <span className="font-bold text-[#f4f4f5] font-mono">{bboxText}</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border border-[#27272a] bg-[#09090b] hover:bg-[#18181b] text-[#f4f4f5] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
