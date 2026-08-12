'use client';

import { useState, useEffect } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sliders,
  Copy,
  Check,
} from 'lucide-react';

export function FontPreviewStage({ generationId }: { generationId: string }) {
  const fontFamilyName = `GeneratedFont_${generationId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const fontUrl = `/api/fonts/preview/${generationId}`;

  const defaultSpecimen = 'The quick brown fox jumps over the lazy dog.';
  const [customText, setCustomText] = useState(defaultSpecimen);
  const [fontSize, setFontSize] = useState(56);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.1);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');

  const [fontLoaded, setFontLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fontFace = new FontFace(fontFamilyName, `url("${fontUrl}") format("woff2")`);

    fontFace
      .load()
      .then((loadedFace) => {
        if (isMounted) {
          document.fonts.add(loadedFace);
          setFontLoaded(true);
        }
      })
      .catch((err) => {
        console.error('Failed to load font in browser:', err);
      });

    return () => {
      isMounted = false;
      document.fonts.delete(fontFace);
    };
  }, [fontFamilyName, fontUrl]);

  function handleCopyText() {
    if (!customText) return;
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <style>{`
        @font-face {
          font-family: "${fontFamilyName}";
          src: url("${fontUrl}") format("woff2");
          font-display: swap;
        }
      `}</style>

      {/* Control Bar */}
      <div className="border border-[#27272a] bg-[#121215] rounded-md p-6 space-y-4 font-mono text-xs text-[#a1a1aa]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27272a] pb-3">
          <span className="font-bold uppercase tracking-wider text-[#f4f4f5] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#e05638]" />
            <span>Interactive Display Preview Controls</span>
          </span>
          <span className="text-[10px] text-[#71717a] uppercase font-bold">
            Display-Only • {fontLoaded ? 'WOFF2 ACTIVE' : 'LOADING BINARY...'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Size */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="uppercase text-[11px]">Size</label>
              <span className="font-bold text-[#f4f4f5]">{fontSize}px</span>
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

          {/* Tracking */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="uppercase text-[11px]">Tracking</label>
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
              <label className="uppercase text-[11px]">Leading</label>
              <span className="font-bold text-[#f4f4f5]">{lineHeight}</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.0"
              step="0.05"
              value={lineHeight}
              onChange={(e) => setLineHeight(Number(e.target.value))}
              className="w-full accent-[#e05638] cursor-pointer"
            />
          </div>

          {/* Alignment */}
          <div className="space-y-1.5">
            <label className="block uppercase text-[11px]">Alignment</label>
            <div className="flex items-center gap-1 bg-[#09090b] border border-[#27272a] rounded-md p-1">
              <button
                type="button"
                onClick={() => setTextAlign('left')}
                className={`p-1.5 rounded text-xs flex-1 flex justify-center cursor-pointer ${
                  textAlign === 'left' ? 'bg-[#18181b] text-[#f4f4f5] font-bold' : 'text-[#71717a]'
                }`}
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setTextAlign('center')}
                className={`p-1.5 rounded text-xs flex-1 flex justify-center cursor-pointer ${
                  textAlign === 'center' ? 'bg-[#18181b] text-[#f4f4f5] font-bold' : 'text-[#71717a]'
                }`}
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setTextAlign('right')}
                className={`p-1.5 rounded text-xs flex-1 flex justify-center cursor-pointer ${
                  textAlign === 'right' ? 'bg-[#18181b] text-[#f4f4f5] font-bold' : 'text-[#71717a]'
                }`}
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Specimen Presets Bar */}
        <div className="pt-3 border-t border-[#27272a]/60 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-[#71717a] font-bold uppercase text-[10px] mr-1">Presets:</span>
          <button
            type="button"
            onClick={() => setCustomText('The quick brown fox jumps over the lazy dog.')}
            className="px-2.5 py-1 bg-[#09090b] hover:bg-[#18181b] border border-[#27272a] rounded text-[#a1a1aa] hover:text-[#f4f4f5] cursor-pointer"
          >
            Pangram
          </button>
          <button
            type="button"
            onClick={() => setCustomText('Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz')}
            className="px-2.5 py-1 bg-[#09090b] hover:bg-[#18181b] border border-[#27272a] rounded text-[#a1a1aa] hover:text-[#f4f4f5] cursor-pointer"
          >
            Alphabet
          </button>
          <button
            type="button"
            onClick={() => setCustomText('0123456789 (!@#$%^&*)')}
            className="px-2.5 py-1 bg-[#09090b] hover:bg-[#18181b] border border-[#27272a] rounded text-[#a1a1aa] hover:text-[#f4f4f5] cursor-pointer"
          >
            Numerals &amp; Symbols
          </button>
          <button
            type="button"
            onClick={() => setCustomText('TYPOGRAPHY SHOWCASE')}
            className="px-2.5 py-1 bg-[#09090b] hover:bg-[#18181b] border border-[#27272a] rounded text-[#a1a1aa] hover:text-[#f4f4f5] cursor-pointer"
          >
            Showcase Header
          </button>
        </div>
      </div>

      {/* Real Specimen Display Workspace */}
      <div className="border border-[#27272a] bg-[#121215] rounded-md p-8 sm:p-12 space-y-8 type-grid-pattern">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3 text-xs font-mono text-[#71717a]">
          <span>SPECIMEN WORKSPACE (Custom Preview Text — Does Not Recompile Font)</span>
          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-1 hover:text-[#f4f4f5] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>
        </div>

        <textarea
          rows={3}
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          style={{
            fontFamily: fontFamilyName,
            fontSize: `${fontSize}px`,
            letterSpacing: `${letterSpacing}px`,
            lineHeight,
            textAlign,
          }}
          className="w-full bg-transparent text-[#f4f4f5] outline-none resize-none border-none leading-none p-0 overflow-hidden font-specimen focus:ring-0"
        />
      </div>
    </div>
  );
}

