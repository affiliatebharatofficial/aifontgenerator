'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { FontFileFormat } from '@/types/database';

export interface DownloadUrlResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

export async function getFontDownloadUrlAction(
  generationId: string,
  format: FontFileFormat
): Promise<DownloadUrlResult> {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized.' };
  }

  // 2. Verify generation ownership
  const { data: generation } = await supabase
    .from('font_generations')
    .select('id, user_id, font_name, status')
    .eq('id', generationId)
    .eq('user_id', user.id)
    .single();

  if (!generation) {
    return { success: false, error: 'Generation not found.' };
  }

  // 3. Verify format record in generated_files table, or compile on demand if missing
  let { data: fileRecord } = await supabase
    .from('generated_files')
    .select('id, storage_path, download_count')
    .eq('generation_id', generationId)
    .eq('format', format)
    .single();

  if (!fileRecord || generation.status !== 'completed') {
    try {
      const { GenerationJobService } = await import('@/lib/font/generation/jobProcessor');
      await GenerationJobService.processJob(generationId);

      const { data: reFetched } = await supabase
        .from('generated_files')
        .select('id, storage_path, download_count')
        .eq('generation_id', generationId)
        .eq('format', format)
        .single();
      fileRecord = reFetched;
    } catch (e) {
      console.error('Failed to compile font on download demand:', e);
    }
  }

  if (!fileRecord) {
    return { success: false, error: `Requested ${format.toUpperCase()} format could not be generated.` };
  }

  await (supabase.from('generated_files') as unknown as {
    update: (data: { download_count: number }) => {
      eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
    };
  })
    .update({ download_count: (fileRecord.download_count || 0) + 1 })
    .eq('id', fileRecord.id);

  // Sanitize filename
  const fontNameRaw = generation.font_name || 'AIFont';
  const cleanFontName = fontNameRaw.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanFontName}.${format}`;

  // 5. Generate short-lived signed URL (valid 300 seconds) with download disposition
  const { data: signedData, error: signedError } = await supabase.storage
    .from('fonts')
    .createSignedUrl(fileRecord.storage_path, 300, {
      download: filename,
    });

  if (!signedError && signedData?.signedUrl) {
    return {
      success: true,
      url: signedData.signedUrl,
      filename,
    };
  }

  // Fallback to public storage URL if signed URL fails
  const { data: publicData } = supabase.storage
    .from('fonts')
    .getPublicUrl(fileRecord.storage_path);

  if (publicData?.publicUrl) {
    return {
      success: true,
      url: publicData.publicUrl,
      filename,
    };
  }

  return { success: false, error: 'Failed to generate secure download link.' };
}

export async function deleteFontGenerationAction(generationId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized.' };
  }

  // 2. Verify generation ownership
  const { data: generation } = await supabase
    .from('font_generations')
    .select('id, user_id')
    .eq('id', generationId)
    .eq('user_id', user.id)
    .single();

  if (!generation) {
    return { success: false, error: 'Generation record not found or unauthorized.' };
  }

  // 3. Fetch storage paths for associated generated files
  const { data: files } = await supabase
    .from('generated_files')
    .select('storage_path')
    .eq('generation_id', generationId);

  if (files && files.length > 0) {
    const paths = files.map((f) => f.storage_path);
    // Delete files from private Supabase Storage
    const { error: storageError } = await supabase.storage.from('fonts').remove(paths);
    if (storageError) {
      console.warn('Storage file deletion warning:', storageError.message);
    }
  }

  // 4. Delete font_generations record (Cascades generated_files rows via ON DELETE CASCADE)
  const { error: deleteError } = await supabase
    .from('font_generations')
    .delete()
    .eq('id', generationId)
    .eq('user_id', user.id);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/my-fonts');
  redirect('/dashboard/my-fonts');
}
