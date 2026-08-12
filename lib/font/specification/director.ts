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
  type FontStyleDNA,
} from './dna';
import { validateFontStyleDNA, createDefaultStyleDNA } from './dnaValidator';
import { PromptIntelligenceEngine } from './promptIntelligence';
import type {
  FontStyleSpecification,
  FontSpecification,
  StyleFamily as LegacyStyleFamily,
} from './types';
import type {
  FontCategory,
  FontWeight,
  FontWidth,
  FontStyle,
  CharacterSetConfig,
  AdvancedSettingsConfig,
} from '@/types/database';

export interface TypographyDirectorContext {
  category?: FontCategory;
  weight?: FontWeight;
  width?: FontWidth;
  style?: FontStyle;
  characterSet?: CharacterSetConfig;
  advancedSettings?: AdvancedSettingsConfig;
  userId?: string;
  generationId?: string;
}

export interface DirectorInterpretationResult {
  dna: FontStyleDNA;
  providerUsed: string;
  modelUsed: string;
  fallbackUsed: boolean;
  latencyMs: number;
}

export class FontTypographyDirector {
  /**
   * Builds the strict, token-efficient system prompt for the AI Typography Director.
   */
  public static buildDirectorSystemPrompt(): string {
    return `You are a world-class AI Typography Director and Master Font Engineer.
Analyze the user's typeface request and synthesize a structured, cohesive FontStyleDNA JSON object.
You must extract both the high-level style family and any fine-grained design modifiers (width, height, weight, terminals, corners, strokes, counters, baseline, spacing, slant).

Allowed Enum Values:
- styleFamily: ${JSON.stringify(STYLE_FAMILIES)}
- strokeModel: ${JSON.stringify(STROKE_MODELS)}
- terminalStyle: ${JSON.stringify(TERMINAL_STYLES)}
- cornerStyle: ${JSON.stringify(CORNER_STYLES)}
- curveModel: ${JSON.stringify(CURVE_MODELS)}
- counterStyle: ${JSON.stringify(COUNTER_STYLES)}
- baselineBehavior: ${JSON.stringify(BASELINE_BEHAVIORS)}
- spacing: ${JSON.stringify(SPACING_SYSTEMS)}
- decorationLevel: ${JSON.stringify(DECORATION_LEVELS)}
- glyphVariation: ${JSON.stringify(GLYPH_VARIATIONS)}
- visualComplexity: ${JSON.stringify(VISUAL_COMPLEXITIES)}

Numeric Bounds (All values normalized relative to 1000 unitsPerEm):
- strokeWidth: number between 0.02 (hairline) and 0.28 (ultra black). Regular is ~0.08.
- strokeContrast: number between 0.0 (monoline) and 1.0 (Didone extreme).
- roundness: number between 0.0 (angular/sharp) and 1.0 (inflated/pillowy).
- angularity: number between 0.0 (smooth/organic) and 1.0 (faceted/techno).
- distortion: number between 0.0 (clean geometric) and 0.85 (heavily distressed/organic).
- symmetry: number between 0.0 (asymmetric/dynamic) and 1.0 (strict formal symmetry).
- slant: number between -0.25 (reverse) and 0.35 (italic/oblique).
- proportions: {
    "width": number (0.70 to 1.35),
    "xHeight": number (0.40 to 0.65),
    "capHeight": number (0.65 to 0.80),
    "ascender": number (0.75 to 0.92),
    "descender": number (-0.30 to -0.12)
  }

Return ONLY a valid raw JSON object matching this schema:
{
  "styleFamily": "...",
  "strokeModel": "...",
  "terminalStyle": "...",
  "cornerStyle": "...",
  "curveModel": "...",
  "counterStyle": "...",
  "baselineBehavior": "...",
  "spacing": "...",
  "decorationLevel": "...",
  "glyphVariation": "...",
  "visualComplexity": "...",
  "strokeWidth": 0.08,
  "strokeContrast": 0.20,
  "roundness": 0.50,
  "angularity": 0.20,
  "distortion": 0.00,
  "symmetry": 0.85,
  "slant": 0.00,
  "proportions": {
    "width": 1.0,
    "xHeight": 0.50,
    "capHeight": 0.70,
    "ascender": 0.80,
    "descender": -0.20
  },
  "modifiers": {
    "width": "NARROW | WIDE | NORMAL",
    "height": "TALL | SHORT | NORMAL",
    "terminals": "DRIPPING | FANG | ROUND | FLAT | WEDGE | HAIRLINE",
    "corners": "SHARP | ROUND | CHAMFERED | CRACKED",
    "baseline": "BOUNCY | IRREGULAR | FLAT | HANDWRITTEN"
  },
  "activeModifiers": ["NARROW", "DRIPPING"],
  "designIntent": "Brief 1-2 sentence description of typography styling decisions"
}

Do NOT wrap in markdown blocks. Output raw JSON only.`;
  }

