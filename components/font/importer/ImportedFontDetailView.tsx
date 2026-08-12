'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Download,
  Sliders,
  Trash2,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Layers,
} from 'lucide-react';
import type { ImportedFont, FontLicense } from '@/types/database';
import { deleteImportedFontAction } from '@/lib/font/importer/actions';
import { ImportedFontLicenseModal } from './ImportedFontLicenseModal';

interface ImportedFontDetailViewProps {
  font: ImportedFont;
  license: FontLicense | null;
}

export function ImportedFontDetailView({
  font,
  license,
}: ImportedFontDetailViewProps) {
  const router = useRouter();

  const [fontSize, setFontSize] = useState(48);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [customText, setCustomText] = useState('The quick brown fox jumps over the lazy dog.');
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fontFamilyName = `ImportedFont_${font.id.replace(/[^a-zA-Z0-9]/g, '')}`;
  const fontUrl = `/api/fonts/imported-preview/${font.id}`;
  const fontName = font.family_name || font.original_filename.replace(/\.[^/.]+$/, '');

  const tables = font.table_records as Record<string, boolean> | null;
  const cmap = font.glyph_cmap as {
    uppercase?: number[];
    lowercase?: number[];
    numbers?: number[];
    punctuation?: number[];
    other?: number[];
  } | null;

  const totalCmapCount =
    (cmap?.uppercase?.length || 0) +
    (cmap?.lowercase?.length || 0) +
    (cmap?.numbers?.length || 0) +
    (cmap?.punctuation?.length || 0) +
    (cmap?.other?.length || 0);

  async function handleDeleteFont() {
    if (!confirm(`Are you sure you want to delete imported font "${fontName}"?`)) return;
    setIsDeleting(true);
    const res = await deleteImportedFontAction(font.id);
    if (res.success) {
      router.push('/dashboard/library');
    } else {
      setIsDeleting(false);
      alert(res.error || 'Failed to delete imported font.');
    }
  }

  return (
    <div className="space-y-10 font-mono text-xs text-[#a1a1aa]">
      {/* Dynamic @font-face style declaration */}
      <style>{`
        @font-face {
          font-family: "${fontFamilyName}";
          src: url("${fontUrl}") format("${font.format}");
          font-display: swap;
        }
      `}</style>

      {/* Header */}
      <div>
        <Link
          href="/dashboard/library"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Type Library</span>
        </Link>
      </div>

      {/* Font Specimen Header */}
      <div className="border border-[#27272a] bg-[#121215] rounded-xl p-8 sm:p-12 space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#27272a]">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#e05638] bg-[#e05638]/10 border border-[#e05638]/30 px-2 py-0.5 rounded">
                SOURCE: IMPORTED
              </span>
              <span className="text-[10px] font-bold uppercase bg-[#18181b] border border-[#27272a] text-[#f4f4f5] px-2 py-0.5 rounded">
                {font.format.toUpperCase()}
              </span>
            </div>

            <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase">
              {fontName}
            </h1>
            {font.subfamily && (
              <p className="text-xs text-[#71717a]">{font.subfamily}</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`/api/fonts/imported-download/${font.id}`}
              download
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono font-bold uppercase border border-[#27272a] bg-[#09090b] text-[#f4f4f5] hover:border-[#e05638] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Original</span>
            </a>

            <Link
              href={`/import-font/${font.id}/test`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono font-bold uppercase bg-[#e05638] text-white hover:bg-[#c8462a] transition-all cursor-pointer shadow-lg"
            >
              <Sliders className="w-4 h-4" />
              <span>Test Studio</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowLicenseModal(true)}
              className="p-2 rounded-md border border-[#27272a] bg-[#09090b] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
              title="Edit License Information"
            >
              <FileText className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteFont}
              className="p-2 rounded-md border border-rose-900/60 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 transition-colors cursor-pointer"
              title="Delete Font"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Technical Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-[#a1a1aa]">
          <div>
            <span className="text-[#71717a] uppercase block text-[10px]">FILE SIZE</span>
            <p className="font-bold text-[#f4f4f5] mt-0.5">
              {(font.file_size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <div>
            <span className="text-[#71717a] uppercase block text-[10px]">UNITS PER EM</span>
            <p className="font-bold text-[#f4f4f5] mt-0.5">{font.units_per_em}</p>
          </div>
          <div>
            <span className="text-[#71717a] uppercase block text-[10px]">GLYPH COUNT</span>
            <p className="font-bold text-[#f4f4f5] mt-0.5">{font.glyph_count}</p>
          </div>
          <div>
            <span className="text-[#71717a] uppercase block text-[10px]">UNICODE CMAP</span>
            <p className="font-bold text-[#f4f4f5] mt-0.5">{totalCmapCount} mapped</p>
          </div>
        </div>
      </div>

      {/* Interactive Specimen Stage */}
      <section className="space-y-4">
        <div className="pb-3 border-b border-[#27272a] flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-bold">
            01 • INTERACTIVE TYPE WORKSPACE
          </h2>
        </div>

        {/* Controls Bar */}
        <div className="border border-[#27272a] bg-[#121215] rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-[#71717a] uppercase">Font Size</span>
                <span className="text-[#f4f4f5]">{fontSize}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="140"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-[#e05638] cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-[#71717a] uppercase">Tracking</span>
                <span className="text-[#f4f4f5]">{letterSpacing}px</span>
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

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-[#71717a] uppercase">Leading</span>
                <span className="text-[#f4f4f5]">{lineHeight}</span>
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

          <div className="pt-2">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type specimen text..."
              className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-[#f4f4f5] text-xs font-mono outline-none focus:border-[#e05638]"
            />
          </div>
        </div>

        {/* Main Specimen Canvas */}
        <div className="border border-[#27272a] bg-[#09090b] rounded-xl p-8 sm:p-12 type-grid-pattern space-y-8 min-h-64 flex flex-col justify-between shadow-2xl">
          <p
            style={{
              fontFamily: `"${fontFamilyName}", sans-serif`,
              fontSize: `${fontSize}px`,
              letterSpacing: `${letterSpacing}px`,
              lineHeight,
            }}
            className="text-[#f4f4f5] font-specimen break-words select-none"
          >
            {customText}
          </p>

          <div className="border-t border-[#27272a] pt-6 space-y-3">
            <span className="text-[10px] uppercase font-bold text-[#71717a] block">
              FULL CHARACTER SPECIMEN
            </span>
            <p
              style={{ fontFamily: `"${fontFamilyName}", sans-serif`, fontSize: '24px' }}
              className="text-[#a1a1aa] font-specimen break-all select-none"
            >
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </p>
            <p
              style={{ fontFamily: `"${fontFamilyName}", sans-serif`, fontSize: '24px' }}
              className="text-[#a1a1aa] font-specimen break-all select-none"
            >
              abcdefghijklmnopqrstuvwxyz 0123456789
            </p>
          </div>
        </div>
      </section>

      {/* OpenType Table Analysis */}
      <section className="space-y-4">
        <div className="pb-3 border-b border-[#27272a]">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-bold">
            02 • OPENTYPE TABLE ANALYSIS
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {tables &&
            Object.entries(tables).map(([tbl, isPresent]) => (
              <div
                key={tbl}
                className="p-4 rounded-lg border border-[#27272a] bg-[#121215] flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-[#f4f4f5] block text-xs">{tbl}</span>
                  <span className="text-[10px] text-[#71717a]">Table Record</span>
                </div>
                {isPresent ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#71717a]" />
                )}
              </div>
            ))}
        </div>
      </section>

      {/* License Notes Section */}
      <section className="border border-[#27272a] bg-[#121215] rounded-xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <h3 className="font-bold text-[#f4f4f5] uppercase tracking-wider text-xs flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#e05638]" />
            <span>LICENSE INFORMATION</span>
          </h3>
          <button
            type="button"
            onClick={() => setShowLicenseModal(true)}
            className="text-[11px] text-[#e05638] hover:underline font-bold uppercase cursor-pointer"
          >
            Edit License Notes
          </button>
        </div>

        {license?.license_name || license?.license_notes ? (
          <div className="space-y-2">
            {license.license_name && (
              <p className="text-xs font-bold text-[#f4f4f5]">{license.license_name}</p>
            )}
            {license.license_url && (
              <a
                href={license.license_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#e05638] hover:underline block"
              >
                {license.license_url}
              </a>
            )}
            {license.license_notes && (
              <p className="text-xs text-[#a1a1aa] leading-relaxed">{license.license_notes}</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#71717a]">
            No custom license information added yet. Click &ldquo;Edit License Notes&rdquo; to add reference details.
          </p>
        )}

        <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-md text-[10px] text-[#71717a]">
          ⚠️ <em>License information is user-provided. AI Font Generator does not determine or guarantee legal font ownership.</em>
        </div>
      </section>

      {/* License Modal */}
      {showLicenseModal && (
        <ImportedFontLicenseModal
          fontId={font.id}
          initialLicense={license}
          onClose={() => setShowLicenseModal(false)}
        />
      )}
    </div>
  );
}
