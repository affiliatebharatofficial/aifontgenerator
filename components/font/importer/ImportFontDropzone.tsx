'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileType, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { importFontFileAction } from '@/lib/font/importer/actions';
import { MAX_IMPORT_FILE_SIZE_BYTES } from '@/lib/font/importer/types';

export function ImportFontDropzone() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  }

  function validateAndSetFile(file: File) {
    setErrorMsg(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['ttf', 'otf', 'woff', 'woff2'].includes(ext)) {
      setErrorMsg('Unsupported format. Please select a TTF, OTF, WOFF, or WOFF2 font file.');
      return;
    }
    if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
      setErrorMsg(`File size exceeds limit of ${MAX_IMPORT_FILE_SIZE_BYTES / (1024 * 1024)}MB.`);
      return;
    }
    setSelectedFile(file);
  }

  async function handleStartImport() {
    if (!selectedFile || isUploading) return;
    setIsUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('fontFile', selectedFile);

    const res = await importFontFileAction(formData);

    if (res.success && res.fontId) {
      router.push(`/import-font/${res.fontId}`);
    } else {
      setIsUploading(false);
      setErrorMsg(res.error || 'Failed to import font file.');
    }
  }

  return (
    <div className="space-y-8 font-mono text-xs text-[#a1a1aa] max-w-3xl mx-auto">
      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-[#e05638] bg-[#e05638]/10'
            : selectedFile
            ? 'border-emerald-700 bg-emerald-950/20'
            : 'border-[#27272a] bg-[#121215] hover:border-[#3f3f46]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#09090b] border border-[#27272a] flex items-center justify-center mx-auto text-[#e05638]">
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : selectedFile ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#f4f4f5] uppercase tracking-wide">
              {selectedFile ? selectedFile.name : 'DRAG & DROP FONT FILE'}
            </h3>
            <p className="text-xs text-[#71717a]">
              {selectedFile
                ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze`
                : 'or click to browse files from your computer.'}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {['TTF', 'OTF', 'WOFF', 'WOFF2'].map((fmt) => (
              <span
                key={fmt}
                className="text-[10px] font-bold text-[#e05638] bg-[#e05638]/10 border border-[#e05638]/30 px-2 py-0.5 rounded"
              >
                {fmt}
              </span>
            ))}
            <span className="text-[10px] text-[#71717a] border border-[#27272a] px-2 py-0.5 rounded">
              MAX 15 MB
            </span>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-4 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="text-xs">{errorMsg}</span>
        </div>
      )}

      {/* Submit Action */}
      {selectedFile && (
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            disabled={isUploading}
            onClick={() => setSelectedFile(null)}
            className="px-5 py-2.5 rounded-lg border border-[#27272a] bg-[#09090b] text-[#a1a1aa] font-bold text-xs uppercase cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isUploading}
            onClick={handleStartImport}
            className="px-8 py-2.5 rounded-lg bg-[#e05638] hover:bg-[#c8462a] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Binary...</span>
              </>
            ) : (
              <>
                <FileType className="w-4 h-4" />
                <span>Import &amp; Analyze Typeface</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
