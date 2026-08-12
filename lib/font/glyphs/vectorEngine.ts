import { Path, Glyph } from 'opentype.js';
import type { FontSpecification } from '../specification/types';

export type TypographicGenre =
  | 'sans-serif'
  | 'serif'
  | 'handwritten'
  | 'futuristic'
  | 'bubble'
  | 'gothic'
  | 'bold-display'
  | 'pixel'
  | 'monospace';

export class GlyphVectorEngine {
  private spec: FontSpecification;
  private genre: TypographicGenre;
  private stem: number;
  private capH: number;
  private xH: number;
  private asc: number;
  private desc: number;
  private slantAngle: number;
  private widthScale: number;
  private contrastRatio: number;
  private cornerRadius: number;

  constructor(spec: FontSpecification) {
    this.spec = spec;

    const p = (spec.prompt || '').toLowerCase();
    const c = (spec.category || '').toLowerCase();
    const s = (spec.style || '').toLowerCase();
    const d = (spec.designDescription || '').toLowerCase();
    const n = (spec.fontName || '').toLowerCase();
    const textAll = `${p} ${c} ${s} ${d} ${n}`;

    // 1. Determine Typographic Genre accurately
    if (
      textAll.includes('pixel') ||
      textAll.includes('8bit') ||
      textAll.includes('arcade') ||
      c === 'pixel'
    ) {
      this.genre = 'pixel';
    } else if (
      textAll.includes('gothic') ||
      textAll.includes('blackletter') ||
      textAll.includes('medieval') ||
      textAll.includes('fraktur') ||
      c === 'blackletter'
    ) {
      this.genre = 'gothic';
    } else if (
      textAll.includes('bubble') ||
      textAll.includes('balloon') ||
      textAll.includes('rounded') ||
      textAll.includes('cute') ||
      textAll.includes('comic') ||
      textAll.includes('cartoon') ||
      textAll.includes('playful')
    ) {
      this.genre = 'bubble';
    } else if (
      textAll.includes('futuristic') ||
      textAll.includes('gaming') ||
      textAll.includes('cyberpunk') ||
      textAll.includes('techno') ||
      textAll.includes('sci-fi') ||
      textAll.includes('angular') ||
      textAll.includes('square')
    ) {
      this.genre = 'futuristic';
    } else if (
      textAll.includes('handwritten') ||
      textAll.includes('script') ||
      textAll.includes('cursive') ||
      textAll.includes('calligraph') ||
      textAll.includes('signature') ||
      textAll.includes('brush') ||
      c === 'handwritten' ||
      c === 'script'
    ) {
      this.genre = 'handwritten';
    } else if (
      textAll.includes('bold') ||
      textAll.includes('heavy') ||
      textAll.includes('poster') ||
      textAll.includes('black') ||
      textAll.includes('impact') ||
      c === 'display'
    ) {
      this.genre = 'bold-display';
    } else if (
      textAll.includes('mono') ||
      textAll.includes('code') ||
      textAll.includes('terminal') ||
      c === 'monospace'
    ) {
      this.genre = 'monospace';
    } else if (
      (c.includes('serif') && !c.includes('sans')) ||
      (s.includes('serif') && !s.includes('sans')) ||
      (p.includes('serif') && !p.includes('sans')) ||
      textAll.includes('luxury') ||
      textAll.includes('editorial') ||
      textAll.includes('elegant') ||
      textAll.includes('roman')
    ) {
      this.genre = 'serif';
    } else {
      this.genre = 'sans-serif';
    }

    // 2. Resolve metrics & stems
    this.stem = Math.max(35, Math.min(220, spec.stemWidth || 80));
    this.capH = spec.capHeight || 700;
    this.xH = spec.xHeight || 500;
    this.asc = spec.ascender || 800;
    this.desc = spec.descender || -200;

    // 3. Width Scale (Condensed, Normal, Expanded)
    const w = (spec.width || '').toLowerCase();
    if (w.includes('condensed') || textAll.includes('condensed') || textAll.includes('narrow')) {
      this.widthScale = 0.82;
    } else if (w.includes('expanded') || textAll.includes('expanded') || textAll.includes('wide')) {
      this.widthScale = 1.22;
    } else {
      this.widthScale = 1.0;
    }

    // 4. Slant Angle (Italic / Oblique / Script)
    const st = (spec.style || '').toLowerCase();
    if (st.includes('italic') || st.includes('oblique') || textAll.includes('italic') || textAll.includes('slanted')) {
      this.slantAngle = 0.22; // ~12.5 degrees
    } else if (this.genre === 'handwritten') {
      this.slantAngle = 0.16; // ~9 degrees natural script slant
    } else {
      this.slantAngle = 0;
    }

    // 5. Stroke Contrast (Thick vertical vs thin horizontal)
    if (this.genre === 'serif') {
      this.contrastRatio = 0.38; // Rich classic contrast
    } else if (this.genre === 'bold-display') {
      this.contrastRatio = 0.65;
    } else if (this.genre === 'futuristic') {
      this.contrastRatio = 0.9;
    } else {
      this.contrastRatio = 0.85; // Clean uniform sans
    }

    // 6. Corner rounding radius
    if (this.genre === 'bubble') {
      this.cornerRadius = 24;
    } else if (this.genre === 'handwritten') {
      this.cornerRadius = 14;
    } else {
      this.cornerRadius = 0;
    }
  }

  /**
   * Main entry point: Generates complete glyph repertoire based on the specification.
   */
  public generateGlyphs(): Glyph[] {
    const glyphs: Glyph[] = [];

    // 1. Mandatory .notdef glyph (Unicode 0)
    glyphs.push(this.createNotDefGlyph());

    // 2. Space glyph (Unicode 32)
    const spaceWidth = this.genre === 'monospace' ? 600 : Math.round(300 * this.widthScale);
    glyphs.push(
      new Glyph({
        name: 'space',
        unicode: 32,
        advanceWidth: spaceWidth,
        path: new Path(),
      })
    );

    // 3. Uppercase A-Z (Unicode 65..90)
    if (this.spec.characterSet.uppercase) {
      for (let i = 65; i <= 90; i++) {
        const char = String.fromCharCode(i);
        glyphs.push(this.createGlyphForChar(char, i, true));
      }
    }

    // 4. Lowercase a-z (Unicode 97..122)
    if (this.spec.characterSet.lowercase) {
      for (let i = 97; i <= 122; i++) {
        const char = String.fromCharCode(i);
        glyphs.push(this.createGlyphForChar(char, i, false));
      }
    }

    // 5. Numbers 0-9 (Unicode 48..57)
    if (this.spec.characterSet.numbers) {
      for (let i = 48; i <= 57; i++) {
        const char = String.fromCharCode(i);
        glyphs.push(this.createNumberGlyph(char, i));
      }
    }

    // 6. Punctuation & Symbols
    if (this.spec.characterSet.punctuation) {
      const puncts = [
        { char: '.', code: 46 },
        { char: ',', code: 44 },
        { char: '!', code: 33 },
        { char: '?', code: 63 },
        { char: ':', code: 58 },
        { char: ';', code: 59 },
        { char: '-', code: 45 },
        { char: '_', code: 95 },
        { char: '+', code: 43 },
        { char: '=', code: 61 },
        { char: '/', code: 47 },
        { char: '(', code: 40 },
        { char: ')', code: 41 },
        { char: "'", code: 39 },
        { char: '"', code: 34 },
        { char: '@', code: 64 },
        { char: '#', code: 35 },
        { char: '$', code: 36 },
        { char: '%', code: 37 },
        { char: '&', code: 38 },
      ];

      puncts.forEach((p) => {
        glyphs.push(this.createPunctuationGlyph(p.char, p.code));
      });
    }

    return glyphs;
  }

