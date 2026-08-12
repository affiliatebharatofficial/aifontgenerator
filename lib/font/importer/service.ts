import { createClient } from '@/lib/supabase/server';
import type { ImportedFont, FontLicense } from '@/types/database';
import { validateFontBufferHeader, parseFontBuffer } from './parser';

export async function saveImportedFont(
  userId: string,
  filename: string,
  buffer: Buffer
): Promise<{ success: boolean; fontId?: string; error?: string }> {
  // 1. Header Validation
  const validation = validateFontBufferHeader(buffer);
  if (!validation.isValid || !validation.format) {
    return { success: false, error: validation.error || 'Invalid font file.' };
  }

  const format = validation.format;
  const fontId = crypto.randomUUID();
  const storagePath = `imported-fonts/${userId}/${fontId}/original.${format}`;

  const supabase = await createClient();

  // 2. Upload raw binary to private Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('fonts')
    .upload(storagePath, buffer, {
      contentType: format === 'woff2' ? 'font/woff2' : format === 'woff' ? 'font/woff' : 'font/ttf',
      upsert: true,
    });

  if (uploadError) {
    console.error('Failed to upload imported font to storage:', uploadError.message);
    return { success: false, error: 'Failed to upload font binary to private storage.' };
  }

  // 3. Parse font structure
  let analysis;
  try {
    analysis = parseFontBuffer(buffer, format);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown parsing error';
    // Clean up uploaded file
    await supabase.storage.from('fonts').remove([storagePath]);
    return { success: false, error: `Font parsing failed: ${msg}` };
  }

  // 4. Save metadata to imported_fonts table
  const { data, error: dbError } = await supabase
    .from('imported_fonts')
    .insert({
      id: fontId,
      user_id: userId,
      original_filename: filename,
      format,
      storage_path: storagePath,
      file_size: buffer.length,
      status: 'ready',
      family_name: analysis.familyName || filename.replace(/\.[^/.]+$/, ''),
      subfamily: analysis.subfamily,
      full_name: analysis.fullName,
      postscript_name: analysis.postscriptName,
      version: analysis.version,
      units_per_em: analysis.unitsPerEm,
      glyph_count: analysis.glyphCount,
      ascender: analysis.ascender,
      descender: analysis.descender,
      line_gap: analysis.lineGap,
      extracted_metadata: analysis.extractedMetadata as unknown as import('@/types/database').Json,
      glyph_cmap: analysis.glyphCmap as unknown as import('@/types/database').Json,
      table_records: analysis.tableRecords as unknown as import('@/types/database').Json,
    })
    .select('id')
    .single();

  if (dbError || !data) {
    console.error('Failed to save imported font DB record:', dbError?.message);
    await supabase.storage.from('fonts').remove([storagePath]);
    return { success: false, error: 'Failed to save font record to database.' };
  }

  return { success: true, fontId: data.id };
}

export async function getUserImportedFonts(userId: string): Promise<ImportedFont[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('imported_fonts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return (data as unknown as ImportedFont[]) ?? [];
}

export async function getImportedFontDetails(
  fontId: string,
  userId: string
): Promise<{ font: ImportedFont | null; license: FontLicense | null }> {
  const supabase = await createClient();

  const { data: fontData } = await supabase
    .from('imported_fonts')
    .select('*')
    .eq('id', fontId)
    .eq('user_id', userId)
    .single();

  if (!fontData) {
    return { font: null, license: null };
  }

  const { data: licenseData } = await supabase
    .from('font_licenses')
    .select('*')
    .eq('font_id', fontId)
    .maybeSingle();

  return {
    font: fontData as unknown as ImportedFont,
    license: (licenseData as unknown as FontLicense | null) ?? null,
  };
}

export async function updateFontLicense(
  fontId: string,
  userId: string,
  licenseName: string,
  licenseUrl: string,
  licenseNotes: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Ownership check
  const { data: font } = await supabase
    .from('imported_fonts')
    .select('id')
    .eq('id', fontId)
    .eq('user_id', userId)
    .single();

  if (!font) return { success: false, error: 'Font not found.' };

  const { error } = await supabase.from('font_licenses').upsert(
    {
      font_id: fontId,
      license_name: licenseName.trim() || null,
      license_url: licenseUrl.trim() || null,
      license_notes: licenseNotes.trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'font_id' }
  );

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteImportedFont(
  fontId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Ownership check
  const { data: font } = await supabase
    .from('imported_fonts')
    .select('id, storage_path')
    .eq('id', fontId)
    .eq('user_id', userId)
    .single();

  if (!font) return { success: false, error: 'Font not found.' };

  // Remove storage file
  if (font.storage_path) {
    await supabase.storage.from('fonts').remove([font.storage_path]);
  }

  // Delete DB record
  const { error } = await supabase
    .from('imported_fonts')
    .delete()
    .eq('id', fontId)
    .eq('user_id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
