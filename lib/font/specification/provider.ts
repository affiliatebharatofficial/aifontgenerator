import type {
  FontSpecification,
  FontStyleSpecification,
  StyleFamily,
  StrokeModel,
  SerifStyle,
  TerminalStyle,
  CornerStyle,
  CurveModel,
  CounterStyle,
  BaselineBehavior,
} from './types';
import { AIProviderService } from '@/lib/ai/provider-service';
import type {
  FontCategory,
  FontWeight,
  FontWidth,
  FontStyle,
  CharacterSetConfig,
  AdvancedSettingsConfig,
} from '@/types/database';

export interface GenerateSpecificationParams {
  prompt: string;
  fontName?: string;
  category: FontCategory;
  weight: FontWeight;
  width: FontWidth;
  style: FontStyle;
  characterSet: CharacterSetConfig;
  advancedSettings: AdvancedSettingsConfig;
  randomSeed?: number;
}

/**
 * Builds the structured system prompt instructing the AI to output ONLY JSON with deep typographic DNA.
 */
export function buildFontGenerationPrompt(params: GenerateSpecificationParams): string {
  return `You are a master digital typographer and font engineer.
Transform the following user request into a precise, structured vector font specification JSON object with deep geometric DNA.

USER PROMPT: "${params.prompt}"
DESIRED FONT NAME: "${params.fontName || 'Auto-generated'}"
CATEGORY: "${params.category}"
WEIGHT: "${params.weight}"
WIDTH: "${params.width}"
STYLE: "${params.style}"

Return ONLY a valid JSON object matching this exact structure:
{
  "fontName": string,
  "category": "${params.category}",
  "weight": "${params.weight}",
  "width": "${params.width}",
  "style": "${params.style}",
  "unitsPerEm": 1000,
  "ascender": 800,
  "descender": -200,
  "capHeight": 700,
  "xHeight": 500,
  "stemWidth": number (between 35 and 220),
  "styleSpec": {
    "styleFamily": "HORROR" | "BUBBLE" | "LUXURY_SERIF" | "FUTURISTIC" | "HANDWRITTEN" | "GOTHIC" | "BOLD_DISPLAY" | "RETRO_PSYCHEDELIC" | "GEOMETRIC_SANS" | "MONOSPACE" | "DEVANAGARI",
    "strokeModel": "monoline" | "high_contrast" | "variable_brush" | "jagged_chiseled" | "inflated_pillowy" | "geometric_techno" | "blackletter_ribbon",
    "serifStyle": "none" | "luxury_bracketed" | "sharp_dagger" | "slab_block" | "calligraphic_flick" | "curled_bulb",
    "terminalStyle": "straight" | "rounded_ball" | "sharp_fang" | "teardrop" | "swash_hook" | "beveled_cut",
    "cornerStyle": "sharp" | "rounded" | "chiseled" | "soft" | "dripping" | "angled",
    "curveModel": "smooth_geometric" | "inflated_balloon" | "jagged_angular" | "organic_loose" | "fractured_gothic" | "square_techno",
    "counterStyle": "standard" | "narrow_slit" | "inflated_pinhole" | "octagonal_box" | "open_slit",
    "baselineBehavior": "straight" | "dancing_organic" | "uneven_staggered",
    "crossbarHeight": number (between 0.28 and 0.72),
    "contrastRatio": number (between 0.20 and 1.00),
    "slantAngle": number (between -0.25 and 0.35)
  },
  "designDescription": string
}

DO NOT include markdown code blocks or explanatory text. Output raw JSON only.`;
}

/**
 * Derives rich, coherent typographic style rules based on prompt semantics and category.
 */
