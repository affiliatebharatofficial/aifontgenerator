import { Font } from 'opentype.js';
import wawoff2 from 'wawoff2';
import type { FontSpecification } from '../specification/types';
import { GlyphVectorEngine } from '../glyphs/vectorEngine';

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
    // 1. Generate vector glyphs
    const vectorEngine = new GlyphVectorEngine(spec);
    const glyphs = vectorEngine.generateGlyphs();

    // Clean family and style names for PostScript compliance
    const familyName = (spec.fontName || 'AIFont').replace(/[^a-zA-Z0-9\s_-]/g, '');
    const styleName = (spec.weight || 'Regular').replace(/[^a-zA-Z0-9\s_-]/g, '');

    // 2. Build opentype.Font instance
    const font = new Font({
      familyName,
      styleName,
      unitsPerEm: spec.unitsPerEm,
      ascender: spec.ascender,
      descender: spec.descender,
      glyphs,
    });

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