  /**
   * Interprets user prompt into validated FontStyleDNA via AI Provider layer with failover.
   */
  public static async interpretPromptToDNA(
    prompt: string,
    context: TypographyDirectorContext = {}
  ): Promise<DirectorInterpretationResult> {
    const startTime = Date.now();

    try {
      // Dynamic import to prevent circular dependency
      const { AIProviderService } = await import('@/lib/ai/provider-service');

      const aiResult = await AIProviderService.generateTypographyDNA(prompt, {
        userId: context.userId,
        generationId: context.generationId,
        category: context.category,
        weight: context.weight,
        width: context.width,
        style: context.style,
      });

      const validatedDNA = validateFontStyleDNA(aiResult.rawJson, prompt, 'ai_director');
      const mergedDNA = PromptIntelligenceEngine.mergeAIDNAWithPromptModifiers(validatedDNA, prompt);

      return {
        dna: mergedDNA,
        providerUsed: aiResult.providerUsed,
        modelUsed: aiResult.modelUsed,
        fallbackUsed: false,
        latencyMs: Date.now() - startTime,
      };
    } catch (err) {
      console.warn('AI Typography Director failed, invoking rule-based DNA synthesizer:', err);

      const fallbackDNA = this.createFallbackDNA(
        prompt,
        context.category,
        context.weight,
        context.width,
        context.style
      );

      return {
        dna: fallbackDNA,
        providerUsed: 'rule_synthesizer',
        modelUsed: 'deterministic_heuristics',
        fallbackUsed: true,
        latencyMs: Date.now() - startTime,
      };
    }
  }


