'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Download,
  Undo2,
  Redo2,
  Sparkles,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import type { FontGeneration, GeneratedFile } from '@/types/database';
import type {
  GlyphMetadataInfo,
  GlyphOverride,
  GlyphTransformParams,
  FontQualityScoreBreakdown,
  ConsistencyReport,
  DevanagariShapingDebugItem,
  GlyphGroupType,
} from '@/lib/font/studio/types';
import { DEFAULT_TRANSFORM_PARAMS } from '@/lib/font/studio/types';
import { GlyphTransformEngine } from '@/lib/font/studio/transformEngine';
import { ActualGlyphCanvas } from './ActualGlyphCanvas';
import { GlyphNavigatorSidebar } from './GlyphNavigatorSidebar';
import { GlyphPropertiesPanel } from './GlyphPropertiesPanel';
import { DevanagariDebugModal } from './DevanagariDebugModal';

interface FontStudioWorkspaceProps {
  generation: FontGeneration;
  files?: GeneratedFile[];
  initialGlyphs: GlyphMetadataInfo[];
  initialQualityScore: FontQualityScoreBreakdown;
  initialConsistencyReport?: ConsistencyReport;
  devanagariDebugItems?: DevanagariShapingDebugItem[];
}

interface StudioHistoryEntry {
  overrides: Record<string, GlyphOverride>;
  fontName: string;
}

