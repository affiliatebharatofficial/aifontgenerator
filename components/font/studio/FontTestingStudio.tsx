'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';
import * as opentype from 'opentype.js';
import type { FontGeneration, GeneratedFile } from '@/types/database';
import type {
  ExtractedFontMeta,
  ExtractedGlyph,
  StudioPreviewSettings,
} from './types';
import dynamic from 'next/dynamic';
import { StudioControls } from './StudioControls';
import { SpecimenCanvas } from './SpecimenCanvas';
import { FontInfoSidebar } from './FontInfoSidebar';
import { GlyphDetailModal } from './GlyphDetailModal';
import { FullscreenSpecimen } from './FullscreenSpecimen';
import { FontDownloadCard } from '../FontDownloadCard';

const GlyphExplorer = dynamic(() => import('./GlyphExplorer').then((mod) => mod.GlyphExplorer), {
  loading: () => <div className="p-8 text-center text-xs font-mono text-[#71717a]">Loading Glyph Explorer...</div>,
  ssr: false,
});

const CssGeneratorCard = dynamic(() => import('./CssGeneratorCard').then((mod) => mod.CssGeneratorCard), {
  loading: () => <div className="p-6 text-center text-xs font-mono text-[#71717a]">Loading CSS Generator...</div>,
  ssr: false,
});

interface FontTestingStudioProps {
  generation: FontGeneration;
  files: GeneratedFile[];
}

const DEFAULT_SETTINGS: StudioPreviewSettings = {
  customText: 'The quick brown fox jumps over the lazy dog.',
  fontSize: 48,
  letterSpacing: 0,
  lineHeight: 1.2,
  textAlign: 'left',
  textTransform: 'none',
  textColor: '#f4f4f5',
  bgMode: 'dark',
  customBgColor: '#121215',
  previewWidth: 'wide',
};

