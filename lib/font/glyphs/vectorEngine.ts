import { Path, Glyph } from 'opentype.js';
import type { FontSpecification } from '../specification/types';

export class GlyphVectorEngine {
  private spec: FontSpecification;
  private stem: number;
  private capH: number;
  private xH: number;
  private asc: number;
  private desc: number;
  private isHorror: boolean;
  private isSerif: boolean;
  private isHandwritten: boolean;
  private isPixel: boolean;

  constructor(spec: FontSpecification) {
    this.spec = spec;
    this.stem = spec.stemWidth || 80;
    this.capH = spec.capHeight || 700;
    this.xH = spec.xHeight || 500;
    this.asc = spec.ascender || 800;
    this.desc = spec.descender || -200;

    const p = (spec.prompt || '').toLowerCase();
    const c = (spec.category || '').toLowerCase();
    const s = (spec.style || '').toLowerCase();
    const d = (spec.designDescription || '').toLowerCase();
    const n = (spec.fontName || '').toLowerCase();

    const textAll = `${p} ${c} ${s} ${d} ${n}`;

    const horrorKeywords = [
      'horror', 'gothic', 'terrifying', 'dark', 'spooky', 'haunted',
      'creepy', 'vampire', 'occult', 'evil', 'witch', 'demon', 'monster',
      'blood', 'sinister', 'cursed', 'forbidden', 'fantasy', 'threat', 'scary',
      'jagged', 'distorted', 'unsettling', 'decay'
    ];

    this.isHorror = horrorKeywords.some((k) => textAll.includes(k));
    this.isSerif = c.includes('serif') || s.includes('serif') || textAll.includes('serif');
    this.isHandwritten = c.includes('script') || c.includes('hand') || s.includes('hand');
    this.isPixel = c.includes('pixel') || s.includes('pixel');

    // Adjust parameters for Horror / Gothic style
    if (this.isHorror) {
      this.capH = Math.min(850, (spec.capHeight || 700) + 60);
      this.asc = Math.min(920, (spec.ascender || 800) + 70);
    }
  }

  /**
   * Generates a complete array of opentype.Glyph objects based on the FontSpecification.
   */
  public generateGlyphs(): Glyph[] {
    const glyphs: Glyph[] = [];

    // 1. Mandatory .notdef glyph (Unicode 0)
    glyphs.push(this.createNotDefGlyph());

    // 2. Space glyph (Unicode 32)
    glyphs.push(
      new Glyph({
        name: 'space',
        unicode: 32,
        advanceWidth: this.isHorror ? 220 : 280,
        path: new Path(),
      })
    );

    // 3. Uppercase A-Z (Unicode 65..90)
    if (this.spec.characterSet.uppercase) {
      for (let i = 65; i <= 90; i++) {
        const char = String.fromCharCode(i);
        glyphs.push(this.createUppercaseGlyph(char, i));
      }
    }

    // 4. Lowercase a-z (Unicode 97..122)
    if (this.spec.characterSet.lowercase) {
      for (let i = 97; i <= 122; i++) {
        const char = String.fromCharCode(i);
        glyphs.push(this.createLowercaseGlyph(char, i));
      }
    }

    // 5. Numbers 0-9 (Unicode 48..57)
    if (this.spec.characterSet.numbers) {
      for (let i = 48; i <= 57; i++) {
        const char = String.fromCharCode(i);
        glyphs.push(this.createNumberGlyph(char, i));
      }
    }

    // 6. Basic Punctuation
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
      ];

