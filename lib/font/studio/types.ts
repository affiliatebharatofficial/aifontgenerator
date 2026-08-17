import type { StyleFamily, StyleDNA } from '../specification/dna';


export interface GlyphTransformParams {
  scaleX: number;       // 1.0 = 100% (range: 0.5 to 2.0)
  scaleY: number;       // 1.0 = 100% (range: 0.5 to 2.0)
  moveX: number;        // in font units (range: -300 to +300)
  moveY: number;        // in font units (range: -300 to +300)
  slant: number;        // angle in degrees (range: -30 to +30)
  strokeDelta: number;  // stroke width multiplier (0.5 to 2.0)
  roundnessDelta: number; // -1.0 (sharper) to +1.0 (rounder)
  advanceWidthDelta: number; // in font units (-200 to +300)
  lsbDelta: number;     // left side bearing adjustment (-100 to +100)
  rsbDelta: number;     // right side bearing adjustment (-100 to +100)
}

export const DEFAULT_TRANSFORM_PARAMS: GlyphTransformParams = {
  scaleX: 1.0,
  scaleY: 1.0,
  moveX: 0,
  moveY: 0,
  slant: 0,
  strokeDelta: 1.0,
  roundnessDelta: 0,
  advanceWidthDelta: 0,
  lsbDelta: 0,
  rsbDelta: 0,
};

export interface GlyphOverride {
  glyphId: string;       // Character e.g. "A" or "dvKRA" or Unicode string
  unicode: number;
  char: string;
  name: string;
  isLocked?: boolean;
  transforms: GlyphTransformParams;
  customPathSvg?: string; // Optional direct vector path override
  version: number;
  updatedAt: string;
}

export type GlyphGroupType =
  | 'UPPERCASE'
  | 'LOWERCASE'
  | 'NUMERALS'
  | 'PUNCTUATION'
  | 'DEVANAGARI_CONSONANTS'
  | 'DEVANAGARI_MARKS'
  | 'ALL';

export interface AIGlyphOperation {
  type:
    | 'ANGULARITY'
    | 'ROUNDNESS'
    | 'WIDTH'
    | 'HEIGHT'
    | 'STROKE'
    | 'SLANT'
    | 'TERMINAL'
    | 'SPACING'
    | 'PROPORTION'
    | 'CONTRAST';
  strength?: number;   // -1.0 to 1.0 or scale 0.5 to 2.0
  scale?: number;
  value?: number | string;
  description?: string;
}

export interface AIGlyphInstruction {
  glyph: string;
  operations: AIGlyphOperation[];
  reasoning: string;
  recommendedName?: string;
}

export interface GlyphMetadataInfo {
  char: string;
  unicode: number;
  unicodeHex: string;
  glyphId: number;
  glyphName: string;
  advanceWidth: number;
  leftSideBearing: number;
  rightSideBearing: number;
  boundingBox: {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
  };
  script: 'Latin' | 'Latin Extended' | 'Devanagari' | 'Numbers' | 'Punctuation' | 'Symbols' | 'Other';
  category: 'Uppercase' | 'Lowercase' | 'Digit' | 'Punctuation' | 'Mark' | 'Conjunct' | 'Other';
  styleFamily: StyleFamily;
  isModified: boolean;
  isLocked: boolean;
}

export interface ConsistencyIssue {
  glyph: string;
  property: 'STROKE_WEIGHT' | 'WIDTH_RATIO' | 'SLANT_ANGLE' | 'VERTICAL_PROPORTION' | 'ALIGNMENT';
  message: string;
  currentValue: number;
  baselineValue: number;
  deviationPercent: number;
  severity: 'low' | 'medium' | 'high';
  suggestedFix?: AIGlyphOperation[];
}

export interface ConsistencyReport {
  overallScore: number; // 0 to 100
  consistentGlyphsCount: number;
  totalChecked: number;
  issues: ConsistencyIssue[];
  recommendations: string[];
}

export interface QualityCategoryScore {
  category: 'Geometry' | 'Metrics' | 'Spacing' | 'Consistency' | 'Coverage' | 'OpenType' | 'Readability';
  score: number;       // 0 to 100
  weight: number;      // sum = 1.0
  details: string[];
}

export interface FontQualityScoreBreakdown {
  overallScore: number; // 0 to 100
  rating: 'Superior' | 'Professional' | 'Acceptable' | 'Needs Refinement';
  categories: QualityCategoryScore[];
  issues: string[];
  suggestions: string[];
}

export interface DevanagariShapingDebugItem {
  inputSequence: string[]; // e.g. ["क", "्", "र"]
  inputHex: string[];      // e.g. ["0915", "094D", "0930"]
  shapedChar: string;      // e.g. "क्र"
  ligatureTag: string;     // e.g. "liga" or "akhn"
  glyphId: number;
  glyphName: string;
  unicodeHex: string;
  isSupported: boolean;
}

export interface StudioVersionRecord {
  versionNumber: number;
  versionLabel: string;
  createdAt: string;
  summary: string;
  overridesCount: number;
  overrides: Record<string, GlyphOverride>;
}