export function deriveStyleFamilyFromPrompt(
  prompt: string,
  category: string,
  style: string
): FontStyleSpecification {
  const text = `${prompt} ${category} ${style}`.toLowerCase();

  // 1. HORROR / CREEPY / DISTORTED
  if (
    text.includes('horror') ||
    text.includes('scary') ||
    text.includes('creepy') ||
    text.includes('blood') ||
    text.includes('halloween') ||
    text.includes('terror') ||
    text.includes('distort') ||
    text.includes('monster') ||
    text.includes('zombie') ||
    text.includes('fang') ||
    text.includes('spooky')
  ) {
    return {
      styleFamily: 'HORROR',
      strokeModel: 'jagged_chiseled',
      serifStyle: 'sharp_dagger',
      terminalStyle: 'sharp_fang',
      cornerStyle: 'dripping',
      curveModel: 'jagged_angular',
      counterStyle: 'narrow_slit',
      baselineBehavior: 'uneven_staggered',
      crossbarHeight: 0.42,
      contrastRatio: 0.65,
      slantAngle: 0.08,
      decorations: ['fangs', 'spikes'],
    };
  }

  // 2. BUBBLE / CARTOON / BALLOON
  if (
    text.includes('bubble') ||
    text.includes('balloon') ||
    text.includes('inflated') ||
    text.includes('pillowy') ||
    text.includes('puffy') ||
    text.includes('cute') ||
    text.includes('cartoon') ||
    text.includes('comic') ||
    text.includes('soft')
  ) {
    return {
      styleFamily: 'BUBBLE',
      strokeModel: 'inflated_pillowy',
      serifStyle: 'none',
      terminalStyle: 'rounded_ball',
      cornerStyle: 'rounded',
      curveModel: 'inflated_balloon',
      counterStyle: 'inflated_pinhole',
      baselineBehavior: 'straight',
      crossbarHeight: 0.52,
      contrastRatio: 0.95,
      slantAngle: 0,
      decorations: ['cushion'],
    };
  }

  // 3. LUXURY SERIF / DIDOT / ELEGANT
  if (
    text.includes('luxury') ||
    text.includes('editorial') ||
    text.includes('fashion') ||
    text.includes('didot') ||
    text.includes('bodoni') ||
    text.includes('vogue') ||
    (category.toLowerCase().includes('serif') && !category.toLowerCase().includes('sans'))
  ) {
    return {
      styleFamily: 'LUXURY_SERIF',
      strokeModel: 'high_contrast',
      serifStyle: 'luxury_bracketed',
      terminalStyle: 'teardrop',
      cornerStyle: 'sharp',
      curveModel: 'smooth_geometric',
      counterStyle: 'standard',
      baselineBehavior: 'straight',
      crossbarHeight: 0.56,
      contrastRatio: 0.28,
      slantAngle: text.includes('italic') ? 0.22 : 0,
    };
  }

  // 4. FUTURISTIC / TECHNO / CYBERPUNK / GAMING
  if (
    text.includes('futuristic') ||
    text.includes('cyber') ||
    text.includes('techno') ||
    text.includes('gaming') ||
    text.includes('sci-fi') ||
    text.includes('stencil') ||
    text.includes('space') ||
    text.includes('robot') ||
    text.includes('angular')
  ) {
    return {
      styleFamily: 'FUTURISTIC',
      strokeModel: 'geometric_techno',
      serifStyle: 'none',
      terminalStyle: 'beveled_cut',
      cornerStyle: 'angled',
      curveModel: 'square_techno',
      counterStyle: 'octagonal_box',
      baselineBehavior: 'straight',
      crossbarHeight: 0.50,
      contrastRatio: 0.92,
      slantAngle: text.includes('italic') ? 0.22 : 0.05,
      decorations: ['chamfers', 'stencils'],
    };
  }

  // 5. HANDWRITTEN / BRUSH / SCRIPT / SIGNATURE
  if (
    text.includes('handwritten') ||
    text.includes('brush') ||
    text.includes('cursive') ||
    text.includes('script') ||
    text.includes('signature') ||
    text.includes('calligraph') ||
    text.includes('loose') ||
    category.toLowerCase() === 'handwritten' ||
    category.toLowerCase() === 'script'
  ) {
    return {
      styleFamily: 'HANDWRITTEN',
      strokeModel: 'variable_brush',
      serifStyle: 'calligraphic_flick',
      terminalStyle: 'swash_hook',
      cornerStyle: 'soft',
      curveModel: 'organic_loose',
      counterStyle: 'open_slit',
      baselineBehavior: 'dancing_organic',
      crossbarHeight: 0.48,
      contrastRatio: 0.60,
      slantAngle: 0.16,
      decorations: ['swashes'],
    };
  }

  // 6. GOTHIC / BLACKLETTER / MEDIEVAL
  if (
    text.includes('gothic') ||
    text.includes('blackletter') ||
    text.includes('medieval') ||
    text.includes('fraktur') ||
    category.toLowerCase() === 'blackletter'
  ) {
    return {
      styleFamily: 'GOTHIC',
      strokeModel: 'blackletter_ribbon',
      serifStyle: 'sharp_dagger',
      terminalStyle: 'beveled_cut',
      cornerStyle: 'chiseled',
      curveModel: 'fractured_gothic',
      counterStyle: 'narrow_slit',
      baselineBehavior: 'straight',
      crossbarHeight: 0.50,
      contrastRatio: 0.35,
      slantAngle: 0,
      decorations: ['diamonds'],
    };
  }

  // 7. RETRO / PSYCHEDELIC / 70S
  if (
    text.includes('retro') ||
    text.includes('psychedelic') ||
    text.includes('70s') ||
    text.includes('groovy') ||
    text.includes('disco') ||
    text.includes('vintage')
  ) {
    return {
      styleFamily: 'RETRO_PSYCHEDELIC',
      strokeModel: 'high_contrast',
      serifStyle: 'curled_bulb',
      terminalStyle: 'rounded_ball',
      cornerStyle: 'rounded',
      curveModel: 'organic_loose',
      counterStyle: 'standard',
      baselineBehavior: 'straight',
      crossbarHeight: 0.36,
      contrastRatio: 0.42,
      slantAngle: 0,
    };
  }

  // 8. BOLD DISPLAY / POSTER
  if (
    text.includes('bold') ||
    text.includes('heavy') ||
    text.includes('poster') ||
    text.includes('impact') ||
    text.includes('display') ||
    category.toLowerCase() === 'display'
  ) {
    return {
      styleFamily: 'BOLD_DISPLAY',
      strokeModel: 'monoline',
      serifStyle: 'none',
      terminalStyle: 'straight',
      cornerStyle: 'sharp',
      curveModel: 'smooth_geometric',
      counterStyle: 'narrow_slit',
      baselineBehavior: 'straight',
      crossbarHeight: 0.52,
      contrastRatio: 0.75,
      slantAngle: 0,
    };
  }

  // 9. DEVANAGARI / HINDI
  if (
    text.includes('devanagari') ||
    text.includes('hindi') ||
    text.includes('sanskrit') ||
    text.includes('हिंदी') ||
    text.includes('देवनागरी') ||
    category.toLowerCase() === 'devanagari'
  ) {
    return {
      styleFamily: 'DEVANAGARI',
      strokeModel: 'monoline',
      serifStyle: 'none',
      terminalStyle: 'straight',
      cornerStyle: 'rounded',
      curveModel: 'smooth_geometric',
      counterStyle: 'standard',
      baselineBehavior: 'straight',
      crossbarHeight: 0.50,
      contrastRatio: 0.85,
      slantAngle: 0,
    };
  }

  // 10. MONOSPACE
  if (category.toLowerCase() === 'monospace' || text.includes('mono') || text.includes('code')) {
    return {
      styleFamily: 'MONOSPACE',
      strokeModel: 'monoline',
      serifStyle: 'slab_block',
      terminalStyle: 'straight',
      cornerStyle: 'sharp',
      curveModel: 'smooth_geometric',
      counterStyle: 'standard',
      baselineBehavior: 'straight',
      crossbarHeight: 0.50,
      contrastRatio: 0.90,
      slantAngle: 0,
    };
  }

  // Default: GEOMETRIC SANS
  return {
    styleFamily: 'GEOMETRIC_SANS',
    strokeModel: 'monoline',
    serifStyle: 'none',
    terminalStyle: 'straight',
    cornerStyle: 'sharp',
    curveModel: 'smooth_geometric',
    counterStyle: 'standard',
    baselineBehavior: 'straight',
    crossbarHeight: 0.50,
    contrastRatio: 0.88,
    slantAngle: 0,
  };
}