      puncts.forEach((p) => {
        glyphs.push(this.createPunctuationGlyph(p.char, p.code));
      });
    }

    return glyphs;
  }

  /**
   * Required OpenType .notdef fallback glyph box.
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
   * Helper to add sharp triangular dagger serifs for horror/gothic styles.
   */
  private addDaggerSerif(path: Path, x: number, y: number, stemW: number, position: 'top' | 'bottom') {
    if (!this.isHorror && !this.isSerif) return;
    const len = this.isHorror ? 35 : 25;
    const h = this.isHorror ? 30 : 15;

    if (position === 'top') {
      path.moveTo(x - len, y);
      path.lineTo(x + stemW + len, y);
      path.lineTo(x + stemW / 2, y + h);
      path.close();
    } else {
      path.moveTo(x - len, y);
      path.lineTo(x + stemW + len, y);
      path.lineTo(x + stemW / 2, y - h);
      path.close();
    }
  }

  /**
   * Synthesizes vector contour paths for Uppercase letters A-Z.
   */
  private createUppercaseGlyph(char: string, unicode: number): Glyph {
    const path = new Path();
    const s = this.stem;
    const h = this.capH;
    let adv = this.isHorror ? 540 : 620;

    switch (char) {
      case 'A': {
        adv = this.isHorror ? 560 : 640;
        const mid = adv / 2;
        const apexY = this.isHorror ? h + 60 : h;

        // Left diagonal
        path.moveTo(40, 0);
        path.lineTo(mid, apexY);
        path.lineTo(mid + s * 0.8, apexY);
        path.lineTo(adv - 40, 0);
        path.lineTo(adv - 40 - s, 0);
        path.lineTo(mid, h - s * 1.2);
        path.lineTo(40 + s, 0);
        path.close();

        // Crossbar
        const barY = h * 0.35;
        path.moveTo(110, barY);
        path.lineTo(adv - 110, barY);
        path.lineTo(adv - 110, barY + s * 0.7);
        path.lineTo(110, barY + s * 0.7);
        path.close();

        this.addDaggerSerif(path, 40, 0, s, 'bottom');
        this.addDaggerSerif(path, adv - 40 - s, 0, s, 'bottom');
        break;
      }
      case 'B': {
        adv = this.isHorror ? 520 : 620;
        path.moveTo(60, 0);
        path.lineTo(60 + s, 0);
        path.lineTo(60 + s, h);
        path.lineTo(60, h);
        path.close();

        // Upper loop
        path.moveTo(60 + s, h);
        path.lineTo(adv - 110, h);
        path.curveTo(adv, h, adv, h * 0.55, adv - 110, h * 0.52);
        path.lineTo(60 + s, h * 0.52);
        path.close();
        path.moveTo(60 + s + s * 0.6, h - s * 0.7);
        path.lineTo(adv - 130, h - s * 0.7);
        path.lineTo(adv - 130, h * 0.52 + s * 0.5);
        path.lineTo(60 + s + s * 0.6, h * 0.52 + s * 0.5);
        path.close();

        // Lower loop
        path.moveTo(60 + s, h * 0.52);
        path.lineTo(adv - 90, h * 0.52);
        path.curveTo(adv + 10, h * 0.48, adv + 10, 0, adv - 90, 0);
        path.lineTo(60 + s, 0);
        path.close();
        path.moveTo(60 + s + s * 0.6, h * 0.52 - s * 0.5);
        path.lineTo(adv - 110, h * 0.52 - s * 0.5);
        path.lineTo(adv - 110, s * 0.7);
        path.lineTo(60 + s + s * 0.6, s * 0.7);
        path.close();

        this.addDaggerSerif(path, 60, h, s, 'top');
        this.addDaggerSerif(path, 60, 0, s, 'bottom');
        break;
      }
      case 'C': {
        adv = this.isHorror ? 540 : 640;
        path.moveTo(adv - 70, h * 0.82);
        path.curveTo(70, h + 30, 70, -30, adv - 70, h * 0.18);
        path.lineTo(adv - 70, h * 0.18 + s);
        path.curveTo(70 + s * 1.2, 0 + s, 70 + s * 1.2, h - s, adv - 70, h * 0.82 - s);
        path.close();
        break;
      }
      case 'D': {
        adv = this.isHorror ? 540 : 640;
        path.moveTo(60, 0);
        path.lineTo(60 + s, 0);
        path.lineTo(60 + s, h);
        path.lineTo(60, h);
        path.close();

        path.moveTo(60 + s, h);
        path.lineTo(adv - 120, h);
        path.curveTo(adv + 20, h, adv + 20, 0, adv - 120, 0);
        path.lineTo(60 + s, 0);
        path.close();

        path.moveTo(60 + s * 1.6, h - s * 0.8);
        path.lineTo(adv - 140, h - s * 0.8);
        path.curveTo(adv - 20, h - s * 0.8, adv - 20, s * 0.8, adv - 140, s * 0.8);
        path.lineTo(60 + s * 1.6, s * 0.8);
        path.close();

        this.addDaggerSerif(path, 60, h, s, 'top');
        this.addDaggerSerif(path, 60, 0, s, 'bottom');
        break;
      }
      case 'E': {
        adv = this.isHorror ? 500 : 580;
        path.moveTo(60, 0);
        path.lineTo(60 + s, 0);
        path.lineTo(60 + s, h);
        path.lineTo(60, h);
        path.close();

        // Top bar
        path.moveTo(60, h - s);
        path.lineTo(adv - 60, h - s);
        path.lineTo(adv - 60, h);
        path.lineTo(60, h);
        path.close();

        // Mid bar
        path.moveTo(60, h * 0.5 - s / 2);
        path.lineTo(adv - 100, h * 0.5 - s / 2);
        path.lineTo(adv - 100, h * 0.5 + s / 2);
        path.lineTo(60, h * 0.5 + s / 2);
        path.close();

        // Bottom bar
        path.moveTo(60, 0);
        path.lineTo(adv - 60, 0);
        path.lineTo(adv - 60, s);
        path.lineTo(60, s);
        path.close();

        this.addDaggerSerif(path, 60, h, s, 'top');
        this.addDaggerSerif(path, 60, 0, s, 'bottom');
        break;
      }
      case 'F': {
        adv = this.isHorror ? 480 : 560;
        path.moveTo(60, 0);
        path.lineTo(60 + s, 0);
        path.lineTo(60 + s, h);
        path.lineTo(60, h);
        path.close();

        // Top bar
        path.moveTo(60, h - s);
        path.lineTo(adv - 60, h - s);
        path.lineTo(adv - 60, h);
        path.lineTo(60, h);
        path.close();

        // Mid bar
        path.moveTo(60, h * 0.5 - s / 2);
        path.lineTo(adv - 100, h * 0.5 - s / 2);
        path.lineTo(adv - 100, h * 0.5 + s / 2);
        path.lineTo(60, h * 0.5 + s / 2);
        path.close();

        this.addDaggerSerif(path, 60, h, s, 'top');
        this.addDaggerSerif(path, 60, 0, s, 'bottom');
        break;
      }
      case 'G': {
        adv = this.isHorror ? 560 : 660;
        path.moveTo(adv - 70, h * 0.82);
        path.curveTo(70, h + 30, 70, -30, adv - 70, h * 0.18);
        path.lineTo(adv - 70, h * 0.45);
        path.lineTo(adv - 180, h * 0.45);
        path.lineTo(adv - 180, h * 0.45 - s);
        path.lineTo(adv - 70 + s, h * 0.45 - s);
        path.lineTo(adv - 70 + s, h * 0.18);
        path.curveTo(70 + s * 1.2, 0 + s, 70 + s * 1.2, h - s, adv - 70, h * 0.82 - s);
        path.close();
        break;
      }
      case 'H': {
        adv = this.isHorror ? 540 : 640;
        // Left stem
        path.moveTo(60, 0);
        path.lineTo(60 + s, 0);
        path.lineTo(60 + s, h);
        path.lineTo(60, h);
        path.close();

        // Right stem
        path.moveTo(adv - 60 - s, 0);
        path.lineTo(adv - 60, 0);
        path.lineTo(adv - 60, h);
        path.lineTo(adv - 60 - s, h);
        path.close();

        // Mid bar
        path.moveTo(60, h * 0.48);
        path.lineTo(adv - 60, h * 0.48);
        path.lineTo(adv - 60, h * 0.48 + s);
        path.lineTo(60, h * 0.48 + s);
        path.close();

        this.addDaggerSerif(path, 60, h, s, 'top');
        this.addDaggerSerif(path, 60, 0, s, 'bottom');
        this.addDaggerSerif(path, adv - 60 - s, h, s, 'top');
        this.addDaggerSerif(path, adv - 60 - s, 0, s, 'bottom');
        break;
      }
      case 'I': {
        adv = this.isHorror ? 320 : 380;
        const mid = adv / 2;
        path.moveTo(mid - s / 2, 0);
        path.lineTo(mid + s / 2, 0);
        path.lineTo(mid + s / 2, h);
        path.lineTo(mid - s / 2, h);
        path.close();

        // Top/bottom serifs
        path.moveTo(mid - s * 1.5, h - s * 0.8);
        path.lineTo(mid + s * 1.5, h - s * 0.8);
        path.lineTo(mid + s * 1.5, h);
        path.lineTo(mid - s * 1.5, h);
        path.close();

        path.moveTo(mid - s * 1.5, 0);
        path.lineTo(mid + s * 1.5, 0);
        path.lineTo(mid + s * 1.5, s * 0.8);
        path.lineTo(mid - s * 1.5, s * 0.8);
        path.close();
        break;
      }
      case 'J': {
        adv = this.isHorror ? 420 : 500;
        path.moveTo(adv - 60 - s, h);
        path.lineTo(adv - 60, h);
        path.lineTo(adv - 60, h * 0.25);
        path.curveTo(adv - 60, -40, 60, -40, 60, h * 0.25);
        path.lineTo(60 + s, h * 0.25);
        path.curveTo(60 + s, 0 + s, adv - 60 - s, 0 + s, adv - 60 - s, h * 0.25);
        path.close();

        this.addDaggerSerif(path, adv - 60 - s, h, s, 'top');
        break;
      }
      case 'K': {
        adv = this.isHorror ? 540 : 620;
        path.moveTo(60, 0);
        path.lineTo(60 + s, 0);
        path.lineTo(60 + s, h);
        path.lineTo(60, h);
        path.close();

        // Upper arm
        path.moveTo(60 + s, h * 0.4);
        path.lineTo(adv - 60 - s, h);
        path.lineTo(adv - 60, h);
        path.lineTo(60 + s, h * 0.35);
        path.close();

        // Lower leg
        path.moveTo(60 + s * 1.5, h * 0.42);
        path.lineTo(adv - 50, 0);
        path.lineTo(adv - 50 - s, 0);
        path.lineTo(60 + s, h * 0.38);
        path.close();

        this.addDaggerSerif(path, 60, h, s, 'top');
        this.addDaggerSerif(path, 60, 0, s, 'bottom');
        this.addDaggerSerif(path, adv - 60 - s, h, s, 'top');
        this.addDaggerSerif(path, adv - 50 - s, 0, s, 'bottom');
        break;
      }
      case 'L': {
        adv = this.isHorror ? 460 : 540;
        path.moveTo(60, 0);
        path.lineTo(60 + s, 0);
        path.lineTo(60 + s, h);
        path.lineTo(60, h);
        path.close();

        path.moveTo(60, 0);
        path.lineTo(adv - 60, 0);
        path.lineTo(adv - 60, s);
        path.lineTo(60, s);
        path.close();

        this.addDaggerSerif(path, 60, h, s, 'top');
        break;
      }
      case 'M': {
        adv = this.isHorror ? 660 : 760;
        const mid = adv / 2;
        const peakY = this.isHorror ? h + 50 : h;

        path.moveTo(50, 0);
        path.lineTo(50 + s, 0);
        path.lineTo(50 + s, peakY);
        path.lineTo(50, peakY);
        path.close();

        path.moveTo(50, peakY);
        path.lineTo(mid, 0);
        path.lineTo(mid + s * 0.8, 0);
        path.lineTo(50 + s, peakY);
        path.close();

        path.moveTo(adv - 50 - s, peakY);
        path.lineTo(mid, 0);
        path.lineTo(mid + s * 0.8, 0);
        path.lineTo(adv - 50, peakY);
        path.close();

        path.moveTo(adv - 50 - s, 0);
        path.lineTo(adv - 50, 0);
        path.lineTo(adv - 50, peakY);
        path.lineTo(adv - 50 - s, peakY);
        path.close();

        this.addDaggerSerif(path, 50, 0, s, 'bottom');
        this.addDaggerSerif(path, adv - 50 - s, 0, s, 'bottom');
        break;
      }
      case 'N': {
        adv = this.isHorror ? 580 : 660;
        const peakY = this.isHorror ? h + 50 : h;

        path.moveTo(60, 0);
        path.lineTo(60 + s, 0);
        path.lineTo(60 + s, peakY);
        path.lineTo(60, peakY);
        path.close();

        path.moveTo(60, peakY);
        path.lineTo(adv - 60, 0);
        path.lineTo(adv - 60 + s * 0.8, 0);
        path.lineTo(60 + s, peakY);
        path.close();

        path.moveTo(adv - 60 - s, 0);
        path.lineTo(adv - 60, 0);
        path.lineTo(adv - 60, peakY);
        path.lineTo(adv - 60 - s, peakY);
        path.close();

        this.addDaggerSerif(path, 60, 0, s, 'bottom');
        this.addDaggerSerif(path, adv - 60 - s, peakY, s, 'top');
        break;
      }
      case 'O': {
        adv = this.isHorror ? 560 : 660;
        path.moveTo(adv / 2, 0);
        path.curveTo(40, 0, 40, h, adv / 2, h);
        path.curveTo(adv - 40, h, adv - 40, 0, adv / 2, 0);
        path.close();

        path.moveTo(adv / 2, s * 1.1);
        path.curveTo(adv - 40 - s, s * 1.1, adv - 40 - s, h - s * 1.1, adv / 2, h - s * 1.1);
        path.curveTo(40 + s, h - s * 1.1, 40 + s, s * 1.1, adv / 2, s * 1.1);
        path.close();
        break;
      }
      case 'P': {
        adv = this.isHorror ? 520 : 600;
        path.moveTo(60, 0);
        path.lineTo(60 + s, 0);
        path.lineTo(60 + s, h);
        path.lineTo(60, h);
        path.close();

        path.moveTo(60 + s, h);
        path.lineTo(adv - 90, h);
        path.curveTo(adv + 10, h, adv + 10, h * 0.45, adv - 90, h * 0.45);
        path.lineTo(60 + s, h * 0.45);
        path.close();

        path.moveTo(60 + s * 1.6, h - s * 0.7);
        path.lineTo(adv - 110, h - s * 0.7);
        path.curveTo(adv - 10, h - s * 0.7, adv - 10, h * 0.45 + s * 0.7, adv - 110, h * 0.45 + s * 0.7);
        path.lineTo(60 + s * 1.6, h * 0.45 + s * 0.7);
        path.close();

        this.addDaggerSerif(path, 60, h, s, 'top');
        this.addDaggerSerif(path, 60, 0, s, 'bottom');
        break;
      }
      case 'Q': {
        adv = this.isHorror ? 580 : 680;
        path.moveTo(adv / 2, 0);
        path.curveTo(40, 0, 40, h, adv / 2, h);
        path.curveTo(adv - 40, h, adv - 40, 0, adv / 2, 0);
        path.close();

        path.moveTo(adv / 2, s * 1.1);
        path.curveTo(adv - 40 - s, s * 1.1, adv - 40 - s, h - s * 1.1, adv / 2, h - s * 1.1);
        path.curveTo(40 + s, h - s * 1.1, 40 + s, s * 1.1, adv / 2, s * 1.1);
        path.close();

        // Dagger tail
        path.moveTo(adv * 0.55, h * 0.25);
        path.lineTo(adv - 30, -60);
        path.lineTo(adv - 30 + s, -60);
        path.lineTo(adv * 0.55 + s, h * 0.25);
        path.close();
        break;
      }
      case 'R': {
        adv = this.isHorror ? 540 : 620;
        path.moveTo(60, 0);
        path.lineTo(60 + s, 0);
        path.lineTo(60 + s, h);
        path.lineTo(60, h);
        path.close();

        // Upper loop
        path.moveTo(60 + s, h);
        path.lineTo(adv - 90, h);
        path.curveTo(adv + 10, h, adv + 10, h * 0.48, adv - 90, h * 0.48);
        path.lineTo(60 + s, h * 0.48);
        path.close();

        path.moveTo(60 + s * 1.6, h - s * 0.7);
        path.lineTo(adv - 110, h - s * 0.7);
        path.curveTo(adv - 10, h - s * 0.7, adv - 10, h * 0.48 + s * 0.7, adv - 110, h * 0.48 + s * 0.7);
        path.lineTo(60 + s * 1.6, h * 0.48 + s * 0.7);
        path.close();

        // Diagonal leg
        path.moveTo(60 + s * 1.2, h * 0.48);
        path.lineTo(adv - 50, 0);
        path.lineTo(adv - 50 - s, 0);
        path.lineTo(60 + s, h * 0.42);
        path.close();

        this.addDaggerSerif(path, 60, h, s, 'top');
        this.addDaggerSerif(path, 60, 0, s, 'bottom');
        this.addDaggerSerif(path, adv - 50 - s, 0, s, 'bottom');
        break;
      }
      case 'S': {
        adv = this.isHorror ? 500 : 580;
        path.moveTo(adv - 60, h * 0.8);
        path.curveTo(adv - 60, h, 60, h, 60, h * 0.65);
        path.curveTo(60, h * 0.35, adv - 60, h * 0.35, adv - 60, h * 0.2);
        path.curveTo(adv - 60, 0, 60, 0, 60, h * 0.2);
        path.lineTo(60, h * 0.2 + s);
        path.curveTo(60 + s, s, adv - 60 - s, s, adv - 60 - s, h * 0.2);
        path.curveTo(adv - 60 - s, h * 0.45, 60 + s, h * 0.45, 60 + s, h * 0.65);
        path.curveTo(60 + s, h - s, adv - 60 - s, h - s, adv - 60 - s, h * 0.8);
        path.close();
        break;
      }
      case 'T': {
        adv = this.isHorror ? 480 : 560;
        const mid = adv / 2;

        // Crossbar
        path.moveTo(40, h - s);
        path.lineTo(adv - 40, h - s);
        path.lineTo(adv - 40, h);
        path.lineTo(40, h);
        path.close();

        // Stem
        path.moveTo(mid - s / 2, 0);
        path.lineTo(mid + s / 2, 0);
        path.lineTo(mid + s / 2, h);
        path.lineTo(mid - s / 2, h);
        path.close();

        this.addDaggerSerif(path, mid - s / 2, 0, s, 'bottom');
        break;
      }
      case 'U': {
        adv = this.isHorror ? 540 : 620;
        path.moveTo(60, h);
        path.lineTo(60 + s, h);
        path.lineTo(60 + s, h * 0.25);
        path.curveTo(60 + s, 0, adv - 60 - s, 0, adv - 60 - s, h * 0.25);
        path.lineTo(adv - 60 - s, h);
        path.lineTo(adv - 60, h);
        path.lineTo(adv - 60, h * 0.25);
        path.curveTo(adv - 60, -30, 60, -30, 60, h * 0.25);
        path.close();

        this.addDaggerSerif(path, 60, h, s, 'top');
        this.addDaggerSerif(path, adv - 60 - s, h, s, 'top');
        break;
      }
      case 'V': {
        adv = this.isHorror ? 540 : 620;
        const mid = adv / 2;
        const botY = this.isHorror ? -50 : 0;

        path.moveTo(50, h);
        path.lineTo(mid, botY);
        path.lineTo(mid + s * 0.8, botY);
        path.lineTo(adv - 50, h);
        path.lineTo(adv - 50 - s, h);
        path.lineTo(mid, botY + s * 1.5);
        path.lineTo(50 + s, h);
        path.close();

        this.addDaggerSerif(path, 50, h, s, 'top');
        this.addDaggerSerif(path, adv - 50 - s, h, s, 'top');
        break;
      }
      case 'W': {
        adv = this.isHorror ? 680 : 780;
        const botY = this.isHorror ? -40 : 0;
        const q1 = adv * 0.28;
        const mid = adv * 0.5;
        const q3 = adv * 0.72;

        path.moveTo(40, h);
        path.lineTo(q1, botY);
        path.lineTo(mid, h);
        path.lineTo(q3, botY);
        path.lineTo(adv - 40, h);
        path.lineTo(adv - 40 - s, h);
        path.lineTo(q3, botY + s * 1.5);
        path.lineTo(mid, h - s);
        path.lineTo(q1, botY + s * 1.5);
        path.lineTo(40 + s, h);
        path.close();

        this.addDaggerSerif(path, 40, h, s, 'top');
        this.addDaggerSerif(path, adv - 40 - s, h, s, 'top');
        break;
      }
      case 'X': {
        adv = this.isHorror ? 520 : 600;
        path.moveTo(50, h);
        path.lineTo(adv - 50, 0);
        path.lineTo(adv - 50 - s, 0);
        path.lineTo(50 + s, h);
        path.close();

        path.moveTo(adv - 50, h);
        path.lineTo(50, 0);
        path.lineTo(50 + s, 0);
        path.lineTo(adv - 50 - s, h);
        path.close();

        this.addDaggerSerif(path, 50, h, s, 'top');
        this.addDaggerSerif(path, adv - 50 - s, h, s, 'top');
        this.addDaggerSerif(path, 50, 0, s, 'bottom');
        this.addDaggerSerif(path, adv - 50 - s, 0, s, 'bottom');
        break;
      }
      case 'Y': {
        adv = this.isHorror ? 520 : 600;
        const mid = adv / 2;

        path.moveTo(50, h);
        path.lineTo(mid, h * 0.45);
        path.lineTo(adv - 50, h);
        path.lineTo(adv - 50 - s, h);
        path.lineTo(mid, h * 0.5);
        path.lineTo(50 + s, h);
        path.close();

        path.moveTo(mid - s / 2, 0);
        path.lineTo(mid + s / 2, 0);
        path.lineTo(mid + s / 2, h * 0.48);
        path.lineTo(mid - s / 2, h * 0.48);
        path.close();

        this.addDaggerSerif(path, 50, h, s, 'top');
        this.addDaggerSerif(path, adv - 50 - s, h, s, 'top');
        this.addDaggerSerif(path, mid - s / 2, 0, s, 'bottom');
        break;
      }
      case 'Z': {
        adv = this.isHorror ? 500 : 580;
        path.moveTo(50, h - s);
        path.lineTo(adv - 50, h - s);
        path.lineTo(adv - 50, h);
        path.lineTo(50, h);
        path.close();

        path.moveTo(adv - 50 - s, h - s);
        path.lineTo(50, s);
        path.lineTo(50 + s, s);
        path.lineTo(adv - 50, h - s);
        path.close();

        path.moveTo(50, 0);
        path.lineTo(adv - 50, 0);
        path.lineTo(adv - 50, s);
        path.lineTo(50, s);
        path.close();
        break;
      }
      default: {
        adv = 580;
        path.moveTo(60, 0);
        path.lineTo(60 + s, 0);
        path.lineTo(60 + s, h);
        path.lineTo(60, h);
        path.close();
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
   * Synthesizes vector contour paths for Lowercase letters a-z.
   */
  private createLowercaseGlyph(char: string, unicode: number): Glyph {
    const path = new Path();
    const s = Math.max(30, this.stem * 0.85);
    const h = this.xH;
    const ascY = this.asc;
    const descY = this.desc;
    let adv = this.isHorror ? 480 : 540;

    switch (char) {
      case 'a': {
        adv = 500;
        path.moveTo(adv - 50 - s, 0);
        path.lineTo(adv - 50, 0);
        path.lineTo(adv - 50, h);
        path.lineTo(adv - 50 - s, h);
        path.close();

        path.moveTo(adv - 50 - s, h);
        path.curveTo(50, h, 50, 0, adv - 50 - s, 0);
        path.lineTo(adv - 50 - s, s);
        path.curveTo(50 + s, s, 50 + s, h - s, adv - 50 - s, h - s);
        path.close();

        this.addDaggerSerif(path, adv - 50 - s, 0, s, 'bottom');
        break;
      }
      case 'b': {
        adv = 500;
        path.moveTo(50, 0);
        path.lineTo(50 + s, 0);
        path.lineTo(50 + s, ascY);
        path.lineTo(50, ascY);
        path.close();

        path.moveTo(50 + s, h);
        path.curveTo(adv, h, adv, 0, 50 + s, 0);
        path.lineTo(50 + s, s);
        path.curveTo(adv - s, s, adv - s, h - s, 50 + s, h - s);
        path.close();

        this.addDaggerSerif(path, 50, ascY, s, 'top');
        this.addDaggerSerif(path, 50, 0, s, 'bottom');
        break;
      }
      case 'c': {
        adv = 460;
        path.moveTo(adv - 60, h * 0.8);
        path.curveTo(60, h + 20, 60, -20, adv - 60, h * 0.2);
        path.lineTo(adv - 60, h * 0.2 + s);
        path.curveTo(60 + s, s, 60 + s, h - s, adv - 60, h * 0.8 - s);
        path.close();
        break;
      }
      case 'd': {
        adv = 500;
        path.moveTo(adv - 50 - s, 0);
        path.lineTo(adv - 50, 0);
        path.lineTo(adv - 50, ascY);
        path.lineTo(adv - 50 - s, ascY);
        path.close();

        path.moveTo(adv - 50 - s, h);
        path.curveTo(40, h, 40, 0, adv - 50 - s, 0);
        path.lineTo(adv - 50 - s, s);
        path.curveTo(40 + s, s, 40 + s, h - s, adv - 50 - s, h - s);
        path.close();

        this.addDaggerSerif(path, adv - 50 - s, ascY, s, 'top');
        this.addDaggerSerif(path, adv - 50 - s, 0, s, 'bottom');
        break;
      }
      case 'e': {
        adv = 480;
        path.moveTo(adv - 50, h * 0.75);
        path.curveTo(50, h + 20, 50, -20, adv - 50, h * 0.2);
        path.lineTo(adv - 50, h * 0.2 + s);
        path.curveTo(50 + s, s, 50 + s, h - s, adv - 50, h * 0.75 - s);
        path.close();

        path.moveTo(50, h * 0.5);
        path.lineTo(adv - 50, h * 0.5);
        path.lineTo(adv - 50, h * 0.5 + s * 0.8);
        path.lineTo(50, h * 0.5 + s * 0.8);
        path.close();
        break;
      }
      case 'f': {
        adv = 360;
        path.moveTo(50, 0);
        path.lineTo(50 + s, 0);
        path.lineTo(50 + s, ascY - 60);
        path.curveTo(50 + s, ascY, adv, ascY, adv, ascY - 40);
        path.lineTo(adv - s, ascY - 40);
        path.curveTo(adv - s, ascY - s, 50 + s, ascY - s, 50, ascY - 60);
        path.close();

        path.moveTo(30, h);
        path.lineTo(adv - 20, h);
        path.lineTo(adv - 20, h + s * 0.8);
        path.lineTo(30, h + s * 0.8);
        path.close();

        this.addDaggerSerif(path, 50, 0, s, 'bottom');
        break;
      }
      case 'g': {
        adv = 500;
        // Top bowl
        path.moveTo(adv - 50 - s, h);
        path.curveTo(40, h, 40, 0, adv - 50 - s, 0);
        path.lineTo(adv - 50 - s, s);
        path.curveTo(40 + s, s, 40 + s, h - s, adv - 50 - s, h - s);
        path.close();

        // Right descender stem
        path.moveTo(adv - 50 - s, h);
        path.lineTo(adv - 50, h);
        path.lineTo(adv - 50, descY + 40);
        path.curveTo(adv - 50, descY, 40, descY, 40, descY + 40);
        path.lineTo(40 + s, descY + 40);
        path.curveTo(40 + s, descY + s, adv - 50 - s, descY + s, adv - 50 - s, descY + 40);
        path.close();
        break;
      }
      case 'h': {
        adv = 520;
        // Left ascender stem
        path.moveTo(50, 0);
        path.lineTo(50 + s, 0);
        path.lineTo(50 + s, ascY);
        path.lineTo(50, ascY);
        path.close();

        // Arch shoulder
        path.moveTo(50 + s, h);
        path.curveTo(adv - 50, h, adv - 50, h * 0.5, adv - 50, 0);
        path.lineTo(adv - 50 - s, 0);
        path.curveTo(adv - 50 - s, h * 0.5, 50 + s, h - s, 50 + s, h - s);
        path.close();

        this.addDaggerSerif(path, 50, ascY, s, 'top');
        this.addDaggerSerif(path, 50, 0, s, 'bottom');
        this.addDaggerSerif(path, adv - 50 - s, 0, s, 'bottom');
        break;
      }
      case 'i': {
        adv = 280;
        const mid = adv / 2;
        path.moveTo(mid - s / 2, 0);
        path.lineTo(mid + s / 2, 0);
        path.lineTo(mid + s / 2, h);
        path.lineTo(mid - s / 2, h);
        path.close();

        // Floating dot
        const dotY = h + 70;
        path.moveTo(mid - s / 2, dotY);
        path.lineTo(mid + s / 2, dotY);
        path.lineTo(mid + s / 2, dotY + s * 1.2);
        path.lineTo(mid - s / 2, dotY + s * 1.2);
        path.close();

        this.addDaggerSerif(path, mid - s / 2, 0, s, 'bottom');
        break;
      }
      case 'j': {
        adv = 320;
        path.moveTo(adv - 50 - s, h);
        path.lineTo(adv - 50, h);
        path.lineTo(adv - 50, descY + 40);
        path.curveTo(adv - 50, descY, 40, descY, 40, descY + 30);
        path.lineTo(40 + s, descY + 30);
        path.curveTo(40 + s, descY + s, adv - 50 - s, descY + s, adv - 50 - s, descY + 40);
        path.close();

        // Floating dot
        const dotY = h + 70;
        path.moveTo(adv - 50 - s, dotY);
        path.lineTo(adv - 50, dotY);
        path.lineTo(adv - 50, dotY + s * 1.2);
        path.lineTo(adv - 50 - s, dotY + s * 1.2);
        path.close();
        break;
      }
      case 'k': {
        adv = 500;
        path.moveTo(50, 0);
        path.lineTo(50 + s, 0);
        path.lineTo(50 + s, ascY);
        path.lineTo(50, ascY);
        path.close();

        // Upper arm
        path.moveTo(50 + s, h * 0.4);
        path.lineTo(adv - 50 - s, h);
        path.lineTo(adv - 50, h);
        path.lineTo(50 + s, h * 0.35);
        path.close();

        // Lower leg
        path.moveTo(50 + s * 1.5, h * 0.42);
        path.lineTo(adv - 40, 0);
        path.lineTo(adv - 40 - s, 0);
        path.lineTo(50 + s, h * 0.38);
        path.close();

        this.addDaggerSerif(path, 50, ascY, s, 'top');
        this.addDaggerSerif(path, 50, 0, s, 'bottom');
        this.addDaggerSerif(path, adv - 40 - s, 0, s, 'bottom');
        break;
      }
      case 'l': {
        adv = 280;
        const mid = adv / 2;
        path.moveTo(mid - s / 2, 0);
        path.lineTo(mid + s / 2, 0);
        path.lineTo(mid + s / 2, ascY);
        path.lineTo(mid - s / 2, ascY);
        path.close();

        this.addDaggerSerif(path, mid - s / 2, ascY, s, 'top');
        this.addDaggerSerif(path, mid - s / 2, 0, s, 'bottom');
        break;
      }
      case 'm': {
        adv = 720;
        const w3 = adv / 3;

        // Stem 1
        path.moveTo(40, 0);
        path.lineTo(40 + s, 0);
        path.lineTo(40 + s, h);
        path.lineTo(40, h);
        path.close();

        // Arch 1 -> Stem 2
        path.moveTo(40 + s, h);
        path.curveTo(w3 + 40, h, w3 + 40, h * 0.5, w3 + 40, 0);
        path.lineTo(w3 + 40 - s, 0);
        path.curveTo(w3 + 40 - s, h * 0.5, 40 + s, h - s, 40 + s, h - s);
        path.close();

        // Arch 2 -> Stem 3
        path.moveTo(w3 + 40, h);
        path.curveTo(adv - 40, h, adv - 40, h * 0.5, adv - 40, 0);
        path.lineTo(adv - 40 - s, 0);
        path.curveTo(adv - 40 - s, h * 0.5, w3 + 40, h - s, w3 + 40, h - s);
        path.close();

        this.addDaggerSerif(path, 40, 0, s, 'bottom');
        this.addDaggerSerif(path, w3 + 40 - s, 0, s, 'bottom');
        this.addDaggerSerif(path, adv - 40 - s, 0, s, 'bottom');
        break;
      }
      case 'n': {
        adv = 520;
        path.moveTo(50, 0);
        path.lineTo(50 + s, 0);
        path.lineTo(50 + s, h);
        path.lineTo(50, h);
        path.close();

        path.moveTo(50 + s, h);
        path.curveTo(adv - 50, h, adv - 50, h * 0.5, adv - 50, 0);
        path.lineTo(adv - 50 - s, 0);
        path.curveTo(adv - 50 - s, h * 0.5, 50 + s, h - s, 50 + s, h - s);
        path.close();

        this.addDaggerSerif(path, 50, 0, s, 'bottom');
        this.addDaggerSerif(path, adv - 50 - s, 0, s, 'bottom');
        break;
      }
      case 'o': {
        adv = 500;
        path.moveTo(adv / 2, 0);
        path.curveTo(40, 0, 40, h, adv / 2, h);
        path.curveTo(adv - 40, h, adv - 40, 0, adv / 2, 0);
        path.close();

        path.moveTo(adv / 2, s);
        path.curveTo(adv - 40 - s, s, adv - 40 - s, h - s, adv / 2, h - s);
        path.curveTo(40 + s, h - s, 40 + s, s, adv / 2, s);
        path.close();
        break;
      }
      case 'p': {
        adv = 500;
        path.moveTo(50, descY);
        path.lineTo(50 + s, descY);
        path.lineTo(50 + s, h);
        path.lineTo(50, h);
        path.close();

        path.moveTo(50 + s, h);
        path.curveTo(adv, h, adv, 0, 50 + s, 0);
        path.lineTo(50 + s, s);
        path.curveTo(adv - s, s, adv - s, h - s, 50 + s, h - s);
        path.close();

        this.addDaggerSerif(path, 50, descY, s, 'bottom');
        break;
      }
      case 'q': {
        adv = 500;
        path.moveTo(adv - 50 - s, descY);
        path.lineTo(adv - 50, descY);
        path.lineTo(adv - 50, h);
        path.lineTo(adv - 50 - s, h);
        path.close();

        path.moveTo(adv - 50 - s, h);
        path.curveTo(40, h, 40, 0, adv - 50 - s, 0);
        path.lineTo(adv - 50 - s, s);
        path.curveTo(40 + s, s, 40 + s, h - s, adv - 50 - s, h - s);
        path.close();

        this.addDaggerSerif(path, adv - 50 - s, descY, s, 'bottom');
        break;
      }
      case 'r': {
        adv = 440;
        path.moveTo(50, 0);
        path.lineTo(50 + s, 0);
        path.lineTo(50 + s, h);
        path.lineTo(50, h);
        path.close();

        path.moveTo(50 + s, h - s * 0.8);
        path.curveTo(adv - 40, h, adv - 40, h * 0.7, adv - 40, h * 0.6);
        path.lineTo(adv - 40 - s, h * 0.6);
        path.curveTo(adv - 40 - s, h * 0.7, 50 + s, h - s * 1.5, 50 + s, h - s * 1.5);
        path.close();

        this.addDaggerSerif(path, 50, 0, s, 'bottom');
        break;
      }
      case 's': {
        adv = 460;
        path.moveTo(adv - 50, h * 0.8);
        path.curveTo(adv - 50, h, 50, h, 50, h * 0.65);
        path.curveTo(50, h * 0.35, adv - 50, h * 0.35, adv - 50, h * 0.2);
        path.curveTo(adv - 50, 0, 50, 0, 50, h * 0.2);
        path.lineTo(50, h * 0.2 + s);
        path.curveTo(50 + s, s, adv - 50 - s, s, adv - 50 - s, h * 0.2);
        path.curveTo(adv - 50 - s, h * 0.45, 50 + s, h * 0.45, 50 + s, h * 0.65);
        path.curveTo(50 + s, h - s, adv - 50 - s, h - s, adv - 50 - s, h * 0.8);
        path.close();
        break;
      }
      case 't': {
        adv = 380;
        const mid = adv / 2;
        path.moveTo(mid - s / 2, 0);
        path.lineTo(mid + s / 2, 0);
        path.lineTo(mid + s / 2, ascY * 0.85);
        path.lineTo(mid - s / 2, ascY * 0.85);
        path.close();

        path.moveTo(30, h);
        path.lineTo(adv - 30, h);
        path.lineTo(adv - 30, h + s * 0.8);
        path.lineTo(30, h + s * 0.8);
        path.close();

        this.addDaggerSerif(path, mid - s / 2, 0, s, 'bottom');
        break;
      }
      case 'u': {
        adv = 500;
        path.moveTo(50, h);
        path.lineTo(50 + s, h);
        path.lineTo(50 + s, h * 0.25);
        path.curveTo(50 + s, 0, adv - 50 - s, 0, adv - 50 - s, h * 0.25);
        path.lineTo(adv - 50 - s, h);
        path.lineTo(adv - 50, h);
        path.lineTo(adv - 50, h * 0.25);
        path.curveTo(adv - 50, -25, 50, -25, 50, h * 0.25);
        path.close();

        this.addDaggerSerif(path, 50, h, s, 'top');
        this.addDaggerSerif(path, adv - 50 - s, h, s, 'top');
        break;
      }
      case 'v': {
        adv = 480;
        const mid = adv / 2;
        path.moveTo(40, h);
        path.lineTo(mid, 0);
        path.lineTo(mid + s * 0.8, 0);
        path.lineTo(adv - 40, h);
        path.lineTo(adv - 40 - s, h);
        path.lineTo(mid, s * 1.5);
        path.lineTo(40 + s, h);
        path.close();

        this.addDaggerSerif(path, 40, h, s, 'top');
        this.addDaggerSerif(path, adv - 40 - s, h, s, 'top');
        break;
      }
      case 'w': {
        adv = 640;
        const q1 = adv * 0.28;
        const mid = adv * 0.5;
        const q3 = adv * 0.72;

        path.moveTo(30, h);
        path.lineTo(q1, 0);
        path.lineTo(mid, h);
        path.lineTo(q3, 0);
        path.lineTo(adv - 30, h);
        path.lineTo(adv - 30 - s, h);
        path.lineTo(q3, s * 1.5);
        path.lineTo(mid, h - s);
        path.lineTo(q1, s * 1.5);
        path.lineTo(30 + s, h);
        path.close();

        this.addDaggerSerif(path, 30, h, s, 'top');
        this.addDaggerSerif(path, adv - 30 - s, h, s, 'top');
        break;
      }
      case 'x': {
        adv = 480;
        path.moveTo(40, h);
        path.lineTo(adv - 40, 0);
        path.lineTo(adv - 40 - s, 0);
        path.lineTo(40 + s, h);
        path.close();

        path.moveTo(adv - 40, h);
        path.lineTo(40, 0);
        path.lineTo(40 + s, 0);
        path.lineTo(adv - 40 - s, h);
        path.close();

        this.addDaggerSerif(path, 40, h, s, 'top');
        this.addDaggerSerif(path, adv - 40 - s, h, s, 'top');
        this.addDaggerSerif(path, 40, 0, s, 'bottom');
        this.addDaggerSerif(path, adv - 40 - s, 0, s, 'bottom');
        break;
      }
      case 'y': {
        adv = 480;
        const mid = adv / 2;
        path.moveTo(40, h);
        path.lineTo(mid, 0);
        path.lineTo(adv - 40, h);
        path.lineTo(adv - 40 - s, h);
        path.lineTo(mid, s * 0.8);
        path.lineTo(40 + s, h);
        path.close();

        path.moveTo(mid, 0);
        path.lineTo(30, descY);
        path.lineTo(30 + s, descY);
        path.lineTo(mid + s, 0);
        path.close();

        this.addDaggerSerif(path, 40, h, s, 'top');
        this.addDaggerSerif(path, adv - 40 - s, h, s, 'top');
        break;
      }
      case 'z': {
        adv = 440;
        path.moveTo(40, h - s);
        path.lineTo(adv - 40, h - s);
        path.lineTo(adv - 40, h);
        path.lineTo(40, h);
        path.close();

        path.moveTo(adv - 40 - s, h - s);
        path.lineTo(40, s);
        path.lineTo(40 + s, s);
        path.lineTo(adv - 40, h - s);
        path.close();

        path.moveTo(40, 0);
        path.lineTo(adv - 40, 0);
        path.lineTo(adv - 40, s);
        path.lineTo(40, s);
        path.close();
        break;
      }
      default: {
        adv = 480;
        path.moveTo(50, 0);
        path.lineTo(50 + s, 0);
        path.lineTo(50 + s, h);
        path.lineTo(50, h);
        path.close();
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
   * Synthesizes vector contour paths for Numbers 0-9.
   */
  private createNumberGlyph(char: string, unicode: number): Glyph {
    const path = new Path();
    const s = this.stem;
    const h = this.capH;
    let adv = 560;

    switch (char) {
      case '0': {
        adv = 560;
        path.moveTo(adv / 2, 0);
        path.curveTo(40, 0, 40, h, adv / 2, h);
        path.curveTo(adv - 40, h, adv - 40, 0, adv / 2, 0);
        path.close();

        path.moveTo(adv / 2, s);
        path.curveTo(adv - 40 - s, s, adv - 40 - s, h - s, adv / 2, h - s);
        path.curveTo(40 + s, h - s, 40 + s, s, adv / 2, s);
        path.close();
        break;
      }
      case '1': {
        adv = 380;
        const mid = adv / 2;
        path.moveTo(mid - s / 2, 0);
        path.lineTo(mid + s / 2, 0);
        path.lineTo(mid + s / 2, h);
        path.lineTo(mid - s / 2, h);
        path.close();

        path.moveTo(mid - s / 2, h - s);
        path.lineTo(mid - s * 2, h - s * 1.5);
        path.lineTo(mid - s * 2, h);
        path.lineTo(mid - s / 2, h);
        path.close();

        this.addDaggerSerif(path, mid - s / 2, 0, s, 'bottom');
        break;
      }
      case '2': {
        adv = 540;
        path.moveTo(60, h * 0.7);
        path.curveTo(60, h, adv - 60, h, adv - 60, h * 0.7);
        path.lineTo(60, s);
        path.lineTo(adv - 60, s);
        path.lineTo(adv - 60, 0);
        path.lineTo(60, 0);
        path.lineTo(adv - 60 - s, h * 0.65);
        path.curveTo(adv - 60 - s, h - s, 60 + s, h - s, 60 + s, h * 0.7);
        path.close();
        break;
      }
      case '3': {
        adv = 540;
        path.moveTo(60, h - s);
        path.lineTo(adv - 60, h - s);
        path.lineTo(adv - 60, h);
        path.lineTo(60, h);
        path.close();

        path.moveTo(adv - 60 - s, h - s);
        path.lineTo(adv / 2 - s / 2, h * 0.52);
        path.lineTo(adv / 2 + s / 2, h * 0.52);
        path.lineTo(adv - 60, h - s);
        path.close();

        path.moveTo(adv / 2 - s / 2, h * 0.52);
        path.curveTo(adv + 10, h * 0.52, adv + 10, 0, 60, 0);
        path.lineTo(60, s);
        path.curveTo(adv - 60 - s, s, adv - 60 - s, h * 0.52 - s, adv / 2 - s / 2, h * 0.52 - s);
        path.close();
        break;
      }
      case '4': {
        adv = 560;
        // Main vertical stem
        path.moveTo(adv - 120 - s, 0);
        path.lineTo(adv - 120, 0);
        path.lineTo(adv - 120, h);
        path.lineTo(adv - 120 - s, h);
        path.close();

        // Diagonal leg
        path.moveTo(adv - 120 - s, h);
        path.lineTo(50, h * 0.35);
        path.lineTo(50, h * 0.35 - s);
        path.lineTo(adv - 120 - s, h * 0.35 - s);
        path.close();

        // Horizontal crossbar
        path.moveTo(40, h * 0.35 - s);
        path.lineTo(adv - 40, h * 0.35 - s);
        path.lineTo(adv - 40, h * 0.35);
        path.lineTo(40, h * 0.35);
        path.close();

        this.addDaggerSerif(path, adv - 120 - s, 0, s, 'bottom');
        break;
      }
      case '5': {
        adv = 540;
        path.moveTo(60, h - s);
        path.lineTo(adv - 60, h - s);
        path.lineTo(adv - 60, h);
        path.lineTo(60, h);
        path.close();

        path.moveTo(60, h * 0.5);
        path.lineTo(60 + s, h * 0.5);
        path.lineTo(60 + s, h);
        path.lineTo(60, h);
        path.close();

        path.moveTo(60 + s, h * 0.55);
        path.curveTo(adv + 20, h * 0.55, adv + 20, 0, 60, 0);
        path.lineTo(60, s);
        path.curveTo(adv - 60 - s, s, adv - 60 - s, h * 0.55 - s, 60 + s, h * 0.55 - s);
        path.close();
        break;
      }
      case '6': {
        adv = 540;
        path.moveTo(adv / 2, 0);
        path.curveTo(40, 0, 40, h * 0.65, adv / 2, h * 0.65);
        path.curveTo(adv - 40, h * 0.65, adv - 40, 0, adv / 2, 0);
        path.close();

        path.moveTo(adv / 2, s);
        path.curveTo(adv - 40 - s, s, adv - 40 - s, h * 0.65 - s, adv / 2, h * 0.65 - s);
        path.curveTo(40 + s, h * 0.65 - s, 40 + s, s, adv / 2, s);
        path.close();

        path.moveTo(40, h * 0.35);
        path.curveTo(40, h, adv - 60, h, adv - 60, h - s);
        path.lineTo(adv - 60 - s, h - s);
        path.curveTo(adv - 60 - s, h - s, 40 + s, h - s, 40 + s, h * 0.35);
        path.close();
        break;
      }
      case '7': {
        adv = 540;
        path.moveTo(50, h - s);
        path.lineTo(adv - 50, h - s);
        path.lineTo(adv - 50, h);
        path.lineTo(50, h);
        path.close();

        path.moveTo(adv - 50 - s, h - s);
        path.lineTo(120, 0);
        path.lineTo(120 + s, 0);
        path.lineTo(adv - 50, h - s);
        path.close();

        this.addDaggerSerif(path, 120, 0, s, 'bottom');
        break;
      }
      case '8': {
        adv = 540;
        // Upper loop
        path.moveTo(adv / 2, h * 0.5);
        path.curveTo(60, h * 0.5, 60, h, adv / 2, h);
        path.curveTo(adv - 60, h, adv - 60, h * 0.5, adv / 2, h * 0.5);
        path.close();
        path.moveTo(adv / 2, h * 0.5 + s / 2);
        path.curveTo(adv - 60 - s, h * 0.5 + s / 2, adv - 60 - s, h - s, adv / 2, h - s);
        path.curveTo(60 + s, h - s, 60 + s, h * 0.5 + s / 2, adv / 2, h * 0.5 + s / 2);
        path.close();

        // Lower loop
        path.moveTo(adv / 2, 0);
        path.curveTo(50, 0, 50, h * 0.52, adv / 2, h * 0.52);
        path.curveTo(adv - 50, h * 0.52, adv - 50, 0, adv / 2, 0);
        path.close();
        path.moveTo(adv / 2, s);
        path.curveTo(adv - 50 - s, s, adv - 50 - s, h * 0.52 - s / 2, adv / 2, h * 0.52 - s / 2);
        path.curveTo(50 + s, h * 0.52 - s / 2, 50 + s, s, adv / 2, s);
        path.close();
        break;
      }
      case '9': {
        adv = 540;
        path.moveTo(adv / 2, h * 0.35);
        path.curveTo(40, h * 0.35, 40, h, adv / 2, h);
        path.curveTo(adv - 40, h, adv - 40, h * 0.35, adv / 2, h * 0.35);
        path.close();

        path.moveTo(adv / 2, h * 0.35 + s);
        path.curveTo(adv - 40 - s, h * 0.35 + s, adv - 40 - s, h - s, adv / 2, h - s);
        path.curveTo(40 + s, h - s, 40 + s, h * 0.35 + s, adv / 2, h * 0.35 + s);
        path.close();

        path.moveTo(adv - 40 - s, h * 0.65);
        path.curveTo(adv - 40 - s, 0, 60, 0, 60, s);
        path.lineTo(60 + s, s);
        path.curveTo(60 + s, s * 1.5, adv - 40, s * 1.5, adv - 40, h * 0.65);
        path.close();
        break;
      }
      default: {
        adv = 540;
        path.moveTo(60, 0);
        path.lineTo(60 + s, 0);
        path.lineTo(60 + s, h);
        path.lineTo(60, h);
        path.close();
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
   * Synthesizes vector contour paths for Punctuation marks.
   */
  private createPunctuationGlyph(char: string, unicode: number): Glyph {
    const path = new Path();
    const s = this.stem;
    const h = this.capH;
    let adv = 320;

    switch (char) {
      case '.': {
        adv = 260;
        path.moveTo(100, 0);
        path.lineTo(100 + s, 0);
        path.lineTo(100 + s, s);
        path.lineTo(100, s);
        path.close();
        break;
      }
      case ',': {
        adv = 260;
        path.moveTo(100, 0);
        path.lineTo(100 + s, 0);
        path.lineTo(100, -s * 1.5);
        path.lineTo(100 - s * 0.5, -s * 1.5);
        path.close();
        break;
      }
      case '!': {
        adv = 300;
        const mid = adv / 2;
        path.moveTo(mid - s / 2, h * 0.25);
        path.lineTo(mid + s / 2, h * 0.25);
        path.lineTo(mid + s * 0.8, h);
        path.lineTo(mid - s * 0.8, h);
        path.close();

        path.moveTo(mid - s / 2, 0);
        path.lineTo(mid + s / 2, 0);
        path.lineTo(mid + s / 2, s);
        path.lineTo(mid - s / 2, s);
        path.close();
        break;
      }
      case '?': {
        adv = 480;
        path.moveTo(60, h * 0.7);
        path.curveTo(60, h, adv - 60, h, adv - 60, h * 0.65);
        path.curveTo(adv - 60, h * 0.4, adv / 2 + s / 2, h * 0.4, adv / 2 + s / 2, h * 0.25);
        path.lineTo(adv / 2 - s / 2, h * 0.25);
        path.curveTo(adv / 2 - s / 2, h * 0.45, adv - 60 - s, h * 0.45, adv - 60 - s, h * 0.65);
        path.curveTo(adv - 60 - s, h - s, 60 + s, h - s, 60 + s, h * 0.7);
        path.close();

        const mid = adv / 2;
        path.moveTo(mid - s / 2, 0);
        path.lineTo(mid + s / 2, 0);
        path.lineTo(mid + s / 2, s);
        path.lineTo(mid - s / 2, s);
        path.close();
        break;
      }
      case ':': {
        adv = 260;
        path.moveTo(100, 0);
        path.lineTo(100 + s, 0);
        path.lineTo(100 + s, s);
        path.lineTo(100, s);
        path.close();

        path.moveTo(100, this.xH - s);
        path.lineTo(100 + s, this.xH - s);
        path.lineTo(100 + s, this.xH);
        path.lineTo(100, this.xH);
        path.close();
        break;
      }
      case ';': {
        adv = 260;
        path.moveTo(100, 0);
        path.lineTo(100 + s, 0);
        path.lineTo(100, -s * 1.5);
        path.lineTo(100 - s * 0.5, -s * 1.5);
        path.close();

        path.moveTo(100, this.xH - s);
        path.lineTo(100 + s, this.xH - s);
        path.lineTo(100 + s, this.xH);
        path.lineTo(100, this.xH);
        path.close();
        break;
      }
      case '-': {
        adv = 360;
        path.moveTo(50, this.xH * 0.45);
        path.lineTo(adv - 50, this.xH * 0.45);
        path.lineTo(adv - 50, this.xH * 0.45 + s * 0.8);
        path.lineTo(50, this.xH * 0.45 + s * 0.8);
        path.close();
        break;
      }
      case '_': {
        adv = 480;
        path.moveTo(20, -100);
        path.lineTo(adv - 20, -100);
        path.lineTo(adv - 20, -100 + s * 0.8);
        path.lineTo(20, -100 + s * 0.8);
        path.close();
        break;
      }
      case '+': {
        adv = 480;
        const midX = adv / 2;
        const midY = this.xH * 0.5;
        path.moveTo(midX - s / 2, midY - 140);
        path.lineTo(midX + s / 2, midY - 140);
        path.lineTo(midX + s / 2, midY + 140);
        path.lineTo(midX - s / 2, midY + 140);
        path.close();

        path.moveTo(midX - 140, midY - s / 2);
        path.lineTo(midX + 140, midY - s / 2);
        path.lineTo(midX + 140, midY + s / 2);
        path.lineTo(midX - 140, midY + s / 2);
        path.close();
        break;
      }
      case '=': {
        adv = 440;
        const midY = this.xH * 0.5;
        path.moveTo(50, midY + 50);
        path.lineTo(adv - 50, midY + 50);
        path.lineTo(adv - 50, midY + 50 + s * 0.8);
        path.lineTo(50, midY + 50 + s * 0.8);
        path.close();

        path.moveTo(50, midY - 50);
        path.lineTo(adv - 50, midY - 50);
        path.lineTo(adv - 50, midY - 50 + s * 0.8);
        path.lineTo(50, midY - 50 + s * 0.8);
        path.close();
        break;
      }
      case '/': {
        adv = 380;
        path.moveTo(60, 0);
        path.lineTo(adv - 60, h);
        path.lineTo(adv - 60 - s, h);
        path.lineTo(60 - s, 0);
        path.close();
        break;
      }
      case '(': {
        adv = 300;
        path.moveTo(adv - 60, h);
        path.curveTo(40, h, 40, 0, adv - 60, 0);
        path.lineTo(adv - 60 + s, 0);
        path.curveTo(40 + s, 0, 40 + s, h, adv - 60 + s, h);
        path.close();
        break;
      }
      case ')': {
        adv = 300;
        path.moveTo(60, h);
        path.curveTo(adv - 40, h, adv - 40, 0, 60, 0);
        path.lineTo(60 - s, 0);
        path.curveTo(adv - 40 - s, 0, adv - 40 - s, h, 60 - s, h);
        path.close();
        break;
      }
      case "'": {
        adv = 220;
        path.moveTo(100, h - 140);
        path.lineTo(100 + s * 0.8, h - 140);
        path.lineTo(100, h);
        path.lineTo(100 - s * 0.8, h);
        path.close();
        break;
      }
      case '"': {
        adv = 340;
        path.moveTo(90, h - 140);
        path.lineTo(90 + s * 0.8, h - 140);
        path.lineTo(90, h);
        path.lineTo(90 - s * 0.8, h);
        path.close();

        path.moveTo(210, h - 140);
        path.lineTo(210 + s * 0.8, h - 140);
        path.lineTo(210, h);
        path.lineTo(210 - s * 0.8, h);
        path.close();
        break;
      }
      default: {
        path.moveTo(80, 0);
        path.lineTo(80 + s, 0);
        path.lineTo(80 + s, h);
        path.lineTo(80, h);
        path.close();
        break;
      }
    }

    return new Glyph({
      name: `punct_${unicode}`,
      unicode,
      advanceWidth: adv,
      path,
    });
  }
}
