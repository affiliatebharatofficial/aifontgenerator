'use client';

import React, { useState } from 'react';
import { X, Tag, Plus } from 'lucide-react';
import type { FontGeneration } from '@/types/database';
import { addTagToFontAction, removeTagFromFontAction } from '@/lib/library/actions';

interface ManageTagsModalProps {
  generation: FontGeneration | null;
  initialTags: string[];
  onClose: () => void;
}

export function ManageTagsModal({
  generation,
  initialTags,
  onClose,
}: ManageTagsModalProps) {
  const [tags, setTags] = useState(initialTags);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!generation) return null;

  async function handleAddTag() {
    if (!newTagInput.trim() || !generation) return;
    const cleanTag = newTagInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanTag || tags.includes(cleanTag)) return;

    setIsAdding(true);
    const res = await addTagToFontAction(generation.id, cleanTag);
    setIsAdding(false);

    if (res.success) {
      setTags((prev) => [...prev, cleanTag]);
      setNewTagInput('');
    }
  }

  async function handleRemoveTag(t: string) {
    if (!generation) return;
    setTags((prev) => prev.filter((item) => item !== t));
    await removeTagFromFontAction(generation.id, t);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="border border-[#27272a] bg-[#121215] rounded-xl max-w-md w-full p-6 space-y-6 text-xs font-mono text-[#a1a1aa] shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#e05638]" />
            <h3 className="font-bold text-[#f4f4f5] uppercase tracking-wider text-xs">
              MANAGE FONT TAGS
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#27272a] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[#71717a] text-[11px]">
          Add custom tags to <strong className="text-[#f4f4f5]">{generation.font_name || 'AI Font'}</strong> for fast filtering (e.g. logo, branding, web).
        </p>

        {/* Existing Tags List */}
        <div className="flex flex-wrap gap-2 py-2">
          {tags.length === 0 ? (
            <span className="text-[11px] text-[#71717a]">No tags added yet.</span>
          ) : (
            tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#e05638]/10 border border-[#e05638]/30 text-[#e05638] font-bold text-[11px]"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-rose-400 p-0.5 cursor-pointer"
                  title="Remove tag"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Add Tag Input */}
        <div className="space-y-2 border-t border-[#27272a] pt-4">
          <label className="block uppercase text-[10px] font-bold text-[#71717a]">
            Add Tag
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="e.g. branding, experimental..."
              className="flex-1 bg-[#09090b] border border-[#27272a] rounded px-3 py-1.5 text-[#f4f4f5] text-xs font-mono outline-none focus:border-[#e05638]"
            />
            <button
              type="button"
              disabled={isAdding || !newTagInput.trim()}
              onClick={handleAddTag}
              className="px-4 py-1.5 rounded bg-[#e05638] hover:bg-[#c8462a] text-white font-bold text-xs uppercase transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Footer Close */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border border-[#27272a] bg-[#09090b] text-[#f4f4f5] font-bold text-xs uppercase cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
