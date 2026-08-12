'use client';

import React, { useState } from 'react';
import {
  Maximize2,
  Copy,
  Check,
  Trash2,
  Monitor,
  Smartphone,
  Tablet,
  Maximize,
} from 'lucide-react';
import type { StudioPreviewSettings, PreviewWidthMode } from './types';

interface SpecimenCanvasProps {
  fontFamilyName: string;
  settings: StudioPreviewSettings;
  onChange: (updater: (prev: StudioPreviewSettings) => StudioPreviewSettings) => void;
  onOpenFullscreen: () => void;
  isLoaded?: boolean;
}

export function SpecimenCanvas({
  fontFamilyName,
  settings,
  onChange,
  onOpenFullscreen,
  isLoaded = true,
}: SpecimenCanvasProps) {
  const [copied, setCopied] = useState(false);

  function handleCopyText() {
    if (!settings.customText) return;
    navigator.clipboard.writeText(settings.customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClearText() {
    onChange((prev) => ({ ...prev, customText: '' }));
  }

  // Calculate canvas background style
  let canvasBgClass = 'bg-[#121215] border-[#27272a] text-[#f4f4f5]';
  let inlineBgStyle: React.CSSProperties = {};

  if (settings.bgMode === 'light') {
    canvasBgClass = 'bg-[#f4f4f5] border-zinc-300 text-zinc-900';
  } else if (settings.bgMode === 'custom') {
    canvasBgClass = 'border-[#27272a]';
    inlineBgStyle = { backgroundColor: settings.customBgColor };
  }

  // Calculate container max-width
  let widthClass = 'w-full';
  if (settings.previewWidth === 'desktop') widthClass = 'max-w-[1024px] mx-auto';
  if (settings.previewWidth === 'tablet') widthClass = 'max-w-[768px] mx-auto';
  if (settings.previewWidth === 'mobile') widthClass = 'max-w-[375px] mx-auto';

  const previewStyle: React.CSSProperties = {
    fontFamily: `"${fontFamilyName}", sans-serif`,
    fontSize: `clamp(14px, ${settings.fontSize}px, ${settings.fontSize}px)`,
    letterSpacing: `${settings.letterSpacing}px`,
    lineHeight: settings.lineHeight,
    textAlign: settings.textAlign,
    textTransform: settings.textTransform,
    color: settings.textColor,
  };

  return (
    <div className="space-y-6">
      {/* Width Selector & Top Action Toolbar */}
      <div className="border border-[#27272a] bg-[#121215] rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-[#a1a1aa]">
        {/* Width Switcher */}
        <div className="flex items-center gap-2">
          <span className="uppercase text-[10px] text-[#71717a] font-bold">Viewport Width:</span>
          <div className="flex items-center gap-1 bg-[#09090b] border border-[#27272a] rounded p-1">
            {(
              [
                { mode: 'wide', icon: Maximize, label: 'Wide' },
                { mode: 'desktop', icon: Monitor, label: 'Desktop' },
                { mode: 'tablet', icon: Tablet, label: 'Tablet' },
                { mode: 'mobile', icon: Smartphone, label: 'Mobile' },
              ] as const
            ).map((w) => {
              const Icon = w.icon;
              const isActive = settings.previewWidth === w.mode;
              return (
                <button
                  key={w.mode}
                  type="button"
                  onClick={() =>
                    onChange((prev) => ({ ...prev, previewWidth: w.mode as PreviewWidthMode }))
                  }
                  title={`Preview width: ${w.label}`}
                  className={`px-2 py-1 rounded flex items-center gap-1.5 cursor-pointer text-[11px] transition-colors ${
                    isActive
                      ? 'bg-[#18181b] text-[#e05638] font-bold border border-[#e05638]/40'
                      : 'text-[#71717a] hover:text-[#f4f4f5]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{w.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Specimen Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#27272a] bg-[#09090b] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Specimen Text'}</span>
          </button>

          <button
            type="button"
            onClick={handleClearText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#27272a] bg-[#09090b] text-[#a1a1aa] hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <button
            type="button"
            onClick={onOpenFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#e05638]/60 bg-[#e05638]/10 text-[#e05638] hover:bg-[#e05638] hover:text-white transition-all cursor-pointer font-bold"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Open Fullscreen</span>
          </button>
        </div>
      </div>

      {/* Main Specimen Preview Stage Container */}
      <div className={`transition-all duration-200 ${widthClass}`}>
        <div
          style={inlineBgStyle}
          className={`border rounded-lg p-6 sm:p-12 space-y-12 transition-colors type-grid-pattern shadow-2xl ${canvasBgClass}`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-current/10 pb-4 text-xs font-mono opacity-60">
            <span className="uppercase font-bold tracking-widest text-[10px]">
              TEST YOUR TYPEFACE • LIVE SPECIMEN
            </span>
            <span className="text-[10px]">
              {settings.fontSize}px / {settings.letterSpacing}px Tracking
            </span>
          </div>

          {/* Interactive Textarea Workspace */}
          <div className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <textarea
              rows={4}
              value={settings.customText}
              onChange={(e) => onChange((prev) => ({ ...prev, customText: e.target.value }))}
              placeholder="Type specimen text here..."
              style={previewStyle}
              className="w-full bg-transparent outline-none resize-none border-none leading-none p-0 overflow-hidden font-specimen focus:ring-0"
            />
          </div>

          {!isLoaded && (
            <div className="py-12 text-center text-xs font-mono text-[#a1a1aa] animate-pulse">
              Initializing typeface binary in workspace...
            </div>
          )}

          {/* Editorial Specimen Sections */}
          <div className="border-t border-current/10 pt-10 space-y-10">
            {/* DISPLAY */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-50 block">
                DISPLAY SPECIMEN
              </span>
              <p
                style={{
                  ...previewStyle,
                  fontSize: 'clamp(28px, 4vw, 56px)',
                  lineHeight: 1.1,
                }}
                className="font-specimen break-words"
              >
                Create Something Beautiful
              </p>
            </div>

            {/* TEXT PARAGRAPH */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-50 block">
                EDITORIAL PARAGRAPH
              </span>
              <p
                style={{
                  ...previewStyle,
                  fontSize: 'clamp(15px, 2vw, 20px)',
                  lineHeight: 1.6,
                }}
                className="font-specimen max-w-3xl break-words"
              >
                Typography changes how words feel, how information is read, and how a visual identity is remembered. Beautiful font design blends artistic expression with precision engineering.
              </p>
            </div>

            {/* CHARACTERS */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-50 block">
                ALPHABET
              </span>
              <div
                style={{
                  ...previewStyle,
                  fontSize: 'clamp(18px, 2.5vw, 28px)',
                  lineHeight: 1.4,
                }}
                className="font-specimen space-y-1 break-all"
              >
                <p>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                <p>abcdefghijklmnopqrstuvwxyz</p>
              </div>
            </div>

            {/* NUMBERS & PUNCTUATION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-50 block">
                  NUMERALS
                </span>
                <p
                  style={{
                    ...previewStyle,
                    fontSize: 'clamp(20px, 3vw, 32px)',
                    lineHeight: 1.2,
                  }}
                  className="font-specimen break-all"
                >
                  0123456789
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-50 block">
                  PUNCTUATION & SYMBOLS
                </span>
                <p
                  style={{
                    ...previewStyle,
                    fontSize: 'clamp(20px, 3vw, 32px)',
                    lineHeight: 1.2,
                  }}
                  className="font-specimen break-all"
                >
                  .,!?;:&apos;&quot;-()[]{}&amp;@#$%+*/=_&lt;&gt;%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
