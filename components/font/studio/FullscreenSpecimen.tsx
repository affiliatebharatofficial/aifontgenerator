'use client';

import React, { useEffect } from 'react';
import { Minimize2, X, Sliders } from 'lucide-react';
import type { StudioPreviewSettings } from './types';

interface FullscreenSpecimenProps {
  isOpen: boolean;
  fontName: string;
  fontFamilyName: string;
  settings: StudioPreviewSettings;
  onChange: (updater: (prev: StudioPreviewSettings) => StudioPreviewSettings) => void;
  onClose: () => void;
}

export function FullscreenSpecimen({
  isOpen,
  fontName,
  fontFamilyName,
  settings,
  onChange,
  onClose,
}: FullscreenSpecimenProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const previewStyle: React.CSSProperties = {
    fontFamily: `"${fontFamilyName}", sans-serif`,
    fontSize: `${settings.fontSize}px`,
    letterSpacing: `${settings.letterSpacing}px`,
    lineHeight: settings.lineHeight,
    textAlign: settings.textAlign,
    textTransform: settings.textTransform,
    color: settings.textColor,
  };

  let bgStyle: React.CSSProperties = { backgroundColor: '#09090b' };
  if (settings.bgMode === 'light') bgStyle = { backgroundColor: '#f4f4f5' };
  if (settings.bgMode === 'custom') bgStyle = { backgroundColor: settings.customBgColor };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={bgStyle}
      className="fixed inset-0 z-50 flex flex-col animate-fade-in text-xs font-mono"
    >
      {/* Fullscreen Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-current/15 bg-black/40 backdrop-blur-md text-[#f4f4f5]">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-[#e05638] uppercase tracking-widest border border-[#e05638]/40 bg-[#e05638]/10 px-2 py-0.5 rounded">
            FULLSCREEN SPECIMEN
          </span>
          <h2 className="font-bold text-sm uppercase tracking-tight">{fontName}</h2>
        </div>

        {/* Quick Sliders */}
        <div className="hidden md:flex items-center gap-6 text-[11px] text-[#a1a1aa]">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-[#e05638]" />
            <span>Size: {settings.fontSize}px</span>
            <input
              type="range"
              min="12"
              max="200"
              value={settings.fontSize}
              onChange={(e) => onChange((prev) => ({ ...prev, fontSize: Number(e.target.value) }))}
              className="w-24 accent-[#e05638] cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <span>Tracking: {settings.letterSpacing}px</span>
            <input
              type="range"
              min="-5"
              max="20"
              value={settings.letterSpacing}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, letterSpacing: Number(e.target.value) }))
              }
              className="w-20 accent-[#e05638] cursor-pointer"
            />
          </div>
        </div>

        {/* Close Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Exit Fullscreen"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#27272a] bg-[#09090b] text-[#f4f4f5] hover:border-[#e05638] transition-colors cursor-pointer"
          >
            <Minimize2 className="w-4 h-4 text-[#e05638]" />
            <span>Exit Fullscreen (Esc)</span>
          </button>
        </div>
      </div>

      {/* Main Fullscreen Canvas Area */}
      <div className="flex-1 p-8 sm:p-16 overflow-y-auto flex flex-col justify-center max-w-7xl mx-auto w-full">
        <textarea
          rows={6}
          value={settings.customText}
          onChange={(e) => onChange((prev) => ({ ...prev, customText: e.target.value }))}
          style={previewStyle}
          className="w-full bg-transparent outline-none resize-none border-none leading-none p-0 font-specimen focus:ring-0"
        />
      </div>
    </div>
  );
}