  /**
   * Applies geometric skew (slant) and coordinates transformations.
   */
  private applySlant(x: number, y: number): { x: number; y: number } {
    if (this.slantAngle === 0) return { x, y };
    return {
      x: Math.round(x + y * this.slantAngle),
      y: Math.round(y),
    };
  }

  /**
   * Helper to add a rectangle contour with optional slant.
   */
  private addRect(path: Path, x: number, y: number, w: number, h: number) {
    const p1 = this.applySlant(x, y);
    const p2 = this.applySlant(x + w, y);
    const p3 = this.applySlant(x + w, y + h);
    const p4 = this.applySlant(x, y + h);

    path.moveTo(p1.x, p1.y);
    path.lineTo(p2.x, p2.y);
    path.lineTo(p3.x, p3.y);
    path.lineTo(p4.x, p4.y);
    path.close();
  }

  /**
   * Helper to draw elegant serifs for Serif genre.
   */
  private addSerif(path: Path, x: number, y: number, stemW: number, position: 'top' | 'bottom' | 'both') {
    if (this.genre !== 'serif') return;

    const overhang = Math.max(16, Math.round(stemW * 0.45));
    const serifHeight = Math.max(10, Math.round(stemW * 0.18));

    if (position === 'top' || position === 'both') {
      const topY = y;
      const p1 = this.applySlant(x - overhang, topY);
      const p2 = this.applySlant(x + stemW + overhang, topY);
      const p3 = this.applySlant(x + stemW + overhang, topY - serifHeight);
      const p4 = this.applySlant(x - overhang, topY - serifHeight);

      path.moveTo(p1.x, p1.y);
      path.lineTo(p2.x, p2.y);
      path.lineTo(p3.x, p3.y);
      path.lineTo(p4.x, p4.y);
      path.close();
    }

    if (position === 'bottom' || position === 'both') {
      const botY = y;
      const p1 = this.applySlant(x - overhang, botY);
      const p2 = this.applySlant(x + stemW + overhang, botY);
      const p3 = this.applySlant(x + stemW + overhang, botY + serifHeight);
      const p4 = this.applySlant(x - overhang, botY + serifHeight);

      path.moveTo(p1.x, p1.y);
      path.lineTo(p2.x, p2.y);
      path.lineTo(p3.x, p3.y);
      path.lineTo(p4.x, p4.y);
      path.close();
    }
  }

  /**
   * Helper to draw high-quality round bowls (O, C, Q, o, c, e, etc.).
   */
  private addOval(
    path: Path,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    innerRx: number,
    innerRy: number
  ) {
    // Outer loop (clockwise)
    const kx = 0.5522847498 * rx;
    const ky = 0.5522847498 * ry;

    const top = this.applySlant(cx, cy + ry);
    const right = this.applySlant(cx + rx, cy);
    const bot = this.applySlant(cx, cy - ry);
    const left = this.applySlant(cx - rx, cy);

    path.moveTo(top.x, top.y);
    path.bezierCurveTo(
      this.applySlant(cx + kx, cy + ry).x, this.applySlant(cx + kx, cy + ry).y,
      this.applySlant(cx + rx, cy + ky).x, this.applySlant(cx + rx, cy + ky).y,
      right.x, right.y
    );
    path.bezierCurveTo(
      this.applySlant(cx + rx, cy - ky).x, this.applySlant(cx + rx, cy - ky).y,
      this.applySlant(cx + kx, cy - ry).x, this.applySlant(cx + kx, cy - ry).y,
      bot.x, bot.y
    );
    path.bezierCurveTo(
      this.applySlant(cx - kx, cy - ry).x, this.applySlant(cx - kx, cy - ry).y,
      this.applySlant(cx - rx, cy - ky).x, this.applySlant(cx - rx, cy - ky).y,
      left.x, left.y
    );
    path.bezierCurveTo(
      this.applySlant(cx - rx, cy + ky).x, this.applySlant(cx - rx, cy + ky).y,
      this.applySlant(cx - kx, cy + ry).x, this.applySlant(cx - kx, cy + ry).y,
      top.x, top.y
    );
    path.close();

    // Inner counter (counter-clockwise for OpenType hole winding)
    if (innerRx > 5 && innerRy > 5) {
      const ikx = 0.5522847498 * innerRx;
      const iky = 0.5522847498 * innerRy;

      const iTop = this.applySlant(cx, cy + innerRy);
      const iLeft = this.applySlant(cx - innerRx, cy);
      const iBot = this.applySlant(cx, cy - innerRy);
      const iRight = this.applySlant(cx + innerRx, cy);

      path.moveTo(iTop.x, iTop.y);
      path.bezierCurveTo(
        this.applySlant(cx - ikx, cy + innerRy).x, this.applySlant(cx - ikx, cy + innerRy).y,
        this.applySlant(cx - innerRx, cy + iky).x, this.applySlant(cx - innerRx, cy + iky).y,
        iLeft.x, iLeft.y
      );
      path.bezierCurveTo(
        this.applySlant(cx - innerRx, cy - iky).x, this.applySlant(cx - innerRx, cy - iky).y,
        this.applySlant(cx - ikx, cy - innerRy).x, this.applySlant(cx - ikx, cy - innerRy).y,
        iBot.x, iBot.y
      );
      path.bezierCurveTo(
        this.applySlant(cx + ikx, cy - innerRy).x, this.applySlant(cx + ikx, cy - innerRy).y,
        this.applySlant(cx + innerRx, cy - iky).x, this.applySlant(cx + innerRx, cy - iky).y,
        iRight.x, iRight.y
      );
      path.bezierCurveTo(
        this.applySlant(cx + innerRx, cy + iky).x, this.applySlant(cx + innerRx, cy + iky).y,
        this.applySlant(cx + ikx, cy + innerRy).x, this.applySlant(cx + ikx, cy + innerRy).y,
        iTop.x, iTop.y
      );
      path.close();
    }
  }

  /**
   * Fallback .notdef glyph box.
   */
  private createNotDefGlyph(): Glyph {
    const path = new Path();
    const w = 500;
    const h = 700;

    path.moveTo(50, 0);
    path.lineTo(w - 50, 0);
    path.lineTo(w - 50, h);
    path.lineTo(50, h);
    path.close();

    path.moveTo(90, 40);
    path.lineTo(90, h - 40);
    path.lineTo(w - 90, h - 40);
    path.lineTo(w - 90, 40);
    path.close();

    return new Glyph({
      name: '.notdef',
      unicode: 0,
      advanceWidth: w,
      path,
    });
  }

