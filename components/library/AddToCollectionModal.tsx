'use client';

import React, { useState } from 'react';
import { X, FolderPlus, Plus, Check } from 'lucide-react';
import type { FontGeneration } from '@/types/database';
import type { CollectionWithCount } from '@/lib/library/service';
import { addFontToCollectionAction, createCollectionAction } from '@/lib/library/actions';

interface AddToCollectionModalProps {
  generation: FontGeneration | null;
  collections: CollectionWithCount[];
  onClose: () => void;
}

export function AddToCollectionModal({
  generation,
  collections: initialCollections,
  onClose,
}: AddToCollectionModalProps) {
  const [collections, setCollections] = useState(initialCollections);
  const [newCollName, setNewCollName] = useState('');
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [isCreating, setIsCreating] = useState(false);

  if (!generation) return null;

  async function handleAddToCollection(collectionId: string) {
    if (!generation) return;
    setAddedMap((prev) => ({ ...prev, [collectionId]: true }));
    await addFontToCollectionAction(collectionId, generation.id);
  }

  async function handleCreateCollection() {
    if (!generation || !newCollName.trim()) return;
    setIsCreating(true);
    const res = await createCollectionAction(newCollName.trim());
    setIsCreating(false);

    if (res.success && res.collectionId) {
      const newColl: CollectionWithCount = {
        id: res.collectionId,
        user_id: generation.user_id,
        name: newCollName.trim(),
        description: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        item_count: 0,
      };
      setCollections((prev) => [newColl, ...prev]);
      setNewCollName('');
      handleAddToCollection(res.collectionId);
    }
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
            <FolderPlus className="w-4 h-4 text-[#e05638]" />
            <h3 className="font-bold text-[#f4f4f5] uppercase tracking-wider text-xs">
              ADD TO COLLECTION
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
          Organize <strong className="text-[#f4f4f5]">{generation.font_name || 'AI Font'}</strong> into a personal collection.
        </p>

        {/* Existing Collections List */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {collections.length === 0 ? (
            <p className="text-[11px] text-[#71717a] py-2">No collections created yet.</p>
          ) : (
            collections.map((c) => {
              const isAdded = addedMap[c.id];
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-[#27272a] bg-[#09090b]"
                >
                  <div>
                    <span className="font-bold text-[#f4f4f5] block">{c.name}</span>
                    <span className="text-[10px] text-[#71717a]">{c.item_count} items</span>
                  </div>

                  <button
                    type="button"
                    disabled={isAdded}
                    onClick={() => handleAddToCollection(c.id)}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 ${
                      isAdded
                        ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                        : 'bg-[#e05638]/10 border border-[#e05638]/40 text-[#e05638] hover:bg-[#e05638] hover:text-white'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Added</span>
                      </>
                    ) : (
                      <span>+ Add</span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Create New Collection Inline Input */}
        <div className="space-y-2 border-t border-[#27272a] pt-4">
          <label className="block uppercase text-[10px] font-bold text-[#71717a]">
            Create New Collection
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCollName}
              onChange={(e) => setNewCollName(e.target.value)}
              placeholder="e.g. Brand Fonts, Display..."
              className="flex-1 bg-[#09090b] border border-[#27272a] rounded px-3 py-1.5 text-[#f4f4f5] text-xs font-mono outline-none focus:border-[#e05638]"
            />
            <button
              type="button"
              disabled={isCreating || !newCollName.trim()}
              onClick={handleCreateCollection}
              className="px-4 py-1.5 rounded bg-[#e05638] hover:bg-[#c8462a] text-white font-bold text-xs uppercase transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create</span>
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