/**
 * Validates and normalizes raw AI specification JSON into a complete FontSpecification.
 */
export function validateSpecificationOutput(
  raw: Record<string, unknown>,
  params: GenerateSpecificationParams
): FontSpecification {
  const name =
    typeof raw.fontName === 'string' && raw.fontName.trim().length > 0
      ? raw.fontName.trim().substring(0, 80)
      : params.fontName || 'AIFont';

  // Determine base stem width from weight
  let stemWidth = 75;
  if (params.weight === 'Thin' || params.weight === 'Extra Light') stemWidth = 35;
  if (params.weight === 'Light') stemWidth = 55;
  if (params.weight === 'Medium') stemWidth = 95;
  if (params.weight === 'Semi Bold') stemWidth = 125;
  if (params.weight === 'Bold') stemWidth = 155;
  if (params.weight === 'Extra Bold' || params.weight === 'Black') stemWidth = 190;

  if (typeof raw.stemWidth === 'number' && raw.stemWidth >= 25 && raw.stemWidth <= 240) {
    stemWidth = Math.round(raw.stemWidth);
  }

  // 1. Derive fallback style spec from prompt keywords
  const fallbackStyleSpec = deriveStyleFamilyFromPrompt(
    params.prompt,
    params.category,
    params.style
  );

  // 2. Extract and merge raw AI styleSpec if present
  let styleSpec: FontStyleSpecification = { ...fallbackStyleSpec };

  if (raw.styleSpec && typeof raw.styleSpec === 'object') {
    const rawStyle = raw.styleSpec as Record<string, unknown>;

    const validFamilies: StyleFamily[] = [
      'HORROR',
      'BUBBLE',
      'LUXURY_SERIF',
      'FUTURISTIC',
      'HANDWRITTEN',
      'GOTHIC',
      'BOLD_DISPLAY',
      'RETRO_PSYCHEDELIC',
      'GEOMETRIC_SANS',
      'MONOSPACE',
      'DEVANAGARI',
    ];

    if (
      typeof rawStyle.styleFamily === 'string' &&
      validFamilies.includes(rawStyle.styleFamily as StyleFamily)
    ) {
      styleSpec.styleFamily = rawStyle.styleFamily as StyleFamily;
    }

    if (typeof rawStyle.crossbarHeight === 'number' && rawStyle.crossbarHeight >= 0.25 && rawStyle.crossbarHeight <= 0.75) {
      styleSpec.crossbarHeight = rawStyle.crossbarHeight;
    }

    if (typeof rawStyle.contrastRatio === 'number' && rawStyle.contrastRatio >= 0.15 && rawStyle.contrastRatio <= 1.0) {
      styleSpec.contrastRatio = rawStyle.contrastRatio;
    }

    if (typeof rawStyle.slantAngle === 'number' && rawStyle.slantAngle >= -0.3 && rawStyle.slantAngle <= 0.4) {
      styleSpec.slantAngle = rawStyle.slantAngle;
    }
  }

  // Adjust stemWidth according to style family
  if (styleSpec.styleFamily === 'BUBBLE') {
    stemWidth = Math.max(120, Math.round(stemWidth * 1.3));
  } else if (styleSpec.styleFamily === 'BOLD_DISPLAY') {
    stemWidth = Math.max(140, Math.round(stemWidth * 1.4));
  } else if (styleSpec.styleFamily === 'LUXURY_SERIF') {
    stemWidth = Math.max(70, Math.round(stemWidth * 1.05));
  }

  // Devanagari detection
  const textLower = `${params.prompt} ${params.category} ${params.style}`.toLowerCase();
  const isDevanagariPrompt =
    params.characterSet.devanagari ||
    params.category === 'Devanagari' ||
    styleSpec.styleFamily === 'DEVANAGARI' ||
    textLower.includes('devanagari') ||
    textLower.includes('hindi') ||
    textLower.includes('sanskrit') ||
    textLower.includes('हिंदी') ||
    textLower.includes('देवनागरी');

  const charSet: CharacterSetConfig = {
    ...params.characterSet,
    devanagari: isDevanagariPrompt,
  };

  if (isDevanagariPrompt) {
    styleSpec.styleFamily = 'DEVANAGARI';
  }

  // Calculate random seed for controlled variation
  let seed = params.randomSeed;
  if (!seed) {
    let hash = 0;
    for (let i = 0; i < params.prompt.length; i++) {
      hash = (hash << 5) - hash + params.prompt.charCodeAt(i);
      hash |= 0;
    }
    seed = Math.abs(hash);
  }
  styleSpec.randomSeed = seed;

  return {
    fontName: name.replace(/[^a-zA-Z0-9\s_-]/g, ''),
    category: params.category,
    weight: params.weight,
    width: params.width,
    style: params.style,
    unitsPerEm: 1000,
    ascender: 800,
    descender: -200,
    capHeight: 700,
    xHeight: 500,
    stemWidth,
    cornerStyle: params.advancedSettings.cornerStyle,
    contrast: params.advancedSettings.contrast,
    strokeStyle: params.advancedSettings.strokeStyle,
    characterSet: charSet,
    advancedSettings: params.advancedSettings,
    designDescription:
      typeof raw.designDescription === 'string'
        ? raw.designDescription.substring(0, 300)
        : `Vector typeface synthesized for ${styleSpec.styleFamily} style family.`,
    prompt: params.prompt,
    styleSpec,
  };
}

/**
 * Unified AI Provider abstraction layer.
 */
export async function generateFontSpecification(
  params: GenerateSpecificationParams
): Promise<FontSpecification> {
  try {
    const aiResult = await AIProviderService.generateFontSpecification(params.prompt, {
      category: params.category,
      weight: params.weight,
      width: params.width,
      style: params.style,
      requestType: 'font_specification',
    });

    const spec = aiResult.specification;

    return validateSpecificationOutput(
      {
        fontName: spec.fontName || params.fontName,
        stemWidth: spec.stemWidth,
        styleSpec: spec.styleSpec,
        designDescription: `Synthesized via ${aiResult.providerUsed} (${aiResult.modelUsed})`,
      },
      params
    );
  } catch (err) {
    console.warn('AI provider generation failed or unconfigured, falling back to rule-based parser:', err);

    return validateSpecificationOutput(
      {
        fontName: params.fontName || 'AIFont',
        designDescription: 'Synthesized via rule-based typographic geometry parser',
      },
      params
    );
  }
}
