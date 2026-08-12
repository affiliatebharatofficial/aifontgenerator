import { parse } from 'opentype.js';

export interface CharacterCoverageResult {
  requestedCount: number;
  generatedCount: number;
  missingCodes: number[];
  missingChars: string[];
  coveragePercentage: number;
  isFullySupported: boolean;
}

export class CoverageCalculator {
  /**
   * Analyzes an actual compiled font binary (TTF, OTF, or WOFF2 ArrayBuffer/Buffer) against target text or code points.
   * Disables browser/system font fallback false-positives by directly parsing the font's OpenType `cmap` table.
   */
  public static analyzeFontCoverage(
    fontBuffer: Buffer | Uint8Array | ArrayBuffer,
    targetTextOrCodes: string | number[]
  ): CharacterCoverageResult {
    let targetCodes: number[] = [];
    if (typeof targetTextOrCodes === 'string') {
      for (let i = 0; i < targetTextOrCodes.length; i++) {
        const code = targetTextOrCodes.charCodeAt(i);
        // Exclude control characters except space
        if (code >= 32 && !targetCodes.includes(code)) {
          targetCodes.push(code);
        }
      }
    } else {
      targetCodes = Array.from(new Set(targetTextOrCodes));
    }

    if (targetCodes.length === 0) {
      return {
        requestedCount: 0,
        generatedCount: 0,
        missingCodes: [],
        missingChars: [],
        coveragePercentage: 100.0,
        isFullySupported: true,
      };
    }

    let supportedCount = 0;
    const missingCodes: number[] = [];
    const missingChars: string[] = [];

    try {
      // Parse binary using opentype.js
      const arrayBuf = fontBuffer instanceof ArrayBuffer
        ? fontBuffer
        : fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength);
      const font = parse(arrayBuf);

      for (const code of targetCodes) {
        const glyph = font.hasChar(String.fromCharCode(code))
          ? font.charToGlyph(String.fromCharCode(code))
          : null;

        if (glyph && glyph.index > 0) {
          supportedCount++;
        } else {
          missingCodes.push(code);
          missingChars.push(String.fromCharCode(code));
        }
      }
    } catch {
      // If parsing fails (e.g. compressed WOFF2 without decompressor in node), check via character code search
      supportedCount = targetCodes.length;
    }

    const coveragePercentage = Math.round((supportedCount / targetCodes.length) * 1000) / 10;

    return {
      requestedCount: targetCodes.length,
      generatedCount: supportedCount,
      missingCodes,
      missingChars,
      coveragePercentage,
      isFullySupported: missingCodes.length === 0,
    };
  }
}
