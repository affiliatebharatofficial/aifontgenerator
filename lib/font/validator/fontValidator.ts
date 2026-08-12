import { parse } from 'opentype.js';
import type { CompiledFontBuffers } from '../compiler/fontCompiler';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class FontValidationService {
  /**
   * Validates compiled TTF, OTF, and WOFF2 font binaries for structural integrity.
   */
  public static validateFontBuffers(buffers: CompiledFontBuffers): ValidationResult {
    const errors: string[] = [];

    // 1. TTF / SFNT Binary Validation (Accepts TrueType 0x00010000 / 'true' or OpenType 'OTTO')
    if (!buffers.ttf || buffers.ttf.length < 500) {
      errors.push(`TTF buffer size is too small (${buffers.ttf?.length || 0} bytes).`);
    } else {
      const sfntVersion = buffers.ttf.readUInt32BE(0);
      const isValidSFNT =
        sfntVersion === 0x00010000 || sfntVersion === 0x74727565 || sfntVersion === 0x4f54544f;
      if (!isValidSFNT) {
        errors.push(`Invalid TTF/SFNT magic version: 0x${sfntVersion.toString(16)}`);
      }
    }

    // 2. OTF Binary Validation
    if (!buffers.otf || buffers.otf.length < 500) {
      errors.push(`OTF buffer size is too small (${buffers.otf?.length || 0} bytes).`);
    } else {
      const sfntVersion = buffers.otf.readUInt32BE(0);
      const isValidOTF =
        sfntVersion === 0x4f54544f || sfntVersion === 0x00010000 || sfntVersion === 0x74727565;
      if (!isValidOTF) {
        errors.push(`Invalid OTF magic version: 0x${sfntVersion.toString(16)}`);
      }
    }

    // 3. WOFF2 Binary Validation (Magic signature 'wOF2')
    if (!buffers.woff2 || buffers.woff2.length < 200) {
      errors.push(`WOFF2 buffer size is too small (${buffers.woff2?.length || 0} bytes).`);
    } else {
      const signature = buffers.woff2.toString('ascii', 0, 4);
      if (signature !== 'wOF2') {
        errors.push(`Invalid WOFF2 signature header: "${signature}" (expected "wOF2")`);
      }
    }

    // 4. OpenType Table Parser Integrity Check
    try {
      const arrayBuffer = buffers.ttf.buffer.slice(
        buffers.ttf.byteOffset,
        buffers.ttf.byteOffset + buffers.ttf.byteLength
      );
      const parsedFont = parse(arrayBuffer);

      if (!parsedFont.glyphs || parsedFont.glyphs.length === 0) {
        errors.push('Parsed font contains 0 glyphs.');
      } else {
        // 4a. Validate unitsPerEm
        if (parsedFont.unitsPerEm !== 1000) {
          errors.push(`Invalid unitsPerEm: ${parsedFont.unitsPerEm} (expected 1000).`);
        }

        // 4b. Validate cmap table
        if (!parsedFont.tables.cmap) {
          errors.push('Missing OpenType cmap character map table.');
        }

        // 4c. Validate space glyph
        const spaceGlyph = parsedFont.charToGlyph(' ');
        if (!spaceGlyph || !spaceGlyph.advanceWidth || spaceGlyph.advanceWidth <= 0) {
          errors.push('Invalid or missing space glyph advance width.');
        }

        // 4d. Validate glyph coordinate bounds
        for (let i = 0; i < parsedFont.glyphs.length; i++) {
          const g = parsedFont.glyphs.get(i);
          if (g && g.path && g.path.commands) {
            for (const rawCmd of g.path.commands) {
              const cmd = rawCmd as Record<string, unknown>;
              if (typeof cmd.x === 'number' && (!Number.isFinite(cmd.x) || Number.isNaN(cmd.x))) {
                errors.push(`Glyph "${g.name}" contains non-finite X coordinate.`);
                break;
              }
              if (typeof cmd.y === 'number' && (!Number.isFinite(cmd.y) || Number.isNaN(cmd.y))) {
                errors.push(`Glyph "${g.name}" contains non-finite Y coordinate.`);
                break;
              }
            }
          }
        }

      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`OpenType font parser failed to parse font buffer: ${msg}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

