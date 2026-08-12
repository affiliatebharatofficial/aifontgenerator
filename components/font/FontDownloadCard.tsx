'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { getFontDownloadUrlAction } from '@/lib/font/download/actions';
import type { GeneratedFile, FontFileFormat } from '@/types/database';

export function FontDownloadCard({
  file,
  fontName,
}: {
  file: GeneratedFile;
  fontName: string;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatLabels: Record<FontFileFormat, { title: string; subtitle: string }> = {
    ttf: { title: 'TTF Format', subtitle: 'Desktop installation & OS vector rendering' },
    otf: { title: 'OTF Format', subtitle: 'Professional typography & print workflows' },
    woff2: { title: 'WOFF2 Format', subtitle: 'Web-ready compressed font binary' },
  };

  const meta = formatLabels[file.format as FontFileFormat] || {
    title: `${file.format.toUpperCase()} Format`,
    subtitle: 'Binary font file',
  };

  async function handleDownload() {
    setError(null);
    setIsDownloading(true);

    try {
      const res = await getFontDownloadUrlAction(file.generation_id, file.format as FontFileFormat);

      if (res.success && res.url) {
        const link = document.createElement('a');
        link.href = res.url;
        link.download = res.filename || `${fontName}.${file.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setError(res.error || 'Failed to generate download link.');
      }
    } catch {
      setError('An error occurred during file download.');
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="border border-[#27272a] bg-[#121215] rounded-md p-6 flex flex-col justify-between space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-3xl font-extrabold uppercase text-[#f4f4f5]">
            .{file.format}
          </span>
          <span className="font-mono text-xs text-[#71717a]">
            {(file.file_size / 1024).toFixed(1)} KB
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-bold uppercase text-[#f4f4f5] tracking-wide">
            {meta.title}
          </h3>
          <p className="text-xs text-[#71717a] leading-relaxed">{meta.subtitle}</p>
        </div>
      </div>

      {error && (
        <p className="text-[11px] font-mono text-rose-400 border border-rose-900 bg-rose-950/60 p-2 rounded-md">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full py-3 bg-[#e05638] hover:bg-[#c84326] text-white text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating Signed Link...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Download .{file.format.toUpperCase()}</span>
          </>
        )}
      </button>
    </div>
  );
}
