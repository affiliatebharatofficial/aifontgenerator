export type HandwritingProcessStage =
  | 'uploaded'
  | 'analyzing'
  | 'review'
  | 'vectorizing'
  | 'compiling'
  | 'validating'
  | 'completed'
  | 'failed';

export type CharacterConfidenceStatus = 'Detected' | 'Needs Review' | 'Missing';

export interface DetectedCharacterItem {
  id: string;
  char: string;
  unicode: number;
  unicodeHex: string;
  category: 'Uppercase' | 'Lowercase' | 'Numbers' | 'Punctuation';
  status: CharacterConfidenceStatus;
  sampleCropUrl: string; // Base64 PNG data URL of character crop
  width: number;
  height: number;
  // Bounding box in source image
  bbox: { x: number; y: number; w: number; h: number };
  // Contour path commands or pixel grid for vectorization
  grid: number[][]; // 0 (white) or 1 (black) 2D pixel array
}

export interface CharacterAssignment {
  id: string;
  char: string;
  unicode: number;
  unicodeHex: string;
  approved: boolean;
  item: DetectedCharacterItem;
}

export interface HandwritingFontInput {
  userId: string;
  fontName: string;
  category?: string;
  weight?: string;
  width?: string;
  style?: string;
  sourceFileBase64: string;
  sourceFileName: string;
  assignments: CharacterAssignment[];
}

export interface AnalysisResult {
  success: boolean;
  generationId?: string;
  sourceImageUrl?: string;
  detectedCharacters: DetectedCharacterItem[];
  missingCharacters: string[];
  error?: string;
}
