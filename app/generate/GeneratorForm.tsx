'use client';

import { useState } from 'react';
import {
  AlertCircle,
  Lock,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DAILY_GENERATION_LIMIT,
  MAX_PROMPT_LENGTH,
  MAX_FONT_NAME_LENGTH,
  FONT_CATEGORIES,
  FONT_WEIGHTS,
  FONT_WIDTHS,
  FONT_STYLES,
  DEFAULT_CHARACTER_SET,
  DEFAULT_ADVANCED_SETTINGS,
} from '@/lib/generations/constants';
import { createGenerationAction } from '@/lib/generations/actions';
import type {
  FontGeneration,
  FontCategory,
  FontWeight,
  FontWidth,
  FontStyle,
  CharacterSetConfig,
  AdvancedSettingsConfig,
} from '@/types/database';
import { RotateCcw } from 'lucide-react';

export function GeneratorForm({
  usageCount,
  usageLimit = 10,
  initialCategory,
  parentGen,
}: {
  usageCount: number;
  usageLimit?: number;
  initialCategory?: FontCategory;
  parentGen?: FontGeneration;
}) {
  const [prompt, setPrompt] = useState(parentGen ? parentGen.prompt : '');
  const [fontName, setFontName] = useState(parentGen ? parentGen.font_name || '' : '');
  const [category, setCategory] = useState<FontCategory>(
    parentGen ? parentGen.category : initialCategory || 'Sans Serif'
  );
  const [weight, setWeight] = useState<FontWeight>(parentGen ? parentGen.weight : 'Regular');
  const [width, setWidth] = useState<FontWidth>(parentGen ? parentGen.width : 'Normal');
  const [style, setStyle] = useState<FontStyle>(parentGen ? parentGen.style : 'Modern');

  const [characterSet, setCharacterSet] = useState<CharacterSetConfig>(
    parentGen ? (parentGen.character_set as unknown as CharacterSetConfig) : DEFAULT_CHARACTER_SET
  );
  const advancedSettings: AdvancedSettingsConfig = parentGen
    ? (parentGen.advanced_settings as unknown as AdvancedSettingsConfig)
    : DEFAULT_ADVANCED_SETTINGS;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLimitReached = usageCount >= usageLimit;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting || isLimitReached) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('fontName', fontName);
    formData.append('category', category);
    formData.append('weight', weight);
    formData.append('width', width);
    formData.append('style', style);

    if (parentGen) {
      formData.append('parentGenerationId', parentGen.id);
    }

    if (characterSet.uppercase) formData.append('char_uppercase', 'on');
    if (characterSet.lowercase) formData.append('char_lowercase', 'on');
    if (characterSet.numbers) formData.append('char_numbers', 'on');
    if (characterSet.punctuation) formData.append('char_punctuation', 'on');
    if (characterSet.devanagari || category === 'Devanagari') formData.append('char_devanagari', 'on');

    formData.append('letterSpacing', advancedSettings.letterSpacing.toString());
    formData.append('contrast', advancedSettings.contrast);
    formData.append('cornerStyle', advancedSettings.cornerStyle);
    formData.append('strokeStyle', advancedSettings.strokeStyle);

    try {
      const res = await createGenerationAction(formData);
      if (res && !res.success) {
        setErrorMessage(res.error || 'Failed to submit generation request.');
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'digest' in err) {
        throw err;
      }
      setErrorMessage('An unexpected error occurred during submission.');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-4 rounded-md bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {parentGen && (
        <div className="flex items-center gap-3 p-4 rounded-md bg-[#e05638]/10 border border-[#e05638]/40 text-[#f4f4f5] text-xs font-mono">
          <RotateCcw className="w-5 h-5 text-[#e05638] shrink-0" />
          <div>
            <p className="font-bold uppercase tracking-wider text-xs">
              REGENERATING VERSION {(parentGen.version_number || 1) + 1}
            </p>
            <p className="text-[11px] text-[#a1a1aa] mt-0.5">
              Pre-filled from parent &ldquo;<strong className="text-[#f4f4f5]">{parentGen.font_name || 'AI Font'}</strong>&rdquo; (V{parentGen.version_number || 1}). Modify settings below and submit to generate a new version.
            </p>
          </div>
        </div>
      )}

      {isLimitReached && (
        <div className="flex items-start gap-2.5 p-4 rounded-md bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-medium">
          <Lock className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold uppercase tracking-wider font-mono">
              Daily Limit Reached ({usageCount}/{usageLimit})
            </p>
            <p className="text-[11px] text-amber-400/80 mt-0.5">
              You have submitted {usageLimit} generations today. You can manage existing fonts or generate again tomorrow.
            </p>
          </div>
        </div>
      )}

      {/* Design-Tool Three-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Parameter Controls */}
        <div className="lg:col-span-4 border border-[#27272a] bg-[#121215] rounded-md p-6 space-y-6">
          <div className="pb-4 border-b border-[#27272a]">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-bold">
              Typeface Controls
            </h2>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-[#a1a1aa] font-semibold uppercase text-[11px]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FontCategory)}
                disabled={isSubmitting || isLimitReached}
                className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-[#f4f4f5] focus:outline-none focus:border-[#e05638]"
              >
                {FONT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Weight */}
            <div className="space-y-1.5">
              <label className="block text-[#a1a1aa] font-semibold uppercase text-[11px]">Weight</label>
              <select
                value={weight}
                onChange={(e) => setWeight(e.target.value as FontWeight)}
                disabled={isSubmitting || isLimitReached}
                className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-[#f4f4f5] focus:outline-none focus:border-[#e05638]"
              >
                {FONT_WEIGHTS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Width */}
            <div className="space-y-1.5">
              <label className="block text-[#a1a1aa] font-semibold uppercase text-[11px]">Width</label>
              <select
                value={width}
                onChange={(e) => setWidth(e.target.value as FontWidth)}
                disabled={isSubmitting || isLimitReached}
                className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-[#f4f4f5] focus:outline-none focus:border-[#e05638]"
              >
                {FONT_WIDTHS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Style */}
            <div className="space-y-1.5">
              <label className="block text-[#a1a1aa] font-semibold uppercase text-[11px]">Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as FontStyle)}
                disabled={isSubmitting || isLimitReached}
                className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-[#f4f4f5] focus:outline-none focus:border-[#e05638]"
              >
                {FONT_STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Character Set Checkboxes */}
            <div className="pt-4 border-t border-[#27272a] space-y-2">
              <label className="block text-[#a1a1aa] font-semibold uppercase text-[11px]">
                Character Encodings
              </label>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <label className="flex items-center gap-2 cursor-pointer text-[#a1a1aa] hover:text-[#f4f4f5]">
                  <input
                    type="checkbox"
                    checked={characterSet.uppercase}
                    onChange={(e) => setCharacterSet({ ...characterSet, uppercase: e.target.checked })}
                    className="accent-[#e05638]"
                  />
                  <span>Uppercase</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#a1a1aa] hover:text-[#f4f4f5]">
                  <input
                    type="checkbox"
                    checked={characterSet.lowercase}
                    onChange={(e) => setCharacterSet({ ...characterSet, lowercase: e.target.checked })}
                    className="accent-[#e05638]"
                  />
                  <span>Lowercase</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#a1a1aa] hover:text-[#f4f4f5]">
                  <input
                    type="checkbox"
                    checked={characterSet.numbers}
                    onChange={(e) => setCharacterSet({ ...characterSet, numbers: e.target.checked })}
                    className="accent-[#e05638]"
                  />
                  <span>Numbers</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#a1a1aa] hover:text-[#f4f4f5]">
                  <input
                    type="checkbox"
                    checked={characterSet.punctuation}
                    onChange={(e) => setCharacterSet({ ...characterSet, punctuation: e.target.checked })}
                    className="accent-[#e05638]"
                  />
                  <span>Symbols</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#a1a1aa] hover:text-[#f4f4f5] col-span-2">
                  <input
                    type="checkbox"
                    checked={characterSet.devanagari || category === 'Devanagari'}
                    onChange={(e) => setCharacterSet({ ...characterSet, devanagari: e.target.checked })}
                    className="accent-[#e05638]"
                  />
                  <span className="font-semibold text-amber-400">Hindi / Devanagari (क, ख, ग)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right Columns: Prompt Input & Execution */}
        <div className="lg:col-span-8 space-y-6">
          <div className="border border-[#27272a] bg-[#121215] rounded-md p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-bold">
                DESCRIBE YOUR TYPEFACE
              </h2>
              <span className="text-[11px] font-mono text-[#71717a]">
                {prompt.length} / {MAX_PROMPT_LENGTH}
              </span>
            </div>

            <div className="space-y-4">
              <textarea
                rows={6}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={MAX_PROMPT_LENGTH}
                placeholder="e.g. Sharp geometric display typeface with high contrast strokes and bold triangular serifs..."
                required
                disabled={isSubmitting || isLimitReached}
                className="w-full p-4 text-sm font-sans bg-[#09090b] border border-[#27272a] rounded-md text-[#f4f4f5] placeholder:text-[#71717a] focus:outline-none focus:border-[#e05638] leading-relaxed"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1 font-mono text-xs">
                  <label className="block text-[#a1a1aa] uppercase text-[11px] font-semibold">
                    Typeface Name (Optional)
                  </label>
                  <Input
                    type="text"
                    value={fontName}
                    onChange={(e) => setFontName(e.target.value)}
                    maxLength={MAX_FONT_NAME_LENGTH}
                    placeholder="e.g. Cyberpunk Display"
                    disabled={isSubmitting || isLimitReached}
                  />
                </div>

                <div className="flex items-end justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting || isLimitReached || !prompt.trim()}
                    className="w-full sm:w-auto px-8 py-3 bg-[#e05638] hover:bg-[#c84326] text-white text-xs uppercase font-bold tracking-wider rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Synthesizing Outlines...</span>
                      </>
                    ) : (
                      <>
                        <span>GENERATE TYPEFACE</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Job Quota Summary Bar */}
          <div className="p-4 border border-[#27272a] bg-[#121215] rounded-md flex items-center justify-between text-xs font-mono text-[#a1a1aa]">
            <span>Today&apos;s Allowance Quota</span>
            <span className="font-bold text-[#f4f4f5]">
              {usageCount} / {usageLimit} Generations Used
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
