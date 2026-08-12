/**
 * FONT STYLE DNA ARCHITECTURE
 * 
 * Formal structured specification contract for font style DNA.
 * Connects the AI Typography Director to future style-aware vector glyph generation.
 */

export const STYLE_FAMILIES = [
  'SANS',
  'GROTESK',
  'HUMANIST_SANS',
  'GEOMETRIC',
  'SERIF',
  'SLAB_SERIF',
  'DIDONE_SERIF',
  'HANDWRITTEN',
  'SCRIPT',
  'BRUSH',
  'GOTHIC',
  'BLACKLETTER',
  'MONOSPACE',
  'DISPLAY',
  'FUTURISTIC',
  'RETRO',
  'PSYCHEDELIC',
  'BUBBLE',
  'CARTOON',
  'HORROR',
  'OCCULT',
  'DECORATIVE',
] as const;
export type StyleFamily = (typeof STYLE_FAMILIES)[number];

export const STROKE_MODELS = [
  'MONOLINE',
  'MODULATED',
  'HIGH_CONTRAST',
  'LOW_CONTRAST',
  'BRUSH',
  'CALLIGRAPHIC',
  'CONSTRUCTED',
] as const;
export type StrokeModel = (typeof STROKE_MODELS)[number];

export const TERMINAL_STYLES = [
  'FLAT',
  'ROUND',
  'SHARP',
  'TAPERED',
  'CUT',
  'WEDGE',
  'BRUSH',
  'FLARED',
  'SERIFED',
  'ORNAMENTAL',
] as const;
export type TerminalStyle = (typeof TERMINAL_STYLES)[number];

export const CORNER_STYLES = [
  'SHARP',
  'ROUND',
  'SOFT',
  'CHAMFERED',
  'CUT',
  'IRREGULAR',
] as const;
export type CornerStyle = (typeof CORNER_STYLES)[number];

export const CURVE_MODELS = [
  'GEOMETRIC',
  'CIRCULAR',
  'ORGANIC',
  'CALLIGRAPHIC',
  'IRREGULAR',
  'ANGULAR',
] as const;
export type CurveModel = (typeof CURVE_MODELS)[number];

export const COUNTER_STYLES = [
  'OPEN',
  'CLOSED',
  'ROUND',
  'OVAL',
  'ANGULAR',
  'NARROW',
  'WIDE',
  'IRREGULAR',
] as const;
export type CounterStyle = (typeof COUNTER_STYLES)[number];

export const BASELINE_BEHAVIORS = [
  'STABLE',
  'SUBTLE_VARIATION',
  'HANDWRITTEN',
  'IRREGULAR',
  'BOUNCY',
] as const;
export type BaselineBehavior = (typeof BASELINE_BEHAVIORS)[number];

export const SPACING_SYSTEMS = [
  'TIGHT',
  'NORMAL',
  'OPEN',
  'DISPLAY',
] as const;
export type SpacingSystem = (typeof SPACING_SYSTEMS)[number];

export const DECORATION_LEVELS = [
  'NONE',
  'SUBTLE',
  'MODERATE',
  'STRONG',
] as const;
export type DecorationLevel = (typeof DECORATION_LEVELS)[number];

export const GLYPH_VARIATIONS = [
  'NONE',
  'SUBTLE',
  'MODERATE',
  'STRONG',
] as const;
export type GlyphVariation = (typeof GLYPH_VARIATIONS)[number];

export const VISUAL_COMPLEXITIES = [
  'MINIMAL',
  'MODERATE',
  'COMPLEX',
] as const;
export type VisualComplexity = (typeof VISUAL_COMPLEXITIES)[number];

/**
 * Normalized Vertical and Horizontal Proportions relative to unitsPerEm (typically 1000)
 */
export interface FontProportions {
  /** Relative width scaling factor (0.60 to 1.40, where 1.0 is standard normal width) */
  width: number;
  /** Normalized lowercase x-height ratio (0.35 to 0.70, standard ~0.50) */
  xHeight: number;
  /** Normalized capital height ratio (0.60 to 0.85, standard ~0.70) */
  capHeight: number;
  /** Normalized ascender line ratio (0.65 to 0.95, standard ~0.80) */
  ascender: number;
  /** Normalized descender depth ratio (-0.35 to -0.10, standard ~ -0.20) */
  descender: number;
}

/**
 * Detailed Prompt Design Modifiers
 */
