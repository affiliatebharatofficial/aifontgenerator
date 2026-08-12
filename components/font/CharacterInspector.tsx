'use client';

import { useState } from 'react';
import type { CharacterSetConfig } from '@/types/database';

export function CharacterInspector({
  generationId,
  characterSet,
  stemWidth = 80,
}: {
  generationId?: string;
  characterSet?: CharacterSetConfig;
  stemWidth?: number;
}) {
  const fontFamilyName = generationId ? `GeneratedFont_${generationId.replace(/[^a-zA-Z0-9]/g, '')}` : 'sans-serif';

  const groups = [
    {
      name: 'Uppercase',
      active: characterSet?.uppercase ?? true,
      chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    },
    {
      name: 'Lowercase',
      active: characterSet?.lowercase ?? true,
      chars: 'abcdefghijklmnopqrstuvwxyz'.split(''),
    },
    {
      name: 'Numbers',
      active: characterSet?.numbers ?? true,
      chars: '0123456789'.split(''),
    },
    {
      name: 'Symbols',
      active: characterSet?.punctuation ?? true,
      chars: ['.', ',', '!', '?', ':', ';', '-', '+', '=', '/'],
    },
  ];

  const [selectedChar, setSelectedChar] = useState('A');

  const selectedUnicode = selectedChar.charCodeAt(0);
  const unicodeHex = `U+${selectedUnicode.toString(16).toUpperCase().padStart(4, '0')}`;

  let advanceWidth = 600;
  if ('AEFHLOCT'.includes(selectedChar)) advanceWidth = 640;
  if ('I'.includes(selectedChar)) advanceWidth = 320;
  if ('il'.includes(selectedChar)) advanceWidth = 280;
  if ('0123456789'.includes(selectedChar)) advanceWidth = 560;
  if ('.,:;-+=/'.includes(selectedChar)) advanceWidth = 320;

  return (
    <div className="border border-[#27272a] bg-[#121215] rounded-md p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
        <h3 className="text-xs font-mono uppercase tracking-widest text-[#f4f4f5] font-bold">
          Glyph Grid & Unicode Inspector
        </h3>
        <span className="text-[10px] font-mono text-[#71717a]">
          Click glyph to inspect properties
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Glyph Selector Grid */}
        <div className="lg:col-span-8 space-y-6">
          {groups.map(
            (group) =>
              group.active && (
                <div key={group.name} className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#71717a] font-bold">
                    {group.name} ({group.chars.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {group.chars.map((char) => {
                      const isSelected = selectedChar === char;
                      return (
                        <button
                          key={char}
                          type="button"
                          onClick={() => setSelectedChar(char)}
                          style={{ fontFamily: `"${fontFamilyName}", sans-serif` }}
                          className={`w-9 h-9 rounded-md border text-sm font-specimen flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#e05638] border-[#e05638] text-white font-bold'
                              : 'bg-[#09090b] border-[#27272a] text-[#f4f4f5] hover:border-[#3f3f46]'
                          }`}
                        >
                          {char}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
          )}
        </div>

        {/* Selected Glyph Inspector Card */}
        <div className="lg:col-span-4 border border-[#27272a] bg-[#09090b] rounded-md p-6 space-y-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#e05638] font-bold block">
            SELECTED GLYPH DETAIL
          </span>

          <div className="flex items-center justify-center h-32 border border-[#27272a] bg-[#121215] rounded-md">
            <span
              style={{ fontFamily: `"${fontFamilyName}", sans-serif` }}
              className="text-7xl text-[#f4f4f5] font-specimen"
            >
              {selectedChar}
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs text-[#a1a1aa] border-t border-[#27272a] pt-4">
            <div className="flex justify-between">
              <span className="uppercase text-[10px]">Glyph Char</span>
              <span className="font-bold text-[#f4f4f5]">&ldquo;{selectedChar}&rdquo;</span>
            </div>

            <div className="flex justify-between">
              <span className="uppercase text-[10px]">Unicode Value</span>
              <span className="font-bold text-[#f4f4f5]">{unicodeHex}</span>
            </div>

            <div className="flex justify-between">
              <span className="uppercase text-[10px]">Advance Width</span>
              <span className="font-bold text-[#f4f4f5]">{advanceWidth} units</span>
            </div>

            <div className="flex justify-between">
              <span className="uppercase text-[10px]">Stem Width</span>
              <span className="font-bold text-[#f4f4f5]">{stemWidth} units</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
