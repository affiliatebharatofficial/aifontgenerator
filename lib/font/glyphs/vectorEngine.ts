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
  | 'monospace'
  | 'devanagari';

export class GlyphVectorEngine {
  private spec: FontSpecification;
  private genre: TypographicGenre;
  private stem: number;
  private hStem: number;
  private capH: number;
  private xH: number;
  private asc: number;
  private desc: number;
  private slantAngle: number;
  private widthScale: number;
  private isDevanagari: boolean;

  constructor(spec: FontSpecification) {
    this.spec = spec;

    const p = (spec.prompt || '').toLowerCase();
    const c = (spec.category || '').toLowerCase();
    const s = (spec.style || '').toLowerCase();
    const d = (spec.designDescription || '').toLowerCase();
    const n = (spec.fontName || '').toLowerCase();
    const textAll = `${p} ${c} ${s} ${d} ${n}`;

    // Detect Hindi / Devanagari
    this.isDevanagari =
      spec.characterSet.devanagari === true ||
      c === 'devanagari' ||
      textAll.includes('devanagari') ||
      textAll.includes('hindi') ||
      textAll.includes('sanskrit') ||
      textAll.includes('हिंदी') ||
      textAll.includes('देवनागरी');

    // 1. Determine Typographic Genre accurately
    if (this.isDevanagari) {
      this.genre = 'devanagari';
    } else if (textAll.includes('pixel') || textAll.includes('8bit') || c === 'pixel') {
      this.genre = 'pixel';
    } else if (textAll.includes('gothic') || textAll.includes('blackletter') || c === 'blackletter') {
      this.genre = 'gothic';
    } else if (textAll.includes('bubble') || textAll.includes('rounded') || textAll.includes('cute')) {
      this.genre = 'bubble';
    } else if (textAll.includes('futuristic') || textAll.includes('gaming') || textAll.includes('cyberpunk') || textAll.includes('tech')) {
      this.genre = 'futuristic';
    } else if (textAll.includes('handwritten') || textAll.includes('script') || textAll.includes('cursive') || c === 'handwritten' || c === 'script') {
      this.genre = 'handwritten';
    } else if (textAll.includes('bold') || textAll.includes('heavy') || textAll.includes('poster') || c === 'display') {
      this.genre = 'bold-display';
    } else if (textAll.includes('mono') || textAll.includes('code') || c === 'monospace') {
      this.genre = 'monospace';
    } else if ((c.includes('serif') && !c.includes('sans')) || (s.includes('serif') && !s.includes('sans')) || (p.includes('serif') && !p.includes('sans')) || textAll.includes('luxury') || textAll.includes('editorial')) {
      this.genre = 'serif';
    } else {
      this.genre = 'sans-serif';
    }

    // 2. Metrics & Stems
    this.stem = Math.max(30, Math.min(200, spec.stemWidth || 75));
    const contrastRatio = this.genre === 'serif' ? 0.45 : this.genre === 'bold-display' ? 0.65 : 0.85;
    this.hStem = Math.max(16, Math.round(this.stem * contrastRatio));

    this.capH = spec.capHeight || 700;
    this.xH = spec.xHeight || 500;
    this.asc = spec.ascender || 800;
    this.desc = spec.descender || -200;

    // 3. Width Scale
    const w = (spec.width || '').toLowerCase();
    if (w.includes('condensed') || textAll.includes('condensed') || textAll.includes('narrow')) {
      this.widthScale = 0.82;
    } else if (w.includes('expanded') || textAll.includes('expanded') || textAll.includes('wide')) {
      this.widthScale = 1.25;
    } else {
      this.widthScale = 1.0;
    }

    // 4. Slant Angle
    const st = (spec.style || '').toLowerCase();
    if (st.includes('italic') || st.includes('oblique') || textAll.includes('italic') || textAll.includes('slanted')) {
      this.slantAngle = 0.22;
    } else if (this.genre === 'handwritten') {
      this.slantAngle = 0.14;
    } else {
      this.slantAngle = 0;
    }
  }

  public generateGlyphs(): Glyph[] {
    const glyphs: Glyph[] = [];

    // 1. Mandatory .notdef glyph (Unicode 0)
    glyphs.push(this.createNotDefGlyph());

    // 2. Space glyph (Unicode 32)
    const spaceWidth = this.genre === 'monospace' ? 600 : Math.round(280 * this.widthScale);
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

    // 7. Devanagari Hindi Characters
    if (this.isDevanagari || this.spec.characterSet.devanagari) {
      this.generateDevanagariGlyphs(glyphs);
    }

    return glyphs;
  }

  private pt(x: number, y: number): { x: number; y: number } {
    if (this.slantAngle === 0) return { x: Math.round(x), y: Math.round(y) };
    return {
      x: Math.round(x + y * this.slantAngle),
      y: Math.round(y),
    };
  }

  private addRect(path: Path, x: number, y: number, w: number, h: number) {
    const p1 = this.pt(x, y);
    const p2 = this.pt(x + w, y);
    const p3 = this.pt(x + w, y + h);
    const p4 = this.pt(x, y + h);

    path.moveTo(p1.x, p1.y);
    path.lineTo(p2.x, p2.y);
    path.lineTo(p3.x, p3.y);
    path.lineTo(p4.x, p4.y);
    path.close();
  }

  private addSerif(path: Path, x: number, y: number, stemW: number, position: 'top' | 'bottom') {
    if (this.genre !== 'serif') return;
    const overhang = Math.max(14, Math.round(stemW * 0.4));
    const h = Math.max(8, Math.round(stemW * 0.16));

    if (position === 'top') {
      const p1 = this.pt(x - overhang, y);
      const p2 = this.pt(x + stemW + overhang, y);
      const p3 = this.pt(x + stemW + overhang, y - h);
      const p4 = this.pt(x - overhang, y - h);
      path.moveTo(p1.x, p1.y);
      path.lineTo(p2.x, p2.y);
      path.lineTo(p3.x, p3.y);
      path.lineTo(p4.x, p4.y);
      path.close();
    } else {
      const p1 = this.pt(x - overhang, y);
      const p2 = this.pt(x + stemW + overhang, y);
      const p3 = this.pt(x + stemW + overhang, y + h);
      const p4 = this.pt(x - overhang, y + h);
      path.moveTo(p1.x, p1.y);
      path.lineTo(p2.x, p2.y);
      path.lineTo(p3.x, p3.y);
      path.lineTo(p4.x, p4.y);
      path.close();
    }
  }

  /**
   * Generates a closed ring contour (like O, o, 0) with outer and inner loops.
   */
  private addRing(path: Path, x: number, y: number, w: number, h: number, sX: number, sY: number) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rx = w / 2;
    const ry = h / 2;
    const irx = Math.max(4, rx - sX);
    const iry = Math.max(4, ry - sY);

    const kx = 0.5522847498 * rx;
    const ky = 0.5522847498 * ry;

    // Outer (Clockwise)
    path.moveTo(this.pt(cx, cy + ry).x, this.pt(cx, cy + ry).y);
    path.bezierCurveTo(
      this.pt(cx + kx, cy + ry).x, this.pt(cx + kx, cy + ry).y,
      this.pt(cx + rx, cy + ky).x, this.pt(cx + rx, cy + ky).y,
      this.pt(cx + rx, cy).x, this.pt(cx + rx, cy).y
    );
    path.bezierCurveTo(
      this.pt(cx + rx, cy - ky).x, this.pt(cx + rx, cy - ky).y,
      this.pt(cx + kx, cy - ry).x, this.pt(cx + kx, cy - ry).y,
      this.pt(cx, cy - ry).x, this.pt(cx, cy - ry).y
    );
    path.bezierCurveTo(
      this.pt(cx - kx, cy - ry).x, this.pt(cx - kx, cy - ry).y,
      this.pt(cx - rx, cy - ky).x, this.pt(cx - rx, cy - ky).y,
      this.pt(cx - rx, cy).x, this.pt(cx - rx, cy).y
    );
    path.bezierCurveTo(
      this.pt(cx - rx, cy + ky).x, this.pt(cx - rx, cy + ky).y,
      this.pt(cx - kx, cy + ry).x, this.pt(cx - kx, cy + ry).y,
      this.pt(cx, cy + ry).x, this.pt(cx, cy + ry).y
    );
    path.close();

    // Inner Counter (Counter-Clockwise for proper OpenType hole cutout)
    const ikx = 0.5522847498 * irx;
    const iky = 0.5522847498 * iry;

