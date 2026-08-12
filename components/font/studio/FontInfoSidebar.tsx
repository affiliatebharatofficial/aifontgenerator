'use client';

import React from 'react';
import { Info, FileCode2, CheckCircle2 } from 'lucide-react';
import type { ExtractedFontMeta } from './types';
import type { FontGeneration, GeneratedFile } from '@/types/database';

interface FontInfoSidebarProps {
  generation: FontGeneration;
  files: GeneratedFile[];
  fontMeta: ExtractedFontMeta | null;
}

export function FontInfoSidebar({
  generation,
  files,
  fontMeta,
}: FontInfoSidebarProps) {
  const fontName = fontMeta?.familyName || generation.font_name || 'AI Font Specimen';
  const postScriptName = fontMeta?.postScriptName || fontName.replace(/\s+/g, '');
  const version = fontMeta?.version || '1.000';
  const unitsPerEm = fontMeta?.unitsPerEm ? `${fontMeta.unitsPerEm} units` : '1000 units';
  const ascender = fontMeta?.ascender ? `${fontMeta.ascender} units` : 'Not available';
  const descender = fontMeta?.descender ? `${fontMeta.descender} units` : 'Not available';
  const glyphCount = fontMeta?.numGlyphs ? `${fontMeta.numGlyphs} glyphs` : 'Not available';
  const coverageCount = fontMeta?.totalSupportedChars
    ? `${fontMeta.totalSupportedChars} characters`
    : 'Not available';

  const formatBadgeList = files.map((f) => f.format.toUpperCase()).join(' · ');

  return (
    <div className="border border-[#27272a] bg-[#121215] rounded-lg p-6 space-y-6 text-xs font-mono text-[#a1a1aa]">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#e05638]" />
          <h3 className="font-bold text-[#f4f4f5] uppercase tracking-wider text-xs">
            Font Specification
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>REAL BINARY</span>
        </span>
      </div>

      {/* Main Attributes List */}
      <div className="space-y-4">
        <div>
          <span className="text-[10px] uppercase text-[#71717a] block font-bold">FAMILY NAME</span>
          <p className="font-bold text-[#f4f4f5] text-sm mt-0.5 uppercase tracking-tight">
            {fontName}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-[#27272a] pt-3">
          <div>
            <span className="text-[10px] uppercase text-[#71717a] block font-bold">CATEGORY</span>
            <p className="font-bold text-[#f4f4f5] mt-0.5">{generation.category}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase text-[#71717a] block font-bold">STYLE</span>
            <p className="font-bold text-[#f4f4f5] mt-0.5">{generation.style}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-[#27272a] pt-3">
          <div>
            <span className="text-[10px] uppercase text-[#71717a] block font-bold">WEIGHT</span>
            <p className="font-bold text-[#f4f4f5] mt-0.5">{generation.weight}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase text-[#71717a] block font-bold">WIDTH</span>
            <p className="font-bold text-[#f4f4f5] mt-0.5">{generation.width}</p>
          </div>
        </div>

        <div className="border-t border-[#27272a] pt-3 space-y-3">
          <div className="flex justify-between">
            <span className="text-[10px] uppercase text-[#71717a]">PostScript Name</span>
            <span className="font-bold text-[#f4f4f5]">{postScriptName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[10px] uppercase text-[#71717a]">Version</span>
            <span className="font-bold text-[#f4f4f5]">{version}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[10px] uppercase text-[#71717a]">Units Per Em</span>
            <span className="font-bold text-[#f4f4f5]">{unitsPerEm}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[10px] uppercase text-[#71717a]">Ascender / Descender</span>
            <span className="font-bold text-[#f4f4f5]">
              {ascender} / {descender}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-[10px] uppercase text-[#71717a]">Glyph Count</span>
            <span className="font-bold text-[#f4f4f5]">{glyphCount}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[10px] uppercase text-[#71717a]">Character Coverage</span>
            <span className="font-bold text-[#f4f4f5]">{coverageCount}</span>
          </div>
        </div>

        {/* Formats */}
        <div className="border-t border-[#27272a] pt-3 space-y-2">
          <span className="text-[10px] uppercase text-[#71717a] block font-bold flex items-center gap-1.5">
            <FileCode2 className="w-3.5 h-3.5 text-[#e05638]" />
            <span>Compiled Formats</span>
          </span>
          <p className="font-bold text-[#e05638] tracking-widest">{formatBadgeList || 'WOFF2 · TTF · OTF'}</p>

          <div className="space-y-1.5 pt-1">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between bg-[#09090b] border border-[#27272a] rounded px-2.5 py-1 text-[11px]"
              >
                <span className="font-bold uppercase text-[#f4f4f5]">{file.format}</span>
                <span className="text-[#71717a] font-mono">
                  {(file.file_size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
