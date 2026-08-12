import { createAdminClient } from '@/lib/supabase/server';
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

  const genRecord = generation as unknown as import('@/types/database').FontGeneration;


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
      const downloadedBuffer = Buffer.from(await downloadedBlob.arrayBuffer());
      let needsRecompile = false;

      // Verify whether stored font has GSUB tables if prompt/category is Devanagari
      const isDevanagariGen =
        genRecord.category === 'Devanagari' ||
        Boolean((genRecord.character_set as unknown as CharacterSetConfig)?.devanagari) ||
        (genRecord.prompt || '').toLowerCase().includes('devanagari') ||
        (genRecord.prompt || '').toLowerCase().includes('hindi');

      if (isDevanagariGen) {
        try {
          const { parse } = await import('opentype.js');
          const arrayBuf = downloadedBuffer.buffer.slice(
            downloadedBuffer.byteOffset,
            downloadedBuffer.byteOffset + downloadedBuffer.byteLength
          );
          const parsed = parse(arrayBuf);
          if (!(parsed.tables as Record<string, unknown>)?.gsub) {
            console.warn(`Stored font ${generationId} lacks GSUB tables. Re-compiling with Devanagari shaping engine...`);
            needsRecompile = true;
          }
        } catch {
          needsRecompile = true;
        }
      }

      if (!needsRecompile) {
        fontBuffer = downloadedBuffer;
      }
    }
  }

  // 3. Fallback: On-demand compilation if storage file is missing or failed
  if (!fontBuffer) {
    try {
      const charSet = (genRecord.character_set as unknown as CharacterSetConfig) || {
        uppercase: true,
        lowercase: true,
        numbers: true,
        punctuation: true,
      };

      const advSettings = (genRecord.advanced_settings as unknown as AdvancedSettingsConfig) || {
        letterSpacing: 0,
        contrast: 'medium',
        cornerStyle: 'sharp',
        strokeStyle: 'solid',
      };

      const { FontTypographyDirector } = await import('@/lib/font/specification/director');
      const { validateFontStyleDNA } = await import('@/lib/font/specification/dnaValidator');

      let dna = genRecord.style_dna
        ? validateFontStyleDNA(genRecord.style_dna, genRecord.prompt)
        : FontTypographyDirector.createFallbackDNA(
            genRecord.prompt,
            genRecord.category,
            genRecord.weight,
            genRecord.width,
            genRecord.style
          );

      if (genRecord.generation_controls) {
        const { GenerationControlsEngine } = await import('@/lib/font/specification/generationControls');
        dna = GenerationControlsEngine.applyGenerationControlsToDNA(
          dna,
          genRecord.generation_controls as unknown as import('@/lib/font/specification/generationControls').GenerationControls
        );
      }

      const legacyStyleSpec = FontTypographyDirector.dnaToLegacyStyleSpec(dna);


      const stemWidth = Math.round(dna.strokeWidth * dna.unitsPerEm);
      const capHeight = Math.round(dna.proportions.capHeight * dna.unitsPerEm);
      const xHeight = Math.round(dna.proportions.xHeight * dna.unitsPerEm);
      const ascender = Math.round(dna.proportions.ascender * dna.unitsPerEm);
      const descender = Math.round(dna.proportions.descender * dna.unitsPerEm);

      const spec: FontSpecification = {
        fontName: genRecord.font_name || 'AIFont',
        category: genRecord.category as FontCategory,
        weight: genRecord.weight as FontWeight,
        width: genRecord.width as FontWidth,
        style: genRecord.style as FontStyle,
        unitsPerEm: dna.unitsPerEm,
        ascender,
        descender,
        capHeight,
        xHeight,
        stemWidth,
        cornerStyle: advSettings.cornerStyle || 'sharp',
        contrast: advSettings.contrast || 'medium',
        strokeStyle: advSettings.strokeStyle || 'solid',
        characterSet: charSet,
        advancedSettings: advSettings,
        designDescription: genRecord.prompt || 'Generated Font',
        prompt: genRecord.prompt,
        styleSpec: legacyStyleSpec,
        styleDNA: dna,
      };

      const compiled = await FontCompilerService.compileFont(spec);


      // Async upload to repair storage record in background
      FontStorageService.uploadAndRecordFontFiles(genRecord.user_id, genRecord.id, compiled).catch((e) =>
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
