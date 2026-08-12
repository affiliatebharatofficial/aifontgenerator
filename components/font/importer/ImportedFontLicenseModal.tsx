'use client';

import React, { useState } from 'react';
import { X, FileText, Save, Check } from 'lucide-react';
import type { FontLicense } from '@/types/database';
import { updateFontLicenseAction } from '@/lib/font/importer/actions';

interface ImportedFontLicenseModalProps {
  fontId: string;
  initialLicense: FontLicense | null;
  onClose: () => void;
}

export function ImportedFontLicenseModal({
  fontId,
  initialLicense,
  onClose,
}: ImportedFontLicenseModalProps) {
  const [licenseName, setLicenseName] = useState(initialLicense?.license_name || '');
  const [licenseUrl, setLicenseUrl] = useState(initialLicense?.license_url || '');
  const [licenseNotes, setLicenseNotes] = useState(initialLicense?.license_notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    const res = await updateFontLicenseAction(fontId, licenseName, licenseUrl, licenseNotes);
    setIsSaving(false);

    if (res.success) {
      setSaved(true);
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      alert(res.error || 'Failed to save license info.');
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono text-xs text-[#a1a1aa]"
    >
      <div className="border border-[#27272a] bg-[#121215] rounded-xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#e05638]" />
            <h3 className="font-bold text-[#f4f4f5] uppercase tracking-wider text-xs">
              EDIT LICENSE NOTES
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#71717a] hover:text-[#f4f4f5] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-[#71717a]">
          Record personal notes or license references for this imported font file.
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block uppercase text-[10px] font-bold text-[#71717a]">
              License Name
            </label>
            <input
              type="text"
              value={licenseName}
              onChange={(e) => setLicenseName(e.target.value)}
              placeholder="e.g. SIL Open Font License (OFL)"
              className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-[#f4f4f5] font-bold text-xs outline-none focus:border-[#e05638]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block uppercase text-[10px] font-bold text-[#71717a]">
              License URL
            </label>
            <input
              type="text"
              value={licenseUrl}
              onChange={(e) => setLicenseUrl(e.target.value)}
              placeholder="e.g. https://scripts.sil.org/OFL"
              className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-[#f4f4f5] text-xs outline-none focus:border-[#e05638]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block uppercase text-[10px] font-bold text-[#71717a]">
              License Notes
            </label>
            <textarea
              rows={3}
              value={licenseNotes}
              onChange={(e) => setLicenseNotes(e.target.value)}
              placeholder="Personal usage notes..."
              className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-[#f4f4f5] text-xs outline-none focus:border-[#e05638] resize-none"
            />
          </div>
        </div>

        <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-md text-[10px] text-[#71717a]">
          ⚠️ <em>License information is user-provided. AI Font Generator does not determine or guarantee legal font ownership.</em>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border border-[#27272a] text-[#a1a1aa] font-bold text-xs uppercase cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-6 py-2 rounded bg-[#e05638] text-white font-bold text-xs uppercase cursor-pointer flex items-center gap-1.5"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save License</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
