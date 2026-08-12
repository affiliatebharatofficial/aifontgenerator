export interface ExtractedGlyph {
  char: string;
  unicode: number;
  unicodeHex: string;
  name: string;
  advanceWidth: number | null;
  xMin: number | null;
  yMin: number | null;
  xMax: number | null;
  yMax: number | null;
  category: 'Uppercase' | 'Lowercase' | 'Numbers' | 'Punctuation' | 'Symbols' | 'Other';
}

export interface ExtractedFontMeta {
  familyName: string;
  subfamily: string;
  fullName: string;
  postScriptName: string;
  version: string;
  unitsPerEm: number | null;
  ascender: number | null;
  descender: number | null;
  numGlyphs: number;
  totalSupportedChars: number;
  glyphs: ExtractedGlyph[];
}

export type TextAlignMode = 'left' | 'center' | 'right' | 'justify';
export type TextTransformMode = 'none' | 'uppercase' | 'lowercase';
export type CanvasBgMode = 'dark' | 'light' | 'custom';
export type PreviewWidthMode = 'wide' | 'desktop' | 'tablet' | 'mobile';

export interface StudioPreviewSettings {
  customText: string;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  textAlign: TextAlignMode;
  textTransform: TextTransformMode;
  textColor: string;
  bgMode: CanvasBgMode;
  customBgColor: string;
  previewWidth: PreviewWidthMode;
}
