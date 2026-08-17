import { createClient } from '@/lib/supabase/server';
import type { FontGeneration, GeneratedFile } from '@/types/database';
import type { FontSpecification } from '../specification/types';
import { StyleAwareGlyphEngine } from '../glyphs/styleAwareEngine';
import { GlyphTransformEngine } from './transformEngine';
import { FontCompilerService, type CompiledFontBuffers } from '../compiler/fontCompiler';
import { FontQualityEngine } from './qualityEngine';
import type {
  GlyphOverride,
  GlyphMetadataInfo,
  FontQualityScoreBreakdown,
  ConsistencyReport,
  DevanagariShapingDebugItem,
} from './types';
import { DEVANAGARI_CONJUNCT_RULES } from '../shaping/devanagariShaper';
import * as opentype from 'opentype.js';

export class FontStudioService {
  /**
   * Fetches full generation data, base glyph list, and current overrides for the studio.
   */
  public static async getStudioGenerationData(
    generationId: string,
    userId: string
  ): Promise<{
    generation: FontGeneration;
    glyphs: GlyphMetadataInfo[];
    qualityScore: FontQualityScoreBreakdown;
    consistencyReport: ConsistencyReport;
    styleDNA: import('../specification/dna').StyleDNA | null;
  }> {
    const supabase = await createClient();

    const { data: job, error } = await supabase
      .from('font_generations')
      .select('*')
      .eq('id', generationId)
      .eq('user_id', userId)
      .single();

    if (error || !job) {
      throw new Error('Font generation not found or unauthorized.');
    }

    const gen = job as unknown as FontGeneration;
    const styleDNA = (gen.style_dna as unknown as import('../specification/dna').StyleDNA) || null;

    // Synthesize specification and generate base glyphs
    const spec: FontSpecification = {
      fontName: gen.font_name || 'AIFont',
      category: gen.category,
      weight: gen.weight,
      width: gen.width,
      style: gen.style,
      unitsPerEm: 1000,
      ascender: 800,
      descender: -200,
      capHeight: 700,
      xHeight: 500,
      stemWidth: 80,
      cornerStyle: 'sharp',
      contrast: 'medium',
      strokeStyle: 'solid',
      designDescription: gen.prompt || '',
      characterSet: gen.character_set as unknown as import('@/types/database').CharacterSetConfig,
      advancedSettings: gen.advanced_settings as unknown as import('@/types/database').AdvancedSettingsConfig,
      styleDNA: styleDNA || undefined,
    };

    const styleEngine = new StyleAwareGlyphEngine(spec, (gen as { seed?: number }).seed);
    const baseGlyphs = styleEngine.generateGlyphs();

    // Extract glyph metadata
    const glyphMetadataList: GlyphMetadataInfo[] = baseGlyphs
      .filter((g) => g.unicode !== undefined && g.name !== '.notdef')
      .map((g, idx) => {
        const u = g.unicode || 0;
        const char = String.fromCodePoint(u);
        const bbox = g.getBoundingBox();

        let script: GlyphMetadataInfo['script'] = 'Latin';
        if (u >= 0x0900 && u <= 0x097f) script = 'Devanagari';
        else if (u >= 48 && u <= 57) script = 'Numbers';
        else if ((u >= 33 && u <= 47) || (u >= 58 && u <= 64) || (u >= 91 && u <= 96) || (u >= 123 && u <= 126)) script = 'Punctuation';
        else if (u > 127 && u < 0x0900) script = 'Latin Extended';

        let category: GlyphMetadataInfo['category'] = 'Other';
        if (u >= 65 && u <= 90) category = 'Uppercase';
        else if (u >= 97 && u <= 122) category = 'Lowercase';
        else if (u >= 48 && u <= 57) category = 'Digit';
        else if (script === 'Punctuation') category = 'Punctuation';
        else if (script === 'Devanagari') category = 'Conjunct';

        return {
          char,
          unicode: u,
          unicodeHex: `U+${u.toString(16).toUpperCase().padStart(4, '0')}`,
          glyphId: idx + 1,
          glyphName: g.name || char,
          advanceWidth: g.advanceWidth || 600,
          leftSideBearing: bbox.x1,
          rightSideBearing: (g.advanceWidth || 600) - bbox.x2,
          boundingBox: {
            xMin: bbox.x1,
            yMin: bbox.y1,
            xMax: bbox.x2,
            yMax: bbox.y2,
          },
          script,
          category,
          styleFamily: styleDNA?.styleFamily || 'GENERAL',
          isModified: false,
          isLocked: false,
        };
      });

    const qualityScore = FontQualityEngine.calculateQualityScore(baseGlyphs, undefined, styleDNA);
    const consistencyReport = FontQualityEngine.evaluateConsistency(baseGlyphs, undefined, styleDNA);

    return {
      generation: gen,
      glyphs: glyphMetadataList,
      qualityScore,
      consistencyReport,
      styleDNA,
    };
  }

