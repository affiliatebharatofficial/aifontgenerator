import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { FontCompilerService } from '@/lib/font/compiler/fontCompiler';
import { FontStorageService } from '@/lib/font/storage/fontStorage';
import type { FontSpecification } from '@/lib/font/specification/types';
import type {
  FontCategory,
  FontWeight,
  FontWidth,
  FontStyle,
  CharacterSetConfig,
  AdvancedSettingsConfig,
} from '@/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ generationId: string }> }
) {
  const { generationId } = await params;
  const adminClient = await createAdminClient();
  const formatParam = (request.nextUrl.searchParams.get('format') || 'woff2').toLowerCase();
  const targetFormat: 'woff2' | 'ttf' | 'otf' = ['ttf', 'woff2', 'otf'].includes(formatParam)
    ? (formatParam as 'woff2' | 'ttf' | 'otf')
    : 'woff2';

  // 1. Fetch generation metadata
  const { data: generation, error: genError } = await adminClient
    .from('font_generations')
    .select('*')
    .eq('id', generationId)
    .maybeSingle();

  if (genError || !generation) {
    return new NextResponse('Font generation not found', { status: 404 });
  }

  // 2. Try fetching existing compiled file record
  const { data: fileRecord } = await adminClient
    .from('generated_files')
    .select('storage_path, format')
    .eq('generation_id', generationId)
    .eq('format', targetFormat)
    .maybeSingle();

  let fontBuffer: Buffer | null = null;

  if (fileRecord?.storage_path) {
    const { data: downloadedBlob, error: downloadError } = await adminClient.storage
      .from('fonts')
      .download(fileRecord.storage_path);

    if (!downloadError && downloadedBlob) {
      fontBuffer = Buffer.from(await downloadedBlob.arrayBuffer());
    }
  }

  // 3. Fallback: On-demand compilation if storage file is missing or failed
  if (!fontBuffer) {
    try {
      const charSet = (generation.character_set as unknown as CharacterSetConfig) || {
        uppercase: true,
        lowercase: true,
        numbers: true,
        punctuation: true,
      };

      const advSettings = (generation.advanced_settings as unknown as AdvancedSettingsConfig) || {
        letterSpacing: 0,
        contrast: 'medium',
        cornerStyle: 'sharp',
        strokeStyle: 'solid',
      };

      let stemWidth = 80;
      if (generation.weight === 'Thin' || generation.weight === 'Extra Light') stemWidth = 40;
      if (generation.weight === 'Light') stemWidth = 60;
      if (generation.weight === 'Medium') stemWidth = 100;
      if (generation.weight === 'Semi Bold') stemWidth = 130;
      if (generation.weight === 'Bold') stemWidth = 160;
      if (generation.weight === 'Extra Bold' || generation.weight === 'Black') stemWidth = 190;

      const spec: FontSpecification = {
        fontName: generation.font_name || 'AIFont',
        category: generation.category as FontCategory,
        weight: generation.weight as FontWeight,
        width: generation.width as FontWidth,
        style: generation.style as FontStyle,
        unitsPerEm: 1000,
        ascender: 800,
        descender: -200,
        capHeight: 700,
        xHeight: 500,
        stemWidth,
        cornerStyle: advSettings.cornerStyle || 'sharp',
        contrast: advSettings.contrast || 'medium',
        strokeStyle: advSettings.strokeStyle || 'solid',
        characterSet: charSet,
        advancedSettings: advSettings,
        designDescription: generation.prompt || 'Generated Font',
        prompt: generation.prompt,
      };

      const compiled = await FontCompilerService.compileFont(spec);

      // Async upload to repair storage record in background
      FontStorageService.uploadAndRecordFontFiles(generation.user_id, generation.id, compiled).catch((e) =>
        console.warn('Background storage repair warning:', e)
      );

      fontBuffer = compiled[targetFormat] || compiled.woff2 || compiled.ttf;
    } catch (compileErr) {
      console.error('On-demand font compilation failed:', compileErr);
      return new NextResponse('Failed to compile or retrieve font binary', { status: 500 });
    }
  }

  const mimeTypeMap: Record<string, string> = {
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    otf: 'font/otf',
  };

  const mimeType = mimeTypeMap[targetFormat] || 'application/octet-stream';

  return new NextResponse(new Uint8Array(fontBuffer), {
    headers: {
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
