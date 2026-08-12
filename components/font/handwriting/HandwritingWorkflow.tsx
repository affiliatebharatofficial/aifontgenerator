'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  HandwritingProcessStage,
  DetectedCharacterItem,
  CharacterAssignment,
} from '@/lib/font/handwriting/types';
import { analyzeHandwritingAction, compileHandwritingFontAction } from '@/lib/font/handwriting/actions';
import { HandwritingUploadStage } from './HandwritingUploadStage';
import { CharacterReviewStage } from './CharacterReviewStage';
import { ProcessingStageIndicator } from './ProcessingStageIndicator';

export function HandwritingWorkflow() {
  const router = useRouter();

  const [currentStage, setCurrentStage] = useState<HandwritingProcessStage>('uploaded');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [sourceBase64, setSourceBase64] = useState<string | null>(null);
  const [sourceFileName, setSourceFileName] = useState<string>('handwriting.png');

  const [detectedItems, setDetectedItems] = useState<DetectedCharacterItem[]>([]);
  const [missingChars, setMissingChars] = useState<string[]>([]);

  // Step 1 -> Step 2: Analyze handwriting
  async function handleImageSelected(base64Data: string, file: File) {
    setSourceBase64(base64Data);
    setSourceFileName(file.name);
    setErrorMessage(null);
    setCurrentStage('analyzing');

    try {
      const res = await analyzeHandwritingAction(base64Data, file.name);

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to analyze handwriting sample.');
        setCurrentStage('failed');
        return;
      }

      setDetectedItems(res.detectedCharacters);
      setMissingChars(res.missingCharacters);
      setCurrentStage('review');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed.';
      setErrorMessage(msg);
      setCurrentStage('failed');
    }
  }

  // Step 3 -> Step 4: Compile font
  async function handleCompileFont(input: {
    fontName: string;
    category: string;
    weight: string;
    width: string;
    style: string;
    assignments: CharacterAssignment[];
  }) {
    if (!sourceBase64) return;

    setErrorMessage(null);
    setCurrentStage('vectorizing');

    try {
      // Simulate real step transition indicators
      setTimeout(() => setCurrentStage('compiling'), 800);
      setTimeout(() => setCurrentStage('validating'), 1600);

      const res = await compileHandwritingFontAction({
        fontName: input.fontName,
        category: input.category,
        weight: input.weight,
        width: input.width,
        style: input.style,
        sourceFileBase64: sourceBase64,
        sourceFileName,
        assignments: input.assignments,
      });

      if (!res.success || !res.generationId) {
        setErrorMessage(res.error || 'Handwriting font compilation failed.');
        setCurrentStage('failed');
        return;
      }

      setCurrentStage('completed');

      // Redirect to Phase 4 result page
      setTimeout(() => {
        router.push(`/font/${res.generationId}`);
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Compilation error.';
      setErrorMessage(msg);
      setCurrentStage('failed');
    }
  }

  function handleReupload() {
    setCurrentStage('uploaded');
    setSourceBase64(null);
    setDetectedItems([]);
    setMissingChars([]);
    setErrorMessage(null);
  }

  return (
    <div className="space-y-10">
      {/* Pipeline Stage Status Bar when active */}
      {currentStage !== 'uploaded' && (
        <ProcessingStageIndicator
          currentStage={currentStage}
          errorMessage={errorMessage}
        />
      )}

      {/* Upload Stage */}
      {currentStage === 'uploaded' && (
        <HandwritingUploadStage
          onImageSelected={handleImageSelected}
          isProcessing={false}
        />
      )}

      {/* Analyzing Stage */}
      {currentStage === 'analyzing' && (
        <div className="border border-[#27272a] bg-[#121215] rounded-xl p-12 text-center space-y-4 font-mono text-xs text-[#a1a1aa]">
          <div className="w-12 h-12 rounded-full border border-[#e05638] bg-[#e05638]/10 text-[#e05638] flex items-center justify-center mx-auto animate-pulse">
            <span className="font-bold text-sm">AI</span>
          </div>
          <h2 className="font-display font-normal text-2xl text-[#f4f4f5] tracking-tight uppercase">
            ANALYZING HANDWRITING &amp; DETECTING CHARACTERS
          </h2>
          <p className="text-[#71717a] max-w-md mx-auto">
            Binarizing image, finding stroke contours, and mapping detected character crops to Unicode code points...
          </p>
        </div>
      )}

      {/* Review Stage */}
      {currentStage === 'review' && (
        <CharacterReviewStage
          detectedItems={detectedItems}
          missingChars={missingChars}
          onCompileFont={handleCompileFont}
          onReupload={handleReupload}
          isCompiling={false}
        />
      )}

      {/* Vectorizing / Compiling Stage */}
      {['vectorizing', 'compiling', 'validating', 'completed'].includes(currentStage) && (
        <div className="border border-[#27272a] bg-[#121215] rounded-xl p-12 text-center space-y-4 font-mono text-xs text-[#a1a1aa]">
          <div className="w-12 h-12 rounded-full border border-[#e05638] bg-[#e05638]/10 text-[#e05638] flex items-center justify-center mx-auto animate-spin">
            <span className="font-bold text-sm">OT</span>
          </div>
          <h2 className="font-display font-normal text-2xl text-[#f4f4f5] tracking-tight uppercase">
            COMPILING OPENTYPE HANDWRITING FONT
          </h2>
          <p className="text-[#71717a] max-w-md mx-auto">
            Converting vector glyph contours into TTF, OTF, and WOFF2 production font binaries...
          </p>
        </div>
      )}
    </div>
  );
}
