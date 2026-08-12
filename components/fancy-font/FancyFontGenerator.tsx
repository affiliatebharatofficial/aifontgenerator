'use client';

import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import {
  Copy,
  Check,
  Search,
  Star,
  RotateCcw,
  Sparkles,
  Share2,
  AlertCircle,
} from 'lucide-react';
import { MAX_FANCY_TEXT_LENGTH, DEFAULT_FANCY_TEXT, QUICK_PRESETS } from '@/lib/fancy-fonts/constants';
import { FANCY_STYLES } from '@/lib/fancy-fonts/styles';
import { FancyCategory } from '@/lib/fancy-fonts/types';

interface FancyFontGeneratorProps {
  initialText?: string;
  initialFilter?: string;
}

export function FancyFontGenerator({
  initialText = DEFAULT_FANCY_TEXT,
  initialFilter = '',
}: FancyFontGeneratorProps) {
  const [inputText, setInputText] = useState(initialText);
  const [searchQuery, setSearchQuery] = useState(initialFilter);
  const [activeCategory, setActiveCategory] = useState<'all' | FancyCategory | 'favorites'>('all');
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('fancy_font_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [clipboardError, setClipboardError] = useState<string | null>(null);

  // Save favorites to localStorage
  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('fancy_font_favorites', JSON.stringify(next));
      } catch {
        // Ignore localStorage write errors
      }
      return next;
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_FANCY_TEXT_LENGTH) {
      setInputText(value);
      setClipboardError(null);
    }
  };

  const clearInput = () => {
    setInputText('');
    setClipboardError(null);
  };

  const setPreset = (preset: string) => {
    setInputText(preset);
    setClipboardError(null);
  };

  // Filtered styles based on category, search query, and favorites
  const filteredStyles = useMemo(() => {
    return FANCY_STYLES.filter((style) => {
      // Category filter
      if (activeCategory === 'favorites') {
        if (!favorites.includes(style.id)) return false;
      } else if (activeCategory !== 'all') {
        if (style.category !== activeCategory) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = style.name.toLowerCase().includes(q);
        const matchDesc = style.description.toLowerCase().includes(q);
        const matchTag = style.tags.some((tag) => tag.toLowerCase().includes(q));
        return matchName || matchDesc || matchTag;
      }

      return true;
    });
  }, [activeCategory, searchQuery, favorites]);

  // Copy single style result
  const handleCopyStyle = async (styleId: string, transformedText: string) => {
    if (!transformedText) return;
    try {
      await navigator.clipboard.writeText(transformedText);
      setCopiedId(styleId);
      setClipboardError(null);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setClipboardError('Failed to access clipboard. Please copy manually.');
    }
  };

  // Copy all visible styles formatted
  const handleCopyAll = async () => {
    if (!inputText || filteredStyles.length === 0) return;
    const formatted = filteredStyles
      .map((style) => `${style.name}: ${style.transform(inputText)}`)
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedAll(true);
      setClipboardError(null);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      setClipboardError('Failed to access clipboard for Copy All.');
    }
  };

  // Share page link
  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    const title = 'Fancy Font Generator';
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        setShareFeedback('Shared!');
        setTimeout(() => setShareFeedback(null), 2000);
      } catch {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareFeedback('URL copied!');
        setTimeout(() => setShareFeedback(null), 2000);
      } catch {
        setShareFeedback('Unable to copy URL');
        setTimeout(() => setShareFeedback(null), 2000);
      }
    }
  };

  const isMaxLength = inputText.length >= MAX_FANCY_TEXT_LENGTH;

  return (
    <div className="w-full space-y-8">
      {/* Live Input Container */}
      <div className="border border-[#27272a] bg-[#121215] rounded-xl p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-[#27272a]/60">
          <label htmlFor="fancy-text-input" className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] font-semibold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#e05638]" />
            <span>Enter Your Text</span>
          </label>

          <div className="flex items-center gap-3">
            {/* Character Count */}
            <span
              className={`text-xs font-mono font-medium ${
                isMaxLength ? 'text-amber-400 font-bold' : 'text-[#71717a]'
              }`}
            >
              {inputText.length} / {MAX_FANCY_TEXT_LENGTH}
            </span>

            {/* Clear Input Button */}
            {inputText && (
              <button
                type="button"
                onClick={clearInput}
                className="text-xs font-mono text-[#a1a1aa] hover:text-[#f4f4f5] flex items-center gap-1 transition-colors px-2 py-1 rounded bg-[#18181b] border border-[#27272a]"
                title="Clear input text"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Textarea Input */}
        <textarea
          id="fancy-text-input"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type something here..."
          rows={3}
          className="w-full bg-[#18181b] border border-[#27272a] focus:border-[#e05638] focus:ring-1 focus:ring-[#e05638] rounded-lg p-4 text-base sm:text-xl font-sans text-[#f4f4f5] placeholder-[#52525b] resize-y transition-all outline-none"
          aria-label="Type text to generate fancy Unicode fonts"
        />

        {/* Warning if length reached */}
        {isMaxLength && (
          <p className="text-xs text-amber-400 font-mono flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Maximum input length of {MAX_FANCY_TEXT_LENGTH} characters reached.
          </p>
        )}

        {/* Quick Presets */}
        <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider">
            Quick Examples:
          </span>
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setPreset(preset)}
              className="px-2.5 py-1 rounded-full bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#121215] border border-[#27272a] p-4 rounded-xl">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search styles (e.g., gothic, bold, bubble)..."
            className="w-full pl-9 pr-4 py-2 bg-[#18181b] border border-[#27272a] focus:border-[#e05638] focus:ring-1 focus:ring-[#e05638] rounded-md text-xs text-[#f4f4f5] placeholder-[#71717a] outline-none transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase font-semibold transition-colors shrink-0 ${
              activeCategory === 'all'
                ? 'bg-[#e05638] text-white'
                : 'bg-[#18181b] text-[#a1a1aa] hover:text-[#f4f4f5] border border-[#27272a]'
            }`}
          >
            All ({FANCY_STYLES.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('popular')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase font-semibold transition-colors shrink-0 ${
              activeCategory === 'popular'
                ? 'bg-[#e05638] text-white'
                : 'bg-[#18181b] text-[#a1a1aa] hover:text-[#f4f4f5] border border-[#27272a]'
            }`}
          >
            Popular
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('social')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase font-semibold transition-colors shrink-0 ${
              activeCategory === 'social'
                ? 'bg-[#e05638] text-white'
                : 'bg-[#18181b] text-[#a1a1aa] hover:text-[#f4f4f5] border border-[#27272a]'
            }`}
          >
            Social
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('decorative')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase font-semibold transition-colors shrink-0 ${
              activeCategory === 'decorative'
                ? 'bg-[#e05638] text-white'
                : 'bg-[#18181b] text-[#a1a1aa] hover:text-[#f4f4f5] border border-[#27272a]'
            }`}
          >
            Decorative
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('favorites')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase font-semibold transition-colors shrink-0 flex items-center gap-1 ${
              activeCategory === 'favorites'
                ? 'bg-[#e05638] text-white'
                : 'bg-[#18181b] text-[#a1a1aa] hover:text-[#f4f4f5] border border-[#27272a]'
            }`}
          >
            <Star className={`w-3 h-3 ${favorites.length > 0 ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Favs ({favorites.length})</span>
          </button>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyAll}
            disabled={!inputText || filteredStyles.length === 0}
            className="px-3 py-2 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-[#27272a] hover:bg-[#3f3f46] text-[#f4f4f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? 'Copied All!' : 'Copy All'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-md text-xs bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
            title="Share page URL"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Share / Clipboard Notification */}
      {shareFeedback && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-md text-xs font-mono text-center">
          {shareFeedback}
        </div>
      )}

      {clipboardError && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-md text-xs font-mono text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{clipboardError}</span>
        </div>
      )}

      {/* Screen Reader Announcement */}
      <div className="sr-only" aria-live="polite">
        {copiedId && 'Style text copied to clipboard successfully.'}
        {copiedAll && 'All fancy text styles copied to clipboard.'}
      </div>

      {/* Generated Styles Grid */}
      {filteredStyles.length === 0 ? (
        <div className="border border-dashed border-[#27272a] p-12 text-center rounded-xl space-y-3">
          <p className="text-sm font-mono text-[#a1a1aa]">No fancy font styles found matching your filter.</p>
          {activeCategory === 'favorites' ? (
            <p className="text-xs text-[#71717a]">
              Star styles to save them to your favorites for quick access!
            </p>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="text-xs font-mono text-[#e05638] underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredStyles.map((style) => {
            const transformed = inputText ? style.transform(inputText) : style.transform('Preview');
            const isCopied = copiedId === style.id;
            const isFav = favorites.includes(style.id);

            return (
              <div
                key={style.id}
                className="border border-[#27272a] bg-[#121215] hover:border-[#3f3f46] p-4 sm:p-5 rounded-xl space-y-3 transition-all flex flex-col justify-between group"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#f4f4f5] uppercase tracking-wide">
                      {style.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-[#a1a1aa] uppercase">
                      {style.category}
                    </span>
                  </div>

                  {/* Star Favorite Button */}
                  <button
                    type="button"
                    onClick={() => toggleFavorite(style.id)}
                    className="p-1 text-[#71717a] hover:text-amber-400 transition-colors"
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star
                      className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`}
                    />
                  </button>
                </div>

                {/* Transformed Output Box */}
                <div className="bg-[#18181b] border border-[#27272a] group-hover:border-[#3f3f46] p-4 rounded-lg min-h-[64px] flex items-center justify-between gap-4 overflow-x-auto transition-colors">
                  <span className="text-lg sm:text-xl font-normal text-[#f4f4f5] break-all select-all font-sans">
                    {transformed || <span className="text-[#52525b] italic">Empty input</span>}
                  </span>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopyStyle(style.id, transformed)}
                    disabled={!inputText}
                    className={`px-3.5 py-2 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 shadow-sm ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#e05638] hover:bg-[#c84326] text-white disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                    title="Copy unicode text"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
