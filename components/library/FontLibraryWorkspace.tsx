'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  LayoutGrid,
  List,
  Search,
  Plus,
  SlidersHorizontal,
  Heart,
  FolderPlus,
  Sparkles,
  X,
  RotateCcw,
} from 'lucide-react';
import type { FontGeneration, GeneratedFile, ImportedFont } from '@/types/database';
import type { CollectionWithCount } from '@/lib/library/service';
import { FontSpecimenCard } from './FontSpecimenCard';
import { AddToCollectionModal } from './AddToCollectionModal';
import { ManageTagsModal } from './ManageTagsModal';
import { UploadCloud } from 'lucide-react';

interface FontLibraryWorkspaceProps {
  initialGenerations: FontGeneration[];
  filesMap: Record<string, GeneratedFile[]>;
  favoriteIds: string[];
  tagsMap: Record<string, string[]>;
  allTags: string[];
  collections: CollectionWithCount[];
  importedFonts?: ImportedFont[];
}

export function FontLibraryWorkspace({
  initialGenerations,
  filesMap,
  favoriteIds,
  tagsMap,
  allTags,
  collections,
  importedFonts = [],
}: FontLibraryWorkspaceProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('font_library_view_mode');
        if (saved === 'grid' || saved === 'list') {
          return saved;
        }
      } catch {
        // Ignore localStorage read error
      }
    }
    return 'grid';
  });

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'generated' | 'imported'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [styleFilter, setStyleFilter] = useState('all');
  const [weightFilter, setWeightFilter] = useState('all');
  const [widthFilter, setWidthFilter] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name_asc' | 'name_desc'>('newest');

  // Modals state
  const [selectedGenForCollection, setSelectedGenForCollection] = useState<FontGeneration | null>(null);
  const [selectedGenForTag, setSelectedGenForTag] = useState<FontGeneration | null>(null);

  function handleSetViewMode(mode: 'grid' | 'list') {
    setViewMode(mode);
    try {
      localStorage.setItem('font_library_view_mode', mode);
    } catch {
      // Ignore write error
    }
  }

  // Filter & Sort Logic
  const combinedCards = useMemo(() => {
    const genCards = (sourceFilter === 'imported' ? [] : initialGenerations).map((g) => ({
      gen: g,
      isImported: false,
    }));

    const importedCards = (sourceFilter === 'generated' ? [] : importedFonts).map((imp) => {
      const g: FontGeneration = {
        id: imp.id,
        user_id: imp.user_id,
        font_name: imp.family_name || imp.original_filename.replace(/\.[^/.]+$/, ''),
        prompt: imp.original_filename,
        category: imp.format.toUpperCase() as unknown as import('@/types/database').FontCategory,
        weight: 'Regular',
        width: 'Normal',
        style: 'Modern',
        character_set: {} as unknown as import('@/types/database').CharacterSetConfig,
        advanced_settings: {} as unknown as import('@/types/database').AdvancedSettingsConfig,
        status: 'completed',
        error_message: null,
        created_at: imp.created_at,
        updated_at: imp.updated_at,
        completed_at: imp.created_at,
      };
      return {
        gen: g,
        isImported: true,
      };
    });

    const allCards = [...genCards, ...importedCards];

    return allCards.filter(({ gen, isImported }) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const nameMatch = (gen.font_name || '').toLowerCase().includes(q);
        const catMatch = (gen.category || '').toLowerCase().includes(q);
        const styleMatch = (gen.style || '').toLowerCase().includes(q);
        const promptMatch = (gen.prompt || '').toLowerCase().includes(q);
        const gTags = tagsMap[gen.id] || [];
        const tagMatch = gTags.some((t) => t.toLowerCase().includes(q));
        if (!nameMatch && !catMatch && !styleMatch && !promptMatch && !tagMatch) return false;
      }

      // Favorites filter
      if (favoritesOnly && !favoriteIds.includes(gen.id)) return false;

      // Category filter
      if (!isImported && categoryFilter !== 'all' && gen.category !== categoryFilter) return false;

      // Style filter
      if (!isImported && styleFilter !== 'all' && gen.style !== styleFilter) return false;

      // Weight filter
      if (!isImported && weightFilter !== 'all' && gen.weight !== weightFilter) return false;

      // Width filter
      if (!isImported && widthFilter !== 'all' && gen.width !== widthFilter) return false;

      // Tag filter
      if (selectedTag !== 'all') {
        const gTags = tagsMap[gen.id] || [];
        if (!gTags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.gen.created_at).getTime() - new Date(b.gen.created_at).getTime();
      if (sortBy === 'name_asc') return (a.gen.font_name || '').localeCompare(b.gen.font_name || '');
      if (sortBy === 'name_desc') return (b.gen.font_name || '').localeCompare(a.gen.font_name || '');
      return new Date(b.gen.created_at).getTime() - new Date(a.gen.created_at).getTime();
    });
  }, [
    initialGenerations,
    importedFonts,
    sourceFilter,
    searchQuery,
    favoritesOnly,
    favoriteIds,
    categoryFilter,
    styleFilter,
    weightFilter,
    widthFilter,
    selectedTag,
    tagsMap,
    sortBy,
  ]);

  function handleResetFilters() {
    setSearchQuery('');
    setCategoryFilter('all');
    setStyleFilter('all');
    setWeightFilter('all');
    setWidthFilter('all');
    setFavoritesOnly(false);
    setSelectedCollectionId('all');
    setSelectedTag('all');
    setSortBy('newest');
  }

  const hasActiveFilters =
    searchQuery ||
    categoryFilter !== 'all' ||
    styleFilter !== 'all' ||
    weightFilter !== 'all' ||
    widthFilter !== 'all' ||
    favoritesOnly ||
    selectedCollectionId !== 'all' ||
    selectedTag !== 'all' ||
    sortBy !== 'newest';

  return (
    <div className="space-y-10 font-mono text-xs text-[#a1a1aa]">
      {/* Library Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#27272a]">
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-[#e05638] uppercase tracking-widest block">
            TYPEFACE WORKSPACE
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-5xl text-[#f4f4f5] tracking-tight uppercase">
            YOUR TYPE LIBRARY
          </h1>
          <p className="text-xs text-[#71717a]">
            All the typefaces you&apos;ve created, organized in one place.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/import-font"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#27272a] bg-[#121215] text-[#f4f4f5] hover:border-[#e05638] transition-colors font-bold text-xs uppercase cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-[#e05638]" />
            <span>Import Font</span>
          </Link>

          <Link
            href="/dashboard/library/collections"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#27272a] bg-[#121215] text-[#f4f4f5] hover:border-[#e05638] transition-colors font-bold text-xs uppercase cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-[#e05638]" />
            <span>Collections ({collections.length})</span>
          </Link>

          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#e05638] hover:bg-[#c8462a] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Font</span>
          </Link>
        </div>
      </div>

      {/* Toolbar: Search, Filters & View Mode Switcher */}
      <div className="border border-[#27272a] bg-[#121215] rounded-xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by font name, category, style, or tag..."
              className="w-full bg-[#09090b] border border-[#27272a] rounded-md pl-9 pr-4 py-2 text-xs text-[#f4f4f5] placeholder-[#71717a] font-mono outline-none focus:border-[#e05638]"
            />
          </div>

          {/* View Mode & Favorites Toggle */}
          <div className="flex items-center gap-3">
            {/* Favorites Filter Button */}
            <button
              type="button"
              onClick={() => setFavoritesOnly((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs font-bold transition-all cursor-pointer ${
                favoritesOnly
                  ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                  : 'bg-[#09090b] border-[#27272a] text-[#71717a] hover:text-[#f4f4f5]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span>Favorites ({favoriteIds.length})</span>
            </button>

            {/* Grid / List Switcher */}
            <div className="flex items-center gap-1 bg-[#09090b] border border-[#27272a] rounded-md p-1">
              <button
                type="button"
                onClick={() => handleSetViewMode('grid')}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  viewMode === 'grid' ? 'bg-[#18181b] text-[#e05638]' : 'text-[#71717a]'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode('list')}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  viewMode === 'list' ? 'bg-[#18181b] text-[#e05638]' : 'text-[#71717a]'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 pt-2 border-t border-[#27272a]">
          {/* Source Filter */}
          <div>
            <label htmlFor="librarySourceFilter" className="block text-[9px] uppercase font-bold text-[#71717a] mb-1">
              Source
            </label>
            <select
              id="librarySourceFilter"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as 'all' | 'generated' | 'imported')}
              className="w-full bg-[#09090b] border border-[#27272a] rounded px-2 py-1.5 text-[#f4f4f5] text-[11px] outline-none focus:border-[#e05638]"
            >
              <option value="all">All Sources</option>
              <option value="generated">AI Generated</option>
              <option value="imported">Imported ({importedFonts.length})</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="libraryCategoryFilter" className="block text-[9px] uppercase font-bold text-[#71717a] mb-1">
              Category
            </label>
            <select
              id="libraryCategoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded px-2 py-1.5 text-[#f4f4f5] text-[11px] outline-none focus:border-[#e05638]"
            >
              <option value="all">All Categories</option>
              {['Sans Serif', 'Serif', 'Display', 'Handwritten', 'Script', 'Monospace', 'Decorative', 'Pixel', 'Blackletter'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Style Filter */}
          <div>
            <label htmlFor="libraryStyleFilter" className="block text-[9px] uppercase font-bold text-[#71717a] mb-1">
              Style
            </label>
            <select
              id="libraryStyleFilter"
              value={styleFilter}
              onChange={(e) => setStyleFilter(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded px-2 py-1.5 text-[#f4f4f5] text-[11px] outline-none focus:border-[#e05638]"
            >
              <option value="all">All Styles</option>
              {['Modern', 'Minimal', 'Elegant', 'Futuristic', 'Playful', 'Professional', 'Retro', 'Vintage', 'Geometric', 'Organic'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Weight Filter */}
          <div>
            <label htmlFor="libraryWeightFilter" className="block text-[9px] uppercase font-bold text-[#71717a] mb-1">
              Weight
            </label>
            <select
              id="libraryWeightFilter"
              value={weightFilter}
              onChange={(e) => setWeightFilter(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded px-2 py-1.5 text-[#f4f4f5] text-[11px] outline-none focus:border-[#e05638]"
            >
              <option value="all">All Weights</option>
              {['Thin', 'Light', 'Regular', 'Medium', 'Bold', 'Black'].map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Width Filter */}
          <div>
            <label htmlFor="libraryWidthFilter" className="block text-[9px] uppercase font-bold text-[#71717a] mb-1">
              Width
            </label>
            <select
              id="libraryWidthFilter"
              value={widthFilter}
              onChange={(e) => setWidthFilter(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded px-2 py-1.5 text-[#f4f4f5] text-[11px] outline-none focus:border-[#e05638]"
            >
              <option value="all">All Widths</option>
              {['Condensed', 'Normal', 'Expanded'].map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Filter */}
          <div>
            <label htmlFor="libraryTagFilter" className="block text-[9px] uppercase font-bold text-[#71717a] mb-1">
              Tag
            </label>
            <select
              id="libraryTagFilter"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded px-2 py-1.5 text-[#f4f4f5] text-[11px] outline-none focus:border-[#e05638]"
            >
              <option value="all">All Tags ({allTags.length})</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  #{t}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="librarySortByFilter" className="block text-[9px] uppercase font-bold text-[#71717a] mb-1">
              Sort By
            </label>
            <select
              id="librarySortByFilter"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'newest' | 'oldest' | 'name_asc' | 'name_desc')
              }
              className="w-full bg-[#09090b] border border-[#27272a] rounded px-2 py-1.5 text-[#f4f4f5] text-[11px] outline-none focus:border-[#e05638]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Reset Filters Option */}
        {hasActiveFilters && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-[#e05638] hover:underline flex items-center gap-1 font-bold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Specimen Grid / List View */}
      {combinedCards.length === 0 ? (
        /* Empty State */
        <div className="border border-dashed border-[#27272a] bg-[#121215]/50 rounded-2xl p-14 text-center space-y-6 max-w-2xl mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-[#09090b] border border-[#27272a] flex items-center justify-center mx-auto text-[#e05638]">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-mono font-bold text-[#f4f4f5] uppercase tracking-wide">
              {hasActiveFilters ? 'NO MATCHING TYPEFACES FOUND' : 'YOUR LIBRARY IS EMPTY'}
            </h3>
            <p className="text-xs font-mono text-[#71717a]">
              {hasActiveFilters
                ? 'No completed or imported fonts match your current search query or active filter settings.'
                : 'Create your first typeface or import an existing font to get started.'}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-lg border border-[#27272a] bg-[#09090b] text-[#f4f4f5] font-bold text-xs uppercase hover:border-[#e05638] transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            ) : (
              <>
                <Link
                  href="/import-font"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#27272a] bg-[#121215] text-[#f4f4f5] font-bold text-xs uppercase hover:border-[#e05638] transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-[#e05638]" />
                  <span>Import Font</span>
                </Link>

                <Link
                  href="/generate"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#e05638] hover:bg-[#c8462a] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create a Font</span>
                </Link>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Active Cards */
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {combinedCards.map(({ gen: g, isImported }) => (
            <FontSpecimenCard
              key={g.id}
              generation={g}
              files={filesMap[g.id] || []}
              isFavorited={favoriteIds.includes(g.id)}
              tags={tagsMap[g.id] || []}
              viewMode={viewMode}
              isImported={isImported}
              onOpenCollectionModal={setSelectedGenForCollection}
              onOpenTagModal={setSelectedGenForTag}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddToCollectionModal
        generation={selectedGenForCollection}
        collections={collections}
        onClose={() => setSelectedGenForCollection(null)}
      />

      <ManageTagsModal
        generation={selectedGenForTag}
        initialTags={selectedGenForTag ? tagsMap[selectedGenForTag.id] || [] : []}
        onClose={() => setSelectedGenForTag(null)}
      />
    </div>
  );
}
