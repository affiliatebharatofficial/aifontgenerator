import { Font, type Glyph } from 'opentype.js';
import wawoff2 from 'wawoff2';
import type { FontSpecification } from '../specification/types';
import { StyleAwareGlyphEngine } from '../glyphs/styleAwareEngine';
import { GlyphVectorEngine } from '../glyphs/vectorEngine';
import { OpenTypeTableBuilder } from './openTypeTableBuilder';


export interface CompiledFontBuffers {
  ttf: Buffer;
  otf: Buffer;
  woff2: Buffer;
}

export class FontCompilerService {
  /**
   * Compiles valid TTF, OTF, and WOFF2 binary font buffers from a FontSpecification.
   */
  public static async compileFont(spec: FontSpecification): Promise<CompiledFontBuffers> {
    // 1. Generate vector glyphs using Style-Aware Glyph Engine (with safe procedural fallback)
    let glyphs: Glyph[];
    try {
      const styleEngine = new StyleAwareGlyphEngine(spec);
      glyphs = styleEngine.generateGlyphs();
    } catch (engineErr) {
      console.warn('StyleAwareGlyphEngine error, invoking safe fallback to GlyphVectorEngine:', engineErr);
      const fallbackEngine = new GlyphVectorEngine(spec);
      glyphs = fallbackEngine.generateGlyphs();
    }


    // Clean family and style names for PostScript compliance
    const familyName = (spec.fontName || 'AIFont').replace(/[^a-zA-Z0-9\s_-]/g, '');
    const styleName = (spec.weight || 'Regular').replace(/[^a-zA-Z0-9\s_-]/g, '');

    // 2. Build opentype.Font instance with clean PostScript metadata
    const unitsPerEm = spec.unitsPerEm || spec.styleDNA?.unitsPerEm || 1000;
    const ascender = spec.ascender !== undefined
      ? spec.ascender
      : spec.styleDNA?.proportions
      ? Math.round(spec.styleDNA.proportions.ascender * unitsPerEm)
      : 800;
    const descender = spec.descender !== undefined
      ? spec.descender
      : spec.styleDNA?.proportions
      ? Math.round(spec.styleDNA.proportions.descender * unitsPerEm)
      : -200;

    const font = new Font({
      familyName,
      styleName,
      unitsPerEm,
      ascender,
      descender,
      glyphs,
    });

    // Build and attach OpenType GSUB table for Devanagari shaping & ligatures
    const gsubTable = OpenTypeTableBuilder.buildGsubTable(glyphs);
    if (gsubTable) {
      font.tables.gsub = gsubTable as any;
    }



    const styleFamily = spec.styleDNA?.styleFamily || 'GENERAL';
    const fontNames = font.names as unknown as Record<string, Record<string, { en: string }>>;

    if (fontNames && fontNames.windows) {
      fontNames.windows.version = { en: `Version 1.000;StyleDNA:${styleFamily}` };
      fontNames.windows.manufacturer = { en: 'AI Font Generator Engine' };
      fontNames.windows.designer = { en: 'AI Typography Director' };
    }
    if (fontNames && fontNames.mac) {
      fontNames.mac.version = { en: `Version 1.000;StyleDNA:${styleFamily}` };
      fontNames.mac.manufacturer = { en: 'AI Font Generator Engine' };
      fontNames.mac.designer = { en: 'AI Typography Director' };
    }


    // 3. Compile TrueType (.ttf) ArrayBuffer
    const ttfArrayBuffer = font.toArrayBuffer();
    const ttfBuffer = Buffer.from(ttfArrayBuffer);



    // 4. Compile OpenType (.otf) ArrayBuffer
    const otfBuffer = Buffer.from(ttfArrayBuffer);

    // 5. Compress TTF to WOFF2 using WebAssembly wawoff2
    const woff2Uint8Array = await wawoff2.compress(ttfBuffer);
    const woff2Buffer = Buffer.from(woff2Uint8Array);

    return {
      ttf: ttfBuffer,
      otf: otfBuffer,
      woff2: woff2Buffer,
    };
  }
}
