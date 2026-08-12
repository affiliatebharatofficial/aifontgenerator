import type {
  FontCategory,
  FontWeight,
  FontWidth,
  FontStyle,
  CharacterSetConfig,
  AdvancedSettingsConfig,
} from '@/types/database';

export type AIProvider = 'openai' | 'gemini' | 'openrouter' | 'deepseek';

export type StyleFamily =
  | 'HORROR'
  | 'BUBBLE'
  | 'LUXURY_SERIF'
  | 'FUTURISTIC'
  | 'HANDWRITTEN'
  | 'GOTHIC'
  | 'BOLD_DISPLAY'
  | 'RETRO_PSYCHEDELIC'
  | 'GEOMETRIC_SANS'
  | 'MONOSPACE'
  | 'DEVANAGARI';

export type StrokeModel =
  | 'monoline'
  | 'high_contrast'
  | 'variable_brush'
  | 'jagged_chiseled'
  | 'inflated_pillowy'
  | 'geometric_techno'
  | 'blackletter_ribbon';

export type SerifStyle =
  | 'none'
  | 'luxury_bracketed'
  | 'sharp_dagger'
  | 'slab_block'
  | 'calligraphic_flick'
  | 'curled_bulb';

export type TerminalStyle =
  | 'straight'
  | 'rounded_ball'
  | 'sharp_fang'
  | 'teardrop'
  | 'swash_hook'
  | 'beveled_cut';

export type CornerStyle =
  | 'sharp'
  | 'rounded'
  | 'chiseled'
  | 'soft'
  | 'dripping'
  | 'angled';

export type CurveModel =
  | 'smooth_geometric'
  | 'inflated_balloon'
  | 'jagged_angular'
  | 'organic_loose'
  | 'fractured_gothic'
  | 'square_techno';

export type CounterStyle =
  | 'standard'
  | 'narrow_slit'
  | 'inflated_pinhole'
  | 'octagonal_box'
  | 'open_slit';

export type BaselineBehavior =
  | 'straight'
  | 'dancing_organic'
  | 'uneven_staggered';

export interface FontStyleSpecification {
  styleFamily: StyleFamily;
  strokeModel: StrokeModel;
  serifStyle: SerifStyle;
  terminalStyle: TerminalStyle;
  cornerStyle: CornerStyle;
  curveModel: CurveModel;
  counterStyle: CounterStyle;
  baselineBehavior: BaselineBehavior;
  crossbarHeight: number; // 0.28 to 0.72 (default ~0.50)
  contrastRatio: number; // 0.20 to 1.0 (default ~0.85)
  slantAngle: number; // -0.30 to 0.35 (default 0)
  randomSeed?: number; // Integer for deterministic or controlled variation
  decorations?: string[];
}

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
  prompt?: string;
  styleSpec?: FontStyleSpecification;
}