  /**
   * Resilient, rule-based typographic DNA synthesizer.
   * Used when AI providers are unavailable or fail validation.
   */
  public static createFallbackDNA(
    prompt: string,
    category?: string,
    weight?: string,
    width?: string,
    style?: string
  ): FontStyleDNA {
    const analysis = PromptIntelligenceEngine.analyzePrompt(prompt, category);
    const text = `${prompt} ${category || ''} ${style || ''}`.toLowerCase();

    // Default metrics derived from weight & width
    let strokeWidth = 0.08;
    if (weight === 'Thin' || weight === 'Extra Light') strokeWidth = 0.035;
    else if (weight === 'Light') strokeWidth = 0.055;
    else if (weight === 'Medium') strokeWidth = 0.095;
    else if (weight === 'Semi Bold') strokeWidth = 0.125;
    else if (weight === 'Bold') strokeWidth = 0.155;
    else if (weight === 'Extra Bold' || weight === 'Black') strokeWidth = 0.20;

    let widthScale = 1.0;
    if (width === 'Condensed' || width === 'Semi Condensed') widthScale = 0.82;
    else if (width === 'Expanded' || width === 'Semi Expanded') widthScale = 1.22;

    const baseDNA = createDefaultStyleDNA(analysis.baseFamily, `Fallback synthesis for: "${prompt}"`);
    baseDNA.strokeWidth = strokeWidth;
    baseDNA.proportions.width = widthScale;

    let familyDNA = baseDNA;

    // 1. MONOSPACE / TERMINAL / CODE
    if (
      analysis.baseFamily === 'MONOSPACE' ||
      category === 'Monospace' ||
      text.includes('monospace') ||
      text.includes('fixed-width') ||
      text.includes('terminal code') ||
      text.includes('code font') ||
      text.includes('programming font')
    ) {
      familyDNA = {
        ...baseDNA,
        styleFamily: 'MONOSPACE',
        strokeModel: 'MONOLINE',
        terminalStyle: 'FLAT',
        cornerStyle: 'SHARP',
        curveModel: 'GEOMETRIC',
        counterStyle: 'ROUND',
        baselineBehavior: 'STABLE',
        spacing: 'DISPLAY',
        decorationLevel: 'NONE',
        glyphVariation: 'NONE',
        visualComplexity: 'MINIMAL',
        strokeWidth: strokeWidth,
        strokeContrast: 0.05,
        roundness: 0.20,
        angularity: 0.40,
        distortion: 0.00,
        symmetry: 0.95,
        slant: 0.00,
        designIntent: 'Uniform fixed-pitch typographic proportions designed for technical precision.',
      };
    }
    // 2. HORROR / OCCULT / SPOOKY / CREEPY
    else if (
      analysis.baseFamily === 'HORROR' ||
      analysis.baseFamily === 'OCCULT' ||
      text.includes('horror') ||
      text.includes('scary') ||
      text.includes('creepy') ||
      text.includes('blood') ||
      text.includes('halloween') ||
      text.includes('monster') ||
      text.includes('zombie') ||
      text.includes('fang') ||
      text.includes('spooky') ||
      text.includes('distort') ||
      text.includes('dark') ||
      text.includes('occult')
    ) {
      familyDNA = {
        ...baseDNA,
        styleFamily: text.includes('occult') || analysis.baseFamily === 'OCCULT' ? 'OCCULT' : 'HORROR',
        strokeModel: 'MODULATED',
        terminalStyle: 'SHARP',
        cornerStyle: 'IRREGULAR',
        curveModel: 'IRREGULAR',
        counterStyle: 'NARROW',
        baselineBehavior: 'IRREGULAR',
        spacing: 'NORMAL',
        decorationLevel: 'SUBTLE',
        glyphVariation: 'MODERATE',
        visualComplexity: 'COMPLEX',
        strokeWidth: Math.max(0.08, strokeWidth),
        strokeContrast: 0.55,
        roundness: 0.10,
        angularity: 0.85,
        distortion: 0.65,
        symmetry: 0.35,
        slant: 0.06,
        designIntent: 'Aggressive, sharp chiseled letterforms with distressed irregular contours.',
      };
    }
    // 3. BUBBLE / CARTOON / BALLOON / PUFFY
    else if (
      analysis.baseFamily === 'BUBBLE' ||
      analysis.baseFamily === 'CARTOON' ||
      text.includes('bubble') ||
      text.includes('balloon') ||
      text.includes('inflated') ||
      text.includes('puffy') ||
      text.includes('cute') ||
      text.includes('cartoon') ||
      text.includes('comic') ||
      (/\bsoft\b/i.test(text) && !text.includes('software'))
    ) {
      familyDNA = {
        ...baseDNA,
        styleFamily: text.includes('cartoon') || text.includes('comic') || analysis.baseFamily === 'CARTOON' ? 'CARTOON' : 'BUBBLE',
        strokeModel: 'MONOLINE',
        terminalStyle: 'ROUND',
        cornerStyle: 'ROUND',
        curveModel: 'CIRCULAR',
        counterStyle: 'ROUND',
        baselineBehavior: 'STABLE',
        spacing: 'NORMAL',
        decorationLevel: 'NONE',
        glyphVariation: 'SUBTLE',
        visualComplexity: 'MINIMAL',
        strokeWidth: Math.max(0.14, strokeWidth * 1.3),
        strokeContrast: 0.10,
        roundness: 0.95,
        angularity: 0.05,
        distortion: 0.00,
        symmetry: 0.90,
        slant: 0.00,
        proportions: {
          ...baseDNA.proportions,
          width: Math.max(1.15, widthScale * 1.15),
        },
        designIntent: 'Heavily rounded, inflated cushion letterforms with soft circular terminals.',
      };
    }
    // 4. LUXURY SERIF / DIDONE / EDITORIAL / ELEGANT
    else if (
      analysis.baseFamily === 'DIDONE_SERIF' ||
      analysis.baseFamily === 'SERIF' ||
      analysis.baseFamily === 'SLAB_SERIF' ||
      text.includes('luxury') ||
      text.includes('editorial') ||
      text.includes('fashion') ||
      text.includes('didot') ||
      text.includes('bodoni') ||
      text.includes('vogue') ||
      text.includes('elegant') ||
      (category && category.toLowerCase().includes('serif') && !category.toLowerCase().includes('sans'))
    ) {
      const isSlab = text.includes('slab') || text.includes('rockwell') || analysis.baseFamily === 'SLAB_SERIF';
      familyDNA = {
        ...baseDNA,
        styleFamily: isSlab ? 'SLAB_SERIF' : text.includes('luxury') || text.includes('didot') || analysis.baseFamily === 'DIDONE_SERIF' ? 'DIDONE_SERIF' : 'SERIF',
        strokeModel: isSlab ? 'MONOLINE' : 'HIGH_CONTRAST',
        terminalStyle: 'SERIFED',
        cornerStyle: 'SHARP',
        curveModel: 'GEOMETRIC',
        counterStyle: 'OVAL',
        baselineBehavior: 'STABLE',
        spacing: 'OPEN',
        decorationLevel: 'SUBTLE',
        glyphVariation: 'NONE',
        visualComplexity: 'MODERATE',
        strokeWidth: isSlab ? Math.max(0.10, strokeWidth) : strokeWidth,
        strokeContrast: isSlab ? 0.20 : 0.85,
        roundness: 0.25,
        angularity: 0.40,
        distortion: 0.00,
        symmetry: 0.92,
        slant: text.includes('italic') ? 0.20 : 0.00,
        designIntent: 'Refined high-contrast luxury serif with razor hairlines and structured bracket serifs.',
      };
    }
    // 5. FUTURISTIC / TECHNO / SCI-FI / CYBERPUNK / GAMING
    else if (
      analysis.baseFamily === 'FUTURISTIC' ||
      text.includes('futuristic') ||
      text.includes('cyber') ||
      text.includes('techno') ||
      text.includes('gaming') ||
      text.includes('sci-fi') ||
      text.includes('space') ||
      text.includes('robot') ||
      text.includes('angular')
    ) {
      familyDNA = {
        ...baseDNA,
        styleFamily: 'FUTURISTIC',
        strokeModel: 'CONSTRUCTED',
        terminalStyle: 'CUT',
        cornerStyle: 'CHAMFERED',
        curveModel: 'ANGULAR',
        counterStyle: 'ANGULAR',
        baselineBehavior: 'STABLE',
        spacing: 'OPEN',
        decorationLevel: 'SUBTLE',
        glyphVariation: 'NONE',
        visualComplexity: 'MODERATE',
        strokeWidth: strokeWidth,
        strokeContrast: 0.12,
        roundness: 0.05,
        angularity: 0.90,
        distortion: 0.00,
        symmetry: 0.88,
        slant: text.includes('italic') ? 0.20 : 0.05,
        proportions: {
          ...baseDNA.proportions,
          width: Math.max(1.15, widthScale * 1.15),
        },
        designIntent: 'Modular 45-degree chamfered techno glyphs with angular octagonal counters.',
      };
    }
    // 6. HANDWRITTEN / BRUSH / SCRIPT / SIGNATURE / CALLIGRAPHY
    else if (
      analysis.baseFamily === 'HANDWRITTEN' ||
      analysis.baseFamily === 'BRUSH' ||
      analysis.baseFamily === 'SCRIPT' ||
      text.includes('handwritten') ||
      text.includes('brush') ||
      text.includes('cursive') ||
      text.includes('script') ||
      text.includes('signature') ||
      text.includes('calligraph') ||
      text.includes('loose') ||
      category === 'Handwritten' ||
      category === 'Script'
    ) {
      const isBrush = text.includes('brush') || text.includes('paint') || analysis.baseFamily === 'BRUSH';
      const isScript = text.includes('script') || text.includes('cursive') || analysis.baseFamily === 'SCRIPT';
      familyDNA = {
        ...baseDNA,
        styleFamily: isBrush ? 'BRUSH' : isScript ? 'SCRIPT' : 'HANDWRITTEN',
        strokeModel: isBrush ? 'BRUSH' : 'CALLIGRAPHIC',
        terminalStyle: 'BRUSH',
        cornerStyle: 'SOFT',
        curveModel: 'ORGANIC',
        counterStyle: 'OPEN',
        baselineBehavior: 'HANDWRITTEN',
        spacing: 'NORMAL',
        decorationLevel: 'MODERATE',
        glyphVariation: 'STRONG',
        visualComplexity: 'MODERATE',
        strokeWidth: strokeWidth,
        strokeContrast: 0.45,
        roundness: 0.65,
        angularity: 0.15,
        distortion: 0.35,
        symmetry: 0.40,
        slant: 0.16,
        designIntent: 'Organic calligraphic stroke modulation with natural dancing baseline rhythms.',
      };
    }
    // 7. GOTHIC / BLACKLETTER / MEDIEVAL / FRAKTUR
    else if (
      analysis.baseFamily === 'GOTHIC' ||
      analysis.baseFamily === 'BLACKLETTER' ||
      text.includes('gothic') ||
      text.includes('blackletter') ||
      text.includes('medieval') ||
      text.includes('fraktur') ||
      category === 'Blackletter'
    ) {
      familyDNA = {
        ...baseDNA,
        styleFamily: 'BLACKLETTER',
        strokeModel: 'CALLIGRAPHIC',
        terminalStyle: 'WEDGE',
        cornerStyle: 'CHAMFERED',
        curveModel: 'ANGULAR',
        counterStyle: 'NARROW',
        baselineBehavior: 'STABLE',
        spacing: 'TIGHT',
        decorationLevel: 'STRONG',
        glyphVariation: 'SUBTLE',
        visualComplexity: 'COMPLEX',
        strokeWidth: Math.max(0.12, strokeWidth * 1.2),
        strokeContrast: 0.70,
        roundness: 0.05,
        angularity: 0.95,
        distortion: 0.15,
        symmetry: 0.80,
        slant: 0.00,
        designIntent: 'Dramatic medieval blackletter with fractured diamond terminals and dense vertical rhythm.',
      };
    }
    // 8. RETRO / PSYCHEDELIC / 70S / GROOVY
    else if (
      analysis.baseFamily === 'RETRO' ||
      analysis.baseFamily === 'PSYCHEDELIC' ||
      text.includes('retro') ||
      text.includes('psychedelic') ||
      text.includes('70s') ||
      text.includes('groovy') ||
      text.includes('disco') ||
      text.includes('vintage')
    ) {
      familyDNA = {
        ...baseDNA,
        styleFamily: text.includes('psychedelic') || text.includes('groovy') || analysis.baseFamily === 'PSYCHEDELIC' ? 'PSYCHEDELIC' : 'RETRO',
        strokeModel: 'HIGH_CONTRAST',
        terminalStyle: 'ROUND',
        cornerStyle: 'ROUND',
        curveModel: 'ORGANIC',
        counterStyle: 'OVAL',
        baselineBehavior: 'STABLE',
        spacing: 'TIGHT',
        decorationLevel: 'MODERATE',
        glyphVariation: 'SUBTLE',
        visualComplexity: 'MODERATE',
        strokeWidth: Math.max(0.12, strokeWidth * 1.2),
        strokeContrast: 0.60,
        roundness: 0.80,
        angularity: 0.10,
        distortion: 0.20,
        symmetry: 0.75,
        slant: 0.00,
        designIntent: 'High-energy 1970s psychedelic typeface with bulbous flourishes and organic curves.',
      };
    }
    // 9. DISPLAY / DECORATIVE
    else if (
      analysis.baseFamily === 'DISPLAY' ||
      analysis.baseFamily === 'DECORATIVE' ||
      category === 'Display' ||
      category === 'Decorative' ||
      text.includes('display') ||
      text.includes('poster')
    ) {
      familyDNA = {
        ...baseDNA,
        styleFamily: category === 'Decorative' ? 'DECORATIVE' : 'DISPLAY',
        strokeModel: 'MODULATED',
        terminalStyle: 'FLAT',
        cornerStyle: 'SHARP',
        curveModel: 'GEOMETRIC',
        counterStyle: 'NARROW',
        baselineBehavior: 'STABLE',
        spacing: 'TIGHT',
        decorationLevel: 'SUBTLE',
        glyphVariation: 'NONE',
        visualComplexity: 'MODERATE',
        strokeWidth: Math.max(0.14, strokeWidth * 1.3),
        strokeContrast: 0.35,
        roundness: 0.25,
        angularity: 0.50,
        distortion: 0.00,
        symmetry: 0.90,
        slant: 0.00,
        designIntent: 'Impactful high-density display typeface optimized for headlines and posters.',
      };
    }

    // Now apply fine-grained modifiers extracted from the prompt
    return PromptIntelligenceEngine.applyModifiersToDNA(familyDNA, analysis.modifiers, analysis.activeModifiers);
  }


