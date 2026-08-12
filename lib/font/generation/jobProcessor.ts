import { createClient } from '@/lib/supabase/server';
import { generateFontSpecification } from '../specification/provider';
import { FontCompilerService } from '../compiler/fontCompiler';
import { FontValidationService } from '../validator/fontValidator';
import { FontStorageService } from '../storage/fontStorage';
import type {
  FontGeneration,
  FontCategory,
  FontWeight,
  FontWidth,
  FontStyle,
  CharacterSetConfig,
  AdvancedSettingsConfig,
} from '@/types/database';

export class GenerationJobService {
  /**
   * Orchestrates the real AI font generation pipeline:
   * Specification → Vector Glyph Engine → TTF/OTF/WOFF2 Compilation → Binary Validation → Supabase Storage → Status Update
   */
  public static async processJob(generationId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // 1. Fetch generation job record
    const { data, error: fetchError } = await supabase
      .from('font_generations')
      .select('*')
      .eq('id', generationId)
      .single();

    const job = data as unknown as FontGeneration | null;

    if (fetchError || !job) {
      return { success: false, error: 'Font generation job record not found.' };
    }

    // Idempotency check: Do not re-process completed or failed jobs
    if (job.status === 'completed') {
      return { success: true };
    }

    // 2. Transition status to 'processing'
    await supabase
      .from('font_generations')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', generationId);

    try {
      // 3. AI Font Specification
      const spec = await generateFontSpecification({
        prompt: job.prompt,
        fontName: job.font_name || undefined,
        category: job.category as FontCategory,
        weight: job.weight as FontWeight,
        width: job.width as FontWidth,
        style: job.style as FontStyle,
        characterSet: job.character_set as unknown as CharacterSetConfig,
        advancedSettings: job.advanced_settings as unknown as AdvancedSettingsConfig,
      });

      // 4. Vector Glyph Synthesis & Font Compilation (TTF, OTF, WOFF2)
      const compiledBuffers = await FontCompilerService.compileFont(spec);

      // 5. Binary & Table Validation
      const validation = FontValidationService.validateFontBuffers(compiledBuffers);
      if (!validation.valid) {
        throw new Error(`Font compilation validation failed: ${validation.errors.join('; ')}`);
      }

      // 6. Upload Binaries to Supabase Storage & Record generated_files
      await FontStorageService.uploadAndRecordFontFiles(job.user_id, job.id, compiledBuffers);

      // 7. Transition job status to 'completed'
      const { error: updateError } = await supabase
        .from('font_generations')
        .update({
          font_name: spec.fontName,
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', generationId);

      if (updateError) {
        console.error('Failed to mark generation completed:', updateError.message);
      }

      return { success: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown generation engine error.';
      console.error(`Font generation failed for job ${generationId}:`, errorMessage);

      // Mark job as failed with safe error message
      await supabase
        .from('font_generations')
        .update({
          status: 'failed',
          error_message: errorMessage.substring(0, 300),
          updated_at: new Date().toISOString(),
        })
        .eq('id', generationId);

      return { success: false, error: errorMessage };
    }
  }
}
