'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createGenerationJob, deleteGenerationJob, CreateGenerationResult } from './service';
import {
  MAX_PROMPT_LENGTH,
  MAX_FONT_NAME_LENGTH,
  FONT_CATEGORIES,
  FONT_WEIGHTS,
  FONT_WIDTHS,
  FONT_STYLES,
} from './constants';
import type {
  FontCategory,
  FontWeight,
  FontWidth,
  FontStyle,
  CharacterSetConfig,
  AdvancedSettingsConfig,
} from '@/types/database';

export async function createGenerationAction(formData: FormData): Promise<CreateGenerationResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      code: 'AUTH_REQUIRED',
      error: 'You must be signed in to generate a font.',
    };
  }

  // 1. Extract & sanitize raw form fields
  const prompt = (formData.get('prompt') as string) || '';
  const fontName = (formData.get('fontName') as string) || '';
  const category = (formData.get('category') as FontCategory) || 'Sans Serif';
  const weight = (formData.get('weight') as FontWeight) || 'Regular';
  const width = (formData.get('width') as FontWidth) || 'Normal';
  const style = (formData.get('style') as FontStyle) || 'Modern';

  const uppercase = formData.get('char_uppercase') === 'on';
  const lowercase = formData.get('char_lowercase') === 'on';
  const numbers = formData.get('char_numbers') === 'on';
  const punctuation = formData.get('char_punctuation') === 'on';

  const letterSpacing = parseInt((formData.get('letterSpacing') as string) || '0', 10);
  const contrast = (formData.get('contrast') as 'low' | 'medium' | 'high') || 'medium';
  const cornerStyle = (formData.get('cornerStyle') as 'sharp' | 'rounded' | 'bevel') || 'sharp';
  const strokeStyle = (formData.get('strokeStyle') as 'solid' | 'handdrawn' | 'inline') || 'solid';

  // 2. Server-side Prompt Validation
  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) {
    return {
      success: false,
      code: 'INVALID_PROMPT',
      error: 'Font description prompt is required.',
    };
  }

  if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
    return {
      success: false,
      code: 'INVALID_PROMPT',
      error: `Prompt must not exceed ${MAX_PROMPT_LENGTH} characters. (Received ${trimmedPrompt.length})`,
    };
  }

  // 3. Font Name Validation
  const trimmedFontName = fontName.trim();
  if (trimmedFontName.length > MAX_FONT_NAME_LENGTH) {
    return {
      success: false,
      code: 'INVALID_CONFIGURATION',
      error: `Font name must not exceed ${MAX_FONT_NAME_LENGTH} characters.`,
    };
  }

  // 4. Validate Enum Select Options
  if (!FONT_CATEGORIES.includes(category)) {
    return { success: false, code: 'INVALID_CONFIGURATION', error: 'Invalid font category selected.' };
  }
  if (!FONT_WEIGHTS.includes(weight)) {
    return { success: false, code: 'INVALID_CONFIGURATION', error: 'Invalid font weight selected.' };
  }
  if (!FONT_WIDTHS.includes(width)) {
    return { success: false, code: 'INVALID_CONFIGURATION', error: 'Invalid font width selected.' };
  }
  if (!FONT_STYLES.includes(style)) {
    return { success: false, code: 'INVALID_CONFIGURATION', error: 'Invalid font style selected.' };
  }

  const characterSet: CharacterSetConfig = {
    uppercase,
    lowercase,
    numbers,
    punctuation,
  };

  const advancedSettings: AdvancedSettingsConfig = {
    letterSpacing: isNaN(letterSpacing) ? 0 : Math.max(-5, Math.min(10, letterSpacing)),
    contrast: ['low', 'medium', 'high'].includes(contrast) ? contrast : 'medium',
    cornerStyle: ['sharp', 'rounded', 'bevel'].includes(cornerStyle) ? cornerStyle : 'sharp',
    strokeStyle: ['solid', 'handdrawn', 'inline'].includes(strokeStyle) ? strokeStyle : 'solid',
  };

  const parentGenerationId = (formData.get('parentGenerationId') as string) || undefined;

  // 5. Call Generation Service
  const res = await createGenerationJob({
    userId: user.id,
    prompt: trimmedPrompt,
    fontName: trimmedFontName || undefined,
    category,
    weight,
    width,
    style,
    characterSet,
    advancedSettings,
    parentGenerationId,
  });

  if (res.success && res.generationId) {
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/my-fonts');

    // Trigger real background AI font generation processing pipeline
    const { GenerationJobService } = await import('@/lib/font/generation/jobProcessor');
    GenerationJobService.processJob(res.generationId).catch((err) => {
      console.error('Background font processing error:', err);
    });

    redirect(`/generate/status/${res.generationId}`);
  }

  return res;
}

export async function deleteGenerationAction(generationId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized.' };
  }

  const res = await deleteGenerationJob(generationId, user.id);
  if (res.success) {
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/my-fonts');
  }
  return res;
}
