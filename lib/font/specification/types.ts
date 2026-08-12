import type {
  FontCategory,
  FontWeight,
  FontWidth,
  FontStyle,
  CharacterSetConfig,
  AdvancedSettingsConfig,
} from '@/types/database';

export type AIProvider = 'openai' | 'gemini' | 'openrouter' | 'deepseek';

export interface FontSpecification {
  fontName: string;
  category: FontCategory;
  weight: FontWeight;
  width: FontWidth;
  style: FontStyle;
  unitsPerEm: number; // e.g. 1000
  ascender: number;   // e.g. 800
  descender: number;  // e.g. -200
  capHeight: number;  // e.g. 700
  xHeight: number;    // e.g. 500
  stemWidth: number;  // e.g. 80 for regular, 160 for bold
  cornerStyle: 'sharp' | 'rounded' | 'bevel';
  contrast: 'low' | 'medium' | 'high';
  strokeStyle: 'solid' | 'handdrawn' | 'inline';
  characterSet: CharacterSetConfig;
  advancedSettings: AdvancedSettingsConfig;
  designDescription: string;
}
