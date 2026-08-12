'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileImage,
  CheckCircle2,
  AlertTriangle,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { TemplateDownloadButton } from './TemplateDownloadButton';

interface HandwritingUploadStageProps {
  onImageSelected: (base64Data: string, file: File) => void;
  isProcessing: boolean;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export function HandwritingUploadStage({
  onImageSelected,
  isProcessing,
}: HandwritingUploadStageProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [objectFit, setObjectFit] = useState<'contain' | 'cover'>('contain');

  const inputRef = useRef<HTMLInputElement>(null);

  function validateAndProcessFile(file: File) {
    setValidationError(null);

    // 1. MIME & extension validation
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setValidationError('Unsupported file format. Please upload PNG, JPG/JPEG, or WEBP.');
      return;
    }

    // 2. Size validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError('File size exceeds the 10MB maximum limit.');
      return;
    }

    setSelectedFile(file);

    // Read preview URL and base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result as string;
      if (res) {
        setPreviewUrl(res);
        setBase64Data(res);
      }
    };
    reader.readAsDataURL(file);
  }

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
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    setPreviewUrl(null);
    setBase64Data(null);
    setValidationError(null);
    setZoomLevel(1);
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleStartAnalysis() {
    if (base64Data && selectedFile) {
      onImageSelected(base64Data, selectedFile);
    }
  }

  return (
    <div className="space-y-10">
      {/* Title Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#e05638]/10 text-[#e05638] border border-[#e05638]/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>REAL HANDWRITING VECTORIZATION</span>
        </span>
        <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase">
          TURN YOUR HANDWRITING INTO A FONT
        </h1>
        <p className="text-sm sm:text-base text-[#a1a1aa] font-mono leading-relaxed">
          Upload a clear handwriting sample and create a typeface from your own letterforms.
        </p>
      </div>

      {/* Action Bar & Printable Template Download */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-[#27272a] bg-[#121215] rounded-lg">
        <div className="space-y-1 font-mono text-xs text-[#a1a1aa]">
          <span className="font-bold text-[#f4f4f5] block uppercase">
            Need a Handwriting Template Sheet?
          </span>
          <p className="text-[#71717a] text-[11px]">
            Download our printable grid template to write uppercase A-Z, lowercase a-z, and numbers.
          </p>
        </div>
        <TemplateDownloadButton />
      </div>

      {/* Main Upload Dropzone or Image Preview */}
      {!previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-14 text-center space-y-6 transition-all cursor-pointer ${
            dragActive
              ? 'border-[#e05638] bg-[#e05638]/10 scale-[1.01]'
              : 'border-[#27272a] bg-[#121215] hover:border-[#3f3f46] hover:bg-[#18181b]'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-full bg-[#09090b] border border-[#27272a] flex items-center justify-center mx-auto text-[#e05638]">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-mono font-bold text-[#f4f4f5] uppercase tracking-wider">
              Drag &amp; Drop Handwriting Sample
            </h3>
            <p className="text-xs font-mono text-[#a1a1aa]">
              or <span className="text-[#e05638] font-bold underline">Browse Files</span> from your computer
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-[#71717a] border-t border-[#27272a] pt-4 max-w-md mx-auto">
            <span>Formats: PNG · JPG · WEBP</span>
            <span>•</span>
            <span>Max Size: 10MB</span>
          </div>
        </div>
      ) : (
        /* Uploaded Image Preview Stage */
        <div className="border border-[#27272a] bg-[#121215] rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-4 font-mono text-xs">
            <div className="flex items-center gap-2">
              <FileImage className="w-4 h-4 text-[#e05638]" />
              <span className="font-bold text-[#f4f4f5] truncate max-w-xs sm:max-w-md">
                {selectedFile?.name}
              </span>
              <span className="text-[10px] text-[#71717a]">
                ({((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                title="Zoom Out"
                className="p-1.5 rounded border border-[#27272a] bg-[#09090b] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-bold text-[#f4f4f5] font-mono min-w-[36px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                title="Zoom In"
                className="p-1.5 rounded border border-[#27272a] bg-[#09090b] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setObjectFit((f) => (f === 'contain' ? 'cover' : 'contain'))}
                title="Toggle fit mode"
                className="p-1.5 rounded border border-[#27272a] bg-[#09090b] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1.5 rounded border border-rose-800/80 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 transition-colors cursor-pointer"
                title="Remove Image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actual Image Viewer Container */}
          <div className="relative h-80 sm:h-96 border border-[#27272a] bg-[#09090b] rounded-lg overflow-hidden flex items-center justify-center type-grid-pattern">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Uploaded handwriting sample"
              style={{
                transform: `scale(${zoomLevel})`,
                objectFit,
              }}
              className="max-h-full max-w-full transition-transform duration-200"
            />
          </div>

          {/* Start Processing Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#27272a] pt-4">
            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Sample validated &amp; ready for analysis</span>
            </span>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleStartAnalysis}
              className="w-full sm:w-auto px-8 py-3 rounded-lg bg-[#e05638] hover:bg-[#c8462a] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-xl cursor-pointer disabled:opacity-50"
            >
              Analyze Handwriting &amp; Detect Characters
            </button>
          </div>
        </div>
      )}

      {/* Validation Error Toast */}
      {validationError && (
        <div className="p-4 rounded-lg border border-rose-800 bg-rose-950/40 text-rose-300 flex items-center gap-2 font-mono text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Quality Instructions Card */}
      <div className="border border-[#27272a] bg-[#121215] rounded-xl p-6 sm:p-8 space-y-4 font-mono text-xs text-[#a1a1aa]">
        <div className="flex items-center gap-2 border-b border-[#27272a] pb-3 text-[#f4f4f5]">
          <HelpCircle className="w-4 h-4 text-[#e05638]" />
          <h3 className="font-bold uppercase tracking-wider text-xs">
            Handwriting Sample Guidelines for Best Vector Quality
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-md space-y-1">
            <span className="font-bold text-[#f4f4f5] block">Dark Ink on Light Background</span>
            <p className="text-[11px] text-[#71717a]">
              Use a dark black or blue pen on clean white or light paper.
            </p>
          </div>

          <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-md space-y-1">
            <span className="font-bold text-[#f4f4f5] block">Keep Characters Separated</span>
            <p className="text-[11px] text-[#71717a]">
              Ensure letters do not touch or overlap each other.
            </p>
          </div>

          <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-md space-y-1">
            <span className="font-bold text-[#f4f4f5] block">Good Uniform Lighting</span>
            <p className="text-[11px] text-[#71717a]">
              Avoid dark shadows or uneven camera flash across the page.
            </p>
          </div>

          <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-md space-y-1">
            <span className="font-bold text-[#f4f4f5] block">High Resolution Image</span>
            <p className="text-[11px] text-[#71717a]">
              Avoid heavily compressed or blurry photos.
            </p>
          </div>

          <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-md space-y-1">
            <span className="font-bold text-[#f4f4f5] block">Upright Orientation</span>
            <p className="text-[11px] text-[#71717a]">
              Do not rotate or tilt the paper sideways when taking the picture.
            </p>
          </div>

          <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-md space-y-1">
            <span className="font-bold text-[#f4f4f5] block">Complete Character Set</span>
            <p className="text-[11px] text-[#71717a]">
              Include A-Z, a-z, and 0-9 for full font coverage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