export function FontTestingStudio({ generation, files }: FontTestingStudioProps) {
  const fontFamilyName = `GeneratedFont_${generation.id.replace(/[^a-zA-Z0-9]/g, '')}`;
  const fontUrl = `/api/fonts/preview/${generation.id}`;
  const ttfUrl = `/api/fonts/preview/${generation.id}?format=ttf`;

  const [fontStatus, setFontStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const [fontMeta, setFontMeta] = useState<ExtractedFontMeta | null>(null);

  const [settings, setSettings] = useState<StudioPreviewSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`font_studio_settings_${generation.id}`);
        if (saved) {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        }
      } catch {
        // Ignore localStorage errors
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [isSavedToast, setIsSavedToast] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedGlyph, setSelectedGlyph] = useState<ExtractedGlyph | null>(null);
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);

  // 1. Browser Font Face Loading with automatic WOFF2 -> TTF fallback & ArrayBuffer direct registration
  useEffect(() => {
    let isMounted = true;
    let registeredFace: FontFace | null = null;

    async function loadFont() {
      try {
        // Try WOFF2 fetch first
        let response = await fetch(fontUrl);
        if (!response.ok) {
          // Fallback to TTF fetch
          response = await fetch(ttfUrl);
        }

        if (!response.ok) {
          throw new Error(`Font fetch failed with status: ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        if (!isMounted) return;

        const face = new FontFace(fontFamilyName, buffer);
        const loadedFace = await face.load();

        if (isMounted) {
          document.fonts.add(loadedFace);
          registeredFace = loadedFace;
          setFontStatus('loaded');
        }
      } catch (err) {
        console.error('Failed to load font into browser:', err);
        if (isMounted) {
          setFontStatus('failed');
        }
      }
    }

    loadFont();

    return () => {
      isMounted = false;
      if (registeredFace) {
        try {
          document.fonts.delete(registeredFace);
        } catch {
          // Ignore delete errors on unmount
        }
      }
    };
  }, [fontFamilyName, fontUrl, ttfUrl]);

  // 2. Client-side TTF Binary Parsing via opentype.js
  useEffect(() => {
    let isMounted = true;

    fetch(ttfUrl)
      .then((res) => {
        if (!res.ok) throw new Error('TTF binary fetch failed');
        return res.arrayBuffer();
      })
      .then((buffer) => {
        const parsedFont = opentype.parse(buffer);
        if (isMounted && parsedFont) {
          const meta = parseFontMetadata(parsedFont);
          setFontMeta(meta);
        }
      })
      .catch((err) => {
        console.warn('Failed to parse TTF binary metadata with opentype.js:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [ttfUrl]);

  // Handle saving preview settings to localStorage
  function handleSaveSettings() {
    try {
      localStorage.setItem(
        `font_studio_settings_${generation.id}`,
        JSON.stringify(settings)
      );
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 2500);
    } catch {
      // Ignore localStorage write error
    }
  }

  function handleResetSettings() {
    setSettings(DEFAULT_SETTINGS);
  }

  const fontName = fontMeta?.familyName || generation.font_name || 'AI Font Specimen';

  return (
    <div className="space-y-10">
      {/* Dynamic @font-face style declaration */}
      <style>{`
        @font-face {
          font-family: "${fontFamilyName}";
          src: url("${fontUrl}") format("woff2");
          font-display: swap;
        }
      `}</style>

      {/* Top Header Navigation & Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#27272a]">
        <div className="space-y-2">
          <Link
            href={`/font/${generation.id}`}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Font Details</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl sm:text-5xl text-[#f4f4f5] tracking-tight uppercase">
              {fontName}
            </h1>
            <span className="text-xs font-mono text-[#71717a] font-bold">STUDIO</span>
          </div>
        </div>

        {/* Load Status Indicator */}
        <div className="flex items-center gap-3">
          {fontStatus === 'loading' && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-bold uppercase bg-amber-950/80 border border-amber-800 text-amber-300">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>LOADING BINARY...</span>
            </span>
          )}

          {fontStatus === 'loaded' && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-bold uppercase bg-emerald-950/80 border border-emerald-800 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>WOFF2 ACTIVE</span>
            </span>
          )}

          {fontStatus === 'failed' && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-bold uppercase bg-rose-950/80 border border-rose-800 text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>LOAD ERROR</span>
            </span>
          )}
        </div>
      </div>

      {/* Font Load Error Banner */}
      {fontStatus === 'failed' && (
        <div className="p-6 rounded-lg border border-rose-800/80 bg-rose-950/40 text-rose-300 space-y-2 font-mono text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>Unable to load this generated font.</span>
          </div>
          <p className="text-rose-300/80">
            The browser could not load the compiled WOFF2 binary file from storage. Please return to the font overview page or attempt to download the font file directly.
          </p>
        </div>
      )}

      {/* Main Testing Studio Viewport */}
      {fontStatus !== 'failed' && (
        <>
          {/* Mobile Collapsible Controls Toggle */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMobileControlsOpen((prev) => !prev)}
              className="w-full flex items-center justify-between p-4 border border-[#27272a] bg-[#121215] rounded-lg text-xs font-mono text-[#f4f4f5] font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#e05638]" />
                <span>Typography Controls</span>
              </div>
              {mobileControlsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {mobileControlsOpen && (
              <div className="mt-2">
                <StudioControls
                  settings={settings}
                  onChange={setSettings}
                  onReset={handleResetSettings}
                  onSave={handleSaveSettings}
                  isSavedToast={isSavedToast}
                />
              </div>
            )}
          </div>

          {/* Desktop Studio Grid (3 Columns: Left Controls, Center Specimen, Right Metadata) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Controls Panel */}
            <div className="hidden lg:block lg:col-span-3 space-y-6 sticky top-6">
              <StudioControls
                settings={settings}
                onChange={setSettings}
                onReset={handleResetSettings}
                onSave={handleSaveSettings}
                isSavedToast={isSavedToast}
              />
            </div>

            {/* Center Canvas Specimen Stage */}
            <div className="lg:col-span-6 space-y-8">
              <SpecimenCanvas
                fontFamilyName={fontFamilyName}
                settings={settings}
                onChange={setSettings}
                onOpenFullscreen={() => setIsFullscreen(true)}
                isLoaded={fontStatus === 'loaded'}
              />
            </div>

            {/* Right Information Sidebar */}
            <div className="lg:col-span-3 space-y-6 sticky top-6">
              <FontInfoSidebar
                generation={generation}
                files={files}
                fontMeta={fontMeta}
              />
            </div>
          </div>

          {/* Bottom Section: Glyph Explorer */}
          <section className="space-y-4 pt-8">
            <GlyphExplorer
              glyphs={fontMeta?.glyphs || []}
              fontFamilyName={fontFamilyName}
              onSelectGlyph={setSelectedGlyph}
            />
          </section>

          {/* CSS Generator */}
          <section className="space-y-4">
            <CssGeneratorCard
              fontName={fontName}
              fontFamilyName={fontFamilyName}
            />
          </section>

          {/* Production Downloads */}
          <section className="space-y-4 pt-4 border-t border-[#27272a]">
            <div className="pb-3 flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-bold flex items-center gap-2">
                <Download className="w-4 h-4 text-[#e05638]" />
                <span>PRODUCTION FORMAT DOWNLOADS</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {files.map((file) => (
                <FontDownloadCard key={file.id} file={file} fontName={fontName} />
              ))}
            </div>
          </section>

          {/* Fullscreen Overlay */}
          <FullscreenSpecimen
            isOpen={isFullscreen}
            fontName={fontName}
            fontFamilyName={fontFamilyName}
            settings={settings}
            onChange={setSettings}
            onClose={() => setIsFullscreen(false)}
          />

          {/* Glyph Inspector Modal */}
          <GlyphDetailModal
            glyph={selectedGlyph}
            fontFamilyName={fontFamilyName}
            onClose={() => setSelectedGlyph(null)}
          />
        </>
      )}
    </div>
  );
}

/**
 * Extracts real font metadata and supported glyph array from opentype.Font
 */
function parseFontMetadata(font: opentype.Font): ExtractedFontMeta {
  const familyName =
    font.names.fontFamily?.en ||
    font.names.fontFamily?.['en-US'] ||
    (font.names.fontFamily ? Object.values(font.names.fontFamily)[0] : 'AI Font Specimen');
  const subfamily =
    font.names.fontSubfamily?.en ||
    (font.names.fontSubfamily ? Object.values(font.names.fontSubfamily)[0] : 'Regular');
  const fullName =
    font.names.fullName?.en ||
    (font.names.fullName ? Object.values(font.names.fullName)[0] : familyName);
  const postScriptName =
    font.names.postScriptName?.en ||
    (font.names.postScriptName ? Object.values(font.names.postScriptName)[0] : familyName.replace(/\s+/g, ''));
  const version =
    font.names.version?.en ||
    (font.names.version ? Object.values(font.names.version)[0] : '1.000');

  const extractedGlyphs: ExtractedGlyph[] = [];
  const seenUnicodes = new Set<number>();

  for (let i = 0; i < font.glyphs.length; i++) {
    const g = font.glyphs.get(i);
    if (!g) continue;

    const unicodes =
      g.unicodes && g.unicodes.length > 0
        ? g.unicodes
        : g.unicode !== undefined && g.unicode !== null
        ? [g.unicode]
        : [];

    for (const u of unicodes) {
      if (u === undefined || u === null || u === 0 || seenUnicodes.has(u)) continue;
      seenUnicodes.add(u);

      const char = String.fromCodePoint(u);
      const hex = `U+${u.toString(16).toUpperCase().padStart(4, '0')}`;

      let category: ExtractedGlyph['category'] = 'Other';
      if (/[A-Z]/.test(char)) category = 'Uppercase';
      else if (/[a-z]/.test(char)) category = 'Lowercase';
      else if (/[0-9]/.test(char)) category = 'Numbers';
      else if (/[.,!?;:'"\-()[\]{}&@#$%+*/=_<>%\\]/.test(char)) category = 'Punctuation';
      else if (/\p{P}|\p{S}/u.test(char)) category = 'Symbols';

      extractedGlyphs.push({
        char,
        unicode: u,
        unicodeHex: hex,
        name: g.name || char,
        advanceWidth: typeof g.advanceWidth === 'number' ? g.advanceWidth : null,
        xMin: typeof g.xMin === 'number' ? g.xMin : null,
        yMin: typeof g.yMin === 'number' ? g.yMin : null,
        xMax: typeof g.xMax === 'number' ? g.xMax : null,
        yMax: typeof g.yMax === 'number' ? g.yMax : null,
        category,
      });
    }
  }

  // Sort glyphs logically: Uppercase -> Lowercase -> Numbers -> Punctuation -> Symbols -> Other
  const categoryOrder: Record<string, number> = {
    Uppercase: 1,
    Lowercase: 2,
    Numbers: 3,
    Punctuation: 4,
    Symbols: 5,
    Other: 6,
  };

  extractedGlyphs.sort((a, b) => {
    const catDiff = (categoryOrder[a.category] || 99) - (categoryOrder[b.category] || 99);
    if (catDiff !== 0) return catDiff;
    return a.unicode - b.unicode;
  });

  return {
    familyName,
    subfamily,
    fullName,
    postScriptName,
    version,
    unitsPerEm: font.unitsPerEm || null,
    ascender: font.ascender || null,
    descender: font.descender || null,
    numGlyphs: font.numGlyphs || font.glyphs.length,
    totalSupportedChars: extractedGlyphs.length,
    glyphs: extractedGlyphs,
  };
}