  /**
   * Bridges new FontStyleDNA into legacy FontStyleSpecification and FontSpecification metrics.
   * Guarantees 100% backwards compatibility with the existing vector compilation pipeline.
   */
  public static dnaToLegacyStyleSpec(dna: FontStyleDNA): FontStyleSpecification {
    // Map new 22-value StyleFamily to legacy 11-value StyleFamily
    let legacyFamily: LegacyStyleFamily = 'GEOMETRIC_SANS';

    if (dna.styleFamily === 'HORROR' || dna.styleFamily === 'OCCULT') {
      legacyFamily = 'HORROR';
    } else if (dna.styleFamily === 'BUBBLE' || dna.styleFamily === 'CARTOON') {
      legacyFamily = 'BUBBLE';
    } else if (dna.styleFamily === 'SERIF' || dna.styleFamily === 'DIDONE_SERIF' || dna.styleFamily === 'SLAB_SERIF') {
      legacyFamily = 'LUXURY_SERIF';
    } else if (dna.styleFamily === 'FUTURISTIC') {
      legacyFamily = 'FUTURISTIC';
    } else if (dna.styleFamily === 'HANDWRITTEN' || dna.styleFamily === 'SCRIPT' || dna.styleFamily === 'BRUSH') {
      legacyFamily = 'HANDWRITTEN';
    } else if (dna.styleFamily === 'GOTHIC' || dna.styleFamily === 'BLACKLETTER') {
      legacyFamily = 'GOTHIC';
    } else if (dna.styleFamily === 'RETRO' || dna.styleFamily === 'PSYCHEDELIC') {
      legacyFamily = 'RETRO_PSYCHEDELIC';
    } else if (dna.styleFamily === 'DISPLAY' || dna.styleFamily === 'DECORATIVE') {
      legacyFamily = 'BOLD_DISPLAY';
    } else if (dna.styleFamily === 'MONOSPACE') {
      legacyFamily = 'MONOSPACE';
    }

    // Map legacy contrast ratio (0.20 to 1.0, where lower means higher contrast)
    const contrastRatio = Math.max(0.15, Math.min(1.0, 1.0 - dna.strokeContrast * 0.75));

    return {
      styleFamily: legacyFamily,
      strokeModel: dna.strokeModel === 'HIGH_CONTRAST' ? 'high_contrast' : dna.strokeModel === 'BRUSH' ? 'variable_brush' : 'monoline',
      serifStyle: dna.terminalStyle === 'SERIFED' ? 'luxury_bracketed' : dna.styleFamily === 'HORROR' ? 'sharp_dagger' : 'none',
      terminalStyle: dna.terminalStyle === 'ROUND' ? 'rounded_ball' : dna.terminalStyle === 'SHARP' ? 'sharp_fang' : 'straight',
      cornerStyle: dna.cornerStyle === 'ROUND' ? 'rounded' : dna.cornerStyle === 'CHAMFERED' ? 'angled' : 'sharp',
      curveModel: dna.curveModel === 'CIRCULAR' ? 'inflated_balloon' : dna.curveModel === 'ANGULAR' ? 'square_techno' : 'smooth_geometric',
      counterStyle: dna.counterStyle === 'NARROW' ? 'narrow_slit' : 'standard',
      baselineBehavior: dna.baselineBehavior === 'HANDWRITTEN' || dna.baselineBehavior === 'BOUNCY' ? 'dancing_organic' : 'straight',
      crossbarHeight: 0.50,
      contrastRatio,
      slantAngle: dna.slant,
    };
  }