export type WidthModifier = 'ULTRA_CONDENSED' | 'CONDENSED' | 'NARROW' | 'NORMAL' | 'WIDE' | 'EXPANDED' | 'ULTRA_EXPANDED';
export type HeightModifier = 'VERY_SHORT' | 'SHORT' | 'NORMAL' | 'TALL' | 'ELONGATED';
export type WeightModifier = 'HAIRLINE' | 'THIN' | 'LIGHT' | 'REGULAR' | 'MEDIUM' | 'BOLD' | 'EXTRA_BOLD' | 'BLACK';
export type TerminalModifier = 'STANDARD' | 'DRIPPING' | 'FANG' | 'CLAW' | 'MELTING' | 'SPUR' | 'SHARP' | 'ROUND' | 'FLAT' | 'WEDGE' | 'TAPERED' | 'FLARED' | 'CUT' | 'HAIRLINE' | 'SERIFED';
export type CornerModifier = 'STANDARD' | 'SHARP' | 'CHAMFERED' | 'ROUND' | 'SOFT' | 'CRACKED' | 'IRREGULAR';
export type StrokeModifier = 'STANDARD' | 'CRACKED' | 'SCRATCHED' | 'HOLLOW' | 'OUTLINE' | 'DOUBLE_LINE' | 'CALLIGRAPHIC' | 'ORGANIC';
export type CounterModifier = 'STANDARD' | 'OPEN' | 'CLOSED' | 'TIGHT' | 'AIRY' | 'EXPANDED' | 'COMPRESSED';
export type BaselineModifier = 'STANDARD' | 'FLAT' | 'BOUNCY' | 'WAVY' | 'IRREGULAR' | 'HANDWRITTEN';


export interface PromptDesignModifiers {
  width?: WidthModifier;
  height?: HeightModifier;
  weight?: WeightModifier;
  terminals?: TerminalModifier;
  corners?: CornerModifier;
  strokes?: StrokeModifier;
  counters?: CounterModifier;
  baseline?: BaselineModifier;
  contrast?: 'LOW' | 'NORMAL' | 'HIGH' | 'EXTREME';
  roundness?: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  angularity?: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  distortion?: 'NONE' | 'SUBTLE' | 'MODERATE' | 'HEAVY' | 'EXTREME';
  spacing?: 'TIGHT' | 'NORMAL' | 'WIDE' | 'EXPANDED';
  slant?: 'NONE' | 'SLIGHT_ITALIC' | 'ITALIC' | 'EXTREME_ITALIC' | 'REVERSE';
  // Quantitative modifier intensity factors [0.0, 1.0]
  terminalStrength?: number;
  distortionStrength?: number;
  widthScaleOverride?: number;
  heightScaleOverride?: number;
  strokeWeightOverride?: number;
  contrastOverride?: number;
}

/**
 * Complete Validated Font Style DNA
 */
export interface FontStyleDNA {
  /** High-level typographic classification */
  styleFamily: StyleFamily;
  /** Stroke modulation and construction physics */
  strokeModel: StrokeModel;
  /** Stroke stroke termination character */
  terminalStyle: TerminalStyle;
  /** Corner join style at path intersections */
  cornerStyle: CornerStyle;
  /** Underlying curvature mathematics */
  curveModel: CurveModel;
  /** Interior negative space geometry */
  counterStyle: CounterStyle;
  /** Baseline placement consistency across glyph sequence */
  baselineBehavior: BaselineBehavior;
  /** Default side-bearing and tracking classification */
  spacing: SpacingSystem;
  /** Intensity of glyph-level construction embellishments */
  decorationLevel: DecorationLevel;
  /** Degree of controlled organic variation across characters */
  glyphVariation: GlyphVariation;
  /** Overall path density and architectural complexity */
  visualComplexity: VisualComplexity;

  /** Normalized main stem thickness (0.02 = ultra-thin, 0.08 = regular, 0.18 = bold, 0.28 = heavy black) */
  strokeWidth: number;
  /** Normalized stroke contrast (0.0 = monoline, 0.5 = moderate, 1.0 = Didone extreme contrast) */
  strokeContrast: number;
  /** Degree of contour curvature vs straight lines (0.0 = razor angular, 1.0 = fully inflated pillow) */
  roundness: number;
  /** Degree of chiseled, hard-edged geometric faceting (0.0 = smooth organic, 1.0 = hard techno faceted) */
  angularity: number;
  /** Controlled organic or jagged irregularity (0.0 = clean geometric, 1.0 = heavily distressed/cursed) */
  distortion: number;
  /** Degree of bilateral/formal symmetry (0.0 = asymmetrical/organic, 1.0 = rigid geometric symmetry) */
  symmetry: number;
  /** Italic or forward/reverse slant angle in radians (-0.35 to +0.45) */
  slant: number;

  /** Normalized vertical and horizontal proportions */
  proportions: FontProportions;

  /** Fine-grained design intent modifiers */
  modifiers?: PromptDesignModifiers;

  /** List of human-readable active modifier tokens (e.g. ['NARROW', 'TALL', 'DRIPPING']) */
  activeModifiers?: string[];

  /** Em square coordinate resolution (standard 1000) */
  unitsPerEm: number;

  /** AI director design summary or rationale */
  designIntent: string;

  /** Source tracking: synthesized via AI or rule-based fallback */
  generatedVia: 'ai_director' | 'fallback_rule';
}

