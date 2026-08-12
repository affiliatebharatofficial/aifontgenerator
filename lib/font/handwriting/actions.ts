'use server';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { getUserDailyUsage } from '@/lib/generations/service';
import { DAILY_GENERATION_LIMIT } from '@/lib/generations/constants';
import { HandwritingSegmentationEngine } from './segmentation';
import { HandwritingCompilerService } from './handwritingCompiler';
import type { CharacterAssignment, AnalysisResult } from './types';
import { createClient } from '@/lib/supabase/server';

export async function analyzeHandwritingAction(
  base64Image: string,
  fileName: string
): Promise<AnalysisResult> {
  const { user } = await getCurrentUserProfile();

  if (!user) {
    return {
      success: false,
      detectedCharacters: [],
      missingCharacters: [],
      error: 'Authentication required. Please log in to process handwriting.',
    };
  }

  // Quota check
  const usageInfo = await getUserDailyUsage(user.id);
  if (usageInfo.isLimitReached) {
    return {
      success: false,
      detectedCharacters: [],
      missingCharacters: [],
      error: `You have reached your daily limit of ${usageInfo.limit} font generations. Please try again tomorrow.`,
    };
  }

  return await HandwritingSegmentationEngine.analyzeHandwritingImage(base64Image);
}

export async function compileHandwritingFontAction(input: {
  fontName: string;
  category?: string;
  weight?: string;
  width?: string;
  style?: string;
  sourceFileBase64: string;
  sourceFileName: string;
  assignments: CharacterAssignment[];
}): Promise<{ success: boolean; generationId?: string; error?: string }> {
  const { user } = await getCurrentUserProfile();

  if (!user) {
    return {
      success: false,
      error: 'Authentication required. Please log in to build your font.',
    };
  }

  // Quota check
  const usageInfo = await getUserDailyUsage(user.id);
  if (usageInfo.isLimitReached) {
    return {
      success: false,
      error: `You have reached your daily limit of ${usageInfo.limit} font generations. Please try again tomorrow.`,
    };
  }

  const result = await HandwritingCompilerService.compileAndSaveHandwritingFont({
    userId: user.id,
    fontName: input.fontName,
    category: input.category,
    weight: input.weight,
    width: input.width,
    style: input.style,
    sourceFileBase64: input.sourceFileBase64,
    sourceFileName: input.sourceFileName,
    assignments: input.assignments,
  });

  if (result.success && result.generationId) {
    // Increment daily usage count
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];
    await supabase.from('generation_usage').upsert(
      {
        user_id: user.id,
        usage_date: today,
        generation_count: usageInfo.count + 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id, usage_date' }
    );
  }

  return result;
}
