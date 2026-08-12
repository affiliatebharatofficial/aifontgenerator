'use client';

import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';

export function TemplateDownloadButton() {
  function handleDownloadTemplate() {
    // Generate clean printable SVG sample sheet template
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600" width="1200" height="1600" style="background:#ffffff; font-family: sans-serif;">
      <rect width="1200" height="1600" fill="#ffffff"/>
      <text x="600" y="80" text-anchor="middle" font-size="28" font-weight="bold" fill="#09090b">HANDWRITING SAMPLE SHEET TEMPLATE</text>
      <text x="600" y="115" text-anchor="middle" font-size="14" fill="#71717a">Write inside each box clearly using dark ink on light background</text>
      
      <!-- Grid Rows -->
      ${['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
        .map((char, i) => {
          const col = i % 6;
          const row = Math.floor(i / 6);
          const x = 80 + col * 175;
          const y = 160 + row * 150;
          return `<g>
            <rect x="${x}" y="${y}" width="155" height="125" fill="none" stroke="#e4e4e7" stroke-width="1.5" rx="4"/>
            <line x1="${x+10}" y1="${y+85}" x2="${x+145}" y2="${y+85}" stroke="#f4f4f5" stroke-width="1" stroke-dasharray="3,3"/>
            <text x="${x+12}" y="${y+25}" font-size="14" font-weight="bold" fill="#a1a1aa">${char}</text>
          </g>`;
        }).join('')}

      <!-- Lowercase Row Header -->
      <text x="80" y="850" font-size="18" font-weight="bold" fill="#09090b">LOWERCASE &amp; NUMERALS</text>
      ${['a','b','c','d','e','f','0','1','2','3','4','5','6','7','8','9','.',',','!','?']
        .map((char, i) => {
          const col = i % 6;
          const row = Math.floor(i / 6);
          const x = 80 + col * 175;
          const y = 880 + row * 150;
          return `<g>
            <rect x="${x}" y="${y}" width="155" height="125" fill="none" stroke="#e4e4e7" stroke-width="1.5" rx="4"/>
            <line x1="${x+10}" y1="${y+85}" x2="${x+145}" y2="${y+85}" stroke="#f4f4f5" stroke-width="1" stroke-dasharray="3,3"/>
            <text x="${x+12}" y="${y+25}" font-size="14" font-weight="bold" fill="#a1a1aa">${char}</text>
          </g>`;
        }).join('')}

      <text x="600" y="1550" text-anchor="middle" font-size="12" fill="#a1a1aa">AI Font Generator • Printable Handwriting Sample Sheet</text>
    </svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'handwriting-sample-template.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleDownloadTemplate}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[#27272a] bg-[#09090b] text-[#f4f4f5] hover:border-[#e05638] hover:text-white transition-all text-xs font-mono font-bold uppercase cursor-pointer shadow-sm"
    >
      <FileSpreadsheet className="w-4 h-4 text-[#e05638]" />
      <Download className="w-3.5 h-3.5" />
      <span>Download Sample Sheet Template</span>
    </button>
  );
}
