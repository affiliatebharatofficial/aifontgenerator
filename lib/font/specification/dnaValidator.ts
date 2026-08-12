import {
  STYLE_FAMILIES,
  STROKE_MODELS,
  TERMINAL_STYLES,
  CORNER_STYLES,
  CURVE_MODELS,
  COUNTER_STYLES,
  BASELINE_BEHAVIORS,
  SPACING_SYSTEMS,
  DECORATION_LEVELS,
  GLYPH_VARIATIONS,
  VISUAL_COMPLEXITIES,
  type StyleFamily,
  type StrokeModel,
  type TerminalStyle,
  type CornerStyle,
  type CurveModel,
  type CounterStyle,
  type BaselineBehavior,
  type SpacingSystem,
  type DecorationLevel,
  type GlyphVariation,
  type VisualComplexity,
  type FontProportions,
  type FontStyleDNA,
} from './dna';

/**
 * Bounds & Defaults Constraints
 */
export const DNA_BOUNDS = {
  strokeWidth: { min: 0.02, max: 0.30, default: 0.08 },
  strokeContrast: { min: 0.0, max: 1.0, default: 0.20 },
  roundness: { min: 0.0, max: 1.0, default: 0.50 },
  angularity: { min: 0.0, max: 1.0, default: 0.20 },
  distortion: { min: 0.0, max: 1.0, default: 0.00 },
  symmetry: { min: 0.0, max: 1.0, default: 0.85 },
  slant: { min: -0.35, max: 0.45, default: 0.00 },
  proportions: {
    width: { min: 0.60, max: 1.40, default: 1.00 },
    xHeight: { min: 0.35, max: 0.70, default: 0.50 },
    capHeight: { min: 0.60, max: 0.85, default: 0.70 },
    ascender: { min: 0.65, max: 0.95, default: 0.80 },
    descender: { min: -0.35, max: -0.10, default: -0.20 },
  },
} as const;

/**
 * Safely clamps and validates a floating point value.
 */
function clampNumber(val: unknown, min: number, max: number, fallback: number): number {
  if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
    return fallback;
  }
  const clamped = Math.max(min, Math.min(max, val));
  return parseFloat(clamped.toFixed(4));
}

/**
 * Safely validates an enum string from a list of allowed values.
 */
function validateEnum<T extends string>(
  val: unknown,
  allowed: readonly T[],
  fallback: T
): T {
  if (typeof val !== 'string') return fallback;
  const upper = val.trim().toUpperCase() as T;
  if (allowed.includes(upper)) {
    return upper;
  }
  // Try case-insensitive normalization matching
  const match = allowed.find((item) => item.toUpperCase() === upper);
  return match || fallback;
}

/**
 * Creates a standard default FontStyleDNA instance.
 */
export function createDefaultStyleDNA(
  family: StyleFamily = 'GEOMETRIC',
  intent = 'Clean balanced geometric sans-serif typeface.'
): FontStyleDNA {
  return {
    styleFamily: family,
    strokeModel: 'MONOLINE',
    terminalStyle: 'FLAT',
    cornerStyle: 'SHARP',
    curveModel: 'GEOMETRIC',
    counterStyle: 'ROUND',
    baselineBehavior: 'STABLE',
    spacing: 'NORMAL',
    decorationLevel: 'NONE',
    glyphVariation: 'NONE',
    visualComplexity: 'MINIMAL',
    strokeWidth: 0.08,
    strokeContrast: 0.15,
    roundness: 0.30,
    angularity: 0.20,
    distortion: 0.00,
    symmetry: 0.90,
    slant: 0.00,
    proportions: {
      width: 1.00,
      xHeight: 0.50,
      capHeight: 0.70,
      ascender: 0.80,
      descender: -0.20,
    },
    unitsPerEm: 1000,
    designIntent: intent,
    generatedVia: 'fallback_rule',
  };
}

/**
 * Validates and normalizes raw object data into a compliant FontStyleDNA.
 */
