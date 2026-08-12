import type { FontStyleDNA, SpacingSystem } from './dna';

export type ControlWeight = 'Thin' | 'Light' | 'Regular' | 'Medium' | 'Bold' | 'Black';
export type ControlWidth = 'Condensed' | 'Normal' | 'Expanded';
export type ControlSlant = 'Upright' | 'Slight' | 'Italic' | 'Strong Italic';
export type ControlSpacing = 'Tight' | 'Normal' | 'Open';

export interface GenerationControls {
  styleStrength: number; // 0 to 100 (default 50)
  variation: number;     // 0 to 100 (default 50)
  weight: ControlWeight;
  width: ControlWidth;
  slant: ControlSlant;
  spacing: ControlSpacing;
  seed?: number;          // Master deterministic seed
  variationSeed?: number; // Micro-variation seed for variation cards
  engineVersion?: string;
}

export const DEFAULT_GENERATION_CONTROLS: GenerationControls = {
  styleStrength: 50,
  variation: 50,
  weight: 'Regular',
  width: 'Normal',
  slant: 'Upright',
  spacing: 'Normal',
  engineVersion: '1.0.0',
};

export class GenerationControlsEngine {
  /**
   * Immutably applies generation controls onto a base FontStyleDNA object.
   * Priority: Explicit Prompt Intent > Explicit User Controls > AI Interpretation > Rule Defaults.
   */
  public static applyGenerationControlsToDNA(
    baseDNA: FontStyleDNA,
    controls: GenerationControls
  ): FontStyleDNA {
    const updated: FontStyleDNA = {
      ...baseDNA,
      proportions: { ...baseDNA.proportions },
      modifiers: { ...(baseDNA.modifiers || {}) },
      activeModifiers: baseDNA.activeModifiers ? [...baseDNA.activeModifiers] : [],
    };

    const effectiveSeed = controls.variationSeed !== undefined && controls.variationSeed !== 0
      ? controls.variationSeed
      : controls.seed !== undefined
      ? controls.seed
      : 42;

    // Helper PRNG for deterministic micro-variations
    const rand = (salt: number): number => {
      let t = (effectiveSeed ^ (salt * 16777619)) >>> 0;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2.0 - 1.0; // [-1.0, 1.0]
    };

    // 1. STYLE STRENGTH (0 to 100, 50 = normal)
    // Modulates style expression intensity without destroying family characteristics
    const strengthFactor = Math.max(0, Math.min(100, controls.styleStrength)) / 50.0; // 0.0 to 2.0
    if (updated.distortion > 0) {
      updated.distortion = Math.max(0.0, Math.min(0.85, updated.distortion * strengthFactor));
    }
    if (updated.roundness > 0.5) {
      updated.roundness = Math.min(1.0, 0.5 + (updated.roundness - 0.5) * strengthFactor);
    } else if (updated.roundness < 0.5) {
      updated.roundness = Math.max(0.0, 0.5 - (0.5 - updated.roundness) * strengthFactor);
    }
    if (updated.angularity > 0.5) {
      updated.angularity = Math.min(1.0, 0.5 + (updated.angularity - 0.5) * strengthFactor);
    }
    if (updated.modifiers && updated.modifiers.terminalStrength !== undefined) {
      updated.modifiers.terminalStrength = Math.max(0.2, Math.min(1.0, updated.modifiers.terminalStrength * strengthFactor));
    }


    // 2. CREATIVITY / VARIATION (0 to 100, 50 = balanced)
    // Injects controlled deterministic micro-variations into proportions & distortion
    const variationFactor = Math.max(0, Math.min(100, controls.variation)) / 50.0; // 0.0 to 2.0
    if (variationFactor > 0) {
      const microDistortion = (variationFactor - 1.0) * 0.12;
      updated.distortion = Math.max(0.0, Math.min(0.85, updated.distortion + Math.max(0, microDistortion)));

      // Deterministic proportion micro-nudges
      const widthNudge = rand(101) * 0.04 * variationFactor;
      const heightNudge = rand(202) * 0.03 * variationFactor;
      updated.proportions.width = Math.max(0.65, Math.min(1.40, updated.proportions.width + widthNudge));
      updated.proportions.capHeight = Math.max(0.62, Math.min(0.85, updated.proportions.capHeight + heightNudge));
    }

    // 3. FONT WEIGHT CONTROL (Explicit Override > Inferred Defaults)
    // Map control to strokeWidth: Thin=0.035, Light=0.055, Regular=0.08, Medium=0.10, Bold=0.16, Black=0.24
    if (!baseDNA.activeModifiers?.includes('HAIRLINE') && !baseDNA.activeModifiers?.includes('BLACK_OVERRIDE')) {
      switch (controls.weight) {
        case 'Thin':
          updated.strokeWidth = 0.035;
          break;
        case 'Light':
          updated.strokeWidth = 0.055;
          break;
        case 'Regular':
          updated.strokeWidth = 0.08;
          break;
        case 'Medium':
          updated.strokeWidth = 0.105;
          break;
        case 'Bold':
          updated.strokeWidth = 0.16;
          break;
        case 'Black':
          updated.strokeWidth = 0.24;
          break;
      }
    }

    // 4. FONT WIDTH CONTROL (Explicit Override > Inferred Defaults)
    // Map control to widthScale: Condensed=0.80, Normal=1.00, Expanded=1.22
    if (!baseDNA.activeModifiers?.includes('ULTRA_CONDENSED') && !baseDNA.activeModifiers?.includes('ULTRA_EXPANDED')) {
      switch (controls.width) {
        case 'Condensed':
          updated.proportions.width = 0.80;
          break;
        case 'Normal':
          updated.proportions.width = 1.00;
          break;
        case 'Expanded':
          updated.proportions.width = 1.22;
          break;
      }
    }

    // 5. SLANT CONTROL (Explicit Override)
    // Map control to slant angle in radians: Upright=0.00, Slight=0.08, Italic=0.20, Strong Italic=0.32
    switch (controls.slant) {
      case 'Upright':
        updated.slant = 0.00;
        break;
      case 'Slight':
        updated.slant = 0.08;
        break;
      case 'Italic':
        updated.slant = 0.20;
        break;
      case 'Strong Italic':
        updated.slant = 0.32;
        break;
    }

    // 6. SPACING CONTROL (Explicit Override)
    // Map control to spacing system: Tight='TIGHT', Normal='NORMAL', Open='OPEN'
    switch (controls.spacing) {
      case 'Tight':
        updated.spacing = 'TIGHT' as SpacingSystem;
        break;
      case 'Normal':
        updated.spacing = 'NORMAL' as SpacingSystem;
        break;
      case 'Open':
        updated.spacing = 'OPEN' as SpacingSystem;
        break;
    }

    // Store active control summary in activeModifiers
    const controlTags = [
      `str:${controls.styleStrength}`,
      `var:${controls.variation}`,
      `w:${controls.weight}`,
      `wd:${controls.width}`,
      `sl:${controls.slant}`,
      `sp:${controls.spacing}`,
    ];
    updated.activeModifiers = Array.from(new Set([...(updated.activeModifiers || []), ...controlTags]));

    return updated;
  }
}
