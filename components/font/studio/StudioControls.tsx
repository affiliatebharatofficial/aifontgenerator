'use client';

import React, { useState } from 'react';
import {
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  RotateCcw,
  Save,
  Check,
  Type,
  Baseline,
} from 'lucide-react';
import type { StudioPreviewSettings, TextAlignMode, TextTransformMode, CanvasBgMode } from './types';

interface StudioControlsProps {
  settings: StudioPreviewSettings;
  onChange: (updater: (prev: StudioPreviewSettings) => StudioPreviewSettings) => void;
  onReset: () => void;
  onSave: () => void;
  isSavedToast: boolean;
}

export const PRESET_TEXTS = [
  {
    label: 'Pangram',
    text: 'The quick brown fox jumps over the lazy dog.',
  },
  {
    label: 'Alphabet',
    text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz',
  },
  {
    label: 'Numbers',
    text: '0123456789',
  },
  {
    label: 'Punctuation',
    text: `.,!?;:'"-()[]{}&@#$%+*/=_<>%`,
  },
  {
    label: 'Heading',
    text: 'Create Something Beautiful',
  },
  {
    label: 'Paragraph',
    text: 'Typography changes how words feel, how information is read, and how a visual identity is remembered.',
  },
];

export function StudioControls({
  settings,
  onChange,
  onReset,
  onSave,
  isSavedToast,
}: StudioControlsProps) {
  const [hexInputErr, setHexInputErr] = useState<string | null>(null);

  function handleHexColorChange(val: string) {
    let cleanVal = val.trim();
    if (!cleanVal.startsWith('#')) {
      cleanVal = '#' + cleanVal;
    }
    const isValid = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(cleanVal);
    if (isValid) {
      setHexInputErr(null);
      onChange((prev) => ({ ...prev, textColor: cleanVal }));
    } else {
      setHexInputErr('Invalid hex');
    }
  }

  function handleCustomBgHexChange(val: string) {
    let cleanVal = val.trim();
    if (!cleanVal.startsWith('#')) {
      cleanVal = '#' + cleanVal;
    }
    const isValid = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(cleanVal);
    if (isValid) {
      onChange((prev) => ({ ...prev, bgMode: 'custom', customBgColor: cleanVal }));
    }
  }

  return (
    <div className="border border-[#27272a] bg-[#121215] rounded-lg p-6 space-y-6 text-xs font-mono text-[#a1a1aa]">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#e05638]" />
          <h2 className="font-bold text-[#f4f4f5] uppercase tracking-wider text-xs">
            Typography Controls
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            title="Reset to default specimen settings"
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#27272a] bg-[#09090b] text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#3f3f46] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Preset Text Selector */}
      <div className="space-y-2">
        <label className="block uppercase text-[10px] font-bold text-[#71717a]">
          Preset Specimens
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {PRESET_TEXTS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange((prev) => ({ ...prev, customText: preset.text }))}
              className="px-2.5 py-1.5 rounded text-left border border-[#27272a] bg-[#09090b] text-[11px] text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#e05638] transition-colors truncate cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size (12px - 200px) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="fontSizeInput" className="uppercase text-[11px] font-bold text-[#71717a]">
            Font Size (px)
          </label>
          <div className="flex items-center gap-1">
            <input
              id="fontSizeInput"
              type="number"
              min="12"
              max="200"
              value={settings.fontSize}
              onChange={(e) => {
                const val = Math.max(12, Math.min(200, Number(e.target.value) || 12));
                onChange((prev) => ({ ...prev, fontSize: val }));
              }}
              className="w-14 bg-[#09090b] border border-[#27272a] rounded px-1.5 py-0.5 text-right font-bold text-[#f4f4f5] text-xs outline-none focus:border-[#e05638]"
            />
            <span className="text-[#71717a]">px</span>
          </div>
        </div>
        <input
          type="range"
          min="12"
          max="200"
          value={settings.fontSize}
          onChange={(e) => onChange((prev) => ({ ...prev, fontSize: Number(e.target.value) }))}
          className="w-full accent-[#e05638] cursor-pointer"
        />
      </div>

      {/* Letter Spacing (-5px - 20px) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="letterSpacingInput" className="uppercase text-[11px] font-bold text-[#71717a]">
            Letter Spacing (Tracking)
          </label>
          <div className="flex items-center gap-1">
            <input
              id="letterSpacingInput"
              type="number"
              min="-5"
              max="20"
              value={settings.letterSpacing}
              onChange={(e) => {
                const val = Math.max(-5, Math.min(20, Number(e.target.value) || 0));
                onChange((prev) => ({ ...prev, letterSpacing: val }));
              }}
              className="w-14 bg-[#09090b] border border-[#27272a] rounded px-1.5 py-0.5 text-right font-bold text-[#f4f4f5] text-xs outline-none focus:border-[#e05638]"
            />
            <span className="text-[#71717a]">px</span>
          </div>
        </div>
        <input
          type="range"
          min="-5"
          max="20"
          value={settings.letterSpacing}
          onChange={(e) => onChange((prev) => ({ ...prev, letterSpacing: Number(e.target.value) }))}
          className="w-full accent-[#e05638] cursor-pointer"
        />
      </div>

      {/* Line Height (0.8 - 3.0) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="lineHeightInput" className="uppercase text-[11px] font-bold text-[#71717a]">
            Line Height (Leading)
          </label>
          <input
            id="lineHeightInput"
            type="number"
            min="0.8"
            max="3"
            step="0.05"
            value={settings.lineHeight}
            onChange={(e) => {
              const val = Math.max(0.8, Math.min(3, Number(e.target.value) || 1.2));
              onChange((prev) => ({ ...prev, lineHeight: val }));
            }}
            className="w-16 bg-[#09090b] border border-[#27272a] rounded px-1.5 py-0.5 text-right font-bold text-[#f4f4f5] text-xs outline-none focus:border-[#e05638]"
          />
        </div>
        <input
          type="range"
          min="0.8"
          max="3"
          step="0.05"
          value={settings.lineHeight}
          onChange={(e) => onChange((prev) => ({ ...prev, lineHeight: Number(e.target.value) }))}
          className="w-full accent-[#e05638] cursor-pointer"
        />
      </div>

      {/* Alignment & Case Transform */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Alignment */}
        <div className="space-y-2">
          <label className="block uppercase text-[10px] font-bold text-[#71717a]">
            Alignment
          </label>
          <div className="flex items-center gap-1 bg-[#09090b] border border-[#27272a] rounded p-1">
            {(
              [
                { mode: 'left', icon: AlignLeft, label: 'Left' },
                { mode: 'center', icon: AlignCenter, label: 'Center' },
                { mode: 'right', icon: AlignRight, label: 'Right' },
                { mode: 'justify', icon: AlignJustify, label: 'Justify' },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const isActive = settings.textAlign === item.mode;
              return (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() => onChange((prev) => ({ ...prev, textAlign: item.mode as TextAlignMode }))}
                  aria-label={`Align ${item.label}`}
                  className={`p-1.5 rounded flex-1 flex justify-center cursor-pointer transition-colors ${
                    isActive ? 'bg-[#18181b] text-[#e05638] font-bold border border-[#e05638]/40' : 'text-[#71717a] hover:text-[#f4f4f5]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Case Transform */}
        <div className="space-y-2">
          <label className="block uppercase text-[10px] font-bold text-[#71717a]">
            Case
          </label>
          <div className="flex items-center gap-1 bg-[#09090b] border border-[#27272a] rounded p-1">
            {(
              [
                { mode: 'none', label: 'Aa' },
                { mode: 'uppercase', label: 'AA' },
                { mode: 'lowercase', label: 'aa' },
              ] as const
            ).map((item) => {
              const isActive = settings.textTransform === item.mode;
              return (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() =>
                    onChange((prev) => ({ ...prev, textTransform: item.mode as TextTransformMode }))
                  }
                  className={`p-1.5 rounded flex-1 text-center font-bold cursor-pointer transition-colors text-xs ${
                    isActive ? 'bg-[#18181b] text-[#e05638] border border-[#e05638]/40' : 'text-[#71717a] hover:text-[#f4f4f5]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Colors & Background */}
      <div className="space-y-4 pt-2 border-t border-[#27272a]">
        {/* Text Color */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="textColorInput" className="uppercase text-[10px] font-bold text-[#71717a]">
              Text Color
            </label>
            {hexInputErr && <span className="text-[10px] text-rose-400 font-bold">{hexInputErr}</span>}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.textColor}
              onChange={(e) => {
                setHexInputErr(null);
                onChange((prev) => ({ ...prev, textColor: e.target.value }));
              }}
              className="w-8 h-8 rounded border border-[#27272a] bg-transparent cursor-pointer p-0.5"
            />
            <input
              id="textColorInput"
              type="text"
              value={settings.textColor}
              onChange={(e) => handleHexColorChange(e.target.value)}
              placeholder="#f4f4f5"
              className="flex-1 bg-[#09090b] border border-[#27272a] rounded px-2.5 py-1.5 font-bold text-[#f4f4f5] text-xs outline-none focus:border-[#e05638]"
            />
          </div>
        </div>

        {/* Canvas Background */}
        <div className="space-y-2">
          <label className="block uppercase text-[10px] font-bold text-[#71717a]">
            Specimen Canvas Background
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onChange((prev) => ({ ...prev, bgMode: 'dark' }))}
              className={`p-2 rounded border text-center transition-all cursor-pointer ${
                settings.bgMode === 'dark'
                  ? 'bg-[#09090b] border-[#e05638] text-white font-bold'
                  : 'bg-[#09090b] border-[#27272a] text-[#71717a] hover:border-[#3f3f46]'
              }`}
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => onChange((prev) => ({ ...prev, bgMode: 'light' }))}
              className={`p-2 rounded border text-center transition-all cursor-pointer ${
                settings.bgMode === 'light'
                  ? 'bg-[#f4f4f5] border-[#e05638] text-zinc-900 font-bold'
                  : 'bg-[#f4f4f5] border-[#27272a] text-zinc-600 hover:border-[#3f3f46]'
              }`}
            >
              Light
            </button>
            <div className="relative">
              <input
                type="color"
                value={settings.customBgColor}
                onChange={(e) => handleCustomBgHexChange(e.target.value)}
                className="w-full h-full opacity-0 absolute inset-0 cursor-pointer z-10"
              />
              <button
                type="button"
                className={`w-full p-2 rounded border text-center transition-all cursor-pointer ${
                  settings.bgMode === 'custom'
                    ? 'border-[#e05638] text-white font-bold'
                    : 'border-[#27272a] text-[#71717a] hover:border-[#3f3f46]'
                }`}
                style={{ backgroundColor: settings.customBgColor }}
              >
                Custom
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Settings */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onSave}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded border border-[#e05638]/50 bg-[#e05638]/10 hover:bg-[#e05638] text-[#f4f4f5] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          {isSavedToast ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Settings Saved</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#e05638] group-hover:text-white" />
              <span>Save Preview Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