  /**
   * Unified character builder for both uppercase and lowercase letters.
   */
  private createGlyphForChar(char: string, unicode: number, isUpper: boolean): Glyph {
    const path = new Path();
    const s = Math.round(this.stem * (isUpper ? 1.0 : 0.88));
    const hStem = Math.max(18, Math.round(s * this.contrastRatio));
    const h = isUpper ? this.capH : this.xH;
    const ascY = this.asc;
    const descY = this.desc;

    // Advance width base
    let baseAdv = isUpper ? 620 : 520;
    if (this.genre === 'monospace') {
      baseAdv = 600;
    } else {
      baseAdv = Math.round(baseAdv * this.widthScale);
    }
    let adv = baseAdv;

    const lower = char.toLowerCase();

    // Uppercase & Lowercase Synthesis
    if (isUpper) {
      switch (char) {
        case 'A': {
          adv = Math.round(660 * this.widthScale);
          const mid = adv / 2;
          const apex = h + 10;

          // Left diagonal
          path.moveTo(this.applySlant(40, 0).x, this.applySlant(40, 0).y);
          path.lineTo(this.applySlant(mid, apex).x, this.applySlant(mid, apex).y);
          path.lineTo(this.applySlant(mid + s * 0.6, apex).x, this.applySlant(mid + s * 0.6, apex).y);
          path.lineTo(this.applySlant(adv - 40, 0).x, this.applySlant(adv - 40, 0).y);
          path.lineTo(this.applySlant(adv - 40 - s, 0).x, this.applySlant(adv - 40 - s, 0).y);
          path.lineTo(this.applySlant(mid, h - s * 1.1).x, this.applySlant(mid, h - s * 1.1).y);
          path.lineTo(this.applySlant(40 + s, 0).x, this.applySlant(40 + s, 0).y);
          path.close();

          // Crossbar
          this.addRect(path, 110, h * 0.35, adv - 220, hStem);
          this.addSerif(path, 40, 0, s, 'bottom');
          this.addSerif(path, adv - 40 - s, 0, s, 'bottom');
          break;
        }

        case 'B': {
          adv = Math.round(620 * this.widthScale);
          this.addRect(path, 60, 0, s, h);
          const r1 = Math.round((h * 0.48) / 2);
          const r2 = Math.round((h * 0.52) / 2);
          this.addOval(path, 60 + s + (adv - 140 - s) / 2, h * 0.74, (adv - 140 - s) / 2, r1, (adv - 140 - s) / 2 - s, r1 - hStem);
          this.addOval(path, 60 + s + (adv - 110 - s) / 2, h * 0.26, (adv - 110 - s) / 2, r2, (adv - 110 - s) / 2 - s, r2 - hStem);
          this.addSerif(path, 60, h, s, 'top');
          this.addSerif(path, 60, 0, s, 'bottom');
          break;
        }

        case 'C': {
          adv = Math.round(640 * this.widthScale);
          const rx = (adv - 100) / 2;
          const ry = h / 2;
          this.addOval(path, 50 + rx, ry, rx, ry, rx - s, ry - hStem);
          // Opening bite on right side
          const biteW = Math.round(adv * 0.42);
          const biteH = Math.round(h * 0.48);
          // Draw over opening
          break;
        }

        case 'D': {
          adv = Math.round(640 * this.widthScale);
          this.addRect(path, 60, 0, s, h);
          const rx = adv - 60 - s - 50;
          const ry = h / 2;
          this.addOval(path, 60 + s + rx / 2, ry, rx / 2, ry, rx / 2 - s, ry - hStem);
          this.addSerif(path, 60, h, s, 'top');
          this.addSerif(path, 60, 0, s, 'bottom');
          break;
        }

        case 'E': {
          adv = Math.round(560 * this.widthScale);
          this.addRect(path, 60, 0, s, h);
          this.addRect(path, 60 + s, h - hStem, adv - 100 - s, hStem); // Top arm
          this.addRect(path, 60 + s, h * 0.5 - hStem / 2, adv - 140 - s, hStem); // Middle arm
          this.addRect(path, 60 + s, 0, adv - 90 - s, hStem); // Bottom arm
          this.addSerif(path, 60, h, s, 'top');
          this.addSerif(path, 60, 0, s, 'bottom');
          break;
        }

        case 'F': {
          adv = Math.round(540 * this.widthScale);
          this.addRect(path, 60, 0, s, h);
          this.addRect(path, 60 + s, h - hStem, adv - 100 - s, hStem);
          this.addRect(path, 60 + s, h * 0.5 - hStem / 2, adv - 140 - s, hStem);
          this.addSerif(path, 60, h, s, 'top');
          this.addSerif(path, 60, 0, s, 'bottom');
          break;
        }

        case 'G': {
          adv = Math.round(660 * this.widthScale);
          const rx = (adv - 100) / 2;
          const ry = h / 2;
          this.addOval(path, 50 + rx, ry, rx, ry, rx - s, ry - hStem);
          this.addRect(path, adv - 60 - s, 0, s, h * 0.45); // Right bottom stem
          this.addRect(path, adv / 2, h * 0.45 - hStem, adv / 2 - 60, hStem); // Inward crossbar
          break;
        }

        case 'H': {
          adv = Math.round(660 * this.widthScale);
          this.addRect(path, 60, 0, s, h);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addRect(path, 60 + s, h * 0.5 - hStem / 2, adv - 120 - 2 * s, hStem);
          this.addSerif(path, 60, h, s, 'top');
          this.addSerif(path, 60, 0, s, 'bottom');
          this.addSerif(path, adv - 60 - s, h, s, 'top');
          this.addSerif(path, adv - 60 - s, 0, s, 'bottom');
          break;
        }

        case 'I': {
          adv = Math.round(360 * this.widthScale);
          const mid = adv / 2;
          this.addRect(path, mid - s / 2, 0, s, h);
          this.addSerif(path, mid - s / 2, h, s, 'top');
          this.addSerif(path, mid - s / 2, 0, s, 'bottom');
          break;
        }

        case 'J': {
          adv = Math.round(440 * this.widthScale);
          this.addRect(path, adv - 60 - s, h * 0.25, s, h * 0.75);
          const r = (adv - 100) / 2;
          this.addOval(path, 50 + r, r, r, r, r - s, r - hStem);
          this.addSerif(path, adv - 60 - s, h, s, 'top');
          break;
        }

        case 'K': {
          adv = Math.round(620 * this.widthScale);
          this.addRect(path, 60, 0, s, h);
          // Diagonal top arm
          path.moveTo(this.applySlant(60 + s, h * 0.45).x, this.applySlant(60 + s, h * 0.45).y);
          path.lineTo(this.applySlant(adv - 60 - s, h).x, this.applySlant(adv - 60 - s, h).y);
          path.lineTo(this.applySlant(adv - 60, h).x, this.applySlant(adv - 60, h).y);
          path.lineTo(this.applySlant(60 + s, h * 0.35).x, this.applySlant(60 + s, h * 0.35).y);
          path.close();
          // Diagonal bottom arm
          path.moveTo(this.applySlant(60 + s * 1.4, h * 0.44).x, this.applySlant(60 + s * 1.4, h * 0.44).y);
          path.lineTo(this.applySlant(adv - 50, 0).x, this.applySlant(adv - 50, 0).y);
          path.lineTo(this.applySlant(adv - 50 - s, 0).x, this.applySlant(adv - 50 - s, 0).y);
          path.lineTo(this.applySlant(60 + s, h * 0.38).x, this.applySlant(60 + s, h * 0.38).y);
          path.close();
          this.addSerif(path, 60, h, s, 'top');
          this.addSerif(path, 60, 0, s, 'bottom');
          break;
        }

        case 'L': {
          adv = Math.round(520 * this.widthScale);
          this.addRect(path, 60, 0, s, h);
          this.addRect(path, 60 + s, 0, adv - 90 - s, hStem);
          this.addSerif(path, 60, h, s, 'top');
          this.addSerif(path, 60, 0, s, 'bottom');
          break;
        }

        case 'M': {
          adv = Math.round(760 * this.widthScale);
          this.addRect(path, 50, 0, s, h);
          this.addRect(path, adv - 50 - s, 0, s, h);
          const mid = adv / 2;
          // Left V-diagonal
          path.moveTo(this.applySlant(50 + s, h).x, this.applySlant(50 + s, h).y);
          path.lineTo(this.applySlant(mid, 0).x, this.applySlant(mid, 0).y);
          path.lineTo(this.applySlant(mid + s * 0.7, 0).x, this.applySlant(mid + s * 0.7, 0).y);
          path.lineTo(this.applySlant(50 + s, h - s * 1.2).x, this.applySlant(50 + s, h - s * 1.2).y);
          path.close();
          // Right V-diagonal
          path.moveTo(this.applySlant(adv - 50 - s, h).x, this.applySlant(adv - 50 - s, h).y);
          path.lineTo(this.applySlant(mid, 0).x, this.applySlant(mid, 0).y);
          path.lineTo(this.applySlant(mid - s * 0.7, 0).x, this.applySlant(mid - s * 0.7, 0).y);
          path.lineTo(this.applySlant(adv - 50 - s, h - s * 1.2).x, this.applySlant(adv - 50 - s, h - s * 1.2).y);
          path.close();
          this.addSerif(path, 50, h, s, 'top');
          this.addSerif(path, 50, 0, s, 'bottom');
          this.addSerif(path, adv - 50 - s, h, s, 'top');
          this.addSerif(path, adv - 50 - s, 0, s, 'bottom');
          break;
        }

        case 'N': {
          adv = Math.round(660 * this.widthScale);
          this.addRect(path, 60, 0, s, h);
          this.addRect(path, adv - 60 - s, 0, s, h);
          // Diagonal
          path.moveTo(this.applySlant(60, h).x, this.applySlant(60, h).y);
          path.lineTo(this.applySlant(adv - 60, 0).x, this.applySlant(adv - 60, 0).y);
          path.lineTo(this.applySlant(adv - 60, s * 1.2).x, this.applySlant(adv - 60, s * 1.2).y);
          path.lineTo(this.applySlant(60 + s, h).x, this.applySlant(60 + s, h).y);
          path.close();
          this.addSerif(path, 60, h, s, 'top');
          this.addSerif(path, 60, 0, s, 'bottom');
          this.addSerif(path, adv - 60 - s, 0, s, 'bottom');
          break;
        }

        case 'O': {
          adv = Math.round(680 * this.widthScale);
          const rx = (adv - 100) / 2;
          const ry = h / 2;
          this.addOval(path, 50 + rx, ry, rx, ry, rx - s, ry - hStem);
          break;
        }

        case 'P': {
          adv = Math.round(580 * this.widthScale);
          this.addRect(path, 60, 0, s, h);
          const rx = (adv - 120 - s) / 2;
          const ry = (h * 0.55) / 2;
          this.addOval(path, 60 + s + rx, h * 0.725, rx, ry, rx - s, ry - hStem);
          this.addSerif(path, 60, h, s, 'top');
          this.addSerif(path, 60, 0, s, 'bottom');
          break;
        }

        case 'Q': {
          adv = Math.round(680 * this.widthScale);
          const rx = (adv - 100) / 2;
          const ry = h / 2;
          this.addOval(path, 50 + rx, ry, rx, ry, rx - s, ry - hStem);
          // Tail
          path.moveTo(this.applySlant(adv * 0.52, h * 0.18).x, this.applySlant(adv * 0.52, h * 0.18).y);
          path.lineTo(this.applySlant(adv - 30, -50).x, this.applySlant(adv - 30, -50).y);
          path.lineTo(this.applySlant(adv - 30 - s, -50).x, this.applySlant(adv - 30 - s, -50).y);
          path.lineTo(this.applySlant(adv * 0.52 - s, h * 0.18).x, this.applySlant(adv * 0.52 - s, h * 0.18).y);
          path.close();
          break;
        }

        case 'R': {
          adv = Math.round(620 * this.widthScale);
          this.addRect(path, 60, 0, s, h);
          const rx = (adv - 130 - s) / 2;
          const ry = (h * 0.52) / 2;
          this.addOval(path, 60 + s + rx, h * 0.74, rx, ry, rx - s, ry - hStem);
          // Diagonal leg
          path.moveTo(this.applySlant(60 + s * 1.2, h * 0.48).x, this.applySlant(60 + s * 1.2, h * 0.48).y);
          path.lineTo(this.applySlant(adv - 50, 0).x, this.applySlant(adv - 50, 0).y);
          path.lineTo(this.applySlant(adv - 50 - s, 0).x, this.applySlant(adv - 50 - s, 0).y);
          path.lineTo(this.applySlant(60 + s, h * 0.48).x, this.applySlant(60 + s, h * 0.48).y);
          path.close();
          this.addSerif(path, 60, h, s, 'top');
          this.addSerif(path, 60, 0, s, 'bottom');
          break;
        }

        case 'S': {
          adv = Math.round(580 * this.widthScale);
          const rx = (adv - 100) / 2;
          const ry1 = (h * 0.54) / 2;
          const ry2 = (h * 0.54) / 2;
          this.addOval(path, 50 + rx, h * 0.73, rx, ry1, rx - s, ry1 - hStem);
          this.addOval(path, 50 + rx, h * 0.27, rx, ry2, rx - s, ry2 - hStem);
          break;
        }

        case 'T': {
          adv = Math.round(560 * this.widthScale);
          const mid = adv / 2;
          this.addRect(path, mid - s / 2, 0, s, h - hStem);
          this.addRect(path, 40, h - hStem, adv - 80, hStem);
          this.addSerif(path, mid - s / 2, 0, s, 'bottom');
          break;
        }

        case 'U': {
          adv = Math.round(640 * this.widthScale);
          this.addRect(path, 60, h * 0.35, s, h * 0.65);
          this.addRect(path, adv - 60 - s, h * 0.35, s, h * 0.65);
          const rx = (adv - 120) / 2;
          const ry = h * 0.35;
          this.addOval(path, 60 + rx, ry, rx, ry, rx - s, ry - hStem);
          this.addSerif(path, 60, h, s, 'top');
          this.addSerif(path, adv - 60 - s, h, s, 'top');
          break;
        }

        case 'V': {
          adv = Math.round(620 * this.widthScale);
          const mid = adv / 2;
          path.moveTo(this.applySlant(50, h).x, this.applySlant(50, h).y);
          path.lineTo(this.applySlant(mid, 0).x, this.applySlant(mid, 0).y);
          path.lineTo(this.applySlant(mid + s * 0.8, 0).x, this.applySlant(mid + s * 0.8, 0).y);
          path.lineTo(this.applySlant(adv - 50, h).x, this.applySlant(adv - 50, h).y);
          path.lineTo(this.applySlant(adv - 50 - s, h).x, this.applySlant(adv - 50 - s, h).y);
          path.lineTo(this.applySlant(mid, s * 1.5).x, this.applySlant(mid, s * 1.5).y);
          path.lineTo(this.applySlant(50 + s, h).x, this.applySlant(50 + s, h).y);
          path.close();
          this.addSerif(path, 50, h, s, 'top');
          this.addSerif(path, adv - 50 - s, h, s, 'top');
          break;
        }

        case 'W': {
          adv = Math.round(800 * this.widthScale);
          const q1 = adv * 0.28;
          const mid = adv * 0.5;
          const q3 = adv * 0.72;
          path.moveTo(this.applySlant(40, h).x, this.applySlant(40, h).y);
          path.lineTo(this.applySlant(q1, 0).x, this.applySlant(q1, 0).y);
          path.lineTo(this.applySlant(mid, h).x, this.applySlant(mid, h).y);
          path.lineTo(this.applySlant(q3, 0).x, this.applySlant(q3, 0).y);
          path.lineTo(this.applySlant(adv - 40, h).x, this.applySlant(adv - 40, h).y);
          path.lineTo(this.applySlant(adv - 40 - s, h).x, this.applySlant(adv - 40 - s, h).y);
          path.lineTo(this.applySlant(q3, s * 1.5).x, this.applySlant(q3, s * 1.5).y);
          path.lineTo(this.applySlant(mid, h - s).x, this.applySlant(mid, h - s).y);
          path.lineTo(this.applySlant(q1, s * 1.5).x, this.applySlant(q1, s * 1.5).y);
          path.lineTo(this.applySlant(40 + s, h).x, this.applySlant(40 + s, h).y);
          path.close();
          this.addSerif(path, 40, h, s, 'top');
          this.addSerif(path, adv - 40 - s, h, s, 'top');
          break;
        }

        case 'X': {
          adv = Math.round(600 * this.widthScale);
          path.moveTo(this.applySlant(50, h).x, this.applySlant(50, h).y);
          path.lineTo(this.applySlant(adv - 50, 0).x, this.applySlant(adv - 50, 0).y);
          path.lineTo(this.applySlant(adv - 50 - s, 0).x, this.applySlant(adv - 50 - s, 0).y);
          path.lineTo(this.applySlant(50 + s, h).x, this.applySlant(50 + s, h).y);
          path.close();
          path.moveTo(this.applySlant(adv - 50, h).x, this.applySlant(adv - 50, h).y);
          path.lineTo(this.applySlant(50, 0).x, this.applySlant(50, 0).y);
          path.lineTo(this.applySlant(50 + s, 0).x, this.applySlant(50 + s, 0).y);
          path.lineTo(this.applySlant(adv - 50 - s, h).x, this.applySlant(adv - 50 - s, h).y);
          path.close();
          this.addSerif(path, 50, h, s, 'top');
          this.addSerif(path, adv - 50 - s, h, s, 'top');
          this.addSerif(path, 50, 0, s, 'bottom');
          this.addSerif(path, adv - 50 - s, 0, s, 'bottom');
          break;
        }

        case 'Y': {
          adv = Math.round(600 * this.widthScale);
          const mid = adv / 2;
          path.moveTo(this.applySlant(50, h).x, this.applySlant(50, h).y);
          path.lineTo(this.applySlant(mid, h * 0.45).x, this.applySlant(mid, h * 0.45).y);
          path.lineTo(this.applySlant(adv - 50, h).x, this.applySlant(adv - 50, h).y);
          path.lineTo(this.applySlant(adv - 50 - s, h).x, this.applySlant(adv - 50 - s, h).y);
          path.lineTo(this.applySlant(mid, h * 0.5).x, this.applySlant(mid, h * 0.5).y);
          path.lineTo(this.applySlant(50 + s, h).x, this.applySlant(50 + s, h).y);
          path.close();
          this.addRect(path, mid - s / 2, 0, s, h * 0.48);
          this.addSerif(path, 50, h, s, 'top');
          this.addSerif(path, adv - 50 - s, h, s, 'top');
          this.addSerif(path, mid - s / 2, 0, s, 'bottom');
          break;
        }

        case 'Z': {
          adv = Math.round(580 * this.widthScale);
          this.addRect(path, 50, h - hStem, adv - 100, hStem);
          path.moveTo(this.applySlant(adv - 50 - s, h - hStem).x, this.applySlant(adv - 50 - s, h - hStem).y);
          path.lineTo(this.applySlant(50, hStem).x, this.applySlant(50, hStem).y);
          path.lineTo(this.applySlant(50 + s * 1.2, hStem).x, this.applySlant(50 + s * 1.2, hStem).y);
          path.lineTo(this.applySlant(adv - 50, h - hStem).x, this.applySlant(adv - 50, h - hStem).y);
          path.close();
          this.addRect(path, 50, 0, adv - 100, hStem);
          break;
        }
      }
    } else {
      // Lowercase a-z
      switch (lower) {
        case 'a': {
          adv = Math.round(500 * this.widthScale);
          const rx = (adv - 100 - s) / 2;
          const ry = h / 2;
          this.addOval(path, 50 + rx, ry, rx, ry, rx - s, ry - hStem);
          this.addRect(path, adv - 50 - s, 0, s, h);
          this.addSerif(path, adv - 50 - s, 0, s, 'bottom');
          break;
        }

        case 'b': {
          adv = Math.round(520 * this.widthScale);
          this.addRect(path, 50, 0, s, ascY);
          const rx = (adv - 100 - s) / 2;
          const ry = h / 2;
          this.addOval(path, 50 + s + rx, ry, rx, ry, rx - s, ry - hStem);
          this.addSerif(path, 50, ascY, s, 'top');
          this.addSerif(path, 50, 0, s, 'bottom');
          break;
        }

        case 'c': {
          adv = Math.round(460 * this.widthScale);
          const rx = (adv - 90) / 2;
          const ry = h / 2;
          this.addOval(path, 45 + rx, ry, rx, ry, rx - s, ry - hStem);
          break;
        }

        case 'd': {
          adv = Math.round(520 * this.widthScale);
          const rx = (adv - 100 - s) / 2;
          const ry = h / 2;
          this.addOval(path, 50 + rx, ry, rx, ry, rx - s, ry - hStem);
          this.addRect(path, adv - 50 - s, 0, s, ascY);
          this.addSerif(path, adv - 50 - s, ascY, s, 'top');
          this.addSerif(path, adv - 50 - s, 0, s, 'bottom');
          break;
        }

        case 'e': {
          adv = Math.round(490 * this.widthScale);
          const rx = (adv - 90) / 2;
          const ry = h / 2;
          // Smooth continuous outer and inner circular bowl
          this.addOval(path, 45 + rx, ry, rx, ry, rx - s, ry - hStem);
          // Proper solid middle crossbar connecting left and right walls
          this.addRect(path, 45 + s * 0.8, h * 0.52 - hStem / 2, adv - 90 - 1.6 * s, hStem);
          break;
        }

        case 'f': {
          adv = Math.round(360 * this.widthScale);
          this.addRect(path, 60, 0, s, ascY - 40);
          this.addRect(path, 60, ascY - 40, 80, hStem);
          this.addRect(path, 35, h - hStem, 130, hStem); // Crossbar
          this.addSerif(path, 60, 0, s, 'bottom');
          break;
        }

        case 'g': {
          adv = Math.round(500 * this.widthScale);
          const rx = (adv - 100 - s) / 2;
          const ry = h / 2;
          this.addOval(path, 50 + rx, ry, rx, ry, rx - s, ry - hStem);
          this.addRect(path, adv - 50 - s, descY + 40, s, h - descY - 40);
          this.addRect(path, 50, descY, adv - 100, hStem); // Descender hook
          break;
        }

        case 'h': {
          adv = Math.round(520 * this.widthScale);
          this.addRect(path, 50, 0, s, ascY);
          this.addRect(path, adv - 50 - s, 0, s, h * 0.7);
          const rx = (adv - 100 - s) / 2;
          this.addOval(path, 50 + rx, h * 0.5, rx, h * 0.5, rx - s, h * 0.5 - hStem);
          this.addSerif(path, 50, ascY, s, 'top');
          this.addSerif(path, 50, 0, s, 'bottom');
          this.addSerif(path, adv - 50 - s, 0, s, 'bottom');
          break;
        }

        case 'i': {
          adv = Math.round(280 * this.widthScale);
          const mid = adv / 2;
          this.addRect(path, mid - s / 2, 0, s, h);
          // Dot
          this.addRect(path, mid - s / 2, h + 60, s, s);
          this.addSerif(path, mid - s / 2, 0, s, 'bottom');
          break;
        }

        case 'j': {
          adv = Math.round(300 * this.widthScale);
          const mid = adv - 60 - s;
          this.addRect(path, mid, descY + 40, s, h - descY - 40);
          this.addRect(path, 40, descY, mid - 40 + s, hStem);
          // Dot
          this.addRect(path, mid, h + 60, s, s);
          break;
        }

        case 'k': {
          adv = Math.round(480 * this.widthScale);
          this.addRect(path, 50, 0, s, ascY);
          // Top arm
          path.moveTo(this.applySlant(50 + s, h * 0.45).x, this.applySlant(50 + s, h * 0.45).y);
          path.lineTo(this.applySlant(adv - 50 - s, h).x, this.applySlant(adv - 50 - s, h).y);
          path.lineTo(this.applySlant(adv - 50, h).x, this.applySlant(adv - 50, h).y);
          path.lineTo(this.applySlant(50 + s, h * 0.35).x, this.applySlant(50 + s, h * 0.35).y);
          path.close();
          // Bottom arm
          path.moveTo(this.applySlant(50 + s * 1.3, h * 0.44).x, this.applySlant(50 + s * 1.3, h * 0.44).y);
          path.lineTo(this.applySlant(adv - 40, 0).x, this.applySlant(adv - 40, 0).y);
          path.lineTo(this.applySlant(adv - 40 - s, 0).x, this.applySlant(adv - 40 - s, 0).y);
          path.lineTo(this.applySlant(50 + s, h * 0.38).x, this.applySlant(50 + s, h * 0.38).y);
          path.close();
          this.addSerif(path, 50, ascY, s, 'top');
          this.addSerif(path, 50, 0, s, 'bottom');
          break;
        }

        case 'l': {
          adv = Math.round(280 * this.widthScale);
          const mid = adv / 2;
          this.addRect(path, mid - s / 2, 0, s, ascY);
          this.addSerif(path, mid - s / 2, ascY, s, 'top');
          this.addSerif(path, mid - s / 2, 0, s, 'bottom');
          break;
        }

        case 'm': {
          adv = Math.round(740 * this.widthScale);
          const w3 = (adv - 80) / 2;
          this.addRect(path, 40, 0, s, h);
          this.addRect(path, 40 + w3 - s / 2, 0, s, h * 0.85);
          this.addRect(path, adv - 40 - s, 0, s, h * 0.85);
          const r1 = w3 / 2;
          this.addOval(path, 40 + r1, h * 0.5, r1, h * 0.5, r1 - s, h * 0.5 - hStem);
          this.addOval(path, 40 + w3 + r1, h * 0.5, r1, h * 0.5, r1 - s, h * 0.5 - hStem);
          this.addSerif(path, 40, 0, s, 'bottom');
          this.addSerif(path, 40 + w3 - s / 2, 0, s, 'bottom');
          this.addSerif(path, adv - 40 - s, 0, s, 'bottom');
          break;
        }

        case 'n': {
          adv = Math.round(520 * this.widthScale);
          this.addRect(path, 50, 0, s, h);
          this.addRect(path, adv - 50 - s, 0, s, h * 0.85);
          const rx = (adv - 100) / 2;
          this.addOval(path, 50 + rx, h * 0.5, rx, h * 0.5, rx - s, h * 0.5 - hStem);
          this.addSerif(path, 50, 0, s, 'bottom');
          this.addSerif(path, adv - 50 - s, 0, s, 'bottom');
          break;
        }

        case 'o': {
          adv = Math.round(500 * this.widthScale);
          const rx = (adv - 90) / 2;
          const ry = h / 2;
          this.addOval(path, 45 + rx, ry, rx, ry, rx - s, ry - hStem);
          break;
        }

        case 'p': {
          adv = Math.round(520 * this.widthScale);
          this.addRect(path, 50, descY, s, h - descY);
          const rx = (adv - 100 - s) / 2;
          const ry = h / 2;
          this.addOval(path, 50 + s + rx, ry, rx, ry, rx - s, ry - hStem);
          this.addSerif(path, 50, descY, s, 'bottom');
          break;
        }

        case 'q': {
          adv = Math.round(520 * this.widthScale);
          const rx = (adv - 100 - s) / 2;
          const ry = h / 2;
          this.addOval(path, 50 + rx, ry, rx, ry, rx - s, ry - hStem);
          this.addRect(path, adv - 50 - s, descY, s, h - descY);
          this.addSerif(path, adv - 50 - s, descY, s, 'bottom');
          break;
        }

        case 'r': {
          adv = Math.round(380 * this.widthScale);
          this.addRect(path, 50, 0, s, h);
          this.addOval(path, 50 + 80, h * 0.6, 80, h * 0.4, 80 - s, h * 0.4 - hStem);
          this.addSerif(path, 50, 0, s, 'bottom');
          break;
        }

        case 's': {
          adv = Math.round(460 * this.widthScale);
          const rx = (adv - 90) / 2;
          const ry1 = (h * 0.54) / 2;
          const ry2 = (h * 0.54) / 2;
          this.addOval(path, 45 + rx, h * 0.73, rx, ry1, rx - s, ry1 - hStem);
          this.addOval(path, 45 + rx, h * 0.27, rx, ry2, rx - s, ry2 - hStem);
          break;
        }

        case 't': {
          adv = Math.round(360 * this.widthScale);
          const mid = 60;
          this.addRect(path, mid, 0, s, ascY * 0.85);
          this.addRect(path, 30, h - hStem, 120, hStem); // Crossbar
          this.addRect(path, mid, 0, 70, hStem); // Bottom hook
          break;
        }

        case 'u': {
          adv = Math.round(520 * this.widthScale);
          this.addRect(path, 50, h * 0.35, s, h * 0.65);
          this.addRect(path, adv - 50 - s, 0, s, h);
          const rx = (adv - 100) / 2;
          const ry = h * 0.35;
          this.addOval(path, 50 + rx, ry, rx, ry, rx - s, ry - hStem);
          this.addSerif(path, 50, h, s, 'top');
          this.addSerif(path, adv - 50 - s, 0, s, 'bottom');
          break;
        }

        case 'v': {
          adv = Math.round(500 * this.widthScale);
          const mid = adv / 2;
          path.moveTo(this.applySlant(45, h).x, this.applySlant(45, h).y);
          path.lineTo(this.applySlant(mid, 0).x, this.applySlant(mid, 0).y);
          path.lineTo(this.applySlant(mid + s * 0.8, 0).x, this.applySlant(mid + s * 0.8, 0).y);
          path.lineTo(this.applySlant(adv - 45, h).x, this.applySlant(adv - 45, h).y);
          path.lineTo(this.applySlant(adv - 45 - s, h).x, this.applySlant(adv - 45 - s, h).y);
          path.lineTo(this.applySlant(mid, s * 1.5).x, this.applySlant(mid, s * 1.5).y);
          path.lineTo(this.applySlant(45 + s, h).x, this.applySlant(45 + s, h).y);
          path.close();
          this.addSerif(path, 45, h, s, 'top');
          this.addSerif(path, adv - 45 - s, h, s, 'top');
          break;
        }

        case 'w': {
          adv = Math.round(720 * this.widthScale);
          const q1 = adv * 0.28;
          const mid = adv * 0.5;
          const q3 = adv * 0.72;
          path.moveTo(this.applySlant(35, h).x, this.applySlant(35, h).y);
          path.lineTo(this.applySlant(q1, 0).x, this.applySlant(q1, 0).y);
          path.lineTo(this.applySlant(mid, h).x, this.applySlant(mid, h).y);
          path.lineTo(this.applySlant(q3, 0).x, this.applySlant(q3, 0).y);
          path.lineTo(this.applySlant(adv - 35, h).x, this.applySlant(adv - 35, h).y);
          path.lineTo(this.applySlant(adv - 35 - s, h).x, this.applySlant(adv - 35 - s, h).y);
          path.lineTo(this.applySlant(q3, s * 1.5).x, this.applySlant(q3, s * 1.5).y);
          path.lineTo(this.applySlant(mid, h - s).x, this.applySlant(mid, h - s).y);
          path.lineTo(this.applySlant(q1, s * 1.5).x, this.applySlant(q1, s * 1.5).y);
          path.lineTo(this.applySlant(35 + s, h).x, this.applySlant(35 + s, h).y);
          path.close();
          this.addSerif(path, 35, h, s, 'top');
          this.addSerif(path, adv - 35 - s, h, s, 'top');
          break;
        }

        case 'x': {
          adv = Math.round(500 * this.widthScale);
          path.moveTo(this.applySlant(45, h).x, this.applySlant(45, h).y);
          path.lineTo(this.applySlant(adv - 45, 0).x, this.applySlant(adv - 45, 0).y);
          path.lineTo(this.applySlant(adv - 45 - s, 0).x, this.applySlant(adv - 45 - s, 0).y);
          path.lineTo(this.applySlant(45 + s, h).x, this.applySlant(45 + s, h).y);
          path.close();
          path.moveTo(this.applySlant(adv - 45, h).x, this.applySlant(adv - 45, h).y);
          path.lineTo(this.applySlant(45, 0).x, this.applySlant(45, 0).y);
          path.lineTo(this.applySlant(45 + s, 0).x, this.applySlant(45 + s, 0).y);
          path.lineTo(this.applySlant(adv - 45 - s, h).x, this.applySlant(adv - 45 - s, h).y);
          path.close();
          this.addSerif(path, 45, h, s, 'top');
          this.addSerif(path, adv - 45 - s, h, s, 'top');
          this.addSerif(path, 45, 0, s, 'bottom');
          this.addSerif(path, adv - 45 - s, 0, s, 'bottom');
          break;
        }

        case 'y': {
          adv = Math.round(500 * this.widthScale);
          const mid = adv / 2;
          path.moveTo(this.applySlant(45, h).x, this.applySlant(45, h).y);
          path.lineTo(this.applySlant(mid, 0).x, this.applySlant(mid, 0).y);
          path.lineTo(this.applySlant(adv - 45, h).x, this.applySlant(adv - 45, h).y);
          path.lineTo(this.applySlant(adv - 45 - s, h).x, this.applySlant(adv - 45 - s, h).y);
          path.lineTo(this.applySlant(mid, s).x, this.applySlant(mid, s).y);
          path.lineTo(this.applySlant(45 + s, h).x, this.applySlant(45 + s, h).y);
          path.close();
          this.addRect(path, mid - s / 2, descY, s, -descY + s);
          this.addSerif(path, 45, h, s, 'top');
          this.addSerif(path, adv - 45 - s, h, s, 'top');
          this.addSerif(path, mid - s / 2, descY, s, 'bottom');
          break;
        }

        case 'z': {
          adv = Math.round(480 * this.widthScale);
          this.addRect(path, 45, h - hStem, adv - 90, hStem);
          path.moveTo(this.applySlant(adv - 45 - s, h - hStem).x, this.applySlant(adv - 45 - s, h - hStem).y);
          path.lineTo(this.applySlant(45, hStem).x, this.applySlant(45, hStem).y);
          path.lineTo(this.applySlant(45 + s * 1.2, hStem).x, this.applySlant(45 + s * 1.2, hStem).y);
          path.lineTo(this.applySlant(adv - 45, h - hStem).x, this.applySlant(adv - 45, h - hStem).y);
          path.close();
          this.addRect(path, 45, 0, adv - 90, hStem);
          break;
        }
      }
    }

    return new Glyph({
      name: char,
      unicode,
      advanceWidth: adv,
      path,
    });
  }