export function FontStudioWorkspace({
  generation,
  initialGlyphs,
  initialQualityScore,
  devanagariDebugItems = [],
}: FontStudioWorkspaceProps) {
  const [fontName, setFontName] = useState(generation.font_name || 'AIFont');
  const [overrides, setOverrides] = useState<Record<string, GlyphOverride>>({});
  const [selectedGlyph, setSelectedGlyph] = useState<GlyphMetadataInfo>(
    initialGlyphs[0] || {
      char: 'A',
      unicode: 65,
      unicodeHex: 'U+0041',
      glyphId: 1,
      glyphName: 'A',
      advanceWidth: 600,
      leftSideBearing: 50,
      rightSideBearing: 50,
      boundingBox: { xMin: 50, yMin: 0, xMax: 550, yMax: 700 },
      script: 'Latin',
      category: 'Uppercase',
      styleFamily: 'GENERAL',
      isModified: false,
      isLocked: false,
    }
  );

  // Compare mode: 'none' | 'overlay' | 'side-by-side'
  const [compareMode, setCompareMode] = useState<'none' | 'overlay' | 'side-by-side'>('none');

  // History stack for 50+ Undo/Redo operations
  const [history, setHistory] = useState<StudioHistoryEntry[]>([
    { overrides: {}, fontName: generation.font_name || 'AIFont' },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // UI state
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [qualityScore, setQualityScore] = useState<FontQualityScoreBreakdown>(initialQualityScore);
  const [showQualityPopover, setShowQualityPopover] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDevanagariDebug, setShowDevanagariDebug] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Bottom live specimen settings
  const [previewText, setPreviewText] = useState('THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG');
  const [previewFontSize, setPreviewFontSize] = useState(36);

  const styleDNA = generation.style_dna as unknown as import('@/lib/font/specification/dna').StyleDNA | null;

  // Show temporary toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Push new state to undo/redo history
  const pushHistory = useCallback(
    (newOverrides: Record<string, GlyphOverride>, newName = fontName) => {
      const nextHistory = history.slice(0, historyIndex + 1);
      if (nextHistory.length >= 60) {
        nextHistory.shift();
      }
      nextHistory.push({ overrides: newOverrides, fontName: newName });
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
      setSaveStatus('dirty');
    },
    [history, historyIndex, fontName]
  );

  // Undo action
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const target = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setOverrides(target.overrides);
      setFontName(target.fontName);
      setSaveStatus('dirty');
      triggerToast('Undo performed');
    }
  }, [historyIndex, history]);

  // Redo action
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const target = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setOverrides(target.overrides);
      setFontName(target.fontName);
      setSaveStatus('dirty');
      triggerToast('Redo performed');
    }
  }, [historyIndex, history]);

  // Keyboard shortcut listener for Undo (Ctrl+Z) and Redo (Ctrl+Y / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyShortcut = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyShortcut);
    return () => window.removeEventListener('keydown', handleKeyShortcut);
  }, [handleUndo, handleRedo]);

  // Update transform for current glyph
  const handleUpdateTransform = (params: Partial<GlyphTransformParams>) => {
    const char = selectedGlyph.char;
    const currentOv = overrides[char] || {
      glyphId: char,
      unicode: selectedGlyph.unicode,
      char,
      name: selectedGlyph.glyphName,
      isLocked: false,
      transforms: { ...DEFAULT_TRANSFORM_PARAMS },
      version: 1,
      updatedAt: new Date().toISOString(),
    };

    const newTransforms: GlyphTransformParams = {
      ...currentOv.transforms,
      ...params,
    };

    const nextOverrides = {
      ...overrides,
      [char]: {
        ...currentOv,
        transforms: newTransforms,
        version: currentOv.version + 1,
        updatedAt: new Date().toISOString(),
      },
    };

    setOverrides(nextOverrides);
    pushHistory(nextOverrides);
  };

  // Toggle lock on a glyph
  const handleToggleLock = (char: string) => {
    const current = overrides[char] || {
      glyphId: char,
      unicode: selectedGlyph.unicode,
      char,
      name: selectedGlyph.glyphName,
      isLocked: false,
      transforms: { ...DEFAULT_TRANSFORM_PARAMS },
      version: 1,
      updatedAt: new Date().toISOString(),
    };

    const nextOverrides = {
      ...overrides,
      [char]: {
        ...current,
        isLocked: !current.isLocked,
        updatedAt: new Date().toISOString(),
      },
    };

    setOverrides(nextOverrides);
    pushHistory(nextOverrides);
    triggerToast(nextOverrides[char].isLocked ? `Glyph '${char}' Locked 🔒` : `Glyph '${char}' Unlocked`);
  };

  // Reset single glyph
  const handleResetGlyph = (char: string) => {
    const nextOverrides = GlyphTransformEngine.resetGlyph(overrides, char);
    setOverrides(nextOverrides);
    pushHistory(nextOverrides);
    triggerToast(`Glyph '${char}' restored to baseline`);
  };

  // Reset all glyph edits
  const handleResetAll = () => {
    const nextOverrides = GlyphTransformEngine.resetAll();
    setOverrides(nextOverrides);
    pushHistory(nextOverrides);
    triggerToast('All glyph modifications reset to original generation');
  };

  // Group transformation
  const handleApplyGroupTransform = (group: GlyphGroupType, delta: Partial<GlyphTransformParams>) => {
    const nextOverrides = GlyphTransformEngine.applyGroupTransform(overrides, group, delta);
    setOverrides(nextOverrides);
    pushHistory(nextOverrides);
    triggerToast(`Group transform applied to ${group}`);
  };

  // Execute AI Glyph Edit
  const handleExecuteAIEdit = async (instruction: string) => {
    setAiLoading(true);
    try {
      const res = await fetch(`/api/fonts/studio/${generation.id}/ai-edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction,
          char: selectedGlyph.char,
          unicode: selectedGlyph.unicode,
          currentTransforms: overrides[selectedGlyph.char]?.transforms || DEFAULT_TRANSFORM_PARAMS,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to interpret AI edit');
      }

      const current = overrides[selectedGlyph.char]?.transforms || { ...DEFAULT_TRANSFORM_PARAMS };
      const updatedTransforms = GlyphTransformEngine.applyInstructionToTransforms(current, data.instruction);

      handleUpdateTransform(updatedTransforms);
      triggerToast(`AI applied: ${data.instruction.operations.length} operations`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI edit failed';
      triggerToast(`AI Edit Error: ${msg}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Regenerate single glyph
  const handleRegenerateSingleGlyph = async () => {
    setAiLoading(true);
    try {
      // Apply variation in stroke & angularity for selected glyph
      const deltaRound = (Math.random() - 0.5) * 0.4;
      const deltaStroke = 0.9 + Math.random() * 0.25;

      handleUpdateTransform({
        roundnessDelta: deltaRound,
        strokeDelta: deltaStroke,
      });

      triggerToast(`Regenerated outline for '${selectedGlyph.char}'`);
    } finally {
      setAiLoading(false);
    }
  };

  // Save changes as new version
  const handleSaveVersion = async () => {
    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/fonts/studio/${generation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overrides,
          fontName,
          versionLabel: `Studio Refinement`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Save failed');
      }

      setSaveStatus('saved');
      triggerToast(`Saved as Version ${data.versionNumber}!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save version';
      triggerToast(`Save Error: ${msg}`);
      setSaveStatus('dirty');
    }
  };

  // Construct dummy baseline and transformed commands for the selected glyph outline
  const { originalCommands, transformedCommands } = useMemo(() => {
    // Generate synthetic vector points matching glyph bounding box
    const bbox = selectedGlyph.boundingBox;
    const h = bbox.yMax || 700;

    // Base contour representing standard font letterform
    const baseCommands = [
      { type: 'M', x: bbox.xMin, y: 0 },
      { type: 'L', x: bbox.xMin + 50, y: h },
      { type: 'L', x: bbox.xMax - 50, y: h },
      { type: 'L', x: bbox.xMax, y: 0 },
      { type: 'L', x: bbox.xMax - 60, y: 0 },
      { type: 'L', x: (bbox.xMin + bbox.xMax) / 2 + 30, y: h * 0.45 },
      { type: 'L', x: (bbox.xMin + bbox.xMax) / 2 - 30, y: h * 0.45 },
      { type: 'L', x: bbox.xMin + 60, y: 0 },
      { type: 'Z' },
    ];

    const ov = overrides[selectedGlyph.char];
    const params = ov?.transforms || DEFAULT_TRANSFORM_PARAMS;

    // Apply transformation directly to commands
    const tanSlant = Math.tan((params.slant * Math.PI) / 180);
    const centerX = (bbox.xMin + bbox.xMax) / 2;

    const modifiedCommands = baseCommands.map((c) => {
      if (c.x === undefined || c.y === undefined) return c;
      let tx = centerX + (c.x - centerX) * params.scaleX;
      let ty = c.y * params.scaleY;

      if (params.strokeDelta !== 1.0) {
        tx += (tx - centerX) * (params.strokeDelta - 1.0) * 0.3;
      }
      if (params.slant !== 0) {
        tx += ty * tanSlant;
      }
      tx += params.moveX;
      ty += params.moveY;

      return { ...c, x: Math.round(tx), y: Math.round(ty) };
    });

    return {
      originalCommands: baseCommands,
      transformedCommands: modifiedCommands,
    };
  }, [selectedGlyph, overrides]);

  return (
    <div className="min-h-screen flex flex-col bg-[#09090c] text-[#f4f4f5] font-sans antialiased select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e1e24] border border-[#e05638]/50 text-[#f4f4f5] px-4 py-2.5 rounded-lg shadow-2xl font-mono text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-[#e05638]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BAR */}
      <header className="h-14 border-b border-[#27272a] bg-[#121215] px-4 sm:px-6 flex items-center justify-between text-xs font-mono">
        {/* Left: Back & Font Name editing */}
        <div className="flex items-center gap-4">
          <Link
            href={`/font/${generation.id}`}
            className="flex items-center gap-1.5 text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors py-1 px-2 rounded hover:bg-[#1f1f24]"
            title="Back to Specimen"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline uppercase text-[11px] font-bold">Specimen</span>
          </Link>

          <div className="h-4 w-px bg-[#27272a]" />

          {/* Editable Font Name */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={fontName}
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-zA-Z0-9\s_-]/g, '');
                setFontName(val);
                pushHistory(overrides, val);
              }}
              className="bg-transparent border-b border-transparent hover:border-[#3f3f46] focus:border-[#e05638] text-sm font-bold text-[#f4f4f5] px-1 py-0.5 focus:outline-none transition-colors"
              title="Click to rename font"
            />
            <span className="text-[10px] font-bold uppercase bg-[#e05638]/10 text-[#e05638] border border-[#e05638]/30 px-2 py-0.5 rounded">
              v{generation.version_number || 1}
            </span>
            <span className="text-[10px] font-bold uppercase bg-[#1f1f24] text-[#a1a1aa] border border-[#27272a] px-2 py-0.5 rounded hidden md:inline">
              {styleDNA?.styleFamily || generation.category || 'SERIF'}
            </span>
          </div>
        </div>

        {/* Center: Quality & Consistency score popover trigger */}
        <div className="relative hidden lg:flex items-center gap-2">
          <button
            onClick={() => setShowQualityPopover(!showQualityPopover)}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#18181c] border border-[#27272a] hover:border-[#3f3f46] text-[#f4f4f5] transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Score: <strong className="text-emerald-400">{qualityScore.overallScore}/100</strong> ({qualityScore.rating})</span>
            <ChevronDown className="w-3 h-3 text-[#71717a]" />
          </button>

          {/* Quality Score Breakdown Popover */}
          {showQualityPopover && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 bg-[#121215] border border-[#27272a] rounded-xl shadow-2xl p-4 z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
                <span className="font-bold text-[#f4f4f5] uppercase text-xs">QUALITY BREAKDOWN</span>
                <span className="text-emerald-400 font-bold text-xs">{qualityScore.overallScore}%</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                {qualityScore.categories.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between text-[#a1a1aa]">
                    <span>{cat.category}</span>
                    <span className="text-[#f4f4f5] font-bold">{cat.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Undo/Redo & Save / Export */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center bg-[#1f1f24] rounded-lg border border-[#27272a] p-0.5">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] disabled:opacity-30 transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] disabled:opacity-30 transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Save Version Button */}
          <button
            onClick={handleSaveVersion}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f1f24] hover:bg-[#27272a] border border-[#27272a] text-[#f4f4f5] font-bold uppercase text-[11px] transition-all"
            title="Save as a new font version"
          >
            <Save className="w-3.5 h-3.5 text-[#e05638]" />
            <span>{saveStatus === 'saving' ? 'Saving...' : 'Save Version'}</span>
          </button>

          {/* Export Font Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#e05638] hover:bg-[#c8462a] text-white font-bold uppercase text-[11px] transition-all shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* STUDIO MAIN WORKSPACE (3-COLUMN LAYOUT) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Glyph Navigator Sidebar */}
        <GlyphNavigatorSidebar
          glyphs={initialGlyphs}
          selectedGlyph={selectedGlyph}
          onSelectGlyph={setSelectedGlyph}
          overrides={overrides}
          onToggleLock={handleToggleLock}
          onApplyGroupTransform={handleApplyGroupTransform}
          onOpenDevanagariDebug={() => setShowDevanagariDebug(true)}
        />

        {/* Center: Real Vector Canvas */}
        <main className="flex-1 flex flex-col p-4 overflow-hidden">
          <ActualGlyphCanvas
            selectedGlyph={selectedGlyph}
            override={overrides[selectedGlyph.char]}
            originalPathCommands={originalCommands}
            transformedPathCommands={transformedCommands}
            compareMode={compareMode}
            onToggleCompareMode={setCompareMode}
          />
        </main>

        {/* Right: Properties & AI Actions Panel */}
        <GlyphPropertiesPanel
          selectedGlyph={selectedGlyph}
          override={overrides[selectedGlyph.char]}
          onUpdateTransform={handleUpdateTransform}
          onToggleLock={handleToggleLock}
          onResetGlyph={handleResetGlyph}
          onResetAll={handleResetAll}
          onExecuteAIEdit={handleExecuteAIEdit}
          onRegenerateSingleGlyph={handleRegenerateSingleGlyph}
          aiLoading={aiLoading}
        />
      </div>

      {/* BOTTOM SPECIMEN LIVE PREVIEW BAR */}
      <footer className="h-16 border-t border-[#27272a] bg-[#121215] px-6 flex items-center justify-between gap-6 font-mono text-xs">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <span className="text-[10px] uppercase text-[#71717a] font-bold">PREVIEW:</span>
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            className="flex-1 bg-[#0c0c0e] border border-[#27272a] rounded-lg px-3 py-1.5 text-xs text-[#f4f4f5] focus:outline-none focus:border-[#e05638]"
          />
        </div>

        {/* Font size slider */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#71717a]">{previewFontSize}px</span>
          <input
            type="range"
            min="18"
            max="72"
            value={previewFontSize}
            onChange={(e) => setPreviewFontSize(parseInt(e.target.value, 10))}
            className="w-28 accent-[#e05638]"
          />
        </div>

        <div className="text-[11px] text-[#a1a1aa] truncate max-w-md" style={{ fontSize: `${previewFontSize}px` }}>
          {previewText}
        </div>
      </footer>

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none font-mono">
          <div className="bg-[#121215] border border-[#27272a] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
              <h3 className="text-lg font-bold text-[#f4f4f5] uppercase flex items-center gap-2">
                <Download className="w-5 h-5 text-[#e05638]" />
                <span>Export Edited Font</span>
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-[#71717a] hover:text-[#f4f4f5]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#a1a1aa]">
              <p>
                Ready to export <strong className="text-[#f4f4f5]">{fontName}</strong> with all{' '}
                <strong className="text-[#e05638]">{Object.keys(overrides).length}</strong> modified glyphs compiled into binary OpenType format.
              </p>

              <div className="space-y-2 pt-2">
                <a
                  href={`/api/fonts/download/${generation.id}?format=ttf`}
                  download
                  className="w-full py-2.5 px-4 rounded-lg bg-[#1f1f24] hover:bg-[#27272a] border border-[#27272a] text-[#f4f4f5] font-bold uppercase flex items-center justify-between transition-all"
                >
                  <span>TrueType Font (.TTF)</span>
                  <Download className="w-4 h-4 text-[#e05638]" />
                </a>

                <a
                  href={`/api/fonts/download/${generation.id}?format=otf`}
                  download
                  className="w-full py-2.5 px-4 rounded-lg bg-[#1f1f24] hover:bg-[#27272a] border border-[#27272a] text-[#f4f4f5] font-bold uppercase flex items-center justify-between transition-all"
                >
                  <span>OpenType Font (.OTF)</span>
                  <Download className="w-4 h-4 text-[#e05638]" />
                </a>

                <a
                  href={`/api/fonts/download/${generation.id}?format=woff2`}
                  download
                  className="w-full py-2.5 px-4 rounded-lg bg-[#1f1f24] hover:bg-[#27272a] border border-[#27272a] text-[#f4f4f5] font-bold uppercase flex items-center justify-between transition-all"
                >
                  <span>Web Open Font Format (.WOFF2)</span>
                  <Download className="w-4 h-4 text-[#e05638]" />
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-[#27272a] flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#f4f4f5] font-bold text-xs uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Devanagari Shaping Debug Modal */}
      <DevanagariDebugModal
        isOpen={showDevanagariDebug}
        onClose={() => setShowDevanagariDebug(false)}
        debugItems={devanagariDebugItems}
      />
    </div>
  );
}
