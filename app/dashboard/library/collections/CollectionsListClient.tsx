'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Folder, FolderPlus, Plus, ExternalLink, Trash2 } from 'lucide-react';
import type { CollectionWithCount } from '@/lib/library/service';
import { createCollectionAction, deleteCollectionAction } from '@/lib/library/actions';

interface CollectionsListClientProps {
  initialCollections: CollectionWithCount[];
}

export function CollectionsListClient({
  initialCollections,
}: CollectionsListClientProps) {
  const [collections, setCollections] = useState(initialCollections);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showModal, setShowModal] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setIsCreating(true);
    const res = await createCollectionAction(name.trim(), description.trim());
    setIsCreating(false);

    if (res.success && res.collectionId) {
      setCollections((prev) => [
        {
          id: res.collectionId!,
          user_id: '',
          name: name.trim(),
          description: description.trim() || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          item_count: 0,
        },
        ...prev,
      ]);
      setName('');
      setDescription('');
      setShowModal(false);
    } else {
      alert(res.error || 'Failed to create collection.');
    }
  }

  async function handleDelete(id: string, collName: string) {
    if (!confirm(`Delete collection "${collName}"?`)) return;
    const res = await deleteCollectionAction(id);
    if (res.success) {
      setCollections((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert(res.error || 'Failed to delete collection.');
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#e05638] hover:bg-[#c8462a] text-white font-bold text-xs uppercase cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Collection</span>
        </button>
      </div>

      {collections.length === 0 ? (
        /* Empty State */
        <div className="border border-dashed border-[#27272a] bg-[#121215]/50 rounded-2xl p-14 text-center space-y-6 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#09090b] border border-[#27272a] flex items-center justify-center mx-auto text-[#e05638]">
            <FolderPlus className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#f4f4f5] uppercase tracking-wide">
              NO COLLECTIONS YET
            </h3>
            <p className="text-xs text-[#71717a]">
              Create custom collections (e.g. Brand Fonts, Experimental, Display) to group your typefaces.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-8 py-3 rounded-lg bg-[#e05638] hover:bg-[#c8462a] text-white font-bold text-xs uppercase cursor-pointer"
          >
            Create Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((c) => (
            <div
              key={c.id}
              className="border border-[#27272a] bg-[#121215] rounded-xl p-6 flex flex-col justify-between space-y-6 hover:border-[#3f3f46] transition-all shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-[#09090b] border border-[#27272a] flex items-center justify-center text-[#e05638]">
                    <Folder className="w-5 h-5" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id, c.name)}
                    className="p-1.5 rounded text-[#71717a] hover:text-rose-400 cursor-pointer"
                    title="Delete Collection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-[#f4f4f5] uppercase tracking-tight">
                    {c.name}
                  </h3>
                  {c.description && (
                    <p className="text-xs text-[#71717a] mt-1 line-clamp-2">{c.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#27272a] pt-4">
                <span className="text-[11px] font-bold text-[#e05638] uppercase">
                  {c.item_count} {c.item_count === 1 ? 'Font' : 'Fonts'}
                </span>

                <Link
                  href={`/dashboard/library/collections/${c.id}`}
                  className="inline-flex items-center gap-1.5 text-xs text-[#f4f4f5] hover:text-[#e05638] font-bold uppercase transition-colors"
                >
                  <span>View Collection</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="border border-[#27272a] bg-[#121215] rounded-xl max-w-md w-full p-6 space-y-6 font-mono text-xs text-[#a1a1aa] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
              <h3 className="font-bold text-[#f4f4f5] uppercase tracking-wider text-xs flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-[#e05638]" />
                <span>CREATE COLLECTION</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-[#71717a] hover:text-[#f4f4f5] cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block uppercase text-[10px] font-bold text-[#71717a]">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Brand Fonts"
                  className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-[#f4f4f5] font-bold text-xs outline-none focus:border-[#e05638]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block uppercase text-[10px] font-bold text-[#71717a]">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes about this collection..."
                  className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-[#f4f4f5] text-xs outline-none focus:border-[#e05638] resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded border border-[#27272a] text-[#a1a1aa] font-bold text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isCreating || !name.trim()}
                onClick={handleCreate}
                className="px-6 py-2 rounded bg-[#e05638] text-white font-bold text-xs uppercase cursor-pointer disabled:opacity-50"
              >
                Create Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