export function validateFontStyleDNA(
  raw: unknown,
  fallbackPrompt = '',
  generatedVia: 'ai_director' | 'fallback_rule' = 'ai_director'
): FontStyleDNA {
  if (!raw || typeof raw !== 'object') {
    return createDefaultStyleDNA('GEOMETRIC', fallbackPrompt ? `Fallback for: ${fallbackPrompt}` : undefined);
  }

  const obj = raw as Record<string, unknown>;

  // 1. Enums
  const styleFamily = validateEnum<StyleFamily>(obj.styleFamily, STYLE_FAMILIES, 'GEOMETRIC');
  const strokeModel = validateEnum<StrokeModel>(obj.strokeModel, STROKE_MODELS, 'MONOLINE');
  const terminalStyle = validateEnum<TerminalStyle>(obj.terminalStyle, TERMINAL_STYLES, 'FLAT');
  const cornerStyle = validateEnum<CornerStyle>(obj.cornerStyle, CORNER_STYLES, 'SHARP');
  const curveModel = validateEnum<CurveModel>(obj.curveModel, CURVE_MODELS, 'GEOMETRIC');
  const counterStyle = validateEnum<CounterStyle>(obj.counterStyle, COUNTER_STYLES, 'ROUND');
  const baselineBehavior = validateEnum<BaselineBehavior>(obj.baselineBehavior, BASELINE_BEHAVIORS, 'STABLE');
  const spacing = validateEnum<SpacingSystem>(obj.spacing, SPACING_SYSTEMS, 'NORMAL');
  const decorationLevel = validateEnum<DecorationLevel>(obj.decorationLevel, DECORATION_LEVELS, 'NONE');
  const glyphVariation = validateEnum<GlyphVariation>(obj.glyphVariation, GLYPH_VARIATIONS, 'NONE');
  const visualComplexity = validateEnum<VisualComplexity>(obj.visualComplexity, VISUAL_COMPLEXITIES, 'MINIMAL');

  // 2. Normalized metrics
  const strokeWidth = clampNumber(
    obj.strokeWidth,
    DNA_BOUNDS.strokeWidth.min,
    DNA_BOUNDS.strokeWidth.max,
    DNA_BOUNDS.strokeWidth.default
  );

  const strokeContrast = clampNumber(
    obj.strokeContrast,
    DNA_BOUNDS.strokeContrast.min,
    DNA_BOUNDS.strokeContrast.max,
    DNA_BOUNDS.strokeContrast.default
  );

  const roundness = clampNumber(
    obj.roundness,
    DNA_BOUNDS.roundness.min,
    DNA_BOUNDS.roundness.max,
    DNA_BOUNDS.roundness.default
  );

  const angularity = clampNumber(
    obj.angularity,
    DNA_BOUNDS.angularity.min,
    DNA_BOUNDS.angularity.max,
    DNA_BOUNDS.angularity.default
  );

  const distortion = clampNumber(
    obj.distortion,
    DNA_BOUNDS.distortion.min,
    DNA_BOUNDS.distortion.max,
    DNA_BOUNDS.distortion.default
  );

  const symmetry = clampNumber(
    obj.symmetry,
    DNA_BOUNDS.symmetry.min,
    DNA_BOUNDS.symmetry.max,
    DNA_BOUNDS.symmetry.default
  );

  const slant = clampNumber(
    obj.slant,
    DNA_BOUNDS.slant.min,
    DNA_BOUNDS.slant.max,
    DNA_BOUNDS.slant.default
  );

  // 3. Proportions
  const rawProp = (obj.proportions && typeof obj.proportions === 'object'
    ? obj.proportions
    : {}) as Record<string, unknown>;

  const proportions: FontProportions = {
    width: clampNumber(
      rawProp.width,
      DNA_BOUNDS.proportions.width.min,
      DNA_BOUNDS.proportions.width.max,
      DNA_BOUNDS.proportions.width.default
    ),
    xHeight: clampNumber(
      rawProp.xHeight,
      DNA_BOUNDS.proportions.xHeight.min,
      DNA_BOUNDS.proportions.xHeight.max,
      DNA_BOUNDS.proportions.xHeight.default
    ),
    capHeight: clampNumber(
      rawProp.capHeight,
      DNA_BOUNDS.proportions.capHeight.min,
      DNA_BOUNDS.proportions.capHeight.max,
      DNA_BOUNDS.proportions.capHeight.default
    ),
    ascender: clampNumber(
      rawProp.ascender,
      DNA_BOUNDS.proportions.ascender.min,
      DNA_BOUNDS.proportions.ascender.max,
      DNA_BOUNDS.proportions.ascender.default
    ),
    descender: clampNumber(
      rawProp.descender,
      DNA_BOUNDS.proportions.descender.min,
      DNA_BOUNDS.proportions.descender.max,
      DNA_BOUNDS.proportions.descender.default
    ),
  };

  // Ensure logical hierarchy: capHeight >= xHeight, ascender >= capHeight
  if (proportions.capHeight < proportions.xHeight) {
    proportions.capHeight = Math.min(0.85, proportions.xHeight + 0.15);
  }
  if (proportions.ascender < proportions.capHeight) {
    proportions.ascender = Math.min(0.95, proportions.capHeight + 0.08);
  }

  const designIntent =
    typeof obj.designIntent === 'string' && obj.designIntent.trim().length > 0
      ? obj.designIntent.trim().substring(0, 300)
      : fallbackPrompt
      ? `Typographic DNA synthesized for: "${fallbackPrompt.substring(0, 80)}"`
      : `Typographic DNA synthesized for ${styleFamily} style family.`;

  return {
    styleFamily,
    strokeModel,
    terminalStyle,
    cornerStyle,
    curveModel,
    counterStyle,
    baselineBehavior,
    spacing,
    decorationLevel,
    glyphVariation,
    visualComplexity,
    strokeWidth,
    strokeContrast,
    roundness,
    angularity,
    distortion,
    symmetry,
    slant,
    proportions,
    unitsPerEm: 1000,
    designIntent,
    generatedVia,
  };
}
