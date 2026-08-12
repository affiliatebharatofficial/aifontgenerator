'use client';

import React, { useState } from 'react';
import { Code, Copy, Check, Info } from 'lucide-react';

interface CssGeneratorCardProps {
  fontName: string;
  fontFamilyName: string;
}

export function CssGeneratorCard({
  fontName,
  fontFamilyName,
}: CssGeneratorCardProps) {
  const [copied, setCopied] = useState(false);

  const cleanFontName = (fontName || 'AIFont').replace(/"/g, '');
  const cssCode = `@font-face {
  font-family: '${cleanFontName}';
  src: url('./fonts/${cleanFontName}.woff2') format('woff2'),
       url('./fonts/${cleanFontName}.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

/* Typography Usage */
.custom-typography {
  font-family: '${cleanFontName}', sans-serif;
}`;

  function handleCopyCss() {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border border-[#27272a] bg-[#121215] rounded-lg p-6 sm:p-8 space-y-6 text-xs font-mono text-[#a1a1aa]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-[#e05638]" />
          <h3 className="font-bold text-[#f4f4f5] uppercase tracking-wider text-xs">
            USE THIS FONT ON YOUR WEBSITE (@FONT-FACE)
          </h3>
        </div>

        <button
          type="button"
          onClick={handleCopyCss}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#e05638]/50 bg-[#e05638]/10 text-[#e05638] hover:bg-[#e05638] hover:text-white transition-all cursor-pointer font-bold"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy CSS'}</span>
        </button>
      </div>

      {/* Code Display */}
      <div className="relative rounded-lg border border-[#27272a] bg-[#09090b] p-4 overflow-x-auto">
        <pre className="text-emerald-400 font-mono text-xs leading-relaxed">{cssCode}</pre>
      </div>

      {/* Info notice about private URLs vs production deployment */}
      <div className="flex items-start gap-2.5 p-3 rounded-md border border-[#27272a] bg-[#09090b] text-[11px] text-[#a1a1aa]">
        <Info className="w-4 h-4 text-[#e05638] shrink-0 mt-0.5" />
        <p>
          <strong className="text-[#f4f4f5]">Deployment Note:</strong> Secure font preview streams use authenticated session tokens. For production deployment on your website, download the compiled WOFF2/TTF binary below and update the <code className="text-[#e05638] font-bold">src: url(...)</code> path to your hosted asset location.
        </p>
      </div>
    </div>
  );
}
