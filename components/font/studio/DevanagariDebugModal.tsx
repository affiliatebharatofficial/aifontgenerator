'use client';

import React, { useState } from 'react';
import { X, Search, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import type { DevanagariShapingDebugItem } from '@/lib/font/studio/types';

interface DevanagariDebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  debugItems: DevanagariShapingDebugItem[];
}

export function DevanagariDebugModal({
  isOpen,
  onClose,
  debugItems,
}: DevanagariDebugModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filtered = debugItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.shapedChar.includes(q) ||
      item.glyphName.toLowerCase().includes(q) ||
      item.ligatureTag.toLowerCase().includes(q) ||
      item.inputSequence.join('').includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="bg-[#121215] border border-[#27272a] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="p-6 border-b border-[#27272a] bg-[#141418] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-[#e05638] font-bold">
                OPENTYPE GSUB DEBUGGER
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                26 CONJUNCTS ACTIVE
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#f4f4f5]">
              Devanagari Real Shaping &amp; Ligature Registry
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#1f1f24] text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#27272a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Info banner */}
        <div className="p-4 border-b border-[#27272a] bg-[#0c0c0e] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 'क्र', 'dvKRA', 'akhn'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121215] border border-[#27272a] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-[#e05638]"
            />
          </div>

          <div className="text-[11px] text-[#71717a] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>OpenType GSUB Type 4 (Ligature Substitution) Features</span>
          </div>
        </div>

        {/* Table of conjuncts */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#09090c]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#121215] border border-[#27272a] hover:border-[#3f3f46] space-y-2.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-normal text-[#f4f4f5] bg-[#1a1a20] px-2.5 py-1 rounded-lg border border-[#27272a]">
                      {item.shapedChar}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-[#f4f4f5] block">{item.glyphName}</span>
                      <span className="text-[10px] text-[#71717a]">{item.unicodeHex}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    {item.ligatureTag}
                  </span>
                </div>

                {/* Input sequence decomposition */}
                <div className="flex items-center gap-1.5 text-xs bg-[#0c0c0e] p-2 rounded-lg border border-[#1f1f24] text-[#a1a1aa]">
                  <span className="text-[10px] text-[#71717a]">SEQUENCE:</span>
                  <div className="flex items-center gap-1">
                    {item.inputSequence.map((c, i) => (
                      <React.Fragment key={i}>
                        <span className="bg-[#18181c] px-1.5 py-0.5 rounded text-[#f4f4f5] font-bold">
                          {c}
                        </span>
                        {i < item.inputSequence.length - 1 && (
                          <span className="text-[#71717a]">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-[#e05638] mx-1" />

                  <span className="text-[#e05638] font-bold">{item.shapedChar}</span>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-xs text-[#71717a]">
              No Devanagari rules matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#27272a] bg-[#141418] flex items-center justify-between text-xs text-[#71717a]">
          <span>OpenType dev2/deva script engines automatically shape these sequences.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#f4f4f5] font-bold uppercase text-[11px]"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