    path.moveTo(this.pt(cx, cy + iry).x, this.pt(cx, cy + iry).y);
    path.bezierCurveTo(
      this.pt(cx - ikx, cy + iry).x, this.pt(cx - ikx, cy + iry).y,
      this.pt(cx - irx, cy + iky).x, this.pt(cx - irx, cy + iky).y,
      this.pt(cx - irx, cy).x, this.pt(cx - irx, cy).y
    );
    path.bezierCurveTo(
      this.pt(cx - irx, cy - iky).x, this.pt(cx - irx, cy - iky).y,
      this.pt(cx - ikx, cy - iry).x, this.pt(cx - ikx, cy - iry).y,
      this.pt(cx, cy - iry).x, this.pt(cx, cy - iry).y
    );
    path.bezierCurveTo(
      this.pt(cx + ikx, cy - iry).x, this.pt(cx + ikx, cy - iry).y,
      this.pt(cx + irx, cy - iky).x, this.pt(cx + irx, cy - iky).y,
      this.pt(cx + irx, cy).x, this.pt(cx + irx, cy).y
    );
    path.bezierCurveTo(
      this.pt(cx + irx, cy + iky).x, this.pt(cx + irx, cy + iky).y,
      this.pt(cx + ikx, cy + iry).x, this.pt(cx + ikx, cy + iry).y,
      this.pt(cx, cy + iry).x, this.pt(cx, cy + iry).y
    );
    path.close();
  }

  /**
   * Generates a C-shaped open curve (like C, c, G).
   */
  private addCCurve(path: Path, x: number, y: number, w: number, h: number, sX: number, sY: number) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rx = w / 2;
    const ry = h / 2;
    const irx = Math.max(4, rx - sX);
    const iry = Math.max(4, ry - sY);

    const topX = x + w - 10;
    const topY = y + h - 20;
    const botX = x + w - 10;
    const botY = y + 20;

    // Outer curve from top-right to bottom-right
    path.moveTo(this.pt(topX, topY).x, this.pt(topX, topY).y);
    path.bezierCurveTo(
      this.pt(cx + rx * 0.3, y + h).x, this.pt(cx + rx * 0.3, y + h).y,
      this.pt(x, cy + ry * 0.7).x, this.pt(x, cy + ry * 0.7).y,
      this.pt(x, cy).x, this.pt(x, cy).y
    );
    path.bezierCurveTo(
      this.pt(x, cy - ry * 0.7).x, this.pt(x, cy - ry * 0.7).y,
      this.pt(cx + rx * 0.3, y).x, this.pt(cx + rx * 0.3, y).y,
      this.pt(botX, botY).x, this.pt(botX, botY).y
    );
    // Flat bottom terminal
    path.lineTo(this.pt(botX - sX, botY + sY * 0.5).x, this.pt(botX - sX, botY + sY * 0.5).y);
    // Inner curve from bottom to top
    path.bezierCurveTo(
      this.pt(cx, y + sY).x, this.pt(cx, y + sY).y,
      this.pt(x + sX, cy - iry * 0.5).x, this.pt(x + sX, cy - iry * 0.5).y,
      this.pt(x + sX, cy).x, this.pt(x + sX, cy).y
    );
    path.bezierCurveTo(
      this.pt(x + sX, cy + iry * 0.5).x, this.pt(x + sX, cy + iry * 0.5).y,
      this.pt(cx, y + h - sY).x, this.pt(cx, y + h - sY).y,
      this.pt(topX - sX, topY - sY * 0.5).x, this.pt(topX - sX, topY - sY * 0.5).y
    );
    path.close();
  }

  /**
   * Generates a lowercase 'e' contour: Top closed dome + middle horizontal bar + bottom open curve.
   */
  private addECurve(path: Path, x: number, y: number, w: number, h: number, sX: number, sY: number) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rx = w / 2;
    const ry = h / 2;
    const midY = y + h * 0.52;

    // 1. Outer contour
    path.moveTo(this.pt(x + w - 10, midY).x, this.pt(x + w - 10, midY).y);
    path.bezierCurveTo(
      this.pt(x + w, y + h).x, this.pt(x + w, y + h).y,
      this.pt(x, y + h).x, this.pt(x, y + h).y,
      this.pt(x, cy).x, this.pt(x, cy).y
    );
    path.bezierCurveTo(
      this.pt(x, y).x, this.pt(x, y).y,
      this.pt(x + w - 10, y).x, this.pt(x + w - 10, y).y,
      this.pt(x + w - 10, y + 40).x, this.pt(x + w - 10, y + 40).y
    );
    // Lower terminal inner edge
    path.lineTo(this.pt(x + w - 10 - sX, y + 40 + sY * 0.4).x, this.pt(x + w - 10 - sX, y + 40 + sY * 0.4).y);
    path.bezierCurveTo(
      this.pt(cx, y + sY).x, this.pt(cx, y + sY).y,
      this.pt(x + sX, y + sY).x, this.pt(x + sX, y + sY).y,
      this.pt(x + sX, midY - sY).x, this.pt(x + sX, midY - sY).y
    );
    path.lineTo(this.pt(x + w - 10, midY - sY).x, this.pt(x + w - 10, midY - sY).y);
    path.close();

    // 2. Upper eye counter (Counter-Clockwise)
    path.moveTo(this.pt(x + sX, midY).x, this.pt(x + sX, midY).y);
    path.lineTo(this.pt(x + w - sX - 5, midY).x, this.pt(x + w - sX - 5, midY).y);
    path.bezierCurveTo(
      this.pt(x + w - sX - 5, y + h - sY).x, this.pt(x + w - sX - 5, y + h - sY).y,
      this.pt(x + sX, y + h - sY).x, this.pt(x + sX, y + h - sY).y,
      this.pt(x + sX, midY).x, this.pt(x + sX, midY).y
    );
    path.close();
  }

  /**
   * Generates a lowercase 'a' single-story contour (Round bowl with right stem).
   */
  private addACurve(path: Path, x: number, y: number, w: number, h: number, sX: number, sY: number) {
    // Right vertical stem
    this.addRect(path, x + w - sX, y, sX, h);
    // Left bowl
    const bowlW = w - sX;
    this.addRing(path, x, y, bowlW, h, sX, sY);
  }

  /**
   * Generates natural arch stems for n, m, h, u.
   */
  private addArchStem(path: Path, x: number, y: number, w: number, h: number, sX: number, sY: number, hasLeftStem: boolean = true) {
    if (hasLeftStem) {
      this.addRect(path, x, y, sX, h);
    }
    // Top connecting shoulder and right stem
    const p1 = this.pt(x, y + h - sY);
    const p2 = this.pt(x + w / 2, y + h);
    const p3 = this.pt(x + w, y + h);
    const p4 = this.pt(x + w, y);
    const p5 = this.pt(x + w - sX, y);
    const p6 = this.pt(x + w - sX, y + h - sY);
    const p7 = this.pt(x + sX, y + h - sY);

    path.moveTo(p1.x, p1.y);
    path.bezierCurveTo(
      p1.x, p2.y,
      p2.x, p3.y,
      p3.x, p3.y
    );
    path.lineTo(p4.x, p4.y);
    path.lineTo(p5.x, p5.y);
    path.lineTo(p6.x, p6.y);
    path.bezierCurveTo(
      p6.x, p7.y,
      p7.x, p7.y,
      p7.x, p7.y
    );
    path.close();
  }

  /**
   * Generates lowercase u (inverted arch).
   */
  private addUCurve(path: Path, x: number, y: number, w: number, h: number, sX: number, sY: number) {
    this.addRect(path, x + w - sX, y, sX, h);
    this.addRect(path, x, y + sY, sX, h - sY);
    this.addRect(path, x, y, w, sY);
  }

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

  private createUppercaseGlyph(char: string, unicode: number): Glyph {
    const path = new Path();
    const s = this.stem;
    const hs = this.hStem;
    const h = this.capH;
    let adv = Math.round((this.genre === 'monospace' ? 600 : 620) * this.widthScale);

    switch (char) {
      case 'A': {
        adv = Math.round(640 * this.widthScale);
        const mid = adv / 2;
        path.moveTo(this.pt(40, 0).x, this.pt(40, 0).y);
        path.lineTo(this.pt(mid, h).x, this.pt(mid, h).y);
        path.lineTo(this.pt(mid + s * 0.6, h).x, this.pt(mid + s * 0.6, h).y);
        path.lineTo(this.pt(adv - 40, 0).x, this.pt(adv - 40, 0).y);
        path.lineTo(this.pt(adv - 40 - s, 0).x, this.pt(adv - 40 - s, 0).y);
        path.lineTo(this.pt(mid, h - s * 1.2).x, this.pt(mid, h - s * 1.2).y);
        path.lineTo(this.pt(40 + s, 0).x, this.pt(40 + s, 0).y);
        path.close();
        this.addRect(path, 110, h * 0.35, adv - 220, hs);
        this.addSerif(path, 40, 0, s, 'bottom');
        this.addSerif(path, adv - 40 - s, 0, s, 'bottom');
        break;
      }

      case 'B': {
        adv = Math.round(600 * this.widthScale);
        this.addRect(path, 60, 0, s, h);
        const loopW = adv - 120;
        this.addRing(path, 60 + s, h * 0.5, loopW, h * 0.5, s, hs);
        this.addRing(path, 60 + s, 0, loopW + 20, h * 0.5, s, hs);
        this.addSerif(path, 60, h, s, 'top');
        this.addSerif(path, 60, 0, s, 'bottom');
        break;
      }

      case 'C': {
        adv = Math.round(620 * this.widthScale);
        this.addCCurve(path, 50, 0, adv - 100, h, s, hs);
        break;
      }

      case 'D': {
        adv = Math.round(620 * this.widthScale);
        this.addRect(path, 60, 0, s, h);
        this.addRing(path, 60, 0, adv - 110, h, s, hs);
        this.addSerif(path, 60, h, s, 'top');
        this.addSerif(path, 60, 0, s, 'bottom');
        break;
      }

      case 'E': {
        adv = Math.round(540 * this.widthScale);
        this.addRect(path, 60, 0, s, h);
        this.addRect(path, 60 + s, h - hs, adv - 110 - s, hs);
        this.addRect(path, 60 + s, h * 0.5 - hs / 2, adv - 140 - s, hs);
        this.addRect(path, 60 + s, 0, adv - 100 - s, hs);
        this.addSerif(path, 60, h, s, 'top');
        this.addSerif(path, 60, 0, s, 'bottom');
        break;
      }

      case 'F': {
        adv = Math.round(520 * this.widthScale);
        this.addRect(path, 60, 0, s, h);
        this.addRect(path, 60 + s, h - hs, adv - 110 - s, hs);
        this.addRect(path, 60 + s, h * 0.5 - hs / 2, adv - 140 - s, hs);
        this.addSerif(path, 60, h, s, 'top');
        this.addSerif(path, 60, 0, s, 'bottom');
        break;
      }

      case 'G': {
        adv = Math.round(640 * this.widthScale);
        this.addCCurve(path, 50, 0, adv - 100, h, s, hs);
        this.addRect(path, adv - 60 - s, 0, s, h * 0.45);
        this.addRect(path, adv / 2, h * 0.45 - hs, adv / 2 - 60, hs);
        break;
      }

      case 'H': {
        adv = Math.round(640 * this.widthScale);
        this.addRect(path, 60, 0, s, h);
        this.addRect(path, adv - 60 - s, 0, s, h);
        this.addRect(path, 60 + s, h * 0.5 - hs / 2, adv - 120 - 2 * s, hs);
        this.addSerif(path, 60, h, s, 'top');
        this.addSerif(path, 60, 0, s, 'bottom');
        this.addSerif(path, adv - 60 - s, h, s, 'top');
        this.addSerif(path, adv - 60 - s, 0, s, 'bottom');
        break;
      }

      case 'I': {
        adv = Math.round(340 * this.widthScale);
        const mid = adv / 2;
        this.addRect(path, mid - s / 2, 0, s, h);
        this.addSerif(path, mid - s / 2, h, s, 'top');
        this.addSerif(path, mid - s / 2, 0, s, 'bottom');
        break;
      }

      case 'J': {
        adv = Math.round(440 * this.widthScale);
        this.addRect(path, adv - 60 - s, h * 0.3, s, h * 0.7);
        this.addRing(path, 50, 0, adv - 110, h * 0.6, s, hs);
        this.addSerif(path, adv - 60 - s, h, s, 'top');
        break;
      }

      case 'K': {
        adv = Math.round(600 * this.widthScale);
        this.addRect(path, 60, 0, s, h);
        path.moveTo(this.pt(60 + s, h * 0.45).x, this.pt(60 + s, h * 0.45).y);
        path.lineTo(this.pt(adv - 60 - s, h).x, this.pt(adv - 60 - s, h).y);
        path.lineTo(this.pt(adv - 60, h).x, this.pt(adv - 60, h).y);
        path.lineTo(this.pt(60 + s, h * 0.35).x, this.pt(60 + s, h * 0.35).y);
        path.close();
        path.moveTo(this.pt(60 + s * 1.3, h * 0.44).x, this.pt(60 + s * 1.3, h * 0.44).y);
        path.lineTo(this.pt(adv - 50, 0).x, this.pt(adv - 50, 0).y);
        path.lineTo(this.pt(adv - 50 - s, 0).x, this.pt(adv - 50 - s, 0).y);
        path.lineTo(this.pt(60 + s, h * 0.38).x, this.pt(60 + s, h * 0.38).y);
        path.close();
        this.addSerif(path, 60, h, s, 'top');
        this.addSerif(path, 60, 0, s, 'bottom');
        break;
      }

      case 'L': {
        adv = Math.round(500 * this.widthScale);
        this.addRect(path, 60, 0, s, h);
        this.addRect(path, 60 + s, 0, adv - 90 - s, hs);
        this.addSerif(path, 60, h, s, 'top');
        this.addSerif(path, 60, 0, s, 'bottom');
        break;
      }

      case 'M': {
        adv = Math.round(740 * this.widthScale);
        this.addRect(path, 50, 0, s, h);
        this.addRect(path, adv - 50 - s, 0, s, h);
        const mid = adv / 2;
        path.moveTo(this.pt(50 + s, h).x, this.pt(50 + s, h).y);
        path.lineTo(this.pt(mid, 0).x, this.pt(mid, 0).y);
        path.lineTo(this.pt(mid + s * 0.7, 0).x, this.pt(mid + s * 0.7, 0).y);
        path.lineTo(this.pt(50 + s, h - s * 1.2).x, this.pt(50 + s, h - s * 1.2).y);
        path.close();
        path.moveTo(this.pt(adv - 50 - s, h).x, this.pt(adv - 50 - s, h).y);
        path.lineTo(this.pt(mid, 0).x, this.pt(mid, 0).y);
        path.lineTo(this.pt(mid - s * 0.7, 0).x, this.pt(mid - s * 0.7, 0).y);
        path.lineTo(this.pt(adv - 50 - s, h - s * 1.2).x, this.pt(adv - 50 - s, h - s * 1.2).y);
        path.close();
        this.addSerif(path, 50, h, s, 'top');
        this.addSerif(path, 50, 0, s, 'bottom');
        this.addSerif(path, adv - 50 - s, h, s, 'top');
        this.addSerif(path, adv - 50 - s, 0, s, 'bottom');
        break;
      }

      case 'N': {
        adv = Math.round(640 * this.widthScale);
        this.addRect(path, 60, 0, s, h);
        this.addRect(path, adv - 60 - s, 0, s, h);
        path.moveTo(this.pt(60, h).x, this.pt(60, h).y);
        path.lineTo(this.pt(adv - 60, 0).x, this.pt(adv - 60, 0).y);
        path.lineTo(this.pt(adv - 60, s * 1.2).x, this.pt(adv - 60, s * 1.2).y);
        path.lineTo(this.pt(60 + s, h).x, this.pt(60 + s, h).y);
        path.close();
        this.addSerif(path, 60, h, s, 'top');
        this.addSerif(path, 60, 0, s, 'bottom');
        this.addSerif(path, adv - 60 - s, 0, s, 'bottom');
        break;
      }

      case 'O': {
        adv = Math.round(660 * this.widthScale);
        this.addRing(path, 50, 0, adv - 100, h, s, hs);
        break;
      }

      case 'P': {
        adv = Math.round(580 * this.widthScale);
        this.addRect(path, 60, 0, s, h);
        this.addRing(path, 60, h * 0.45, adv - 110, h * 0.55, s, hs);
        this.addSerif(path, 60, h, s, 'top');
        this.addSerif(path, 60, 0, s, 'bottom');
        break;
      }

      case 'Q': {
        adv = Math.round(660 * this.widthScale);
        this.addRing(path, 50, 0, adv - 100, h, s, hs);
        path.moveTo(this.pt(adv * 0.52, h * 0.18).x, this.pt(adv * 0.52, h * 0.18).y);
        path.lineTo(this.pt(adv - 30, -40).x, this.pt(adv - 30, -40).y);
        path.lineTo(this.pt(adv - 30 - s, -40).x, this.pt(adv - 30 - s, -40).y);
        path.lineTo(this.pt(adv * 0.52 - s, h * 0.18).x, this.pt(adv * 0.52 - s, h * 0.18).y);
        path.close();
        break;
      }

      case 'R': {
        adv = Math.round(600 * this.widthScale);
        this.addRect(path, 60, 0, s, h);
        this.addRing(path, 60, h * 0.45, adv - 110, h * 0.55, s, hs);
        path.moveTo(this.pt(60 + s * 1.2, h * 0.48).x, this.pt(60 + s * 1.2, h * 0.48).y);
        path.lineTo(this.pt(adv - 50, 0).x, this.pt(adv - 50, 0).y);
        path.lineTo(this.pt(adv - 50 - s, 0).x, this.pt(adv - 50 - s, 0).y);
        path.lineTo(this.pt(60 + s, h * 0.48).x, this.pt(60 + s, h * 0.48).y);
        path.close();
        this.addSerif(path, 60, h, s, 'top');
        this.addSerif(path, 60, 0, s, 'bottom');
        break;
      }

      case 'S': {
        adv = Math.round(560 * this.widthScale);
        this.addCCurve(path, 50, h * 0.48, adv - 100, h * 0.52, s, hs);
        this.addCCurve(path, 50, 0, adv - 100, h * 0.52, s, hs);
        break;
      }

      case 'T': {
        adv = Math.round(540 * this.widthScale);
        const mid = adv / 2;
        this.addRect(path, mid - s / 2, 0, s, h - hs);
        this.addRect(path, 40, h - hs, adv - 80, hs);
        this.addSerif(path, mid - s / 2, 0, s, 'bottom');
        break;
      }

      case 'U': {
        adv = Math.round(620 * this.widthScale);
        this.addUCurve(path, 60, 0, adv - 120, h, s, hs);
        this.addSerif(path, 60, h, s, 'top');
        this.addSerif(path, adv - 60 - s, h, s, 'top');
        break;
      }

      case 'V': {
        adv = Math.round(600 * this.widthScale);
        const mid = adv / 2;
        path.moveTo(this.pt(50, h).x, this.pt(50, h).y);
        path.lineTo(this.pt(mid, 0).x, this.pt(mid, 0).y);
        path.lineTo(this.pt(mid + s * 0.8, 0).x, this.pt(mid + s * 0.8, 0).y);
        path.lineTo(this.pt(adv - 50, h).x, this.pt(adv - 50, h).y);
        path.lineTo(this.pt(adv - 50 - s, h).x, this.pt(adv - 50 - s, h).y);
        path.lineTo(this.pt(mid, s * 1.5).x, this.pt(mid, s * 1.5).y);
        path.lineTo(this.pt(50 + s, h).x, this.pt(50 + s, h).y);
        path.close();
        this.addSerif(path, 50, h, s, 'top');
        this.addSerif(path, adv - 50 - s, h, s, 'top');
        break;
      }

      case 'W': {
        adv = Math.round(780 * this.widthScale);
        const q1 = adv * 0.28;
        const mid = adv * 0.5;
        const q3 = adv * 0.72;
        path.moveTo(this.pt(40, h).x, this.pt(40, h).y);
        path.lineTo(this.pt(q1, 0).x, this.pt(q1, 0).y);
        path.lineTo(this.pt(mid, h).x, this.pt(mid, h).y);
        path.lineTo(this.pt(q3, 0).x, this.pt(q3, 0).y);
        path.lineTo(this.pt(adv - 40, h).x, this.pt(adv - 40, h).y);
        path.lineTo(this.pt(adv - 40 - s, h).x, this.pt(adv - 40 - s, h).y);
        path.lineTo(this.pt(q3, s * 1.5).x, this.pt(q3, s * 1.5).y);
        path.lineTo(this.pt(mid, h - s).x, this.pt(mid, h - s).y);
        path.lineTo(this.pt(q1, s * 1.5).x, this.pt(q1, s * 1.5).y);
        path.lineTo(this.pt(40 + s, h).x, this.pt(40 + s, h).y);
        path.close();
        this.addSerif(path, 40, h, s, 'top');
        this.addSerif(path, adv - 40 - s, h, s, 'top');
        break;
      }

      case 'X': {
        adv = Math.round(580 * this.widthScale);
        path.moveTo(this.pt(50, h).x, this.pt(50, h).y);
        path.lineTo(this.pt(adv - 50, 0).x, this.pt(adv - 50, 0).y);
        path.lineTo(this.pt(adv - 50 - s, 0).x, this.pt(adv - 50 - s, 0).y);
        path.lineTo(this.pt(50 + s, h).x, this.pt(50 + s, h).y);
        path.close();
        path.moveTo(this.pt(adv - 50, h).x, this.pt(adv - 50, h).y);
        path.lineTo(this.pt(50, 0).x, this.pt(50, 0).y);
        path.lineTo(this.pt(50 + s, 0).x, this.pt(50 + s, 0).y);
        path.lineTo(this.pt(adv - 50 - s, h).x, this.pt(adv - 50 - s, h).y);
        path.close();
        this.addSerif(path, 50, h, s, 'top');
        this.addSerif(path, adv - 50 - s, h, s, 'top');
        this.addSerif(path, 50, 0, s, 'bottom');
        this.addSerif(path, adv - 50 - s, 0, s, 'bottom');
        break;
      }

      case 'Y': {
        adv = Math.round(580 * this.widthScale);
        const mid = adv / 2;
        path.moveTo(this.pt(50, h).x, this.pt(50, h).y);
        path.lineTo(this.pt(mid, h * 0.45).x, this.pt(mid, h * 0.45).y);
        path.lineTo(this.pt(adv - 50, h).x, this.pt(adv - 50, h).y);
        path.lineTo(this.pt(adv - 50 - s, h).x, this.pt(adv - 50 - s, h).y);
        path.lineTo(this.pt(mid, h * 0.5).x, this.pt(mid, h * 0.5).y);
        path.lineTo(this.pt(50 + s, h).x, this.pt(50 + s, h).y);
        path.close();
        this.addRect(path, mid - s / 2, 0, s, h * 0.48);
        this.addSerif(path, 50, h, s, 'top');
        this.addSerif(path, adv - 50 - s, h, s, 'top');
        this.addSerif(path, mid - s / 2, 0, s, 'bottom');
        break;
      }

      case 'Z': {
        adv = Math.round(560 * this.widthScale);
        this.addRect(path, 50, h - hs, adv - 100, hs);
        path.moveTo(this.pt(adv - 50 - s, h - hs).x, this.pt(adv - 50 - s, h - hs).y);
        path.lineTo(this.pt(50, hs).x, this.pt(50, hs).y);
        path.lineTo(this.pt(50 + s * 1.2, hs).x, this.pt(50 + s * 1.2, hs).y);
        path.lineTo(this.pt(adv - 50, h - hs).x, this.pt(adv - 50, h - hs).y);
        path.close();
        this.addRect(path, 50, 0, adv - 100, hs);
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

  private createLowercaseGlyph(char: string, unicode: number): Glyph {
    const path = new Path();
    const s = Math.round(this.stem * 0.88);
    const hs = this.hStem;
    const h = this.xH;
    const ascY = this.asc;
    const descY = this.desc;
    let adv = Math.round((this.genre === 'monospace' ? 600 : 500) * this.widthScale);

    switch (char) {
      case 'a': {
        adv = Math.round(480 * this.widthScale);
        this.addACurve(path, 40, 0, adv - 80, h, s, hs);
        this.addSerif(path, adv - 40 - s, 0, s, 'bottom');
        break;
      }

      case 'b': {
        adv = Math.round(500 * this.widthScale);
        this.addRect(path, 50, 0, s, ascY);
        this.addRing(path, 50, 0, adv - 100, h, s, hs);
        this.addSerif(path, 50, ascY, s, 'top');
        this.addSerif(path, 50, 0, s, 'bottom');
        break;
      }

      case 'c': {
        adv = Math.round(450 * this.widthScale);
        this.addCCurve(path, 40, 0, adv - 80, h, s, hs);
        break;
      }

      case 'd': {
        adv = Math.round(500 * this.widthScale);
        this.addRect(path, adv - 50 - s, 0, s, ascY);
        this.addRing(path, 50, 0, adv - 100, h, s, hs);
        this.addSerif(path, adv - 50 - s, ascY, s, 'top');
        this.addSerif(path, adv - 50 - s, 0, s, 'bottom');
        break;
      }

      case 'e': {
        adv = Math.round(470 * this.widthScale);
        this.addECurve(path, 40, 0, adv - 80, h, s, hs);
        break;
      }

      case 'f': {
        adv = Math.round(340 * this.widthScale);
        this.addRect(path, 60, 0, s, ascY - 40);
        this.addRect(path, 60, ascY - 40, 80, hs);
        this.addRect(path, 35, h - hs, 120, hs);
        this.addSerif(path, 60, 0, s, 'bottom');
        break;
      }

      case 'g': {
        adv = Math.round(480 * this.widthScale);
        this.addRing(path, 45, 0, adv - 90, h, s, hs);
        this.addRect(path, adv - 45 - s, descY + 40, s, h - descY - 40);
        this.addRect(path, 45, descY, adv - 90, hs);
        break;
      }

      case 'h': {
        adv = Math.round(500 * this.widthScale);
        this.addRect(path, 50, 0, s, ascY);
        this.addArchStem(path, 50, 0, adv - 100, h, s, hs, false);
        this.addSerif(path, 50, ascY, s, 'top');
        this.addSerif(path, 50, 0, s, 'bottom');
        this.addSerif(path, adv - 50 - s, 0, s, 'bottom');
        break;
      }

      case 'i': {
        adv = Math.round(280 * this.widthScale);
        const mid = adv / 2;
        this.addRect(path, mid - s / 2, 0, s, h);
        this.addRect(path, mid - s / 2, h + 60, s, s);
        this.addSerif(path, mid - s / 2, 0, s, 'bottom');
        break;
      }

      case 'j': {
        adv = Math.round(280 * this.widthScale);
        const mid = adv - 50 - s;
        this.addRect(path, mid, descY + 40, s, h - descY - 40);
        this.addRect(path, 40, descY, mid - 40 + s, hs);
        this.addRect(path, mid, h + 60, s, s);
        break;
      }

      case 'k': {
        adv = Math.round(460 * this.widthScale);
        this.addRect(path, 50, 0, s, ascY);
        path.moveTo(this.pt(50 + s, h * 0.45).x, this.pt(50 + s, h * 0.45).y);
        path.lineTo(this.pt(adv - 50 - s, h).x, this.pt(adv - 50 - s, h).y);
        path.lineTo(this.pt(adv - 50, h).x, this.pt(adv - 50, h).y);
        path.lineTo(this.pt(50 + s, h * 0.35).x, this.pt(50 + s, h * 0.35).y);
        path.close();
        path.moveTo(this.pt(50 + s * 1.3, h * 0.44).x, this.pt(50 + s * 1.3, h * 0.44).y);
        path.lineTo(this.pt(adv - 40, 0).x, this.pt(adv - 40, 0).y);
        path.lineTo(this.pt(adv - 40 - s, 0).x, this.pt(adv - 40 - s, 0).y);
        path.lineTo(this.pt(50 + s, h * 0.38).x, this.pt(50 + s, h * 0.38).y);
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
        adv = Math.round(720 * this.widthScale);
        const w3 = (adv - 80) / 2;
        this.addRect(path, 40, 0, s, h);
        this.addArchStem(path, 40, 0, w3, h, s, hs, false);
        this.addArchStem(path, 40 + w3, 0, w3, h, s, hs, false);
        this.addSerif(path, 40, 0, s, 'bottom');
        this.addSerif(path, 40 + w3, 0, s, 'bottom');
        this.addSerif(path, adv - 40 - s, 0, s, 'bottom');
        break;
      }

      case 'n': {
        adv = Math.round(500 * this.widthScale);
        this.addRect(path, 50, 0, s, h);
        this.addArchStem(path, 50, 0, adv - 100, h, s, hs, false);
        this.addSerif(path, 50, 0, s, 'bottom');
        this.addSerif(path, adv - 50 - s, 0, s, 'bottom');
        break;
      }

      case 'o': {
        adv = Math.round(480 * this.widthScale);
        this.addRing(path, 45, 0, adv - 90, h, s, hs);
        break;
      }

      case 'p': {
        adv = Math.round(500 * this.widthScale);
        this.addRect(path, 50, descY, s, h - descY);
        this.addRing(path, 50, 0, adv - 100, h, s, hs);
        this.addSerif(path, 50, descY, s, 'bottom');
        break;
      }

      case 'q': {
        adv = Math.round(500 * this.widthScale);
        this.addRing(path, 50, 0, adv - 100, h, s, hs);
        this.addRect(path, adv - 50 - s, descY, s, h - descY);
        this.addSerif(path, adv - 50 - s, descY, s, 'bottom');
        break;
      }

      case 'r': {
        adv = Math.round(360 * this.widthScale);
        this.addRect(path, 50, 0, s, h);
        this.addArchStem(path, 50, h * 0.4, adv - 90, h * 0.6, s, hs, false);
        this.addSerif(path, 50, 0, s, 'bottom');
        break;
      }

      case 's': {
        adv = Math.round(440 * this.widthScale);
        this.addCCurve(path, 40, h * 0.48, adv - 80, h * 0.52, s, hs);
        this.addCCurve(path, 40, 0, adv - 80, h * 0.52, s, hs);
        break;
      }

      case 't': {
        adv = Math.round(340 * this.widthScale);
        const mid = 60;
        this.addRect(path, mid, 0, s, ascY * 0.85);
        this.addRect(path, 30, h - hs, 110, hs);
        this.addRect(path, mid, 0, 60, hs);
        break;
      }

      case 'u': {
        adv = Math.round(500 * this.widthScale);
        this.addUCurve(path, 50, 0, adv - 100, h, s, hs);
        this.addSerif(path, 50, h, s, 'top');
        this.addSerif(path, adv - 50 - s, 0, s, 'bottom');
        break;
      }

      case 'v': {
        adv = Math.round(480 * this.widthScale);
        const mid = adv / 2;
        path.moveTo(this.pt(45, h).x, this.pt(45, h).y);
        path.lineTo(this.pt(mid, 0).x, this.pt(mid, 0).y);
        path.lineTo(this.pt(mid + s * 0.8, 0).x, this.pt(mid + s * 0.8, 0).y);
        path.lineTo(this.pt(adv - 45, h).x, this.pt(adv - 45, h).y);
        path.lineTo(this.pt(adv - 45 - s, h).x, this.pt(adv - 45 - s, h).y);
        path.lineTo(this.pt(mid, s * 1.5).x, this.pt(mid, s * 1.5).y);
        path.lineTo(this.pt(45 + s, h).x, this.pt(45 + s, h).y);
        path.close();
        this.addSerif(path, 45, h, s, 'top');
        this.addSerif(path, adv - 45 - s, h, s, 'top');
        break;
      }

      case 'w': {
        adv = Math.round(700 * this.widthScale);
        const q1 = adv * 0.28;
        const mid = adv * 0.5;
        const q3 = adv * 0.72;
        path.moveTo(this.pt(35, h).x, this.pt(35, h).y);
        path.lineTo(this.pt(q1, 0).x, this.pt(q1, 0).y);
        path.lineTo(this.pt(mid, h).x, this.pt(mid, h).y);
        path.lineTo(this.pt(q3, 0).x, this.pt(q3, 0).y);
        path.lineTo(this.pt(adv - 35, h).x, this.pt(adv - 35, h).y);
        path.lineTo(this.pt(adv - 35 - s, h).x, this.pt(adv - 35 - s, h).y);
        path.lineTo(this.pt(q3, s * 1.5).x, this.pt(q3, s * 1.5).y);
        path.lineTo(this.pt(mid, h - s).x, this.pt(mid, h - s).y);
        path.lineTo(this.pt(q1, s * 1.5).x, this.pt(q1, s * 1.5).y);
        path.lineTo(this.pt(35 + s, h).x, this.pt(35 + s, h).y);
        path.close();
        this.addSerif(path, 35, h, s, 'top');
        this.addSerif(path, adv - 35 - s, h, s, 'top');
        break;
      }

      case 'x': {
        adv = Math.round(480 * this.widthScale);
        path.moveTo(this.pt(45, h).x, this.pt(45, h).y);
        path.lineTo(this.pt(adv - 45, 0).x, this.pt(adv - 45, 0).y);
        path.lineTo(this.pt(adv - 45 - s, 0).x, this.pt(adv - 45 - s, 0).y);
        path.lineTo(this.pt(45 + s, h).x, this.pt(45 + s, h).y);
        path.close();
        path.moveTo(this.pt(adv - 45, h).x, this.pt(adv - 45, h).y);
        path.lineTo(this.pt(45, 0).x, this.pt(45, 0).y);
        path.lineTo(this.pt(45 + s, 0).x, this.pt(45 + s, 0).y);
        path.lineTo(this.pt(adv - 45 - s, h).x, this.pt(adv - 45 - s, h).y);
        path.close();
        this.addSerif(path, 45, h, s, 'top');
        this.addSerif(path, adv - 45 - s, h, s, 'top');
        this.addSerif(path, 45, 0, s, 'bottom');
        this.addSerif(path, adv - 45 - s, 0, s, 'bottom');
        break;
      }

      case 'y': {
        adv = Math.round(480 * this.widthScale);
        const mid = adv / 2;
        path.moveTo(this.pt(45, h).x, this.pt(45, h).y);
        path.lineTo(this.pt(mid, 0).x, this.pt(mid, 0).y);
        path.lineTo(this.pt(adv - 45, h).x, this.pt(adv - 45, h).y);
        path.lineTo(this.pt(adv - 45 - s, h).x, this.pt(adv - 45 - s, h).y);
        path.lineTo(this.pt(mid, hs).x, this.pt(mid, hs).y);
        path.lineTo(this.pt(45 + s, h).x, this.pt(45 + s, h).y);
        path.close();
        this.addRect(path, mid - s / 2, descY, s, -descY + hs);
        this.addSerif(path, 45, h, s, 'top');
        this.addSerif(path, adv - 45 - s, h, s, 'top');
        break;
      }

      case 'z': {
        adv = Math.round(460 * this.widthScale);
        this.addRect(path, 45, h - hs, adv - 90, hs);
        path.moveTo(this.pt(adv - 45 - s, h - hs).x, this.pt(adv - 45 - s, h - hs).y);
        path.lineTo(this.pt(45, hs).x, this.pt(45, hs).y);
        path.lineTo(this.pt(45 + s * 1.2, hs).x, this.pt(45 + s * 1.2, hs).y);
        path.lineTo(this.pt(adv - 45, h - hs).x, this.pt(adv - 45, h - hs).y);
        path.close();
        this.addRect(path, 45, 0, adv - 90, hs);
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

  private createNumberGlyph(char: string, unicode: number): Glyph {
    const path = new Path();
    const s = Math.round(this.stem * 0.95);
    const hs = this.hStem;
    const h = this.capH;
    const adv = this.genre === 'monospace' ? 600 : Math.round(560 * this.widthScale);

    switch (char) {
      case '0': {
        this.addRing(path, 50, 0, adv - 100, h, s, hs);
        break;
      }
      case '1': {
        const mid = adv / 2;
        this.addRect(path, mid - s / 2, 0, s, h);
        path.moveTo(this.pt(mid - s / 2, h).x, this.pt(mid - s / 2, h).y);
        path.lineTo(this.pt(mid - 90, h - 80).x, this.pt(mid - 90, h - 80).y);
        path.lineTo(this.pt(mid - 90, h - 80 - hs).x, this.pt(mid - 90, h - 80 - hs).y);
        path.lineTo(this.pt(mid - s / 2, h - hs).x, this.pt(mid - s / 2, h - hs).y);
        path.close();
        this.addRect(path, mid - 90, 0, 180, hs);
        break;
      }
      case '2': {
        this.addRing(path, 50, h * 0.45, adv - 100, h * 0.55, s, hs);
        path.moveTo(this.pt(adv - 50, h * 0.5).x, this.pt(adv - 50, h * 0.5).y);
        path.lineTo(this.pt(50, hs).x, this.pt(50, hs).y);
        path.lineTo(this.pt(50 + s * 1.2, hs).x, this.pt(50 + s * 1.2, hs).y);
        path.lineTo(this.pt(adv - 50, h * 0.5).x, this.pt(adv - 50, h * 0.5).y);
        path.close();
        this.addRect(path, 50, 0, adv - 100, hs);
        break;
      }
      case '3': {
        this.addCCurve(path, 50, h * 0.48, adv - 100, h * 0.52, s, hs);
        this.addCCurve(path, 50, 0, adv - 100, h * 0.52, s, hs);
        this.addRect(path, adv * 0.4, h * 0.5 - hs / 2, adv * 0.4, hs);
        break;
      }
      case '4': {
        this.addRect(path, adv - 110 - s, 0, s, h);
        path.moveTo(this.pt(adv - 110, h).x, this.pt(adv - 110, h).y);
        path.lineTo(this.pt(50, h * 0.3).x, this.pt(50, h * 0.3).y);
        path.lineTo(this.pt(50, h * 0.3 - hs).x, this.pt(50, h * 0.3 - hs).y);
        path.lineTo(this.pt(adv - 110, h * 0.3 - hs).x, this.pt(adv - 110, h * 0.3 - hs).y);
        path.close();
        this.addRect(path, 50, h * 0.3 - hs, adv - 90, hs);
        break;
      }
      case '5': {
        this.addRect(path, 60, h * 0.5, s, h * 0.5);
        this.addRect(path, 60, h - hs, adv - 110, hs);
        this.addRing(path, 55, 0, adv - 110, h * 0.58, s, hs);
        break;
      }
      case '6': {
        this.addRing(path, 50, 0, adv - 100, h * 0.58, s, hs);
        this.addRect(path, 50, h * 0.5, s, h * 0.5);
        this.addRect(path, 50, h - hs, adv - 130, hs);
        break;
      }
      case '7': {
        this.addRect(path, 50, h - hs, adv - 100, hs);
        path.moveTo(this.pt(adv - 50, h).x, this.pt(adv - 50, h).y);
        path.lineTo(this.pt(adv * 0.35, 0).x, this.pt(adv * 0.35, 0).y);
        path.lineTo(this.pt(adv * 0.35 + s * 1.1, 0).x, this.pt(adv * 0.35 + s * 1.1, 0).y);
        path.lineTo(this.pt(adv - 50, h - s * 1.1).x, this.pt(adv - 50, h - s * 1.1).y);
        path.close();
        break;
      }
      case '8': {
        this.addRing(path, 50, h * 0.48, adv - 100, h * 0.52, s, hs);
        this.addRing(path, 50, 0, adv - 100, h * 0.52, s, hs);
        break;
      }
      case '9': {
        this.addRing(path, 50, h * 0.42, adv - 100, h * 0.58, s, hs);
        this.addRect(path, adv - 50 - s, 0, s, h * 0.5);
        this.addRect(path, 70, 0, adv - 120, hs);
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

  private createPunctuationGlyph(char: string, unicode: number): Glyph {
    const path = new Path();
    const s = Math.round(this.stem * 0.85);
    const hs = this.hStem;
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
        path.moveTo(this.pt(120 + s / 2, s).x, this.pt(120 + s / 2, s).y);
        path.lineTo(this.pt(100 - s / 2, -40).x, this.pt(100 - s / 2, -40).y);
        path.lineTo(this.pt(120 - s / 2, 0).x, this.pt(120 - s / 2, 0).y);
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
        adv = 460;
        this.addCCurve(path, 50, h * 0.45, adv - 100, h * 0.55, s, hs);
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
        path.moveTo(this.pt(mid + s, s).x, this.pt(mid + s, s).y);
        path.lineTo(this.pt(mid - 15, -40).x, this.pt(mid - 15, -40).y);
        path.lineTo(this.pt(mid, 0).x, this.pt(mid, 0).y);
        path.close();
        break;
      }
      case '-': {
        adv = 360;
        this.addRect(path, 50, this.xH * 0.5 - hs / 2, adv - 100, hs);
        break;
      }
      case '_': {
        adv = 460;
        this.addRect(path, 20, -50, adv - 40, hs);
        break;
      }
      case '+': {
        adv = 460;
        const midX = adv / 2;
        const midY = this.xH * 0.5;
        this.addRect(path, 60, midY - hs / 2, adv - 120, hs);
        this.addRect(path, midX - s / 2, midY - (adv - 120) / 2, s, adv - 120);
        break;
      }
      case '=': {
        adv = 460;
        const midY = this.xH * 0.5;
        this.addRect(path, 60, midY + 35, adv - 120, hs);
        this.addRect(path, 60, midY - 35 - hs, adv - 120, hs);
        break;
      }
      case '/': {
        adv = 400;
        path.moveTo(this.pt(adv - 60, h).x, this.pt(adv - 60, h).y);
        path.lineTo(this.pt(60, this.desc).x, this.pt(60, this.desc).y);
        path.lineTo(this.pt(60 + s, this.desc).x, this.pt(60 + s, this.desc).y);
        path.lineTo(this.pt(adv - 60 + s, h).x, this.pt(adv - 60 + s, h).y);
        path.close();
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

  private generateDevanagariGlyphs(glyphs: Glyph[]) {
    const s = Math.round(this.stem * 0.9);
    const hs = this.hStem;
    const h = this.capH;
    const defaultAdv = Math.round(600 * this.widthScale);

    const devanagariMap: Array<{ code: number; name: string; render: (path: Path, adv: number) => void; width?: number }> = [
      // Swar
      {
        code: 0x0905, // अ
        name: 'dv_A',
        render: (path, adv) => {
          this.addCCurve(path, 50, h * 0.48, adv - 180, h * 0.52, s, hs);
          this.addCCurve(path, 50, 0, adv - 180, h * 0.52, s, hs);
          this.addRect(path, adv - 150, h * 0.5 - hs / 2, 80, hs);
          this.addRect(path, adv - 70 - s, 0, s, h);
          this.addRect(path, adv - 110 - s, h - hs, 110 + s, hs);
        },
      },
      {
        code: 0x0906, // आ
        name: 'dv_Aa',
        width: Math.round(700 * this.widthScale),
        render: (path, adv) => {
          this.addCCurve(path, 40, h * 0.48, adv - 250, h * 0.52, s, hs);
          this.addCCurve(path, 40, 0, adv - 250, h * 0.52, s, hs);
          this.addRect(path, adv - 220, h * 0.5 - hs / 2, 80, hs);
          this.addRect(path, adv - 140 - s, 0, s, h);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addRect(path, adv - 170 - s, h - hs, 170 + s, hs);
        },
      },
      {
        code: 0x0907, // इ
        name: 'dv_I',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv / 2 - s / 2, h * 0.75, s, h * 0.25);
          this.addCCurve(path, 50, h * 0.4, adv - 100, h * 0.4, s, hs);
          this.addCCurve(path, 50, 0, adv - 100, h * 0.4, s, hs);
        },
      },
      {
        code: 0x0908, // ई
        name: 'dv_Ee',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv / 2 - s / 2, h * 0.75, s, h * 0.25);
          this.addCCurve(path, 50, h * 0.4, adv - 100, h * 0.4, s, hs);
          this.addCCurve(path, 50, 0, adv - 100, h * 0.4, s, hs);
          this.addRect(path, adv / 2, h, s, 60);
        },
      },
      {
        code: 0x0909, // उ
        name: 'dv_U',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addCCurve(path, 50, h * 0.48, adv - 100, h * 0.52, s, hs);
          this.addCCurve(path, 50, 0, adv - 100, h * 0.52, s, hs);
        },
      },
      {
        code: 0x090A, // ऊ
        name: 'dv_Oo',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addCCurve(path, 50, h * 0.48, adv - 100, h * 0.52, s, hs);
          this.addCCurve(path, 50, 0, adv - 100, h * 0.52, s, hs);
          this.addRect(path, adv - 70, h * 0.45 - hs / 2, 50, hs);
          this.addRect(path, adv - 30 - s, 0, s, h * 0.45);
        },
      },
      {
        code: 0x090F, // ए
        name: 'dv_E',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, 60, h * 0.4, s, h * 0.6);
          this.addRect(path, 60, h * 0.4 - hs, adv - 140, hs);
          this.addRect(path, adv - 80 - s, h * 0.35, s, h * 0.65);
        },
      },
      {
        code: 0x0910, // ऐ
        name: 'dv_Ai',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, 60, h * 0.4, s, h * 0.6);
          this.addRect(path, 60, h * 0.4 - hs, adv - 140, hs);
          this.addRect(path, adv - 80 - s, h * 0.35, s, h * 0.65);
          this.addRect(path, 60, h, s, 70);
        },
      },
      {
        code: 0x0913, // ओ
        name: 'dv_O',
        width: Math.round(700 * this.widthScale),
        render: (path, adv) => {
          this.addCCurve(path, 40, h * 0.48, adv - 250, h * 0.52, s, hs);
          this.addCCurve(path, 40, 0, adv - 250, h * 0.52, s, hs);
          this.addRect(path, adv - 220, h * 0.5 - hs / 2, 80, hs);
          this.addRect(path, adv - 140 - s, 0, s, h);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addRect(path, adv - 170 - s, h - hs, 170 + s, hs);
          this.addRect(path, adv - 60 - s, h, s, 60);
        },
      },
      {
        code: 0x0914, // औ
        name: 'dv_Au',
        width: Math.round(700 * this.widthScale),
        render: (path, adv) => {
          this.addCCurve(path, 40, h * 0.48, adv - 250, h * 0.52, s, hs);
          this.addCCurve(path, 40, 0, adv - 250, h * 0.52, s, hs);
          this.addRect(path, adv - 220, h * 0.5 - hs / 2, 80, hs);
          this.addRect(path, adv - 140 - s, 0, s, h);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addRect(path, adv - 170 - s, h - hs, 170 + s, hs);
          this.addRect(path, adv - 80 - s, h, s * 0.8, 70);
          this.addRect(path, adv - 45 - s, h, s * 0.8, 70);
        },
      },

      // Vyanjan
      {
        code: 0x0915, // क (Ka)
        name: 'dv_Ka',
        render: (path, adv) => {
          this.addRect(path, 30, h - hs, adv - 60, hs);
          const mid = adv / 2;
          this.addRect(path, mid - s / 2, 0, s, h);
          this.addRing(path, 50, h * 0.25, mid - 50 + s / 2, h * 0.5, s, hs);
          this.addCCurve(path, mid - s / 2, h * 0.25, adv - mid - 20, h * 0.5, s, hs);
        },
      },
      {
        code: 0x0916, // ख (Kha)
        name: 'dv_Kha',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addRing(path, 50, h * 0.45, 110, h * 0.55, s, hs);
          this.addRect(path, 50, 0, adv - 110, hs);
          this.addRing(path, adv - 140, h * 0.2, 80, h * 0.45, s, hs);
        },
      },
      {
        code: 0x0917, // ग (Ga)
        name: 'dv_Ga',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addRect(path, 60, h * 0.25, s, h * 0.75);
          this.addRect(path, 60, h * 0.25 - hs, 70, hs);
        },
      },
      {
        code: 0x0918, // घ (Gha)
        name: 'dv_Gha',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addCCurve(path, 50, h * 0.45, adv - 110 - s, h * 0.55, s, hs);
          this.addCCurve(path, 50, 0, adv - 110 - s, h * 0.55, s, hs);
        },
      },
      {
        code: 0x091A, // च (Cha)
        name: 'dv_Cha',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addRect(path, 60, h * 0.45, adv - 120 - s, hs);
          this.addCCurve(path, 60, 0, adv - 120 - s, h * 0.55, s, hs);
        },
      },
      {
        code: 0x091C, // ज (Ja)
        name: 'dv_Ja',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addRect(path, 90, h * 0.45, adv - 150 - s, hs);
          this.addCCurve(path, 50, 0, 100, h * 0.55, s, hs);
        },
      },
      {
        code: 0x091F, // ट (Ta)
        name: 'dv_Ta',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv / 2 - s / 2, h * 0.7, s, h * 0.3);
          this.addCCurve(path, 50, 0, adv - 100, h * 0.75, s, hs);
        },
      },
      {
        code: 0x0920, // ठ (Ttha)
        name: 'dv_Ttha',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv / 2 - s / 2, h * 0.7, s, h * 0.3);
          this.addRing(path, 50, 0, adv - 100, h * 0.75, s, hs);
        },
      },
      {
        code: 0x0924, // त (Ta)
        name: 'dv_Ta_ind',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addRect(path, 70, h * 0.45, adv - 130 - s, hs);
          this.addRect(path, 70, 0, s, h * 0.45);
        },
      },
      {
        code: 0x0926, // द (Da)
        name: 'dv_Da',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv / 2 - s / 2, h * 0.75, s, h * 0.25);
          this.addCCurve(path, 50, h * 0.25, adv - 100, h * 0.55, s, hs);
          this.addRect(path, adv - 90, -30, s, 60);
        },
      },
      {
        code: 0x0927, // ध (Dha)
        name: 'dv_Dha',
        render: (path, adv) => {
          this.addRect(path, adv * 0.4, h - hs, adv * 0.6, hs);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addCCurve(path, 60, h * 0.48, adv - 120 - s, h * 0.52, s, hs);
          this.addCCurve(path, 60, 0, adv - 120 - s, h * 0.52, s, hs);
        },
      },
      {
        code: 0x0928, // न (Na)
        name: 'dv_Na',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addRect(path, 70, h * 0.45, adv - 130 - s, hs);
          this.addRect(path, 60, h * 0.45 - 20, s, 40);
        },
      },
      {
        code: 0x092A, // प (Pa)
        name: 'dv_Pa',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addRect(path, 60, h * 0.35, s, h * 0.65);
          this.addRect(path, 60, 0, adv - 120 - s, hs);
        },
      },
      {
        code: 0x092B, // फ (Pha)
        name: 'dv_Pha',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          const mid = adv / 2;
          this.addRect(path, mid - s / 2, 0, s, h);
          this.addRect(path, 50, h * 0.35, s, h * 0.65);
          this.addRect(path, 50, 0, mid - 50 + s / 2, hs);
          this.addCCurve(path, mid - s / 2, 0, adv - mid - 10, h * 0.6, s, hs);
        },
      },
      {
        code: 0x092C, // ब (Ba)
        name: 'dv_Ba',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addRing(path, 50, h * 0.15, adv - 110 - s, h * 0.7, s, hs);
        },
      },
      {
        code: 0x092D, // भ (Bha)
        name: 'dv_Bha',
        render: (path, adv) => {
          this.addRect(path, adv * 0.4, h - hs, adv * 0.6, hs);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addRect(path, 60, h * 0.3, s, h * 0.6);
          this.addRect(path, 60, h * 0.3 - hs / 2, adv - 120 - s, hs);
        },
      },
      {
        code: 0x092E, // म (Ma)
        name: 'dv_Ma',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addRect(path, 60, h * 0.3, s, h * 0.7);
          this.addRect(path, 60, h * 0.3 - hs / 2, adv - 120 - s, hs);
        },
      },
      {
        code: 0x092F, // य (Ya)
        name: 'dv_Ya',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addCCurve(path, 50, h * 0.45, 100, h * 0.55, s, hs);
          this.addRect(path, 50, 0, adv - 110 - s, hs);
        },
      },
      {
        code: 0x0930, // र (Ra)
        name: 'dv_Ra',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addCCurve(path, 60, h * 0.45, adv - 120, h * 0.55, s, hs);
          path.moveTo(this.pt(adv / 2, h * 0.45).x, this.pt(adv / 2, h * 0.45).y);
          path.lineTo(this.pt(adv - 70, 0).x, this.pt(adv - 70, 0).y);
          path.lineTo(this.pt(adv - 70 - s, 0).x, this.pt(adv - 70 - s, 0).y);
          path.lineTo(this.pt(adv / 2 - s, h * 0.45).x, this.pt(adv / 2 - s, h * 0.45).y);
          path.close();
        },
      },
      {
        code: 0x0932, // ल (La)
        name: 'dv_La',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addCCurve(path, 60, h * 0.45, 90, h * 0.55, s, hs);
          this.addCCurve(path, 110, 0, 100, h * 0.55, s, hs);
        },
      },
      {
        code: 0x0935, // व (Va)
        name: 'dv_Va',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addRing(path, 50, h * 0.15, adv - 110 - s, h * 0.7, s, hs);
        },
      },
      {
        code: 0x0936, // श (Sha)
        name: 'dv_Sha',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addCCurve(path, 50, h * 0.45, 110, h * 0.55, s, hs);
          this.addRect(path, 80, 0, s, h * 0.45);
        },
      },
      {
        code: 0x0937, // ष (Ssa)
        name: 'dv_Ssa',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addRect(path, 60, h * 0.35, s, h * 0.65);
          this.addRect(path, 60, 0, adv - 120 - s, hs);
        },
      },
      {
        code: 0x0938, // स (Sa)
        name: 'dv_Sa',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv - 60 - s, 0, s, h);
          this.addCCurve(path, 50, h * 0.45, 100, h * 0.55, s, hs);
          this.addRect(path, 90, h * 0.45 - hs / 2, adv - 150 - s, hs);
          path.moveTo(this.pt(100, h * 0.45).x, this.pt(100, h * 0.45).y);
          path.lineTo(this.pt(140, 0).x, this.pt(140, 0).y);
          path.lineTo(this.pt(140 - s, 0).x, this.pt(140 - s, 0).y);
          path.lineTo(this.pt(100 - s, h * 0.45).x, this.pt(100 - s, h * 0.45).y);
          path.close();
        },
      },
      {
        code: 0x0939, // ह (Ha)
        name: 'dv_Ha',
        render: (path, adv) => {
          this.addRect(path, 40, h - hs, adv - 80, hs);
          this.addRect(path, adv / 2 - s / 2, h * 0.75, s, h * 0.25);
          this.addCCurve(path, 50, h * 0.45, adv - 100, h * 0.45, s, hs);
          this.addCCurve(path, 70, 0, adv - 120, h * 0.5, s, hs);
        },
      },

      // Matras
      {
        code: 0x093E, // ा (Aa Matra)
        name: 'dv_Matra_Aa',
        width: Math.round(260 * this.widthScale),
        render: (path, adv) => {
          this.addRect(path, 20, h - hs, adv - 40, hs);
          this.addRect(path, adv / 2 - s / 2, 0, s, h);
        },
      },
      {
        code: 0x093F, // ि (I Matra)
        name: 'dv_Matra_I',
        width: Math.round(320 * this.widthScale),
        render: (path, adv) => {
          this.addRect(path, 40, 0, s, h);
          this.addRect(path, 40, h - hs, adv - 60, hs);
        },
      },
      {
        code: 0x0940, // ी (Ee Matra)
        name: 'dv_Matra_Ee',
        width: Math.round(320 * this.widthScale),
        render: (path, adv) => {
          this.addRect(path, adv - 40 - s, 0, s, h);
          this.addRect(path, 20, h - hs, adv - 60, hs);
        },
      },
      {
        code: 0x0947, // े (E Matra)
        name: 'dv_Matra_E',
        width: Math.round(240 * this.widthScale),
        render: (path, adv) => {
          this.addRect(path, adv / 2 - s / 2, h, s, 65);
        },
      },
      {
        code: 0x0948, // ै (Ai Matra)
        name: 'dv_Matra_Ai',
        width: Math.round(260 * this.widthScale),
        render: (path, adv) => {
          this.addRect(path, adv / 2 - s - 10, h, s * 0.8, 65);
          this.addRect(path, adv / 2 + 10, h, s * 0.8, 65);
        },
      },
      {
        code: 0x094B, // ो (O Matra)
        name: 'dv_Matra_O',
        width: Math.round(280 * this.widthScale),
        render: (path, adv) => {
          this.addRect(path, 20, h - hs, adv - 40, hs);
          this.addRect(path, adv / 2 - s / 2, 0, s, h);
          this.addRect(path, adv / 2 - s / 2, h, s, 60);
        },
      },
      {
        code: 0x094C, // ौ (Au Matra)
        name: 'dv_Matra_Au',
        width: Math.round(300 * this.widthScale),
        render: (path, adv) => {
          this.addRect(path, 20, h - hs, adv - 40, hs);
          this.addRect(path, adv / 2 - s / 2, 0, s, h);
          this.addRect(path, adv / 2 - s - 5, h, s * 0.8, 65);
          this.addRect(path, adv / 2 + 5, h, s * 0.8, 65);
        },
      },
      {
        code: 0x094D, // ् (Virama / Halant)
        name: 'dv_Halant',
        width: Math.round(200 * this.widthScale),
        render: (path, adv) => {
          path.moveTo(this.pt(40, -10).x, this.pt(40, -10).y);
          path.lineTo(this.pt(adv - 40, -50).x, this.pt(adv - 40, -50).y);
          path.lineTo(this.pt(adv - 40, -50 + hs).x, this.pt(adv - 40, -50 + hs).y);
          path.lineTo(this.pt(40, -10 + hs).x, this.pt(40, -10 + hs).y);
          path.close();
        },
      },
      {
        code: 0x0902, // ं (Anusvara)
        name: 'dv_Anusvara',
        width: Math.round(200 * this.widthScale),
        render: (path, adv) => {
          this.addRect(path, adv / 2 - s / 2, h + 30, s, s);
        },
      },
      {
        code: 0x0903, // ः (Visarga)
        name: 'dv_Visarga',
        width: Math.round(220 * this.widthScale),
        render: (path, adv) => {
          this.addRect(path, adv / 2 - s / 2, h * 0.65, s, s);
          this.addRect(path, adv / 2 - s / 2, h * 0.35, s, s);
        },
      },
      {
        code: 0x0964, // । (Purna Viram)
        name: 'dv_Danda',
        width: Math.round(240 * this.widthScale),
        render: (path, adv) => {
          this.addRect(path, adv / 2 - s / 2, 0, s, h);
        },
      },
      {
        code: 0x0965, // ॥ (Double Purna Viram)
        name: 'dv_DoubleDanda',
        width: Math.round(360 * this.widthScale),
        render: (path, adv) => {
          this.addRect(path, 70, 0, s, h);
          this.addRect(path, adv - 70 - s, 0, s, h);
        },
      },
      // Digits
      {
        code: 0x0966, // ० (0)
        name: 'dv_zero',
        render: (path, adv) => {
          this.addRing(path, 50, 0, adv - 100, h * 0.9, s, hs);
        },
      },
      {
        code: 0x0967, // १ (1)
        name: 'dv_one',
        render: (path, adv) => {
          this.addRing(path, 60, h * 0.45, 90, h * 0.55, s, hs);
          this.addRect(path, adv - 70 - s, 0, s, h * 0.7);
        },
      },
      {
        code: 0x0968, // २ (2)
        name: 'dv_two',
        render: (path, adv) => {
          this.addCCurve(path, 50, h * 0.45, adv - 100, h * 0.55, s, hs);
          this.addRect(path, 50, 0, adv - 100, hs);
        },
      },
      {
        code: 0x0969, // ३ (3)
        name: 'dv_three',
        render: (path, adv) => {
          this.addCCurve(path, 50, h * 0.48, adv - 100, h * 0.52, s, hs);
          this.addCCurve(path, 50, 0, adv - 100, h * 0.52, s, hs);
        },
      },
    ];

    devanagariMap.forEach((entry) => {
      const adv = entry.width || defaultAdv;
      const path = new Path();
      entry.render(path, adv);

      glyphs.push(
        new Glyph({
          name: entry.name,
          unicode: entry.code,
          advanceWidth: adv,
          path,
        })
      );
    });
  }
}
