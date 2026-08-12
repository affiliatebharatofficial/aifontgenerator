'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Search,
  Download,
  Trash2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { getFontDownloadUrlAction, deleteFontGenerationAction } from '@/lib/font/download/actions';
import type { FontGeneration, GeneratedFile } from '@/types/database';

interface MyFontsListProps {
  initialGenerations: FontGeneration[];
  filesMap: Record<string, GeneratedFile[]>;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  search: string;
  statusFilter: string;
  sortBy: string;
}

export default function MyFontsList({
  initialGenerations,
  totalCount,
  currentPage,
  pageSize,
  search: initialSearch,
  statusFilter: initialStatus,
  sortBy: initialSort,
}: MyFontsListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-refresh polling for in-flight pending/processing jobs
  const hasInFlight = initialGenerations.some(
    (g) => g.status === 'pending' || g.status === 'processing'
  );

  useEffect(() => {
    if (!hasInFlight) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 4000);

    return () => clearInterval(interval);
  }, [hasInFlight, router]);

  function updateParams(newParams: Record<string, string | number | null>) {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '' || val === 'all' || val === 'newest') {
        current.delete(key);
      } else {
        current.set(key, String(val));
      }
    });

    const searchStr = current.toString();
    const query = searchStr ? `?${searchStr}` : '';
    router.push(`${pathname}${query}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ search: searchInput, page: 1 });
  }

  async function handleQuickDownload(generationId: string) {
    setErrorMsg(null);
    setDownloadingId(generationId);

    try {
      const res = await getFontDownloadUrlAction(generationId, 'ttf');

      if (res.success && res.url) {
        const link = document.createElement('a');
        link.href = res.url;
        link.download = res.filename || 'font.ttf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setErrorMsg(res.error || 'Failed to download TTF binary.');
      }
    } catch {
      setErrorMsg('An error occurred while fetching download link.');
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTargetId) return;
    setErrorMsg(null);
    setIsDeleting(true);

    try {
      const res = await deleteFontGenerationAction(deleteTargetId);
      if (res && !res.success) {
        setErrorMsg(res.error || 'Failed to delete font generation.');
      } else {
        setDeleteTargetId(null);
        router.refresh();
      }
    } catch {
      setErrorMsg('An error occurred during font deletion.');
    } finally {
      setIsDeleting(false);
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-8">
      {errorMsg && (
        <div className="flex items-start gap-2.5 p-4 rounded-md bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Control Bar: Search & Status Filter Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-[#27272a]">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          {['all', 'completed', 'processing', 'failed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => updateParams({ status: st, page: 1 })}
              className={`px-3 py-1.5 rounded-md font-bold uppercase transition-all cursor-pointer ${
                initialStatus === st || (initialStatus === '' && st === 'all')
                  ? 'bg-[#e05638] text-white'
                  : 'bg-[#121215] border border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search typeface name or prompt..."
              className="w-full pl-9 pr-3 py-1.5 text-xs font-mono bg-[#121215] border border-[#27272a] rounded-md text-[#f4f4f5] focus:outline-none focus:border-[#e05638]"
            />
          </form>

          <select
            value={initialSort}
            onChange={(e) => updateParams({ sort: e.target.value, page: 1 })}
            className="w-full sm:w-auto px-3 py-1.5 text-xs font-mono bg-[#121215] border border-[#27272a] rounded-md text-[#f4f4f5] focus:outline-none focus:border-[#e05638]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
          </select>
        </div>
      </div>

      {/* Specimen Grid */}
      {initialGenerations.length === 0 ? (
        <div className="border border-[#27272a] bg-[#121215] rounded-md p-16 text-center space-y-4">
          <h3 className="font-display font-normal text-3xl text-[#f4f4f5]">No Typefaces Found</h3>
          <p className="text-xs text-[#71717a] max-w-md mx-auto">
            No font generations match your search query or filter status.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialGenerations.map((g) => {
            const fontName = g.font_name || 'AIFont';
            const fontFamilyName = `Font_${g.id.replace(/[^a-zA-Z0-9]/g, '')}`;
            const fontUrl = `/api/fonts/preview/${g.id}`;

            return (
              <div
                key={g.id}
                className="border border-[#27272a] bg-[#121215] rounded-md p-6 flex flex-col justify-between space-y-6 hover:border-[#3f3f46] transition-all"
              >
                {/* Specimen Header & Real WOFF2 Font Injector */}
                <div className="space-y-4">
                  {g.status === 'completed' && (
                    <style>{`
                      @font-face {
                        font-family: "${fontFamilyName}";
                        src: url("${fontUrl}") format("woff2");
                        font-display: swap;
                      }
                    `}</style>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-display font-normal text-2xl text-[#f4f4f5] truncate">
                      {fontName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        g.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : g.status === 'failed'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {g.status}
                    </span>
                  </div>

                  {/* Dynamic Specimen Text */}
                  {g.status === 'completed' ? (
                    <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-md space-y-1">
                      <div
                        style={{ fontFamily: fontFamilyName }}
                        className="text-4xl text-[#f4f4f5] truncate font-specimen"
                      >
                        Aa Bb Cc 0123
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-md text-xs font-mono text-[#71717a]">
                      {g.status === 'failed' ? (
                        <p className="text-rose-400 truncate">{g.error_message || 'Engine failure'}</p>
                      ) : (
                        <p className="text-amber-400 animate-pulse">Processing vector outlines...</p>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-[#71717a] font-mono line-clamp-2">{g.prompt}</p>

                  <div className="text-[10px] font-mono text-[#a1a1aa] flex items-center justify-between border-t border-[#27272a] pt-3">
                    <span>{g.category} • {g.weight}</span>
                    <span>{new Date(g.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#27272a]">
                  {g.status === 'completed' ? (
                    <>
                      <Link
                        href={`/font/${g.id}`}
                        className="flex-1 py-2 bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] text-[#f4f4f5] text-xs font-mono font-bold uppercase rounded-md text-center transition-colors"
                      >
                        Inspect →
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleQuickDownload(g.id)}
                        disabled={downloadingId === g.id}
                        className="p-2 bg-[#e05638] hover:bg-[#c84326] text-white rounded-md transition-colors cursor-pointer"
                        title="Download TTF"
                      >
                        {downloadingId === g.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>
                    </>
                  ) : (
                    <Link
                      href={`/generate/status/${g.id}`}
                      className="flex-1 py-2 bg-[#18181b] border border-[#27272a] text-[#a1a1aa] text-xs font-mono font-bold uppercase rounded-md text-center"
                    >
                      Status →
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteTargetId(g.id);
                      setDeleteTargetName(fontName);
                    }}
                    className="p-2 text-[#71717a] hover:text-rose-400 hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
                    title="Delete Font"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-[#27272a] text-xs font-mono text-[#a1a1aa]">
          <span>
            Page {currentPage} of {totalPages} ({totalCount} typefaces)
          </span>

          <div className="flex items-center gap-2">
            {currentPage > 1 && (
              <button
                type="button"
                onClick={() => updateParams({ page: currentPage - 1 })}
                className="px-3 py-1.5 rounded-md bg-[#121215] border border-[#27272a] text-[#f4f4f5] hover:bg-[#18181b]"
              >
                Previous
              </button>
            )}
            {currentPage < totalPages && (
              <button
                type="button"
                onClick={() => updateParams({ page: currentPage + 1 })}
                className="px-3 py-1.5 rounded-md bg-[#121215] border border-[#27272a] text-[#f4f4f5] hover:bg-[#18181b]"
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="border border-[#27272a] bg-[#121215] rounded-md max-w-md w-full p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#f4f4f5] font-display">Delete Typeface</h3>
              <p className="text-xs text-[#71717a] font-mono">
                Are you sure you want to delete &ldquo;{deleteTargetName}&rdquo;? This will permanently erase the font binaries and database records.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-[#18181b] border border-[#27272a] text-[#a1a1aa] rounded-md"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-md font-bold uppercase flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
