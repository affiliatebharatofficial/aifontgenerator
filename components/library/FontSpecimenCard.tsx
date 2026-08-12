'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  Sliders,
  Download,
  FolderPlus,
  Tag,
  Trash2,
  ExternalLink,
  Check,
  FileCode2,
} from 'lucide-react';
import type { FontGeneration, GeneratedFile } from '@/types/database';
import { toggleFavoriteAction, deleteFontFromLibraryAction } from '@/lib/library/actions';

interface FontSpecimenCardProps {
  generation: FontGeneration;
  files: GeneratedFile[];
  isFavorited: boolean;
  tags: string[];
  viewMode: 'grid' | 'list';
  isImported?: boolean;
  onOpenCollectionModal: (gen: FontGeneration) => void;
  onOpenTagModal: (gen: FontGeneration) => void;
}

export function FontSpecimenCard({
  generation,
  files,
  isFavorited: initialFavorited,
  tags,
  viewMode,
  isImported = false,
  onOpenCollectionModal,
  onOpenTagModal,
}: FontSpecimenCardProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favLoading, setFavLoading] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const fontFamilyName = isImported
    ? `ImportedFont_${generation.id.replace(/[^a-zA-Z0-9]/g, '')}`
    : `GeneratedFont_${generation.id.replace(/[^a-zA-Z0-9]/g, '')}`;

  const fontUrl = isImported
    ? `/api/fonts/imported-preview/${generation.id}`
    : `/api/fonts/preview/${generation.id}`;
  const fontName = generation.font_name || 'AI Font Specimen';

  async function handleToggleFavorite() {
    if (favLoading) return;
    setFavLoading(true);
    // Optimistic toggle
    setFavorited((prev) => !prev);

    const res = await toggleFavoriteAction(generation.id);
    if (!res.success) {
      // Revert if error
      setFavorited(initialFavorited);
    } else if (res.isFavorited !== undefined) {
      setFavorited(res.isFavorited);
    }
    setFavLoading(false);
  }

  async function handleDeleteFont() {
    if (!confirm(`Are you sure you want to delete "${fontName}" from your library?`)) return;
    setIsDeleting(true);
    const res = await deleteFontFromLibraryAction(generation.id);
    if (res.success) {
      setDeleted(true);
    } else {
      setIsDeleting(false);
      alert(res.error || 'Failed to delete font.');
    }
  }

  if (deleted) return null;

  return (
    <div
      className={`group border border-[#27272a] bg-[#121215] rounded-xl overflow-hidden transition-all hover:border-[#3f3f46] shadow-xl ${
        viewMode === 'list' ? 'flex flex-col md:flex-row items-stretch' : 'flex flex-col justify-between'
      }`}
    >
      {/* Dynamic @font-face style declaration */}
      <style>{`
        @font-face {
          font-family: "${fontFamilyName}";
          src: url("${fontUrl}") format("woff2");
          font-display: swap;
        }
      `}</style>

      {/* Main Specimen Preview Stage */}
      <div
        className={`p-6 bg-[#09090b] border-b border-[#27272a] relative type-grid-pattern ${
          viewMode === 'list' ? 'md:w-2/5 md:border-b-0 md:border-r' : 'h-52'
        } flex flex-col justify-between`}
      >
        {/* Card Header Bar */}
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#e05638]">
              {isImported ? 'SOURCE: IMPORTED' : generation.category}
            </span>
            {!isImported && (
              <span className="text-[9px] font-bold uppercase bg-[#e05638]/10 text-[#e05638] border border-[#e05638]/30 px-1.5 py-0.2 rounded">
                V{generation.version_number || 1}
              </span>
            )}
          </div>

          {/* Favorite Toggle Button */}
          <button
            type="button"
            disabled={favLoading}
            onClick={handleToggleFavorite}
            className={`p-1.5 rounded-full border transition-all cursor-pointer ${
              favorited
                ? 'bg-rose-950/80 border-rose-800 text-rose-400'
                : 'bg-[#121215] border-[#27272a] text-[#71717a] hover:text-[#f4f4f5]'
            }`}
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-rose-400' : ''}`} />
          </button>
        </div>

        {/* Large Specimen Rendering */}
        <div className="my-auto py-2">
          <p
            style={{ fontFamily: `"${fontFamilyName}", sans-serif` }}
            className="text-4xl sm:text-5xl text-[#f4f4f5] tracking-tight font-specimen truncate select-none"
          >
            Aa Bb 123
          </p>
        </div>

        {/* Specimen Alphabet Sub-Line */}
        <div className="overflow-hidden opacity-60">
          <p
            style={{ fontFamily: `"${fontFamilyName}", sans-serif` }}
            className="text-xs text-[#a1a1aa] font-specimen truncate select-none"
          >
            ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
          </p>
        </div>
      </div>

      {/* Font Metadata & Actions Section */}
      <div
        className={`p-6 space-y-4 font-mono text-xs text-[#a1a1aa] flex-1 flex flex-col justify-between`}
      >
        <div className="space-y-3">
          {/* Title & Date */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-base text-[#f4f4f5] uppercase tracking-tight">
                {fontName}
              </h3>
              <span className="text-[10px] text-[#71717a]">
                {isImported ? 'Imported' : 'Created'} {new Date(generation.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Formats badges */}
            <span className="text-[10px] font-bold text-[#e05638] uppercase border border-[#e05638]/30 bg-[#e05638]/10 px-2 py-0.5 rounded shrink-0">
              {isImported ? generation.category?.toUpperCase() || 'FONT' : files.map((f) => f.format.toUpperCase()).join(' · ')}
            </span>
          </div>

          {/* Attributes */}
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="bg-[#09090b] border border-[#27272a] rounded px-2 py-0.5 text-[#f4f4f5]">
              {generation.weight}
            </span>
            <span className="bg-[#09090b] border border-[#27272a] rounded px-2 py-0.5 text-[#f4f4f5]">
              {generation.width}
            </span>
            <span className="bg-[#09090b] border border-[#27272a] rounded px-2 py-0.5 text-[#f4f4f5]">
              {generation.style}
            </span>
          </div>

          {/* Tags list */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {tags.map((t) => (
              <span
                key={t}
                className="text-[10px] text-[#e05638] bg-[#e05638]/10 border border-[#e05638]/20 px-1.5 py-0.5 rounded"
              >
                #{t}
              </span>
            ))}
            <button
              type="button"
              onClick={() => onOpenTagModal(generation)}
              className="text-[10px] text-[#71717a] hover:text-[#f4f4f5] border border-dashed border-[#27272a] rounded px-1.5 py-0.5 cursor-pointer flex items-center gap-1"
            >
              <Tag className="w-2.5 h-2.5" />
              <span>+ Tag</span>
            </button>
          </div>
        </div>

        {/* Quick Action Toolbar */}
        <div className="space-y-3 pt-3 border-t border-[#27272a]">
          {showDownloads ? (
            /* Format download options */
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#f4f4f5]">
                <span>SELECT FORMAT TO DOWNLOAD</span>
                <button
                  type="button"
                  onClick={() => setShowDownloads(false)}
                  className="text-[#71717a] hover:text-[#f4f4f5] cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {isImported ? (
                  <a
                    href={`/api/fonts/imported-download/${generation.id}`}
                    download
                    className="p-1.5 rounded border border-[#27272a] bg-[#09090b] text-center font-bold text-[#e05638] hover:bg-[#e05638] hover:text-white transition-colors cursor-pointer block text-[10px] col-span-3"
                  >
                    DOWNLOAD ORIGINAL BINARY
                  </a>
                ) : (
                  files.map((file) => (
                    <a
                      key={file.id}
                      href={`/api/fonts/download/${generation.id}?fileId=${file.id}`}
                      download
                      className="p-1.5 rounded border border-[#27272a] bg-[#09090b] text-center font-bold text-[#e05638] hover:bg-[#e05638] hover:text-white transition-colors cursor-pointer block text-[10px]"
                    >
                      {file.format.toUpperCase()}
                    </a>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Primary Actions */
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={isImported ? `/import-font/${generation.id}/test` : `/font/${generation.id}/test`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded border border-[#e05638]/50 bg-[#e05638]/10 text-[#e05638] hover:bg-[#e05638] hover:text-white transition-all font-bold text-xs cursor-pointer uppercase"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Test Studio</span>
              </Link>

              <Link
                href={isImported ? `/import-font/${generation.id}` : `/font/${generation.id}`}
                className="p-2 rounded border border-[#27272a] bg-[#09090b] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
                title="Open Font Details"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setShowDownloads(true)}
                className="p-2 rounded border border-[#27272a] bg-[#09090b] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
                title="Download Font Files"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onOpenCollectionModal(generation)}
                className="p-2 rounded border border-[#27272a] bg-[#09090b] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
                title="Add to Collection"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteFont}
                className="p-2 rounded border border-rose-900/50 bg-rose-950/20 text-rose-400 hover:bg-rose-900/60 transition-colors cursor-pointer"
                title="Delete Font"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
