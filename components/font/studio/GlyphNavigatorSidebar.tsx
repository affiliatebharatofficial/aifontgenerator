import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Lock,
  Layers,
  ChevronRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import type { GlyphMetadataInfo, GlyphOverride, GlyphGroupType, GlyphTransformParams } from '@/lib/font/studio/types';

interface GlyphNavigatorSidebarProps {
  glyphs: GlyphMetadataInfo[];
  selectedGlyph: GlyphMetadataInfo;
  onSelectGlyph: (glyph: GlyphMetadataInfo) => void;
  overrides: Record<string, GlyphOverride>;
  onToggleLock: (char: string) => void;
  onApplyGroupTransform: (group: GlyphGroupType, delta: Partial<GlyphTransformParams>) => void;
  onOpenDevanagariDebug?: () => void;
}

export function GlyphNavigatorSidebar({
  glyphs,
  selectedGlyph,
  onSelectGlyph,
  overrides,
  onToggleLock,
  onApplyGroupTransform,
  onOpenDevanagariDebug,
}: GlyphNavigatorSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [groupActionOpen, setGroupActionOpen] = useState(false);

  // Available categories based on actual glyphs
  const categories = useMemo(() => {
    const set = new Set<string>(['ALL']);
    glyphs.forEach((g) => {
      if (g.category === 'Uppercase') set.add('A-Z');
      else if (g.category === 'Lowercase') set.add('a-z');
      else if (g.category === 'Digit') set.add('0-9');
      else if (g.script === 'Punctuation') set.add('Punctuation');
      else if (g.script === 'Devanagari') set.add('Devanagari');
      else if (g.script === 'Latin Extended') set.add('Extended');
    });
    return Array.from(set);
  }, [glyphs]);

  // Filtered glyphs
  const filteredGlyphs = useMemo(() => {
    return glyphs.filter((g) => {
      // Category filter
      if (activeCategory === 'A-Z' && g.category !== 'Uppercase') return false;
      if (activeCategory === 'a-z' && g.category !== 'Lowercase') return false;
      if (activeCategory === '0-9' && g.category !== 'Digit') return false;
      if (activeCategory === 'Punctuation' && g.script !== 'Punctuation') return false;
      if (activeCategory === 'Devanagari' && g.script !== 'Devanagari') return false;
      if (activeCategory === 'Extended' && g.script !== 'Latin Extended') return false;

      // Search filter (character, unicode hex, glyph name)
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.trim().toLowerCase();
        const matchesChar = g.char.toLowerCase().includes(q);
        const matchesHex = g.unicodeHex.toLowerCase().includes(q);
        const matchesName = g.glyphName.toLowerCase().includes(q);
        const matchesCode = `u+${g.unicode.toString(16).toLowerCase()}`.includes(q);
        return matchesChar || matchesHex || matchesName || matchesCode;
      }

      return true;
    });
  }, [glyphs, activeCategory, searchQuery]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If active target is an input or textarea, skip
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const currentIndex = filteredGlyphs.findIndex((g) => g.char === selectedGlyph.char);
      if (currentIndex === -1) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = filteredGlyphs[(currentIndex + 1) % filteredGlyphs.length];
        if (next) onSelectGlyph(next);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = filteredGlyphs[(currentIndex - 1 + filteredGlyphs.length) % filteredGlyphs.length];
        if (prev) onSelectGlyph(prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredGlyphs, selectedGlyph, onSelectGlyph]);

  const totalCoverage = glyphs.length;
  const modifiedCount = Object.keys(overrides).length;
  const lockedCount = Object.values(overrides).filter((o) => o.isLocked).length;

  return (
    <div className="w-80 flex flex-col bg-[#121215] border-r border-[#27272a] h-full select-none">
      {/* Sidebar Header & Search */}
      <div className="p-4 border-b border-[#27272a] space-y-3 bg-[#141418]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] font-bold flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#e05638]" />
            <span>GLYPH EXPLORER</span>
          </span>
          <span className="text-[10px] font-mono font-bold bg-[#1f1f24] text-[#f4f4f5] px-2 py-0.5 rounded border border-[#27272a]">
            {filteredGlyphs.length} / {totalCoverage}
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search 'A', 'U+0041', 'क'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0c0c0e] border border-[#27272a] rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-[#e05638]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#71717a] hover:text-[#f4f4f5]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-[#e05638] text-white'
                  : 'bg-[#1f1f24] text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#f4f4f5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Glyph Grid */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-4 gap-2 content-start bg-[#0c0c0e]">
        {filteredGlyphs.map((glyph) => {
          const isSelected = glyph.char === selectedGlyph.char;
          const override = overrides[glyph.char];
          const isModified = !!override && (
            override.transforms.scaleX !== 1.0 ||
            override.transforms.scaleY !== 1.0 ||
            override.transforms.moveX !== 0 ||
            override.transforms.moveY !== 0 ||
            override.transforms.slant !== 0 ||
            override.transforms.strokeDelta !== 1.0 ||
            override.transforms.roundnessDelta !== 0 ||
            override.transforms.advanceWidthDelta !== 0
          );
          const isLocked = override?.isLocked;

          return (
            <button
              key={`${glyph.unicode}_${glyph.char}`}
              onClick={() => onSelectGlyph(glyph)}
              className={`h-16 rounded-lg border flex flex-col items-center justify-center relative transition-all group ${
                isSelected
                  ? 'bg-[#e05638]/20 border-[#e05638] shadow-lg text-[#f4f4f5]'
                  : 'bg-[#121215] border-[#27272a] hover:border-[#3f3f46] hover:bg-[#18181c] text-[#a1a1aa] hover:text-[#f4f4f5]'
              }`}
            >
              {/* Glyph character presentation */}
              <span className="text-xl font-medium leading-none mb-1">
                {glyph.char}
              </span>

              {/* Hex / Unicode badge */}
              <span className="text-[9px] font-mono text-[#71717a] group-hover:text-[#a1a1aa]">
                {glyph.unicodeHex.replace('U+', '')}
              </span>

              {/* Modified indicator dot */}
              {isModified && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1.5 right-1.5" title="Modified" />
              )}

              {/* Lock indicator */}
              {isLocked && (
                <Lock className="w-2.5 h-2.5 text-purple-400 absolute top-1.5 left-1.5" />
              )}
            </button>
          );
        })}

        {filteredGlyphs.length === 0 && (
          <div className="col-span-4 py-12 text-center text-xs font-mono text-[#71717a]">
            No glyphs matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

      {/* Sidebar Footer: Character Coverage & Group Transform */}
      <div className="p-3 border-t border-[#27272a] bg-[#141418] space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between text-[#a1a1aa] text-[11px]">
          <span>COVERAGE</span>
          <span className="text-[#10b981] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
            <span>100% ({totalCoverage} Glyphs)</span>
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#71717a]">
          <span>MODIFIED: <strong className="text-[#f4f4f5]">{modifiedCount}</strong></span>
          <span>LOCKED: <strong className="text-purple-400">{lockedCount}</strong></span>
        </div>

        {/* Group Actions Bar */}
        <div className="pt-2 border-t border-[#27272a] flex items-center gap-2">
          <button
            onClick={() => setGroupActionOpen(!groupActionOpen)}
            className="flex-1 py-1.5 px-2.5 rounded bg-[#1f1f24] hover:bg-[#27272a] text-[#f4f4f5] text-[10px] uppercase font-bold flex items-center justify-between border border-[#27272a]"
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-[#e05638]" />
              <span>Group Batch Edit</span>
            </span>
            <ChevronRight className={`w-3 h-3 transition-transform ${groupActionOpen ? 'rotate-90' : ''}`} />
          </button>

          {onOpenDevanagariDebug && (
            <button
              onClick={onOpenDevanagariDebug}
              className="py-1.5 px-2 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase"
              title="Inspect OpenType GSUB Devanagari shaping ligatures"
            >
              GSUB Debug
            </button>
          )}
        </div>

        {/* Group Actions Dropdown Drawer */}
        {groupActionOpen && (
          <div className="p-2.5 bg-[#09090c] rounded-lg border border-[#27272a] space-y-2 animate-in fade-in slide-in-from-top-1">
            <span className="text-[10px] uppercase text-[#71717a] block font-bold">BATCH TRANSFORM:</span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <button
                onClick={() => onApplyGroupTransform('UPPERCASE', { strokeDelta: 1.15 })}
                className="p-1.5 rounded bg-[#18181c] hover:bg-[#222228] text-[#f4f4f5] text-left border border-[#27272a]"
              >
                +15% Bold A-Z
              </button>
              <button
                onClick={() => onApplyGroupTransform('LOWERCASE', { strokeDelta: 1.15 })}
                className="p-1.5 rounded bg-[#18181c] hover:bg-[#222228] text-[#f4f4f5] text-left border border-[#27272a]"
              >
                +15% Bold a-z
              </button>
              <button
                onClick={() => onApplyGroupTransform('UPPERCASE', { scaleX: 1.1 })}
                className="p-1.5 rounded bg-[#18181c] hover:bg-[#222228] text-[#f4f4f5] text-left border border-[#27272a]"
              >
                +10% Width A-Z
              </button>
              <button
                onClick={() => onApplyGroupTransform('ALL', { slant: 8 })}
                className="p-1.5 rounded bg-[#18181c] hover:bg-[#222228] text-[#f4f4f5] text-left border border-[#27272a]"
              >
                Italicize All (+8°)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