  /**
   * Numerals (0-9).
   */
  private createNumberGlyph(char: string, unicode: number): Glyph {
    const path = new Path();
    const s = Math.round(this.stem * 0.95);
    const hStem = Math.max(18, Math.round(s * this.contrastRatio));
    const h = this.capH;
    const adv = this.genre === 'monospace' ? 600 : Math.round(580 * this.widthScale);

    switch (char) {
      case '0': {
        const rx = (adv - 100) / 2;
        const ry = h / 2;
        this.addOval(path, 50 + rx, ry, rx, ry, rx - s, ry - hStem);
        break;
      }
      case '1': {
        const mid = adv / 2;
        this.addRect(path, mid - s / 2, 0, s, h);
        path.moveTo(this.applySlant(mid - s / 2, h).x, this.applySlant(mid - s / 2, h).y);
        path.lineTo(this.applySlant(mid - 100, h - 80).x, this.applySlant(mid - 100, h - 80).y);
        path.lineTo(this.applySlant(mid - 100, h - 80 - hStem).x, this.applySlant(mid - 100, h - 80 - hStem).y);
        path.lineTo(this.applySlant(mid - s / 2, h - hStem).x, this.applySlant(mid - s / 2, h - hStem).y);
        path.close();
        this.addRect(path, mid - 100, 0, 200, hStem);
        break;
      }
      case '2': {
        const rx = (adv - 100) / 2;
        this.addOval(path, 50 + rx, h * 0.72, rx, h * 0.28, rx - s, h * 0.28 - hStem);
        path.moveTo(this.applySlant(adv - 50, h * 0.5).x, this.applySlant(adv - 50, h * 0.5).y);
        path.lineTo(this.applySlant(50, hStem).x, this.applySlant(50, hStem).y);
        path.lineTo(this.applySlant(50 + s * 1.2, hStem).x, this.applySlant(50 + s * 1.2, hStem).y);
        path.lineTo(this.applySlant(adv - 50, h * 0.5).x, this.applySlant(adv - 50, h * 0.5).y);
        path.close();
        this.addRect(path, 50, 0, adv - 100, hStem);
        break;
      }
      case '3': {
        const rx = (adv - 100) / 2;
        const ry = (h * 0.54) / 2;
        this.addOval(path, 50 + rx, h * 0.73, rx, ry, rx - s, ry - hStem);
        this.addOval(path, 50 + rx, h * 0.27, rx, ry, rx - s, ry - hStem);
        this.addRect(path, adv * 0.4, h * 0.5 - hStem / 2, adv * 0.4, hStem);
        break;
      }
      case '4': {
        this.addRect(path, adv - 120 - s, 0, s, h);
        path.moveTo(this.applySlant(adv - 120, h).x, this.applySlant(adv - 120, h).y);
        path.lineTo(this.applySlant(50, h * 0.3).x, this.applySlant(50, h * 0.3).y);
        path.lineTo(this.applySlant(50, h * 0.3 - hStem).x, this.applySlant(50, h * 0.3 - hStem).y);
        path.lineTo(this.applySlant(adv - 120, h * 0.3 - hStem).x, this.applySlant(adv - 120, h * 0.3 - hStem).y);
        path.close();
        this.addRect(path, 50, h * 0.3 - hStem, adv - 100, hStem);
        break;
      }
      case '5': {
        this.addRect(path, 60, h * 0.5, s, h * 0.5);
        this.addRect(path, 60, h - hStem, adv - 120, hStem);
        const rx = (adv - 110) / 2;
        const ry = (h * 0.58) / 2;
        this.addOval(path, 55 + rx, ry, rx, ry, rx - s, ry - hStem);
        break;
      }
      case '6': {
        const rx = (adv - 100) / 2;
        const ry = (h * 0.55) / 2;
        this.addOval(path, 50 + rx, ry, rx, ry, rx - s, ry - hStem);
        this.addRect(path, 50, ry, s, h - ry);
        this.addRect(path, 50, h - hStem, adv - 140, hStem);
        break;
      }
      case '7': {
        this.addRect(path, 50, h - hStem, adv - 100, hStem);
        path.moveTo(this.applySlant(adv - 50, h).x, this.applySlant(adv - 50, h).y);
        path.lineTo(this.applySlant(adv * 0.35, 0).x, this.applySlant(adv * 0.35, 0).y);
        path.lineTo(this.applySlant(adv * 0.35 + s * 1.1, 0).x, this.applySlant(adv * 0.35 + s * 1.1, 0).y);
        path.lineTo(this.applySlant(adv - 50, h - s * 1.1).x, this.applySlant(adv - 50, h - s * 1.1).y);
        path.close();
        break;
      }
      case '8': {
        const rx = (adv - 100) / 2;
        const ry1 = (h * 0.48) / 2;
        const ry2 = (h * 0.52) / 2;
        this.addOval(path, 50 + rx, h * 0.74, rx, ry1, rx - s, ry1 - hStem);
        this.addOval(path, 50 + rx, h * 0.26, rx, ry2, rx - s, ry2 - hStem);
        break;
      }
      case '9': {
        const rx = (adv - 100) / 2;
        const ry = (h * 0.55) / 2;
        this.addOval(path, 50 + rx, h - ry, rx, ry, rx - s, ry - hStem);
        this.addRect(path, adv - 50 - s, 0, s, h - ry);
        this.addRect(path, 70, 0, adv - 120, hStem);
        break;
      }
    }

    return new Glyph({
      name: char,
      unicode,
      advanceWidth: adv,
      path,
    });
  }

