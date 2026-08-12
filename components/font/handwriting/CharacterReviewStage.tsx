'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Edit3,
  Trash2,
  Grid,
} from 'lucide-react';
import type {
  CharacterAssignment,
  DetectedCharacterItem,
} from '@/lib/font/handwriting/types';

interface CharacterReviewStageProps {
  detectedItems: DetectedCharacterItem[];
  missingChars: string[];
  onCompileFont: (input: {
    fontName: string;
    category: string;
    weight: string;
    width: string;
    style: string;
    assignments: CharacterAssignment[];
  }) => void;
  onReupload: () => void;
  isCompiling: boolean;
}

export function CharacterReviewStage({
  detectedItems,
  missingChars,
  onCompileFont,
  onReupload,
  isCompiling,
}: CharacterReviewStageProps) {
  const [fontName, setFontName] = useState('My Handwriting');
  const [category, setCategory] = useState('Handwritten');
  const [weight, setWeight] = useState('Regular');
  const [width, setWidth] = useState('Normal');
  const [style, setStyle] = useState('Organic');

  const [assignments, setAssignments] = useState<CharacterAssignment[]>(() =>
    detectedItems.map((item) => ({
      id: item.id,
      char: item.char,
      unicode: item.unicode,
      unicodeHex: item.unicodeHex,
      approved: true,
      item,
    }))
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCharInput, setEditCharInput] = useState('');

  function handleToggleApprove(id: string) {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, approved: !a.approved } : a))
    );
  }

  function handleRemoveAssignment(id: string) {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  }

  function handleStartEditing(a: CharacterAssignment) {
    setEditingId(a.id);
    setEditCharInput(a.char);
  }

  function handleSaveEditing(id: string) {
    if (!editCharInput.trim()) {
      setEditingId(null);
      return;
    }
    const char = editCharInput.trim()[0];
    const u = char.charCodeAt(0);
    const hex = `U+${u.toString(16).toUpperCase().padStart(4, '0')}`;

    setAssignments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              char,
              unicode: u,
              unicodeHex: hex,
              item: { ...a.item, char, unicode: u, unicodeHex: hex },
            }
          : a
      )
    );
    setEditingId(null);
  }

  const approvedCount = assignments.filter((a) => a.approved).length;

  function handleSubmit() {
    onCompileFont({
      fontName: fontName.trim() || 'My Handwriting',
      category,
      weight,
      width,
      style,
      assignments,
    });
  }

  return (
    <div className="space-y-10 font-mono text-xs text-[#a1a1aa]">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272a] pb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#e05638] uppercase tracking-widest block">
            STAGE 2 • CHARACTER ASSIGNMENT REVIEW
          </span>
          <h2 className="font-display font-normal text-3xl sm:text-4xl text-[#f4f4f5] tracking-tight uppercase">
            REVIEW DETECTED HANDWRITING GLYPHS
          </h2>
          <p className="text-xs text-[#71717a]">
            {approvedCount} characters approved for OpenType vector compilation.
          </p>
        </div>

        <button
          type="button"
          onClick={onReupload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#27272a] bg-[#09090b] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer self-start sm:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Upload Another Sample</span>
        </button>
      </div>

      {/* Font Metadata Form */}
      <div className="border border-[#27272a] bg-[#121215] rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-[#27272a] pb-3 text-[#f4f4f5]">
          <Sparkles className="w-4 h-4 text-[#e05638]" />
          <h3 className="font-bold uppercase tracking-wider text-xs">
            Font Metadata &amp; Specification
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Font Name */}
          <div className="space-y-1.5 lg:col-span-2">
            <label htmlFor="handwritingFontNameInput" className="block uppercase text-[10px] font-bold text-[#71717a]">
              Font Name
            </label>
            <input
              id="handwritingFontNameInput"
              type="text"
              value={fontName}
              onChange={(e) => setFontName(e.target.value)}
              placeholder="My Handwriting"
              className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-[#f4f4f5] font-bold text-xs outline-none focus:border-[#e05638]"
            />
          </div>

          {/* Style */}
          <div className="space-y-1.5">
            <label htmlFor="handwritingStyleSelect" className="block uppercase text-[10px] font-bold text-[#71717a]">
              Style
            </label>
            <select
              id="handwritingStyleSelect"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded px-2.5 py-2 text-[#f4f4f5] font-bold text-xs outline-none focus:border-[#e05638]"
            >
              {['Organic', 'Casual', 'Cursive', 'Script', 'Calligraphic', 'Personal'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Weight */}
          <div className="space-y-1.5">
            <label htmlFor="handwritingWeightSelect" className="block uppercase text-[10px] font-bold text-[#71717a]">
              Weight
            </label>
            <select
              id="handwritingWeightSelect"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded px-2.5 py-2 text-[#f4f4f5] font-bold text-xs outline-none focus:border-[#e05638]"
            >
              {['Thin', 'Light', 'Regular', 'Medium', 'Bold', 'Black'].map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Width */}
          <div className="space-y-1.5">
            <label htmlFor="handwritingWidthSelect" className="block uppercase text-[10px] font-bold text-[#71717a]">
              Width
            </label>
            <select
              id="handwritingWidthSelect"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded px-2.5 py-2 text-[#f4f4f5] font-bold text-xs outline-none focus:border-[#e05638]"
            >
              {['Condensed', 'Semi Condensed', 'Normal', 'Semi Expanded', 'Expanded'].map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Detected Characters Grid */}
      <div className="border border-[#27272a] bg-[#121215] rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-[#e05638]" />
            <h3 className="font-bold text-[#f4f4f5] uppercase tracking-wider text-xs">
              DETECTED GLYPH ASSIGNMENTS ({assignments.length})
            </h3>
          </div>

          <span className="text-[10px] text-[#71717a]">
            Click edit to reassign character mapping
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {assignments.map((a) => {
            const isEditing = editingId === a.id;
            const statusClass =
              a.item.status === 'Detected'
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : 'bg-amber-950/60 border-amber-800 text-amber-300';

            return (
              <div
                key={a.id}
                className={`border rounded-lg p-3 flex flex-col justify-between space-y-3 transition-all ${
                  a.approved
                    ? 'border-[#27272a] bg-[#09090b]'
                    : 'border-[#27272a]/40 bg-[#09090b]/40 opacity-50'
                }`}
              >
                {/* Header status */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${statusClass}`}
                  >
                    {a.item.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEditing(a)}
                      title="Edit character label"
                      className="p-1 rounded text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#27272a] cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveAssignment(a.id)}
                      title="Remove character"
                      className="p-1 rounded text-[#71717a] hover:text-rose-400 hover:bg-[#27272a] cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Sample Crop Image & Label */}
                <div className="flex items-center justify-between bg-[#121215] border border-[#27272a] rounded p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.item.sampleCropUrl}
                    alt={`Crop ${a.char}`}
                    className="w-10 h-10 object-contain rounded bg-[#09090b] border border-[#27272a]"
                  />

                  {isEditing ? (
                    <input
                      type="text"
                      maxLength={1}
                      value={editCharInput}
                      onChange={(e) => setEditCharInput(e.target.value)}
                      onBlur={() => handleSaveEditing(a.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEditing(a.id)}
                      autoFocus
                      className="w-8 h-8 bg-[#09090b] border border-[#e05638] text-center font-bold text-base text-[#f4f4f5] rounded outline-none"
                    />
                  ) : (
                    <div className="text-right">
                      <span className="font-display text-2xl font-bold text-[#f4f4f5]">
                        {a.char}
                      </span>
                      <span className="text-[9px] text-[#71717a] block font-mono">
                        {a.unicodeHex}
                      </span>
                    </div>
                  )}
                </div>

                {/* Checkbox Approve toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleApprove(a.id)}
                  className={`w-full py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    a.approved
                      ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                      : 'bg-[#18181b] border border-[#27272a] text-[#71717a]'
                  }`}
                >
                  {a.approved ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Approved</span>
                    </>
                  ) : (
                    <span>Excluded</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Missing Characters Notice */}
      {missingChars.length > 0 && (
        <div className="p-4 rounded-lg border border-amber-800/80 bg-amber-950/30 text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-200 block text-xs">
              MISSING CHARACTERS DETECTED ({missingChars.length})
            </span>
            <p className="text-[11px] text-amber-300/80">
              The following character targets were not detected in your handwriting sample:{' '}
              <strong className="text-white font-mono">{missingChars.join(', ')}</strong>. You can compile your font with available characters or re-upload a sample containing the missing glyphs.
            </p>
          </div>
        </div>
      )}

      {/* Build CTA Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border border-[#27272a] bg-[#121215] rounded-xl">
        <div>
          <span className="font-bold text-[#f4f4f5] text-sm uppercase block">
            READY TO BUILD YOUR HANDWRITING FONT
          </span>
          <p className="text-xs text-[#71717a]">
            Compiling {approvedCount} OpenType vector glyphs into TTF, OTF, and WOFF2 production binaries.
          </p>
        </div>

        <button
          type="button"
          disabled={isCompiling || approvedCount === 0}
          onClick={handleSubmit}
          className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#e05638] hover:bg-[#c8462a] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-xl cursor-pointer disabled:opacity-50"
        >
          {isCompiling ? 'Compiling Vector Font...' : 'Build Handwriting Font Now'}
        </button>
      </div>
    </div>
  );
}
