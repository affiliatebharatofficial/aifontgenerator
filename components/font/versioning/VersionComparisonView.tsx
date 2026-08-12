'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Layers,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Download,
  ExternalLink,
} from 'lucide-react';
import type { FontGeneration, GeneratedFile } from '@/types/database';

interface VersionComparisonViewProps {
  currentGen: FontGeneration;
  familyGenerations: FontGeneration[];
  filesMap: Record<string, GeneratedFile[]>;
}

export function VersionComparisonView({
  currentGen,
  familyGenerations,
  filesMap,
}: VersionComparisonViewProps) {
  const completedVersions = familyGenerations.filter((g) => g.status === 'completed');

  const [versionAId, setVersionAId] = useState<string>(
    completedVersions[0]?.id || currentGen.id
  );
  const [versionBId, setVersionBId] = useState<string>(
    completedVersions[1]?.id || completedVersions[0]?.id || currentGen.id
  );

  // Synchronized controls
  const [fontSize, setFontSize] = useState(48);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [customText, setCustomText] = useState('The quick brown fox jumps over the lazy dog.');

  const genA = completedVersions.find((g) => g.id === versionAId) || currentGen;
  const genB = completedVersions.find((g) => g.id === versionBId) || currentGen;

  const fontNameA = genA.font_name || 'AI Font Specimen';
  const fontNameB = genB.font_name || 'AI Font Specimen';

  const familyNameA = `GeneratedFont_${genA.id.replace(/[^a-zA-Z0-9]/g, '')}`;
  const fontUrlA = `/api/fonts/preview/${genA.id}`;

  const familyNameB = `GeneratedFont_${genB.id.replace(/[^a-zA-Z0-9]/g, '')}`;
  const fontUrlB = `/api/fonts/preview/${genB.id}`;

  const filesA = filesMap[genA.id] || [];
  const filesB = filesMap[genB.id] || [];

  return (
    <div className="space-y-10 font-mono text-xs text-[#a1a1aa]">
      {/* Dynamic @font-face style declarations */}
      <style>{`
        @font-face {
          font-family: "${familyNameA}";
          src: url("${fontUrlA}") format("woff2");
          font-display: swap;
        }
        @font-face {
          font-family: "${familyNameB}";
          src: url("${fontUrlB}") format("woff2");
          font-display: swap;
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#27272a]">
        <div className="space-y-2">
          <Link
            href={`/font/${currentGen.id}`}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Font Details</span>
          </Link>
          <h1 className="font-display font-normal text-3xl sm:text-5xl text-[#f4f4f5] tracking-tight uppercase">
            COMPARE FONT VERSIONS
          </h1>
          <p className="text-xs text-[#71717a]">
            Side-by-side visual specimen comparison and technical specifications.
          </p>
        </div>
      </div>

      {/* Synchronized Typography Controls Bar */}
      <div className="border border-[#27272a] bg-[#121215] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <span className="font-bold uppercase tracking-wider text-[#f4f4f5] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#e05638]" />
            <span>SYNCHRONIZED COMPARISON CONTROLS</span>
          </span>
          <span className="text-[10px] text-[#e05638] uppercase font-bold">
            WOFF2 REAL STREAM
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Size */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="uppercase text-[10px] font-bold text-[#71717a]">Font Size</label>
              <span className="font-bold text-[#f4f4f5]">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="16"
              max="120"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-[#e05638] cursor-pointer"
            />
          </div>

          {/* Tracking */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="uppercase text-[10px] font-bold text-[#71717a]">Tracking</label>
              <span className="font-bold text-[#f4f4f5]">{letterSpacing}px</span>
            </div>
            <input
              type="range"
              min="-5"
              max="20"
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(Number(e.target.value))}
              className="w-full accent-[#e05638] cursor-pointer"
            />
          </div>

          {/* Line Height */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="uppercase text-[10px] font-bold text-[#71717a]">Leading</label>
              <span className="font-bold text-[#f4f4f5]">{lineHeight}</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={lineHeight}
              onChange={(e) => setLineHeight(Number(e.target.value))}
              className="w-full accent-[#e05638] cursor-pointer"
            />
          </div>
        </div>

        {/* Custom Text Input */}
        <div className="pt-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Type comparison text here..."
            className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-[#f4f4f5] text-xs font-mono outline-none focus:border-[#e05638]"
          />
        </div>
      </div>

      {/* Version Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Version A Selector */}
        <div className="space-y-1.5">
          <label htmlFor="versionASelect" className="block uppercase text-[10px] font-bold text-[#e05638]">
            VERSION A (LEFT / TOP)
          </label>
          <select
            id="versionASelect"
            value={versionAId}
            onChange={(e) => setVersionAId(e.target.value)}
            className="w-full bg-[#121215] border border-[#27272a] rounded px-3 py-2 text-[#f4f4f5] font-bold text-xs outline-none focus:border-[#e05638]"
          >
            {completedVersions.map((g) => (
              <option key={g.id} value={g.id}>
                Version {g.version_number || 1} — {g.font_name || 'AI Font'} ({g.weight} • {g.style})
              </option>
            ))}
          </select>
        </div>

        {/* Version B Selector */}
        <div className="space-y-1.5">
          <label htmlFor="versionBSelect" className="block uppercase text-[10px] font-bold text-emerald-400">
            VERSION B (RIGHT / BOTTOM)
          </label>
          <select
            id="versionBSelect"
            value={versionBId}
            onChange={(e) => setVersionBId(e.target.value)}
            className="w-full bg-[#121215] border border-[#27272a] rounded px-3 py-2 text-[#f4f4f5] font-bold text-xs outline-none focus:border-[#e05638]"
          >
            {completedVersions.map((g) => (
              <option key={g.id} value={g.id}>
                Version {g.version_number || 1} — {g.font_name || 'AI Font'} ({g.weight} • {g.style})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Visual Specimen Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Version A Specimen Stage */}
        <div className="border border-[#27272a] bg-[#121215] rounded-xl p-6 sm:p-8 space-y-6 type-grid-pattern shadow-xl">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
            <span className="text-xs font-bold text-[#e05638] uppercase">
              VERSION {genA.version_number || 1} • {fontNameA}
            </span>
            <Link
              href={`/font/${genA.id}`}
              className="text-[10px] text-[#a1a1aa] hover:text-[#f4f4f5] underline flex items-center gap-1"
            >
              <span>View V{genA.version_number || 1}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-6">
            <p
              style={{
                fontFamily: `"${familyNameA}", sans-serif`,
                fontSize: `${fontSize}px`,
                letterSpacing: `${letterSpacing}px`,
                lineHeight,
              }}
              className="text-[#f4f4f5] font-specimen break-words select-none"
            >
              {customText}
            </p>

            <div className="border-t border-[#27272a] pt-4 space-y-2">
              <span className="text-[9px] uppercase font-bold text-[#71717a] block">ALPHABET</span>
              <p
                style={{ fontFamily: `"${familyNameA}", sans-serif`, fontSize: '20px' }}
                className="text-[#a1a1aa] font-specimen break-all select-none"
              >
                ABCDEFGHIJKLMNOPQRSTUVWXYZ
              </p>
              <p
                style={{ fontFamily: `"${familyNameA}", sans-serif`, fontSize: '20px' }}
                className="text-[#a1a1aa] font-specimen break-all select-none"
              >
                abcdefghijklmnopqrstuvwxyz 0123456789
              </p>
            </div>
          </div>
        </div>

        {/* Version B Specimen Stage */}
        <div className="border border-[#27272a] bg-[#121215] rounded-xl p-6 sm:p-8 space-y-6 type-grid-pattern shadow-xl">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase">
              VERSION {genB.version_number || 1} • {fontNameB}
            </span>
            <Link
              href={`/font/${genB.id}`}
              className="text-[10px] text-[#a1a1aa] hover:text-[#f4f4f5] underline flex items-center gap-1"
            >
              <span>View V{genB.version_number || 1}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-6">
            <p
              style={{
                fontFamily: `"${familyNameB}", sans-serif`,
                fontSize: `${fontSize}px`,
                letterSpacing: `${letterSpacing}px`,
                lineHeight,
              }}
              className="text-[#f4f4f5] font-specimen break-words select-none"
            >
              {customText}
            </p>

            <div className="border-t border-[#27272a] pt-4 space-y-2">
              <span className="text-[9px] uppercase font-bold text-[#71717a] block">ALPHABET</span>
              <p
                style={{ fontFamily: `"${familyNameB}", sans-serif`, fontSize: '20px' }}
                className="text-[#a1a1aa] font-specimen break-all select-none"
              >
                ABCDEFGHIJKLMNOPQRSTUVWXYZ
              </p>
              <p
                style={{ fontFamily: `"${familyNameB}", sans-serif`, fontSize: '20px' }}
                className="text-[#a1a1aa] font-specimen break-all select-none"
              >
                abcdefghijklmnopqrstuvwxyz 0123456789
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specifications Matrix Comparison Table */}
      <div className="border border-[#27272a] bg-[#121215] rounded-xl p-6 sm:p-8 space-y-4">
        <h3 className="font-bold text-[#f4f4f5] uppercase tracking-wider text-xs border-b border-[#27272a] pb-3">
          TECHNICAL COMPARISON MATRIX
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#27272a] text-[#71717a] text-[10px]">
                <th className="py-2 px-3 uppercase">Property</th>
                <th className="py-2 px-3 uppercase text-[#e05638]">Version {genA.version_number || 1}</th>
                <th className="py-2 px-3 uppercase text-emerald-400">Version {genB.version_number || 1}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]/50">
              <tr>
                <td className="py-2.5 px-3 text-[#71717a]">Font Name</td>
                <td className="py-2.5 px-3 font-bold text-[#f4f4f5]">{fontNameA}</td>
                <td className="py-2.5 px-3 font-bold text-[#f4f4f5]">{fontNameB}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-[#71717a]">Category</td>
                <td className="py-2.5 px-3 font-bold text-[#f4f4f5]">{genA.category}</td>
                <td className="py-2.5 px-3 font-bold text-[#f4f4f5]">{genB.category}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-[#71717a]">Weight / Width</td>
                <td className="py-2.5 px-3 font-bold text-[#f4f4f5]">
                  {genA.weight} • {genA.width}
                </td>
                <td className="py-2.5 px-3 font-bold text-[#f4f4f5]">
                  {genB.weight} • {genB.width}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-[#71717a]">Style</td>
                <td className="py-2.5 px-3 font-bold text-[#f4f4f5]">{genA.style}</td>
                <td className="py-2.5 px-3 font-bold text-[#f4f4f5]">{genB.style}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-[#71717a]">Created Date</td>
                <td className="py-2.5 px-3 text-[#a1a1aa]">
                  {new Date(genA.created_at).toLocaleDateString()}
                </td>
                <td className="py-2.5 px-3 text-[#a1a1aa]">
                  {new Date(genB.created_at).toLocaleDateString()}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-[#71717a]">Compiled Formats</td>
                <td className="py-2.5 px-3 font-bold text-[#e05638]">
                  {filesA.map((f) => f.format.toUpperCase()).join(' · ')}
                </td>
                <td className="py-2.5 px-3 font-bold text-emerald-400">
                  {filesB.map((f) => f.format.toUpperCase()).join(' · ')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
