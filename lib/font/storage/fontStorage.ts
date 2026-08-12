import { createAdminClient, createClient } from '@/lib/supabase/server';
import type { CompiledFontBuffers } from '../compiler/fontCompiler';

export interface UploadResult {
  format: 'ttf' | 'otf' | 'woff2';
  storagePath: string;
  fileSize: number;
}

export class FontStorageService {
  /**
   * Uploads validated TTF, OTF, and WOFF2 buffers to private Supabase Storage
   * under `fonts/{userId}/{generationId}/font.{ext}` and inserts records in `generated_files`.
   */
  public static async uploadAndRecordFontFiles(
    userId: string,
    generationId: string,
    buffers: CompiledFontBuffers
  ): Promise<UploadResult[]> {
    const supabase = await createAdminClient();
    const bucketName = 'fonts';

    const formats: Array<{ ext: 'ttf' | 'otf' | 'woff2'; buffer: Buffer; mime: string }> = [
      { ext: 'ttf', buffer: buffers.ttf, mime: 'font/ttf' },
      { ext: 'otf', buffer: buffers.otf, mime: 'font/otf' },
      { ext: 'woff2', buffer: buffers.woff2, mime: 'font/woff2' },
    ];

    const results: UploadResult[] = [];

    for (const item of formats) {
      const storagePath = `${userId}/${generationId}/font.${item.ext}`;

      // Upload binary buffer to Supabase Storage
      let { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(storagePath, item.buffer, {
          contentType: item.mime,
          upsert: true,
        });

      if (uploadError && (uploadError.message.includes('Bucket not found') || uploadError.message.includes('NoSuchBucket'))) {
        try {
          await supabase.storage.createBucket(bucketName, { public: true });
          const { error: retryErr } = await supabase.storage
            .from(bucketName)
            .upload(storagePath, item.buffer, {
              contentType: item.mime,
              upsert: true,
            });
          uploadError = retryErr;
        } catch {
          // Ignore bucket creation error if handled via SQL
        }
      }

      if (uploadError) {
        console.warn(`Supabase Storage upload warning for ${item.ext}:`, uploadError.message);
      }

      // Record entry in public.generated_files table
      const fileSize = item.buffer.length;
      const { error: dbError } = await supabase
        .from('generated_files')
        .upsert(
          {
            generation_id: generationId,
            format: item.ext,
            storage_path: storagePath,
            file_size: fileSize,
          },
          { onConflict: 'generation_id, format' }
        );

      if (dbError) {
        console.error(`Failed to record generated_file entry for ${item.ext}:`, dbError.message);
      }

      results.push({
        format: item.ext,
        storagePath,
        fileSize,
      });
    }

    return results;
  }
}
