export type SupportedImportFormat = 'ttf' | 'otf' | 'woff' | 'woff2';

export const MAX_IMPORT_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB Server-side default

export interface ParsedFontAnalysis {
  familyName: string | null;
  subfamily: string | null;
  fullName: string | null;
  postscriptName: string | null;
  version: string | null;
  unitsPerEm: number;
  glyphCount: number;
  ascender: number;
  descender: number;
  lineGap: number;
  tableRecords: Record<string, boolean>;
  glyphCmap: {
    uppercase: number[];
    lowercase: number[];
    numbers: number[];
    punctuation: number[];
    other: number[];
  };
  extractedMetadata: Record<string, unknown>;
}

export interface FontImportValidationResult {
  isValid: boolean;
  format?: SupportedImportFormat;
  error?: string;
}
