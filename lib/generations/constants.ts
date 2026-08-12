import type {
  FontCategory,
  FontWeight,
  FontWidth,
  FontStyle,
  CharacterSetConfig,
  AdvancedSettingsConfig,
} from '@/types/database';

export const DAILY_GENERATION_LIMIT = 3;
export const MAX_PROMPT_LENGTH = 2000;
export const MAX_FONT_NAME_LENGTH = 100;

export const FONT_CATEGORIES: FontCategory[] = [
  'Sans Serif',
  'Serif',
  'Display',
  'Handwritten',
  'Script',
  'Monospace',
  'Decorative',
  'Pixel',
  'Blackletter',
  'Other',
];

export const FONT_WEIGHTS: FontWeight[] = [
  'Thin',
  'Extra Light',
  'Light',
  'Regular',
  'Medium',
  'Semi Bold',
  'Bold',
  'Extra Bold',
  'Black',
];

export const FONT_WIDTHS: FontWidth[] = [
  'Condensed',
  'Semi Condensed',
  'Normal',
  'Semi Expanded',
  'Expanded',
];

export const FONT_STYLES: FontStyle[] = [
  'Modern',
  'Minimal',
  'Elegant',
  'Futuristic',
  'Playful',
  'Professional',
  'Retro',
  'Vintage',
  'Geometric',
  'Organic',
];

export const DEFAULT_CHARACTER_SET: CharacterSetConfig = {
  uppercase: true,
  lowercase: true,
  numbers: true,
  punctuation: true,
};

export const DEFAULT_ADVANCED_SETTINGS: AdvancedSettingsConfig = {
  letterSpacing: 0,
  contrast: 'medium',
  cornerStyle: 'sharp',
  strokeStyle: 'solid',
};
