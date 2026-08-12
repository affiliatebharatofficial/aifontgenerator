import * as opentype from 'opentype.js';
import type { ParsedFontAnalysis, FontImportValidationResult, SupportedImportFormat } from './types';
import { MAX_IMPORT_FILE_SIZE_BYTES } from './types';

/**
 * Validates raw font binary buffer magic header bytes
 */
export function validateFontBufferHeader(buffer: Buffer): FontImportValidationResult {
  if (!buffer || buffer.length < 4) {
    return { isValid: false, error: 'File is empty or corrupted.' };
  }

  if (buffer.length > MAX_IMPORT_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size exceeds maximum allowed import limit of ${MAX_IMPORT_FILE_SIZE_BYTES / (1024 * 1024)}MB.`,
    };
  }

  const magicNum = buffer.readUInt32BE(0);

  // 0x00010000 or 'true' (0x74727565) -> TTF
  if (magicNum === 0x00010000 || magicNum === 0x74727565) {
    return { isValid: true, format: 'ttf' };
  }
  // 'OTTO' (0x4F54544F) -> OTF
  if (magicNum === 0x4f54544f) {
    return { isValid: true, format: 'otf' };
  }
  // 'wOFF' (0x774F4646) -> WOFF
  if (magicNum === 0x774f4646) {
    return { isValid: true, format: 'woff' };
  }
  // 'wOF2' (0x774F4632) -> WOFF2
  if (magicNum === 0x774f4632) {
    return { isValid: true, format: 'woff2' };
  }

  return {
    isValid: false,
    error: 'Unsupported or corrupted font file format. Supported formats: TTF, OTF, WOFF, WOFF2.',
  };
}

function getLocalizedStr(nameObj: unknown): string | null {
  if (!nameObj) return null;
  if (typeof nameObj === 'string') return nameObj;
  if (typeof nameObj === 'object') {
    const obj = nameObj as Record<string, string>;
    return obj.en || Object.values(obj)[0] || null;
  }
  return null;
}

/**
 * Server-side font parser extracting real OpenType/TrueType binary metadata & unicode character map
 */
export function parseFontBuffer(buffer: Buffer, format: SupportedImportFormat): ParsedFontAnalysis {
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

  let font: opentype.Font;
  try {
    font = opentype.parse(arrayBuffer);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown parsing error';
    throw new Error(`Failed to parse OpenType font structure: ${msg}`);
  }

  const names = (font.names as unknown as Record<string, unknown>) || {};

  const familyName = getLocalizedStr(names.fontFamily) || getLocalizedStr(names.preferredFamily);
  const subfamily = getLocalizedStr(names.fontSubfamily) || getLocalizedStr(names.preferredSubfamily);
  const fullName = getLocalizedStr(names.fullName);
  const postscriptName = getLocalizedStr(names.postScriptName);
  const version = getLocalizedStr(names.version);

  const unitsPerEm = font.unitsPerEm || 1000;
  const ascender = font.ascender || 800;
  const descender = font.descender || -200;
  const glyphCount = font.numGlyphs || (font.glyphs ? font.glyphs.length : 0);
  const lineGap = (font.tables as Record<string, unknown>)?.hhea ? ((font.tables as Record<string, unknown>).hhea as { lineGap?: number }).lineGap || 0 : 0;

  // Extract table presence map
  const tables = (font.tables as Record<string, unknown>) || {};
  const tableRecords: Record<string, boolean> = {
    head: !!tables.head,
    name: !!tables.name,
    cmap: !!tables.cmap,
    maxp: !!tables.maxp,
    hhea: !!tables.hhea,
    'OS/2': !!tables['os2'] || !!tables['OS/2'],
    post: !!tables.post,
    glyf: !!tables.glyf,
    CFF: !!tables.cff || !!tables.CFF,
    hmtx: !!tables.hmtx,
  };

  // Extract unicode character map
  const uppercase: number[] = [];
  const lowercase: number[] = [];
  const numbers: number[] = [];
  const punctuation: number[] = [];
  const other: number[] = [];

  if (font.glyphs && font.glyphs.length > 0) {
    for (let i = 0; i < font.glyphs.length; i++) {
      const g = font.glyphs.get(i);
      if (g && g.unicode !== undefined && g.unicode > 0) {
        const code = g.unicode;
        if (code >= 65 && code <= 90) {
          uppercase.push(code);
        } else if (code >= 97 && code <= 122) {
          lowercase.push(code);
        } else if (code >= 48 && code <= 57) {
          numbers.push(code);
        } else if (
          (code >= 32 && code <= 47) ||
          (code >= 58 && code <= 64) ||
          (code >= 91 && code <= 96) ||
          (code >= 123 && code <= 126)
        ) {
          punctuation.push(code);
        } else {
          other.push(code);
        }
      }
    }
  }

  return {
    familyName,
    subfamily,
    fullName,
    postscriptName,
    version,
    unitsPerEm,
    glyphCount,
    ascender,
    descender,
    lineGap,
    tableRecords,
    glyphCmap: {
      uppercase: Array.from(new Set(uppercase)).sort((a, b) => a - b),
      lowercase: Array.from(new Set(lowercase)).sort((a, b) => a - b),
      numbers: Array.from(new Set(numbers)).sort((a, b) => a - b),
      punctuation: Array.from(new Set(punctuation)).sort((a, b) => a - b),
      other: Array.from(new Set(other)).sort((a, b) => a - b),
    },
    extractedMetadata: {
      copyright: getLocalizedStr(names.copyright),
      trademark: getLocalizedStr(names.trademark),
      manufacturer: getLocalizedStr(names.manufacturer),
      designer: getLocalizedStr(names.designer),
      formatDetected: format,
    },
  };
}
