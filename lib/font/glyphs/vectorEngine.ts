import { Path, Glyph } from 'opentype.js';
import type { FontSpecification } from '../specification/types';

export class GlyphVectorEngine {
  private spec: FontSpecification;
  private stem: number;
  private capH: number;
  private xH: number;
  private asc: number;
  private desc: number;

  constructor(spec: FontSpecification) {
    this.spec = spec;
    this.stem = spec.stemWidth;
    this.capH = spec.capHeight;
    this.xH = spec.xHeight;
    this.asc = spec.ascender;
    this.desc = spec.descender;
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
        advanceWidth: 260,
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

    // Outer rectangle
    path.moveTo(50, 0);
    path.lineTo(w - 50, 0);
    path.lineTo(w - 50, h);
    path.lineTo(50, h);
    path.close();

    // Inner cutout
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
   * Synthesizes vector contour paths for Uppercase letters A-Z.
   */
  private createUppercaseGlyph(char: string, unicode: number): Glyph {
    const path = new Path();
    const s = this.stem;
    const h = this.capH;
    let adv = 600;

    switch (char) {
      case 'A': {
        adv = 640;
        const mid = adv / 2;
        path.moveTo(50, 0);
        path.lineTo(mid - s / 2, h);
        path.lineTo(mid + s / 2, h);
        path.lineTo(adv - 50, 0);
        path.lineTo(adv - 50 - s, 0);
        path.lineTo(mid, h - s * 1.5);
        path.lineTo(50 + s, 0);
        path.close();
        // Crossbar
        path.moveTo(120, h * 0.35);
        path.lineTo(adv - 120, h * 0.35);
        path.lineTo(adv - 120, h * 0.35 + s * 0.8);
        path.lineTo(120, h * 0.35 + s * 0.8);
        path.close();
        break;
      }
      case 'B': {
        adv = 620;
        path.moveTo(60, 0);
        path.lineTo(60, h);
        path.lineTo(adv - 120, h);
        path.curveTo(adv, h, adv, h * 0.55, adv - 120, h * 0.52);
        path.curveTo(adv + 20, h * 0.5, adv + 20, 0, adv - 120, 0);
        path.close();
        // Counter cutouts
        path.moveTo(60 + s, s);
        path.lineTo(adv - 140, s);
        path.lineTo(adv - 140, h * 0.45);
        path.lineTo(60 + s, h * 0.45);
        path.close();
        path.moveTo(60 + s, h * 0.55);
        path.lineTo(adv - 140, h * 0.55);
        path.lineTo(adv - 140, h - s);
        path.lineTo(60 + s, h - s);
        path.close();
        break;
      }
      case 'C': {
        adv = 640;
        path.moveTo(adv - 80, h * 0.8);
        path.curveTo(80, h + 20, 80, -20, adv - 80, h * 0.2);
        path.lineTo(adv - 80, h * 0.2 + s);
        path.curveTo(80 + s, 0, 80 + s, h, adv - 80, h * 0.8 - s);
        path.close();
        break;
      }
      case 'H':
      case 'I':
      case 'T':
      case 'L':
      case 'E':
      case 'F': {
        adv = char === 'I' ? 320 : 600;
        path.moveTo(60, 0);
        path.lineTo(60 + s, 0);
        path.lineTo(60 + s, h);
        path.lineTo(60, h);
        path.close();
        if (char === 'H') {
          path.moveTo(adv - 60 - s, 0);
          path.lineTo(adv - 60, 0);
          path.lineTo(adv - 60, h);
          path.lineTo(adv - 60 - s, h);
          path.close();
          // Crossbar
          path.moveTo(60, h * 0.48);
          path.lineTo(adv - 60, h * 0.48);
          path.lineTo(adv - 60, h * 0.48 + s);
          path.lineTo(60, h * 0.48 + s);
          path.close();
        }
        if (char === 'T') {
          adv = 560;
          path.moveTo(40, h - s);
          path.lineTo(adv - 40, h - s);
          path.lineTo(adv - 40, h);
          path.lineTo(40, h);
          path.close();
          path.moveTo(adv / 2 - s / 2, 0);
          path.lineTo(adv / 2 + s / 2, 0);
          path.lineTo(adv / 2 + s / 2, h);
          path.lineTo(adv / 2 - s / 2, h);
          path.close();
        }
        if (char === 'L') {
          path.moveTo(60, 0);
          path.lineTo(adv - 80, 0);
          path.lineTo(adv - 80, s);
          path.lineTo(60, s);
          path.close();
        }
        if (char === 'E' || char === 'F') {
          path.moveTo(60, h - s);
          path.lineTo(adv - 80, h - s);
          path.lineTo(adv - 80, h);
          path.lineTo(60, h);
          path.close();
          path.moveTo(60, h * 0.5);
          path.lineTo(adv - 120, h * 0.5);
          path.lineTo(adv - 120, h * 0.5 + s);
          path.lineTo(60, h * 0.5 + s);
          path.close();
          if (char === 'E') {
            path.moveTo(60, 0);
            path.lineTo(adv - 80, 0);
            path.lineTo(adv - 80, s);
            path.lineTo(60, s);
            path.close();
          }
        }
        break;
      }
      case 'O': {
        adv = 680;
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
      default: {
        // Geometric universal capital stem fallback
        adv = 600;
        path.moveTo(60, 0);
        path.lineTo(60 + s, 0);
        path.lineTo(60 + s, h);
        path.lineTo(60, h);
        path.close();
        path.moveTo(60, h - s);
        path.lineTo(adv - 60, h - s);
        path.lineTo(adv - 60, h);
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
    const s = this.stem * 0.85;
    const h = this.xH;
    let adv = 520;

    switch (char) {
      case 'a':
      case 'o':
      case 'e': {
        adv = 540;
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
      case 'i':
      case 'l': {
        adv = 280;
        const stemH = char === 'l' ? this.asc : h;
        path.moveTo(50, 0);
        path.lineTo(50 + s, 0);
        path.lineTo(50 + s, stemH);
        path.lineTo(50, stemH);
        path.close();
        if (char === 'i') {
          // Dot over i
          path.moveTo(50, h + 100);
          path.lineTo(50 + s, h + 100);
          path.lineTo(50 + s, h + 100 + s);
          path.lineTo(50, h + 100 + s);
          path.close();
        }
        break;
      }
      default: {
        // Universal lowercase stem fallback
        adv = 480;
        path.moveTo(50, 0);
        path.lineTo(50 + s, 0);
        path.lineTo(50 + s, h);
        path.lineTo(50, h);
        path.close();
        path.moveTo(50, h - s);
        path.lineTo(adv - 50, h - s);
        path.lineTo(adv - 50, h);
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
    const adv = 560;

    if (char === '1') {
      path.moveTo(adv / 2 - s / 2, 0);
      path.lineTo(adv / 2 + s / 2, 0);
      path.lineTo(adv / 2 + s / 2, h);
      path.lineTo(adv / 2 - s / 2, h);
      path.close();
    } else if (char === '0') {
      path.moveTo(adv / 2, 0);
      path.curveTo(40, 0, 40, h, adv / 2, h);
      path.curveTo(adv - 40, h, adv - 40, 0, adv / 2, 0);
      path.close();
      path.moveTo(adv / 2, s);
      path.curveTo(adv - 40 - s, s, adv - 40 - s, h - s, adv / 2, h - s);
      path.curveTo(40 + s, h - s, 40 + s, s, adv / 2, s);
      path.close();
    } else {
      path.moveTo(60, 0);
      path.lineTo(60 + s, 0);
      path.lineTo(60 + s, h);
      path.lineTo(60, h);
      path.close();
      path.moveTo(60, h - s);
      path.lineTo(adv - 60, h - s);
      path.lineTo(adv - 60, h);
      path.lineTo(60, h);
      path.close();
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
    const adv = 320;

    if (char === '.') {
      path.moveTo(100, 0);
      path.lineTo(100 + s, 0);
      path.lineTo(100 + s, s);
      path.lineTo(100, s);
      path.close();
    } else if (char === '-') {
      path.moveTo(40, this.xH * 0.4);
      path.lineTo(adv - 40, this.xH * 0.4);
      path.lineTo(adv - 40, this.xH * 0.4 + s * 0.8);
      path.lineTo(40, this.xH * 0.4 + s * 0.8);
      path.close();
    } else {
      path.moveTo(80, 0);
      path.lineTo(80 + s, 0);
      path.lineTo(80 + s, this.capH);
      path.lineTo(80, this.capH);
      path.close();
    }

    return new Glyph({
      name: `punct_${unicode}`,
      unicode,
      advanceWidth: adv,
      path,
    });
  }
}
