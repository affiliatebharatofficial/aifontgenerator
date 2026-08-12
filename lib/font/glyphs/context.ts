import type { FontStyleDNA } from '../specification/dna';
import type { FontSpecification } from '../specification/types';
import { validateFontStyleDNA } from '../specification/dnaValidator';

export interface GlyphPoint {
  x: number;
  y: number;
}

export class GlyphGeometryContext {
  public spec: FontSpecification;
  public dna: FontStyleDNA;

  // Primary Font Metrics
  public unitsPerEm: number;
  public capH: number;
  public xH: number;
  public asc: number;
  public desc: number;
  public widthScale: number;

  // Stroke Metrics
  public stem: number;
  public hStem: number;
  public contrastRatio: number;
  public slantAngle: number;

  // Style Parameters
  public roundness: number;
  public angularity: number;
  public distortion: number;
  public symmetry: number;
  public seed: number;
  public overshoot: number;

  constructor(spec: FontSpecification, customSeed?: number) {
    this.spec = spec;
    this.dna = spec.styleDNA
      ? validateFontStyleDNA(spec.styleDNA, spec.prompt || spec.designDescription)
      : validateFontStyleDNA({}, spec.prompt || spec.designDescription);

    this.unitsPerEm = this.dna.unitsPerEm || spec.unitsPerEm || 1000;
    this.capH = Math.round(this.dna.proportions.capHeight * this.unitsPerEm);
    this.xH = Math.round(this.dna.proportions.xHeight * this.unitsPerEm);
    this.asc = Math.round(this.dna.proportions.ascender * this.unitsPerEm);
    this.desc = Math.round(this.dna.proportions.descender * this.unitsPerEm);
    this.widthScale = this.dna.proportions.width || 1.0;

    // Derived Stem Widths
    const rawStem = Math.round(this.dna.strokeWidth * this.unitsPerEm);
    this.stem = Math.max(20, Math.min(260, rawStem));

    // Contrast Ratio (0.0 = high contrast Didone ~0.15, 1.0 = monoline ~1.0)
    this.contrastRatio = Math.max(0.12, 1.0 - this.dna.strokeContrast * 0.85);
    this.hStem = Math.max(8, Math.round(this.stem * this.contrastRatio));

    this.slantAngle = this.dna.slant || 0;
    this.roundness = this.dna.roundness;
    this.angularity = this.dna.angularity;
    this.distortion = this.dna.distortion;
    this.symmetry = this.dna.symmetry;

    // Typographic Overshoot for curved crowns and bowls (1000 UPM grid)
    // Angular/Chamfered techno styles do not overshoot. Rounded styles overshoot by ~10-16 units.
    if (this.dna.styleFamily === 'FUTURISTIC' || this.dna.cornerStyle === 'CHAMFERED' || this.angularity > 0.8) {
      this.overshoot = 0;
    } else {
      this.overshoot = Math.max(0, Math.min(20, Math.round(14 * Math.max(0.2, this.roundness))));
    }

    // Deterministic seed generation based on font name and prompt hash
    this.seed = customSeed !== undefined ? customSeed : this.hashString((spec.fontName || '') + (spec.prompt || ''));
  }

  /**
   * Deterministic Hash for string seeding
   */
  private hashString(str: string): number {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  /**
   * Seeded Pseudo-Random Number Generator returning deterministic float in [-1.0, 1.0].
   */
  public seededRand(glyphCode: number, salt: number = 0): number {
    let t = (this.seed ^ (glyphCode * 374761393) ^ (salt * 668265263)) >>> 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const normalized = ((t ^ (t >>> 14)) >>> 0) / 4294967296; // [0, 1)
    return normalized * 2.0 - 1.0; // [-1.0, 1.0]
  }

  /**
   * Coordinate Transformer: Applies slant, baseline physics, and controlled distortion.
   */
  public pt(x: number, y: number, glyphCode: number = 0, salt: number = 0): GlyphPoint {
    let curX = x;
    let curY = y;

    // 1. Baseline behavior bounce
    if (this.dna.baselineBehavior === 'BOUNCY') {
      curY += this.seededRand(glyphCode, 888) * 32;
    } else if (this.dna.baselineBehavior === 'HANDWRITTEN') {
      curY += this.seededRand(glyphCode, 888) * 16;
    } else if (this.dna.baselineBehavior === 'SUBTLE_VARIATION') {
      curY += this.seededRand(glyphCode, 888) * 6;
    }

    // 2. Controlled deterministic distortion
    if (this.distortion > 0) {
      const maxJitterX = this.distortion * 42;
      const maxJitterY = this.distortion * 32;
      curX += this.seededRand(glyphCode, salt * 2) * maxJitterX;
      curY += this.seededRand(glyphCode, salt * 2 + 1) * maxJitterY;
    }

    // 3. Geometric slant shear
    if (this.slantAngle !== 0) {
      curX += curY * Math.tan(this.slantAngle);
    }

    return {
      x: Math.round(curX),
      y: Math.round(curY),
    };
  }

  /**
   * Optical side bearings based on glyph geometry characteristics
   */
  public getOpticalSideBearings(shape: 'straight' | 'round' | 'diagonal_left' | 'diagonal_right' | 'open_right' | 'open_left' | 'narrow' | 'wide' = 'straight'): { lsb: number; rsb: number } {
    let baseBearing = 48;
    if (this.dna.spacing === 'TIGHT') baseBearing = 32;
    else if (this.dna.spacing === 'OPEN') baseBearing = 68;
    else if (this.dna.spacing === 'DISPLAY') baseBearing = 80;

    switch (shape) {
      case 'round':
        return { lsb: Math.round(baseBearing * 0.75), rsb: Math.round(baseBearing * 0.75) };
      case 'diagonal_left': // e.g. A
        return { lsb: Math.round(baseBearing * 0.65), rsb: Math.round(baseBearing * 0.65) };
      case 'diagonal_right': // e.g. V, W, Y
        return { lsb: Math.round(baseBearing * 0.55), rsb: Math.round(baseBearing * 0.55) };
      case 'open_right': // e.g. C, E, F, K, L
        return { lsb: baseBearing, rsb: Math.round(baseBearing * 0.65) };
      case 'open_left': // e.g. J
        return { lsb: Math.round(baseBearing * 0.65), rsb: baseBearing };
      case 'narrow': // e.g. I, i, l, 1, !, :, ;
        return { lsb: Math.round(baseBearing * 0.8), rsb: Math.round(baseBearing * 0.8) };
      case 'wide': // e.g. W, M, w, m
        return { lsb: Math.round(baseBearing * 0.7), rsb: Math.round(baseBearing * 0.7) };
      case 'straight':
      default:
        return { lsb: baseBearing, rsb: baseBearing };
    }
  }

  /**
   * Calculates standardized advance width for character.
   */
  public getAdvanceWidth(nominalWidth: number, shape: 'straight' | 'round' | 'diagonal_left' | 'diagonal_right' | 'open_right' | 'open_left' | 'narrow' | 'wide' = 'straight'): number {
    if (this.dna.styleFamily === 'MONOSPACE') {
      return Math.round(620 * this.widthScale);
    }

    const { lsb, rsb } = this.getOpticalSideBearings(shape);
    const scaledWidth = nominalWidth * this.widthScale;
    return Math.max(160, Math.round(scaledWidth + (lsb + rsb - 96)));
  }

  /**
   * Center X coordinate for glyph bounded box within nominal advance width.
   */
  public getCenterOffset(totalContentWidth: number, advanceWidth: number): number {
    return Math.max(20, Math.round((advanceWidth - totalContentWidth) / 2));
  }
}

