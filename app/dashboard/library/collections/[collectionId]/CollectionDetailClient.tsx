'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, Trash2, Edit3, Save, X, Plus } from 'lucide-react';
import type { FontCollection, FontGeneration, GeneratedFile } from '@/types/database';
import { FontSpecimenCard } from '@/components/library/FontSpecimenCard';
import { updateCollectionAction, deleteCollectionAction } from '@/lib/library/actions';

interface CollectionDetailClientProps {
  collection: FontCollection;
  generations: FontGeneration[];
  filesMap: Record<string, GeneratedFile[]>;
  favoriteIds: string[];
  tagsMap: Record<string, string[]>;
}

export function CollectionDetailClient({
  collection,
  generations,
  filesMap,
  favoriteIds,
  tagsMap,
}: CollectionDetailClientProps) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description || '');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setIsSaving(true);
    const res = await updateCollectionAction(collection.id, name.trim(), description.trim());
    setIsSaving(false);
    if (res.success) {
      setIsEditing(false);
      router.refresh();
    } else {
      alert(res.error || 'Failed to update collection.');
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete collection "${collection.name}"?`)) return;
    const res = await deleteCollectionAction(collection.id);
    if (res.success) {
      router.push('/dashboard/library/collections');
    } else {
      alert(res.error || 'Failed to delete collection.');
    }
  }

  return (
    <div className="space-y-8 font-mono text-xs text-[#a1a1aa]">
      {/* Header */}
      <div className="border border-[#27272a] bg-[#121215] rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272a] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#09090b] border border-[#27272a] flex items-center justify-center text-[#e05638]">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#e05638] uppercase tracking-widest block">
                COLLECTION
              </span>
              <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#f4f4f5] tracking-tight uppercase">
                {collection.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#27272a] bg-[#09090b] text-[#f4f4f5] hover:border-[#e05638] transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Collection'}</span>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-rose-900/60 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Inline Edit Form */}
        {isEditing ? (
          <div className="space-y-4 pt-2 border-t border-[#27272a]">
            <div className="space-y-1.5">
              <label className="block uppercase text-[10px] font-bold text-[#71717a]">
                Collection Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-[#f4f4f5] font-bold text-xs outline-none focus:border-[#e05638]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block uppercase text-[10px] font-bold text-[#71717a]">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-[#f4f4f5] text-xs outline-none focus:border-[#e05638] resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="px-6 py-2 rounded bg-[#e05638] text-white font-bold text-xs uppercase cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        ) : (
          collection.description && (
            <p className="text-xs text-[#a1a1aa] leading-relaxed">{collection.description}</p>
          )
        )}
      </div>

      {/* Member Fonts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#f4f4f5] font-bold">
            COLLECTION FONTS ({generations.length})
          </h2>
        </div>

        {generations.length === 0 ? (
          <div className="p-12 border border-dashed border-[#27272a] rounded-xl text-center space-y-4 text-[#71717a]">
            <p>No fonts have been added to this collection yet.</p>
            <p className="text-[11px]">
              Go to <strong className="text-[#f4f4f5]">Your Type Library</strong> and click the folder icon on any font card to add it to this collection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generations.map((g) => (
              <FontSpecimenCard
                key={g.id}
                generation={g}
                files={filesMap[g.id] || []}
                isFavorited={favoriteIds.includes(g.id)}
                tags={tagsMap[g.id] || []}
                viewMode="grid"
                onOpenCollectionModal={() => {}}
                onOpenTagModal={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