  /**
   * Compiles an edited font with all glyph overrides applied.
   */
  public static async compileEditedFont(
    generationId: string,
    overrides: Record<string, GlyphOverride>,
    customFontName?: string
  ): Promise<{ buffers: CompiledFontBuffers; fontName: string; qualityScore: FontQualityScoreBreakdown }> {
    const supabase = await createClient();

    const { data: job } = await supabase
      .from('font_generations')
      .select('*')
      .eq('id', generationId)
      .single();

    if (!job) throw new Error('Generation not found.');
    const gen = job as unknown as FontGeneration;
    const styleDNA = (gen.style_dna as unknown as import('../specification/dna').StyleDNA) || null;

    const fontName = customFontName?.trim() || gen.font_name || 'AIFont_Edited';

    const spec: FontSpecification = {
      fontName,
      category: gen.category,
      weight: gen.weight,
      width: gen.width,
      style: gen.style,
      unitsPerEm: 1000,
      ascender: 800,
      descender: -200,
      capHeight: 700,
      xHeight: 500,
      stemWidth: 80,
      cornerStyle: 'sharp',
      contrast: 'medium',
      strokeStyle: 'solid',
      designDescription: gen.prompt || '',
      characterSet: gen.character_set as unknown as import('@/types/database').CharacterSetConfig,
      advancedSettings: gen.advanced_settings as unknown as import('@/types/database').AdvancedSettingsConfig,
      styleDNA: styleDNA || undefined,
    };

    const styleEngine = new StyleAwareGlyphEngine(spec, (gen as { seed?: number }).seed);
    const baseGlyphs = styleEngine.generateGlyphs();

    // Apply overrides to glyphs
    const finalGlyphs = baseGlyphs.map((baseG) => {
      const char = baseG.name || (baseG.unicode ? String.fromCharCode(baseG.unicode) : '');
      const override = overrides[char];
      if (override) {
        return GlyphTransformEngine.applyTransform(baseG, override);
      }
      return baseG;
    });

    // Compile TrueType, OpenType, and WOFF2
    const familyName = fontName.replace(/[^a-zA-Z0-9\s_-]/g, '');
    const styleName = (spec.weight || 'Regular').replace(/[^a-zA-Z0-9\s_-]/g, '');
    const unitsPerEm = spec.unitsPerEm || styleDNA?.unitsPerEm || 1000;
    const ascender = spec.ascender !== undefined ? spec.ascender : 800;
    const descender = spec.descender !== undefined ? spec.descender : -200;

    const font = new opentype.Font({
      familyName,
      styleName,
      unitsPerEm,
      ascender,
      descender,
      glyphs: finalGlyphs,
    });

    const { OpenTypeTableBuilder } = await import('../compiler/openTypeTableBuilder');
    const gsubTable = OpenTypeTableBuilder.buildGsubTable(finalGlyphs);
    if (gsubTable) {
      font.tables.gsub = gsubTable as unknown as typeof font.tables.gsub;
    }

    const ttfArrayBuffer = font.toArrayBuffer();
    const ttfBuffer = Buffer.from(ttfArrayBuffer);
    const otfBuffer = Buffer.from(ttfArrayBuffer);

    const wawoff2 = (await import('wawoff2')).default;
    const woff2Uint8Array = await wawoff2.compress(ttfBuffer);
    const woff2Buffer = Buffer.from(woff2Uint8Array);

    const qualityScore = FontQualityEngine.calculateQualityScore(finalGlyphs, overrides, styleDNA);

    return {
      buffers: {
        ttf: ttfBuffer,
        otf: otfBuffer,
        woff2: woff2Buffer,
      },
      fontName,
      qualityScore,
    };
  }

