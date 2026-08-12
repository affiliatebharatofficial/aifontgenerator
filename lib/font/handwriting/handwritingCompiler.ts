import { Font } from 'opentype.js';
import wawoff2 from 'wawoff2';
import { createClient } from '@/lib/supabase/server';
import { HandwritingVectorizerEngine } from './vectorizer';
import { FontValidationService } from '../validator/fontValidator';
import { FontStorageService } from '../storage/fontStorage';
import type { HandwritingFontInput } from './types';

export class HandwritingCompilerService {
  /**
   * Compiles true TTF, OTF, and WOFF2 font binaries from vectorized handwriting glyphs,
   * validates output, uploads files to private Supabase storage, and completes the generation job.
   */
  public static async compileAndSaveHandwritingFont(
    input: HandwritingFontInput
  ): Promise<{ success: boolean; generationId?: string; error?: string }> {
    const supabase = await createClient();

    const fontName = input.fontName.trim() || 'My Handwriting';
    const familyName = fontName.replace(/[^a-zA-Z0-9\s_-]/g, '');
    const styleName = (input.weight || 'Regular').replace(/[^a-zA-Z0-9\s_-]/g, '');

    // 1. Create font_generations job record
    const { data: job, error: insertErr } = await supabase
      .from('font_generations')
      .insert({
        user_id: input.userId,
        font_name: fontName,
        prompt: `Handwriting font from uploaded sample: ${input.sourceFileName}`,
        category: input.category || 'Handwritten',
        weight: input.weight || 'Regular',
        width: input.width || 'Normal',
        style: input.style || 'Organic',
        character_set: { uppercase: true, lowercase: true, numbers: true, punctuation: true },
        advanced_settings: { letterSpacing: 0, contrast: 'medium', cornerStyle: 'sharp', strokeStyle: 'handdrawn' },
        status: 'processing',
      })
      .select('id')
      .single();

    if (insertErr || !job) {
      console.error('Failed to insert handwriting generation record:', insertErr?.message);
      return { success: false, error: 'Database job creation failed.' };
    }

    const generationId = job.id;

    try {
      // 2. Vectorize approved character assignments into opentype.Glyph array
      const glyphs = HandwritingVectorizerEngine.vectorizeAssignments(input.assignments);

      // 3. Construct opentype.Font instance
      const font = new Font({
        familyName,
        styleName,
        unitsPerEm: 1000,
        ascender: 800,
        descender: -200,
        glyphs,
      });

      // 4. Compile TrueType (.ttf) & OpenType (.otf) ArrayBuffers
      const ttfArrayBuffer = font.toArrayBuffer();
      const ttfBuffer = Buffer.from(ttfArrayBuffer);
      const otfBuffer = Buffer.from(ttfArrayBuffer);

      // 5. Compress TTF to WOFF2 using wawoff2
      const woff2Uint8Array = await wawoff2.compress(ttfBuffer);
      const woff2Buffer = Buffer.from(woff2Uint8Array);

      const compiledBuffers = {
        ttf: ttfBuffer,
        otf: otfBuffer,
        woff2: woff2Buffer,
      };

      // 6. Binary validation
      const validation = FontValidationService.validateFontBuffers(compiledBuffers);
      if (!validation.valid) {
        throw new Error(`Font compilation validation failed: ${validation.errors.join('; ')}`);
      }

      // 7. Save original handwriting sample privately in Supabase Storage
      if (input.sourceFileBase64 && input.sourceFileBase64.includes(';base64,')) {
        const base64Str = input.sourceFileBase64.split(';base64,')[1];
        const sampleBuffer = Buffer.from(base64Str, 'base64');
        const samplePath = `${input.userId}/${generationId}/source-handwriting.png`;

        await supabase.storage.from('fonts').upload(samplePath, sampleBuffer, {
          contentType: 'image/png',
          upsert: true,
        });
      }

      // 8. Upload font binaries to private storage & record generated_files
      await FontStorageService.uploadAndRecordFontFiles(input.userId, generationId, compiledBuffers);

      // 9. Update generation status to completed
      await supabase
        .from('font_generations')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', generationId);

      return {
        success: true,
        generationId,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Handwriting compilation failed.';
      console.error(`Handwriting compilation error for job ${generationId}:`, errorMessage);

      // Mark job as failed
      await supabase
        .from('font_generations')
        .update({
          status: 'failed',
          error_message: errorMessage.substring(0, 300),
          updated_at: new Date().toISOString(),
        })
        .eq('id', generationId);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
