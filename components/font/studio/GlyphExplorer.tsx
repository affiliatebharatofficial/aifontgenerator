'use client';

import React, { useState, useMemo } from 'react';
import { Grid, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ExtractedGlyph } from './types';

interface GlyphExplorerProps {
  glyphs: ExtractedGlyph[];
  fontFamilyName: string;
  onSelectGlyph: (glyph: ExtractedGlyph) => void;
}

const PAGE_SIZE = 60;

export function GlyphExplorer({
  glyphs,
  fontFamilyName,
  onSelectGlyph,
}: GlyphExplorerProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter glyphs based on category and search query
  const filteredGlyphs = useMemo(() => {
    return glyphs.filter((g) => {
      // Category match
      if (activeCategory !== 'All') {
        if (activeCategory === 'Uppercase' && g.category !== 'Uppercase') return false;
        if (activeCategory === 'Lowercase' && g.category !== 'Lowercase') return false;
        if (activeCategory === 'Numbers' && g.category !== 'Numbers') return false;
        if (
          activeCategory === 'Punctuation & Symbols' &&
          !['Punctuation', 'Symbols', 'Other'].includes(g.category)
        )
          return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const charMatch = g.char.toLowerCase().includes(q);
        const hexMatch = g.unicodeHex.toLowerCase().includes(q);
        const nameMatch = g.name.toLowerCase().includes(q);
        return charMatch || hexMatch || nameMatch;
      }

      return true;
    });
  }, [glyphs, activeCategory, searchQuery]);

  // Reset page when filter/search changes
  const totalPages = Math.ceil(filteredGlyphs.length / PAGE_SIZE) || 1;
  const safePage = Math.min(currentPage, totalPages);

  const displayedGlyphs = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredGlyphs.slice(start, start + PAGE_SIZE);
  }, [filteredGlyphs, safePage]);

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat);
    setCurrentPage(1);
  }

  function handleSearchChange(val: string) {
    setSearchQuery(val);
    setCurrentPage(1);
  }

  return (
    <div className="border border-[#27272a] bg-[#121215] rounded-lg p-6 sm:p-8 space-y-6 text-xs font-mono text-[#a1a1aa]">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272a] pb-4">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-[#e05638]" />
          <h3 className="font-bold text-[#f4f4f5] uppercase tracking-wider text-xs">
            GLYPH EXPLORER &amp; UNICODE MAP ({glyphs.length} TOTAL)
          </h3>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search character or U+0041..."
            className="w-full bg-[#09090b] border border-[#27272a] rounded-md pl-8 pr-3 py-1.5 font-mono text-xs text-[#f4f4f5] placeholder-[#71717a] outline-none focus:border-[#e05638]"
          />
        </div>
      </div>

      {/* Category Tabs & Pagination info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Categories */}
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Uppercase', 'Lowercase', 'Numbers', 'Punctuation & Symbols'].map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#e05638] text-white'
                    : 'bg-[#09090b] border border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#3f3f46]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#71717a]">
              Page {safePage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded border border-[#27272a] bg-[#09090b] text-[#f4f4f5] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#e05638] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded border border-[#27272a] bg-[#09090b] text-[#f4f4f5] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#e05638] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Glyph Grid */}
      {displayedGlyphs.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#27272a] rounded-lg text-[#71717a]">
          No supported glyphs match your current filter query.
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {displayedGlyphs.map((glyph) => (
            <button
              key={`${glyph.unicodeHex}-${glyph.char}`}
              type="button"
              onClick={() => onSelectGlyph(glyph)}
              title={`Click to inspect glyph "${glyph.char}" (${glyph.unicodeHex})`}
              className="group aspect-square rounded-lg border border-[#27272a] bg-[#09090b] hover:bg-[#18181b] hover:border-[#e05638] p-2 flex flex-col items-center justify-between transition-all cursor-pointer relative"
            >
              <span
                style={{ fontFamily: `"${fontFamilyName}", sans-serif` }}
                className="text-2xl text-[#f4f4f5] group-hover:scale-110 transition-transform font-specimen my-auto select-none"
              >
                {glyph.char}
              </span>
              <span className="text-[9px] font-mono text-[#71717a] group-hover:text-[#e05638] truncate w-full text-center">
                {glyph.unicodeHex}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
