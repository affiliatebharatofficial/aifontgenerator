'use client';

import { useState } from 'react';
import { Type, Sliders } from 'lucide-react';

export function SpecimenPreview() {
  const [text, setText] = useState('Typography AI');
  const [fontSize, setFontSize] = useState(48);
  const [fontWeight, setFontWeight] = useState(600);
  const [letterSpacing, setLetterSpacing] = useState(-1);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Interactive Vector Specimen Playground
          </span>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Size</span>
            <input
              type="range"
              min="24"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-20 accent-indigo-500 bg-slate-800"
            />
            <span className="w-6 font-mono text-slate-300">{fontSize}px</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Weight</span>
            <input
              type="range"
              min="300"
              max="900"
              step="100"
              value={fontWeight}
              onChange={(e) => setFontWeight(Number(e.target.value))}
              className="w-20 accent-indigo-500 bg-slate-800"
            />
            <span className="w-6 font-mono text-slate-300">{fontWeight}</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Kerning</span>
            <input
              type="range"
              min="-4"
              max="10"
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(Number(e.target.value))}
              className="w-20 accent-indigo-500 bg-slate-800"
            />
            <span className="w-6 font-mono text-slate-300">{letterSpacing}px</span>
          </div>
        </div>
      </div>

      {/* Input specimen prompt */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Specimen Text</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type sample text to preview..."
          className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60"
        />
      </div>

      {/* Preview Stage */}
      <div className="min-h-[160px] flex items-center justify-center p-8 bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden">
        <p
          className="text-center text-slate-100 transition-all font-sans break-all"
          style={{
            fontSize: `${fontSize}px`,
            fontWeight: fontWeight,
            letterSpacing: `${letterSpacing}px`,
          }}
        >
          {text || 'Sample Glyph Preview'}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Real-time kerning & glyph rasterizer simulation
        </span>
        <span className="font-mono">OTF / TTF / WOFF2 Compatible</span>
      </div>
    </div>
  );
}
