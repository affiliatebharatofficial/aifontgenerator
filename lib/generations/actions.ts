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
  const devanagari =
    formData.get('char_devanagari') === 'on' ||
    category === 'Devanagari' ||
    prompt.toLowerCase().includes('hindi') ||
    prompt.toLowerCase().includes('devanagari') ||
    prompt.toLowerCase().includes('sanskrit') ||
    prompt.includes('हिंदी') ||
    prompt.includes('देवनागरी');

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
    devanagari,
  };

  const advancedSettings: AdvancedSettingsConfig = {
    letterSpacing: isNaN(letterSpacing) ? 0 : Math.max(-5, Math.min(10, letterSpacing)),
    contrast: ['low', 'medium', 'high'].includes(contrast) ? contrast : 'medium',
    cornerStyle: ['sharp', 'rounded', 'bevel'].includes(cornerStyle) ? cornerStyle : 'sharp',
    strokeStyle: ['solid', 'handdrawn', 'inline'].includes(strokeStyle) ? strokeStyle : 'solid',
  };

  const styleStrength = Math.max(0, Math.min(100, parseInt((formData.get('styleStrength') as string) || '50', 10)));
  const variation = Math.max(0, Math.min(100, parseInt((formData.get('variation') as string) || '50', 10)));
  const slant = (formData.get('slant') as 'Upright' | 'Slight' | 'Italic' | 'Strong Italic') || 'Upright';
  const spacing = (formData.get('spacing') as 'Tight' | 'Normal' | 'Open') || 'Normal';
  const seedRaw = formData.get('seed') as string;
  const seed = seedRaw ? parseInt(seedRaw, 10) : Math.floor(Math.random() * 1000000) + 1;

  const parentGenerationId = (formData.get('parentGenerationId') as string) || undefined;

  const generationControls = {
    styleStrength,
    variation,
    weight: (['Thin', 'Light', 'Regular', 'Medium', 'Bold', 'Black'].includes(weight) ? weight : 'Regular') as import('@/lib/font/specification/generationControls').ControlWeight,
    width: (['Condensed', 'Normal', 'Expanded'].includes(width) ? width : 'Normal') as import('@/lib/font/specification/generationControls').ControlWidth,

    slant,
    spacing,
    seed,
    engineVersion: '1.0.0',
  };

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
    generationControls,
    seed,
  });


  if (res.success && res.generationId) {
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/my-fonts');

    // Synchronously await AI font generation processing pipeline to prevent serverless termination
    try {
      const { GenerationJobService } = await import('@/lib/font/generation/jobProcessor');
      await GenerationJobService.processJob(res.generationId);
    } catch (err) {
      console.error('Font processing error:', err);
    }

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

export async function createVariationAction(
  parentGenId: string,
  variationIndex: number = 1
): Promise<CreateGenerationResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, code: 'AUTH_REQUIRED', error: 'You must be signed in to generate variations.' };
  }

  // 1. Fetch parent generation
  const { data: parentGen, error: fetchErr } = await supabase
    .from('font_generations')
    .select('*')
    .eq('id', parentGenId)
    .eq('user_id', user.id)
    .single();

  const parent = parentGen as unknown as import('@/types/database').FontGeneration;

  if (fetchErr || !parent) {
    return { success: false, code: 'INVALID_CONFIGURATION', error: 'Parent generation not found.' };
  }


  // Max 4 variations limit per generation session
  if (variationIndex < 1 || variationIndex > 4) {
    return { success: false, code: 'INVALID_CONFIGURATION', error: 'Variation index must be between 1 and 4.' };
  }

  const baseControls = (parent.generation_controls as unknown as import('@/lib/font/specification/generationControls').GenerationControls) || {
    styleStrength: 50,
    variation: 50,
    weight: parent.weight || 'Regular',
    width: parent.width || 'Normal',
    slant: 'Upright',
    spacing: 'Normal',
    engineVersion: '1.0.0',
  };

  const masterSeed = (parent.seed as number) || 42;
  const variationSeed = masterSeed + variationIndex * 1337 + 77;

  const variationControls = {
    ...baseControls,
    seed: masterSeed,
    variationSeed,
  };

  const fontName = parent.font_name ? `${parent.font_name} Var ${variationIndex}` : `AI Font Var ${variationIndex}`;

  const res = await createGenerationJob({
    userId: user.id,
    prompt: parent.prompt,
    fontName,
    category: parent.category as FontCategory,
    weight: parent.weight as FontWeight,
    width: parent.width as FontWidth,
    style: parent.style as FontStyle,
    characterSet: parent.character_set as unknown as CharacterSetConfig,
    advancedSettings: parent.advanced_settings as unknown as AdvancedSettingsConfig,
    parentGenerationId: parent.parent_generation_id || parent.id,
    generationControls: variationControls,
    seed: variationSeed,
  });


  if (res.success && res.generationId) {
    try {
      const { GenerationJobService } = await import('@/lib/font/generation/jobProcessor');
      await GenerationJobService.processJob(res.generationId);
    } catch (err) {
      console.error('Variation processing error:', err);
    }
  }

  return res;
}