  /**
   * Synthesizes a complete FontSpecification from user parameters and Style DNA.
   */
  public static async synthesizeStyleSpecification(params: {
    prompt: string;
    fontName?: string;
    category?: FontCategory;
    weight?: FontWeight;
    width?: FontWidth;
    style?: FontStyle;
    characterSet?: Partial<CharacterSetConfig>;
    advancedSettings?: Partial<AdvancedSettingsConfig>;
    userId?: string;
    generationId?: string;
  }): Promise<FontSpecification> {
    const category = params.category || 'Sans Serif';
    const weight = params.weight || 'Regular';
    const width = params.width || 'Normal';
    const style = params.style || 'Modern';

    // 1. Direct AI Typography Director interpretation
    const directorResult = await this.interpretPromptToDNA(params.prompt, {
      category,
      weight,
      width,
      style,
      characterSet: params.characterSet as CharacterSetConfig,
      advancedSettings: params.advancedSettings as AdvancedSettingsConfig,
      userId: params.userId,
      generationId: params.generationId,
    });

    const dna = directorResult.dna;
    const legacyStyleSpec = this.dnaToLegacyStyleSpec(dna);

    // Calculate stemWidth in unitsPerEm coordinates (1000 UPM)
    const stemWidth = Math.round(dna.strokeWidth * dna.unitsPerEm);
    const capHeight = Math.round(dna.proportions.capHeight * dna.unitsPerEm);
    const xHeight = Math.round(dna.proportions.xHeight * dna.unitsPerEm);
    const ascender = Math.round(dna.proportions.ascender * dna.unitsPerEm);
    const descender = Math.round(dna.proportions.descender * dna.unitsPerEm);

    const name =
      params.fontName && params.fontName.trim().length > 0
        ? params.fontName.trim().replace(/[^a-zA-Z0-9\s_-]/g, '').substring(0, 80)
        : 'AIFont';

    // Devanagari detection
    const textLower = `${params.prompt} ${category} ${style}`.toLowerCase();
    const isDevanagariPrompt =
      Boolean(params.characterSet?.devanagari) ||
      category === 'Devanagari' ||
      (dna.styleFamily as string) === 'DEVANAGARI' ||
      textLower.includes('devanagari') ||
      textLower.includes('hindi') ||
      textLower.includes('sanskrit') ||
      textLower.includes('हिंदी') ||
      textLower.includes('देवनागरी');

    const charSet: CharacterSetConfig = {
      uppercase: true,
      lowercase: true,
      numbers: true,
      punctuation: true,
      ...(params.characterSet || {}),
      devanagari: isDevanagariPrompt,
    };

    const advSettings: AdvancedSettingsConfig = {
      letterSpacing: 0,
      contrast: 'medium',
      cornerStyle: 'sharp',
      strokeStyle: 'solid',
      ...(params.advancedSettings || {}),
    };


    return {
      fontName: name,
      category: params.category || 'Sans Serif',
      weight: params.weight || 'Regular',
      width: params.width || 'Normal',
      style: params.style || 'Modern',
      unitsPerEm: dna.unitsPerEm,
      ascender,
      descender,
      capHeight,
      xHeight,
      stemWidth,
      cornerStyle: advSettings.cornerStyle,
      contrast: advSettings.contrast,
      strokeStyle: advSettings.strokeStyle,
      characterSet: charSet,
      advancedSettings: advSettings,
      designDescription: `${dna.designIntent} (Engine: ${directorResult.providerUsed}/${directorResult.modelUsed})`,
      prompt: params.prompt,
      styleSpec: legacyStyleSpec,
      styleDNA: dna,
    };
  }
}