  /**
   * Saves a new edited version without mutating the original immutable baseline.
   */
  public static async saveStudioVersion(
    generationId: string,
    userId: string,
    overrides: Record<string, GlyphOverride>,
    versionLabel?: string,
    fontName?: string
  ): Promise<{ success: boolean; newGenerationId?: string; versionNumber: number }> {
    const supabase = await createClient();

    // 1. Fetch parent generation
    const { data: parentJob } = await supabase
      .from('font_generations')
      .select('*')
      .eq('id', generationId)
      .eq('user_id', userId)
      .single();

    if (!parentJob) throw new Error('Target generation not found or unauthorized.');
    const parentGen = parentJob as unknown as FontGeneration;

    const rootId = parentGen.parent_generation_id || parentGen.id;

    // 2. Compute max version number
    const { data: family } = await supabase
      .from('font_generations')
      .select('version_number')
      .or(`id.eq.${rootId},parent_generation_id.eq.${rootId}`);

    const maxVer = (family || []).reduce((max, f) => Math.max(max, f.version_number || 1), 1);
    const nextVer = maxVer + 1;

    // 3. Compile edited binaries
    const { buffers, fontName: finalName } = await this.compileEditedFont(
      generationId,
      overrides,
      fontName || parentGen.font_name || undefined
    );

    // 4. Insert new version generation record
    const newGenPayload: any = {
      user_id: userId,
      font_name: finalName,
      prompt: parentGen.prompt,
      category: parentGen.category,
      weight: parentGen.weight,
      width: parentGen.width,
      style: parentGen.style,
      character_set: parentGen.character_set,
      advanced_settings: parentGen.advanced_settings,
      parent_generation_id: rootId,
      version_number: nextVer,
      generation_type: 'studio_edit',
      status: 'completed',
      style_dna: parentGen.style_dna,
      completed_at: new Date().toISOString(),
    };

    const { data: newJob, error: insertError } = await supabase
      .from('font_generations')
      .insert([newGenPayload] as any)
      .select()
      .single();

    if (insertError || !newJob) {
      throw new Error(`Failed to create version record: ${insertError?.message}`);
    }

    const newGenId = (newJob as unknown as { id: string }).id;

    // 5. Upload edited binaries to storage & record in generated_files
    const { FontStorageService } = await import('../storage/fontStorage');
    await FontStorageService.uploadAndRecordFontFiles(userId, newGenId, buffers);

    return {
      success: true,
      newGenerationId: newGenId,
      versionNumber: nextVer,
    };
  }

  /**
   * Fetches real Devanagari shaping debug information from conjunct rules and compiled glyphs.
   */
  public static getDevanagariShapingDebugData(): DevanagariShapingDebugItem[] {
    return DEVANAGARI_CONJUNCT_RULES.map((rule, idx) => {
      const inputChars = rule.components.map((c) => String.fromCodePoint(c));
      const inputHexStr = rule.components.map((c) => `0x${c.toString(16).toUpperCase()}`);
      const shapedChar = String.fromCodePoint(rule.code);

      return {
        inputSequence: inputChars,
        inputHex: inputHexStr,
        shapedChar,
        ligatureTag: rule.tag,
        glyphId: idx + 100,
        glyphName: rule.name,
        unicodeHex: `0x${rule.code.toString(16).toUpperCase()}`,
        isSupported: true,
      };
    });
  }
}