  /**
   * Punctuation marks and common symbols.
   */
  private createPunctuationGlyph(char: string, unicode: number): Glyph {
    const path = new Path();
    const s = Math.round(this.stem * 0.85);
    const hStem = Math.max(16, Math.round(s * this.contrastRatio));
    const h = this.capH;
    let adv = 320;

    switch (char) {
      case '.': {
        adv = 240;
        this.addRect(path, 120 - s / 2, 0, s, s);
        break;
      }
      case ',': {
        adv = 240;
        this.addRect(path, 120 - s / 2, 0, s, s);
        path.moveTo(this.applySlant(120 + s / 2, s).x, this.applySlant(120 + s / 2, s).y);
        path.lineTo(this.applySlant(100 - s / 2, -40).x, this.applySlant(100 - s / 2, -40).y);
        path.lineTo(this.applySlant(120 - s / 2, 0).x, this.applySlant(120 - s / 2, 0).y);
        path.close();
        break;
      }
      case '!': {
        adv = 260;
        const mid = adv / 2;
        this.addRect(path, mid - s / 2, 120, s, h - 120);
        this.addRect(path, mid - s / 2, 0, s, s);
        break;
      }
      case '?': {
        adv = 480;
        const rx = (adv - 100) / 2;
        this.addOval(path, 50 + rx, h * 0.72, rx, h * 0.28, rx - s, h * 0.28 - hStem);
        this.addRect(path, adv / 2 - s / 2, 120, s, 140);
        this.addRect(path, adv / 2 - s / 2, 0, s, s);
        break;
      }
      case ':': {
        adv = 240;
        const mid = 120 - s / 2;
        this.addRect(path, mid, 0, s, s);
        this.addRect(path, mid, this.xH - s, s, s);
        break;
      }
      case ';': {
        adv = 240;
        const mid = 120 - s / 2;
        this.addRect(path, mid, this.xH - s, s, s);
        this.addRect(path, mid, 0, s, s);
        path.moveTo(this.applySlant(mid + s, s).x, this.applySlant(mid + s, s).y);
        path.lineTo(this.applySlant(mid - 15, -40).x, this.applySlant(mid - 15, -40).y);
        path.lineTo(this.applySlant(mid, 0).x, this.applySlant(mid, 0).y);
        path.close();
        break;
      }
      case '-': {
        adv = 360;
        this.addRect(path, 50, this.xH * 0.5 - hStem / 2, adv - 100, hStem);
        break;
      }
      case '_': {
        adv = 480;
        this.addRect(path, 20, -50, adv - 40, hStem);
        break;
      }
      case '+': {
        adv = 480;
        const midX = adv / 2;
        const midY = this.xH * 0.5;
        this.addRect(path, 60, midY - hStem / 2, adv - 120, hStem);
        this.addRect(path, midX - s / 2, midY - (adv - 120) / 2, s, adv - 120);
        break;
      }
      case '=': {
        adv = 480;
        const midY = this.xH * 0.5;
        this.addRect(path, 60, midY + 40, adv - 120, hStem);
        this.addRect(path, 60, midY - 40 - hStem, adv - 120, hStem);
        break;
      }
      case '/': {
        adv = 420;
        path.moveTo(this.applySlant(adv - 60, h).x, this.applySlant(adv - 60, h).y);
        path.lineTo(this.applySlant(60, this.desc).x, this.applySlant(60, this.desc).y);
        path.lineTo(this.applySlant(60 + s, this.desc).x, this.applySlant(60 + s, this.desc).y);
        path.lineTo(this.applySlant(adv - 60 + s, h).x, this.applySlant(adv - 60 + s, h).y);
        path.close();
        break;
      }
      case '(': {
        adv = 320;
        const rx = 120;
        const ry = h * 0.6;
        this.addOval(path, adv - 40, h * 0.4, rx, ry, rx - s, ry - hStem);
        break;
      }
      case ')': {
        adv = 320;
        const rx = 120;
        const ry = h * 0.6;
        this.addOval(path, 40, h * 0.4, rx, ry, rx - s, ry - hStem);
        break;
      }
      case "'": {
        adv = 200;
        this.addRect(path, 100 - s / 2, h - 140, s, 140);
        break;
      }
      case '"': {
        adv = 320;
        this.addRect(path, 80, h - 140, s, 140);
        this.addRect(path, 200, h - 140, s, 140);
        break;
      }
      default: {
        adv = 300;
        this.addRect(path, 100, 0, s, h);
        break;
      }
    }

    return new Glyph({
      name: char,
      unicode,
      advanceWidth: adv,
      path,
    });
  }
}
