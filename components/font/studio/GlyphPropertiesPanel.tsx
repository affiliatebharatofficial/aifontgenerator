'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Lock,
  Unlock,
  RotateCcw,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  Wand2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import type {
  GlyphMetadataInfo,
  GlyphTransformParams,
  GlyphOverride,
  AIGlyphInstruction,
} from '@/lib/font/studio/types';
import { DEFAULT_TRANSFORM_PARAMS } from '@/lib/font/studio/types';

interface GlyphPropertiesPanelProps {
  selectedGlyph: GlyphMetadataInfo;
  override?: GlyphOverride;
  onUpdateTransform: (params: Partial<GlyphTransformParams>) => void;
  onToggleLock: (char: string) => void;
  onResetGlyph: (char: string) => void;
  onResetAll: () => void;
  onExecuteAIEdit: (instruction: string) => Promise<void>;
  onRegenerateSingleGlyph: () => Promise<void>;
  aiLoading?: boolean;
}

export function GlyphPropertiesPanel({
  selectedGlyph,
  override,
  onUpdateTransform,
  onToggleLock,
  onResetGlyph,
  onResetAll,
  onExecuteAIEdit,
  onRegenerateSingleGlyph,
  aiLoading = false,
}: GlyphPropertiesPanelProps) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [showMetadata, setShowMetadata] = useState(true);
  const [confirmResetAll, setConfirmResetAll] = useState(false);

  const transforms = override?.transforms || { ...DEFAULT_TRANSFORM_PARAMS };
  const isLocked = !!override?.isLocked;

  const handleSliderChange = (key: keyof GlyphTransformParams, val: number) => {
    onUpdateTransform({ [key]: val });
  };

  const handleAIFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || aiLoading) return;
    await onExecuteAIEdit(aiPrompt.trim());
    setAiPrompt('');
  };

  return (
    <div className="w-88 flex flex-col bg-[#121215] border-l border-[#27272a] h-full overflow-y-auto select-none font-mono text-xs text-[#a1a1aa]">
      {/* Panel Header */}
      <div className="p-4 border-b border-[#27272a] bg-[#141418] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#e05638]" />
          <span className="font-bold text-[#f4f4f5] uppercase">GLYPH PROPERTIES</span>
        </div>

        {/* Lock Toggle Button */}
        <button
          onClick={() => onToggleLock(selectedGlyph.char)}
          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1.5 border transition-all ${
            isLocked
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
              : 'bg-[#1f1f24] text-[#a1a1aa] border-[#27272a] hover:text-[#f4f4f5]'
          }`}
          title={isLocked ? 'Glyph is locked (protected from variations)' : 'Lock glyph to protect during variation'}
        >
          {isLocked ? (
            <>
              <Lock className="w-3 h-3 text-purple-400" />
              <span>LOCKED</span>
            </>
          ) : (
            <>
              <Unlock className="w-3 h-3 text-[#71717a]" />
              <span>LOCK</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 space-y-6 flex-1">
        {/* AI Action Box */}
        <div className="border border-[#e05638]/40 bg-[#e05638]/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#e05638] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#e05638]" />
              <span>AI GLYPH EDITOR</span>
            </span>
          </div>

          <form onSubmit={handleAIFormSubmit} className="space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder='e.g. "Make this A more aggressive"...'
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={aiLoading}
                className="w-full bg-[#0c0c0e] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-[#e05638] disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={!aiPrompt.trim() || aiLoading}
              className="w-full py-1.5 rounded-lg bg-[#e05638] text-white hover:bg-[#c8462a] disabled:opacity-50 text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              {aiLoading ? (
                <span>Interpreting AI Edit...</span>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Apply AI Refinement</span>
                </>
              )}
            </button>
          </form>

          {/* Quick AI Presets */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[9px] uppercase text-[#71717a] block font-bold">QUICK AI TRANSFORM ACTIONS:</span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <button
                onClick={() => onExecuteAIEdit('Make this glyph sharper with acute angles')}
                disabled={aiLoading}
                className="p-1.5 rounded bg-[#18181c] hover:bg-[#202026] text-[#f4f4f5] border border-[#27272a] text-left hover:border-[#e05638]/50"
              >
                ⚡ Make Sharper
              </button>
              <button
                onClick={() => onExecuteAIEdit('Make this glyph rounder and softer')}
                disabled={aiLoading}
                className="p-1.5 rounded bg-[#18181c] hover:bg-[#202026] text-[#f4f4f5] border border-[#27272a] text-left hover:border-[#e05638]/50"
              >
                🫧 Make Rounder
              </button>
              <button
                onClick={() => onExecuteAIEdit('Make this glyph bolder and heavier')}
                disabled={aiLoading}
                className="p-1.5 rounded bg-[#18181c] hover:bg-[#202026] text-[#f4f4f5] border border-[#27272a] text-left hover:border-[#e05638]/50"
              >
                ⬛ Make Bolder
              </button>
              <button
                onClick={() => onExecuteAIEdit('Make this glyph thinner and lighter')}
                disabled={aiLoading}
                className="p-1.5 rounded bg-[#18181c] hover:bg-[#202026] text-[#f4f4f5] border border-[#27272a] text-left hover:border-[#e05638]/50"
              >
                🪶 Make Thinner
              </button>
              <button
                onClick={() => onExecuteAIEdit('Fix proportion and optical balance')}
                disabled={aiLoading}
                className="p-1.5 rounded bg-[#18181c] hover:bg-[#202026] text-[#f4f4f5] border border-[#27272a] text-left hover:border-[#e05638]/50"
              >
                ⚖️ Fix Proportion
              </button>
              <button
                onClick={() => onExecuteAIEdit('Match overall font style DNA')}
                disabled={aiLoading}
                className="p-1.5 rounded bg-[#18181c] hover:bg-[#202026] text-[#f4f4f5] border border-[#27272a] text-left hover:border-[#e05638]/50"
              >
                🎯 Match Font Style
              </button>
            </div>

            {/* Single Glyph Regeneration */}
            <button
              onClick={onRegenerateSingleGlyph}
              disabled={aiLoading}
              className="w-full py-1.5 mt-2 rounded bg-[#1f1f24] hover:bg-[#27272a] text-amber-300 border border-amber-500/30 text-[10px] uppercase font-bold flex items-center justify-center gap-1.5"
              title="Regenerate only this glyph using seed-controlled synthesis"
            >
              <RefreshCw className="w-3 h-3 text-amber-400" />
              <span>Regenerate Single Glyph</span>
            </button>
          </div>
        </div>

        {/* Manual Geometric Sliders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-[#27272a]">
            <span className="text-[11px] font-bold text-[#f4f4f5] uppercase">GEOMETRY TRANSFORMS</span>
            <button
              onClick={() => onResetGlyph(selectedGlyph.char)}
              className="text-[10px] text-[#e05638] hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Glyph</span>
            </button>
          </div>

          {/* Width Scale */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span>WIDTH SCALE</span>
              <span className="font-bold text-[#f4f4f5]">{Math.round(transforms.scaleX * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.02"
              value={transforms.scaleX}
              onChange={(e) => handleSliderChange('scaleX', parseFloat(e.target.value))}
              className="w-full accent-[#e05638]"
            />
          </div>

          {/* Height Scale */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span>HEIGHT SCALE</span>
              <span className="font-bold text-[#f4f4f5]">{Math.round(transforms.scaleY * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.02"
              value={transforms.scaleY}
              onChange={(e) => handleSliderChange('scaleY', parseFloat(e.target.value))}
              className="w-full accent-[#e05638]"
            />
          </div>

          {/* Stroke Delta */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span>STROKE THICKNESS</span>
              <span className="font-bold text-[#f4f4f5]">{transforms.strokeDelta.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.2"
              step="0.05"
              value={transforms.strokeDelta}
              onChange={(e) => handleSliderChange('strokeDelta', parseFloat(e.target.value))}
              className="w-full accent-[#e05638]"
            />
          </div>

          {/* Slant Angle */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span>SLANT ANGLE</span>
              <span className="font-bold text-[#f4f4f5]">{transforms.slant}°</span>
            </div>
            <input
              type="range"
              min="-25"
              max="25"
              step="1"
              value={transforms.slant}
              onChange={(e) => handleSliderChange('slant', parseInt(e.target.value, 10))}
              className="w-full accent-[#e05638]"
            />
          </div>

          {/* Roundness / Sharpness */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span>ROUNDNESS DELTA</span>
              <span className="font-bold text-[#f4f4f5]">
                {transforms.roundnessDelta > 0 ? `+${transforms.roundnessDelta.toFixed(2)}` : transforms.roundnessDelta.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="-1.0"
              max="1.0"
              step="0.05"
              value={transforms.roundnessDelta}
              onChange={(e) => handleSliderChange('roundnessDelta', parseFloat(e.target.value))}
              className="w-full accent-[#e05638]"
            />
          </div>

          {/* Advance Width Offset */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span>ADVANCE SPACING DELTA</span>
              <span className="font-bold text-[#f4f4f5]">{transforms.advanceWidthDelta > 0 ? `+${transforms.advanceWidthDelta}` : transforms.advanceWidthDelta}</span>
            </div>
            <input
              type="range"
              min="-150"
              max="250"
              step="10"
              value={transforms.advanceWidthDelta}
              onChange={(e) => handleSliderChange('advanceWidthDelta', parseInt(e.target.value, 10))}
              className="w-full accent-[#e05638]"
            />
          </div>
        </div>

        {/* Glyph Metadata Accordion */}
        <div className="border border-[#27272a] rounded-lg bg-[#0c0c0e] overflow-hidden">
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="w-full p-3 flex items-center justify-between text-[11px] font-bold text-[#f4f4f5] bg-[#141418] hover:bg-[#18181c]"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>GLYPH METRICS &amp; INFO</span>
            </span>
            {showMetadata ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showMetadata && (
            <div className="p-3 space-y-2 text-[10px]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#71717a]">UNICODE:</span>
                  <p className="text-[#f4f4f5] font-bold">{selectedGlyph.unicodeHex}</p>
                </div>
                <div>
                  <span className="text-[#71717a]">SCRIPT:</span>
                  <p className="text-[#f4f4f5] font-bold">{selectedGlyph.script}</p>
                </div>
                <div>
                  <span className="text-[#71717a]">ADVANCE:</span>
                  <p className="text-[#f4f4f5] font-bold">{selectedGlyph.advanceWidth} units</p>
                </div>
                <div>
                  <span className="text-[#71717a]">GLYPH ID:</span>
                  <p className="text-[#f4f4f5] font-bold">#{selectedGlyph.glyphId}</p>
                </div>
                <div>
                  <span className="text-[#71717a]">LSB / RSB:</span>
                  <p className="text-[#f4f4f5] font-bold">
                    {Math.round(selectedGlyph.leftSideBearing)} / {Math.round(selectedGlyph.rightSideBearing)}
                  </p>
                </div>
                <div>
                  <span className="text-[#71717a]">STYLE:</span>
                  <p className="text-[#f4f4f5] font-bold">{selectedGlyph.styleFamily}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Danger Zone: Reset All */}
        <div className="pt-4 border-t border-[#27272a]">
          {!confirmResetAll ? (
            <button
              onClick={() => setConfirmResetAll(true)}
              className="w-full py-1.5 rounded bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/30 text-[10px] uppercase font-bold transition-all"
            >
              Reset All Glyph Edits
            </button>
          ) : (
            <div className="p-2.5 rounded bg-red-950/40 border border-red-800 text-center space-y-2">
              <span className="text-[10px] text-red-300 font-bold block">Restore original generation?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onResetAll();
                    setConfirmResetAll(false);
                  }}
                  className="flex-1 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setConfirmResetAll(false)}
                  className="flex-1 py-1 rounded bg-[#27272a] hover:bg-[#3f3f46] text-[#f4f4f5] font-bold text-[10px] uppercase"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
