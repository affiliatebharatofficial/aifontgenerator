import { Path, Glyph } from 'opentype.js';
import type { FontSpecification } from '../specification/types';
import { GlyphGeometryContext } from './context';
import { StemPrimitive } from './primitives/StemPrimitive';
import { SerifPrimitive } from './primitives/SerifPrimitive';
import { RingPrimitive } from './primitives/RingPrimitive';
import { DiagonalPrimitive } from './primitives/DiagonalPrimitive';

export class StyleAwareGlyphEngine {
  private ctx: GlyphGeometryContext;
  private spec: FontSpecification;

  constructor(spec: FontSpecification, customSeed?: number) {
    this.spec = spec;
    this.ctx = new GlyphGeometryContext(spec, customSeed);
  }

  public getContext(): GlyphGeometryContext {
    return this.ctx;
  }

  public generateGlyphs(): Glyph[] {
    const glyphs: Glyph[] = [];

    // 1. .notdef
    glyphs.push(this.createNotDefGlyph());

    // 2. Space
    const spaceWidth = this.ctx.getAdvanceWidth(320);
    glyphs.push(
      new Glyph({
        name: 'space',
        unicode: 32,
        advanceWidth: spaceWidth,
        path: new Path(),
      })
    );

    // 3. Uppercase A-Z
    if (this.spec.characterSet.uppercase) {
      for (let i = 65; i <= 90; i++) {
        const char = String.fromCharCode(i);
        glyphs.push(this.createUppercaseGlyph(char, i));
      }
    }

    // 4. Lowercase a-z
    if (this.spec.characterSet.lowercase) {
      for (let i = 97; i <= 122; i++) {
        const char = String.fromCharCode(i);
        glyphs.push(this.createLowercaseGlyph(char, i));
      }
    }

    // 5. Numbers 0-9
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

    // 7. Devanagari script if enabled
    const isDevanagari =
      (this.ctx.dna.styleFamily as string) === 'DEVANAGARI' ||
      this.spec.characterSet.devanagari === true ||
      (this.spec.category || '').toLowerCase() === 'devanagari';


    if (isDevanagari) {
      this.generateDevanagariGlyphs(glyphs);
    }

    return glyphs;
  }

  private createNotDefGlyph(): Glyph {
    const p = new Path();
    const w = 500;
    const h = this.ctx.capH;
    const s = this.ctx.stem;
    StemPrimitive.addStem(this.ctx, p, 50, 0, s, h, 0);
    StemPrimitive.addStem(this.ctx, p, w - 50 - s, 0, s, h, 0);
    StemPrimitive.addStem(this.ctx, p, 50, h - s, w - 100, s, 0);
    StemPrimitive.addStem(this.ctx, p, 50, 0, w - 100, s, 0);

    return new Glyph({
      name: '.notdef',
      unicode: 0,
      advanceWidth: this.ctx.getAdvanceWidth(w),
      path: p,
    });
  }

  // =========================================================================
  // UPPERCASE GLYPHS (A - Z)
  // =========================================================================
  private createUppercaseGlyph(char: string, code: number): Glyph {
    const p = new Path();
    const capH = this.ctx.capH;
    const stem = this.ctx.stem;
    const hStem = this.ctx.hStem;

    let nominalW = 580;

    switch (char) {
      case 'A': {
        nominalW = 620;
        const xCenter = nominalW / 2;
        DiagonalPrimitive.addApex(this.ctx, p, xCenter, capH, 50, 0, nominalW - 50 - stem, 0, stem, code);
        const barY = Math.round(capH * 0.38);
        StemPrimitive.addStem(this.ctx, p, 130, barY, nominalW - 260, hStem, code);
        SerifPrimitive.addSerifs(this.ctx, p, 50, 0, stem, 'bot', code);
        SerifPrimitive.addSerifs(this.ctx, p, nominalW - 50 - stem, 0, stem, 'bot', code);
        break;
      }
      case 'B': {
        nominalW = 580;
        StemPrimitive.addStem(this.ctx, p, 60, 0, stem, capH, code, { topTerminal: true, botTerminal: true });
        const midY = Math.round(capH * 0.50);
        RingPrimitive.addRing(this.ctx, p, 60 + stem, midY, nominalW - 120 - stem, capH - midY, stem, hStem, code);
        RingPrimitive.addRing(this.ctx, p, 60 + stem, 0, nominalW - 100 - stem, midY, stem, hStem, code);
        SerifPrimitive.addSerifs(this.ctx, p, 60, 0, stem, 'both', code);
        break;
      }
      case 'C': {
        nominalW = 580;
        RingPrimitive.addRing(this.ctx, p, 60, 0, nominalW - 120, capH, stem, hStem, code);
        // Cut out the right aperture
        const cutH = Math.round(capH * 0.40);
        const cutY = Math.round((capH - cutH) / 2);
        const p1 = this.ctx.pt(nominalW / 2, cutY, code, 400);
        const p2 = this.ctx.pt(nominalW + 40, cutY - 10, code, 401);
        const p3 = this.ctx.pt(nominalW + 40, cutY + cutH + 10, code, 402);
        const p4 = this.ctx.pt(nominalW / 2, cutY + cutH, code, 403);
        p.moveTo(p1.x, p1.y);
        p.lineTo(p2.x, p2.y);
        p.lineTo(p3.x, p3.y);
        p.lineTo(p4.x, p4.y);
        p.close();
        break;
      }
      case 'D': {
        nominalW = 600;
        StemPrimitive.addStem(this.ctx, p, 60, 0, stem, capH, code, { topTerminal: true, botTerminal: true });
        RingPrimitive.addRing(this.ctx, p, 60, 0, nominalW - 100, capH, stem, hStem, code);
        SerifPrimitive.addSerifs(this.ctx, p, 60, 0, stem, 'both', code);
        break;
      }
      case 'E': {
        nominalW = 540;
        StemPrimitive.addStem(this.ctx, p, 60, 0, stem, capH, code, { topTerminal: true, botTerminal: true });
        StemPrimitive.addStem(this.ctx, p, 60 + stem, capH - hStem, nominalW - 120 - stem, hStem, code, { rightTerminal: true });
        const midY = Math.round(capH * 0.50);
        StemPrimitive.addStem(this.ctx, p, 60 + stem, midY - hStem / 2, Math.round((nominalW - 150 - stem) * 0.85), hStem, code, { rightTerminal: true });
        StemPrimitive.addStem(this.ctx, p, 60 + stem, 0, nominalW - 110 - stem, hStem, code, { rightTerminal: true });
        SerifPrimitive.addSerifs(this.ctx, p, 60, 0, stem, 'both', code);
        break;
      }
      case 'F': {
        nominalW = 520;
        StemPrimitive.addStem(this.ctx, p, 60, 0, stem, capH, code, { topTerminal: true, botTerminal: true });
        StemPrimitive.addStem(this.ctx, p, 60 + stem, capH - hStem, nominalW - 120 - stem, hStem, code, { rightTerminal: true });
        const midY = Math.round(capH * 0.50);
        StemPrimitive.addStem(this.ctx, p, 60 + stem, midY - hStem / 2, Math.round((nominalW - 150 - stem) * 0.85), hStem, code, { rightTerminal: true });
        SerifPrimitive.addSerifs(this.ctx, p, 60, 0, stem, 'bot', code);
        break;
      }
      case 'G': {
        nominalW = 600;
        RingPrimitive.addRing(this.ctx, p, 60, 0, nominalW - 120, capH, stem, hStem, code);
        const midY = Math.round(capH * 0.44);
        StemPrimitive.addStem(this.ctx, p, nominalW - 60 - stem, 0, stem, midY, code);
        StemPrimitive.addStem(this.ctx, p, Math.round(nominalW * 0.48), midY - hStem, Math.round(nominalW * 0.52 - 60), hStem, code);
        break;
      }
      case 'H': {
        nominalW = 620;
        StemPrimitive.addStem(this.ctx, p, 60, 0, stem, capH, code, { topTerminal: true, botTerminal: true });
        StemPrimitive.addStem(this.ctx, p, nominalW - 60 - stem, 0, stem, capH, code, { topTerminal: true, botTerminal: true });
        const midY = Math.round(capH * 0.50);
        StemPrimitive.addStem(this.ctx, p, 60 + stem, midY - hStem / 2, nominalW - 120 - stem * 2, hStem, code);
        SerifPrimitive.addSerifs(this.ctx, p, 60, 0, stem, 'both', code);
        SerifPrimitive.addSerifs(this.ctx, p, nominalW - 60 - stem, 0, stem, 'both', code);
        break;
      }
      case 'I': {
        nominalW = 340;
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, capH, code, { topTerminal: true, botTerminal: true });
        SerifPrimitive.addSerifs(this.ctx, p, cX, 0, stem, 'both', code);
        break;
      }
      case 'J': {
        nominalW = 420;
        const stemX = nominalW - 60 - stem;
        StemPrimitive.addStem(this.ctx, p, stemX, Math.round(capH * 0.22), stem, Math.round(capH * 0.78), code, { topTerminal: true });
        RingPrimitive.addRing(this.ctx, p, 60, 0, nominalW - 120, Math.round(capH * 0.48), stem, hStem, code);
        SerifPrimitive.addSerifs(this.ctx, p, stemX, 0, stem, 'top', code);
        break;
      }
      case 'K': {
        nominalW = 580;
        StemPrimitive.addStem(this.ctx, p, 60, 0, stem, capH, code, { topTerminal: true, botTerminal: true });
        const midY = Math.round(capH * 0.45);
        DiagonalPrimitive.addDiagonal(this.ctx, p, 60 + stem, midY, nominalW - 60, capH, stem, code, { isDownstroke: false });
        DiagonalPrimitive.addDiagonal(this.ctx, p, Math.round(nominalW * 0.46), Math.round(capH * 0.52), nominalW - 60, 0, stem, code, { isDownstroke: true });
        SerifPrimitive.addSerifs(this.ctx, p, 60, 0, stem, 'both', code);
        break;
      }
      case 'L': {
        nominalW = 480;
        StemPrimitive.addStem(this.ctx, p, 60, 0, stem, capH, code, { topTerminal: true, botTerminal: true });
        StemPrimitive.addStem(this.ctx, p, 60 + stem, 0, nominalW - 110 - stem, hStem, code, { rightTerminal: true });
        SerifPrimitive.addSerifs(this.ctx, p, 60, 0, stem, 'top', code);
        break;
      }
      case 'M': {
        nominalW = 720;
        StemPrimitive.addStem(this.ctx, p, 50, 0, stem, capH, code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 50 - stem, 0, stem, capH, code);
        const midX = nominalW / 2;
        DiagonalPrimitive.addDiagonal(this.ctx, p, 50 + stem, capH, midX, Math.round(capH * 0.15), stem, code, { isDownstroke: true });
        DiagonalPrimitive.addDiagonal(this.ctx, p, midX, Math.round(capH * 0.15), nominalW - 50 - stem, capH, stem, code, { isDownstroke: false });
        SerifPrimitive.addSerifs(this.ctx, p, 50, 0, stem, 'both', code);
        SerifPrimitive.addSerifs(this.ctx, p, nominalW - 50 - stem, 0, stem, 'both', code);
        break;
      }
      case 'N': {
        nominalW = 620;
        StemPrimitive.addStem(this.ctx, p, 60, 0, stem, capH, code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 60 - stem, 0, stem, capH, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, 60 + stem, capH, nominalW - 60 - stem, 0, stem, code, { isDownstroke: true });
        SerifPrimitive.addSerifs(this.ctx, p, 60, 0, stem, 'both', code);
        SerifPrimitive.addSerifs(this.ctx, p, nominalW - 60 - stem, 0, stem, 'both', code);
        break;
      }
      case 'O': {
        nominalW = 620;
        RingPrimitive.addRing(this.ctx, p, 60, 0, nominalW - 120, capH, stem, hStem, code);
        break;
      }
      case 'P': {
        nominalW = 560;
        StemPrimitive.addStem(this.ctx, p, 60, 0, stem, capH, code, { topTerminal: true, botTerminal: true });
        const midY = Math.round(capH * 0.45);
        RingPrimitive.addRing(this.ctx, p, 60 + stem, midY, nominalW - 110 - stem, capH - midY, stem, hStem, code);
        SerifPrimitive.addSerifs(this.ctx, p, 60, 0, stem, 'both', code);
        break;
      }
      case 'Q': {
        nominalW = 620;
        RingPrimitive.addRing(this.ctx, p, 60, 0, nominalW - 120, capH, stem, hStem, code);
        // Stylistic tail spur
        const tailX = Math.round(nominalW * 0.60);
        DiagonalPrimitive.addDiagonal(this.ctx, p, tailX, Math.round(capH * 0.25), nominalW - 20, -Math.round(capH * 0.12), stem, code);
        break;
      }
      case 'R': {
        nominalW = 580;
        StemPrimitive.addStem(this.ctx, p, 60, 0, stem, capH, code, { topTerminal: true, botTerminal: true });
        const midY = Math.round(capH * 0.48);
        RingPrimitive.addRing(this.ctx, p, 60 + stem, midY, nominalW - 120 - stem, capH - midY, stem, hStem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, 60 + stem, midY, nominalW - 60, 0, stem, code, { isDownstroke: true });
        SerifPrimitive.addSerifs(this.ctx, p, 60, 0, stem, 'both', code);
        break;
      }
      case 'S': {
        nominalW = 540;
        const midY = Math.round(capH * 0.50);
        RingPrimitive.addRing(this.ctx, p, 60, midY - hStem / 2, nominalW - 120, capH - midY + hStem / 2, stem, hStem, code);
        RingPrimitive.addRing(this.ctx, p, 60, 0, nominalW - 120, midY + hStem / 2, stem, hStem, code);
        break;
      }
      case 'T': {
        nominalW = 540;
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, capH - hStem, code, { botTerminal: true });
        StemPrimitive.addStem(this.ctx, p, 40, capH - hStem, nominalW - 80, hStem, code, { leftTerminal: true, rightTerminal: true });
        SerifPrimitive.addSerifs(this.ctx, p, cX, 0, stem, 'bot', code);
        break;
      }
      case 'U': {
        nominalW = 600;
        StemPrimitive.addStem(this.ctx, p, 60, Math.round(capH * 0.28), stem, Math.round(capH * 0.72), code, { topTerminal: true });
        StemPrimitive.addStem(this.ctx, p, nominalW - 60 - stem, Math.round(capH * 0.28), stem, Math.round(capH * 0.72), code, { topTerminal: true });
        RingPrimitive.addRing(this.ctx, p, 60, 0, nominalW - 120, Math.round(capH * 0.56), stem, hStem, code);
        SerifPrimitive.addSerifs(this.ctx, p, 60, 0, stem, 'top', code);
        SerifPrimitive.addSerifs(this.ctx, p, nominalW - 60 - stem, 0, stem, 'top', code);
        break;
      }
      case 'V': {
        nominalW = 600;
        const xCenter = nominalW / 2;
        DiagonalPrimitive.addApex(this.ctx, p, xCenter, 0, 50, capH, nominalW - 50 - stem, capH, stem, code);
        SerifPrimitive.addSerifs(this.ctx, p, 50, capH, stem, 'top', code);
        SerifPrimitive.addSerifs(this.ctx, p, nominalW - 50 - stem, capH, stem, 'top', code);
        break;
      }
      case 'W': {
        nominalW = 800;
        const q1 = Math.round(nominalW * 0.28);
        const q3 = Math.round(nominalW * 0.72);
        DiagonalPrimitive.addDiagonal(this.ctx, p, 50, capH, q1, 0, stem, code, { isDownstroke: true });
        DiagonalPrimitive.addDiagonal(this.ctx, p, q1, 0, nominalW / 2, capH, stem, code, { isDownstroke: false });
        DiagonalPrimitive.addDiagonal(this.ctx, p, nominalW / 2, capH, q3, 0, stem, code, { isDownstroke: true });
        DiagonalPrimitive.addDiagonal(this.ctx, p, q3, 0, nominalW - 50, capH, stem, code, { isDownstroke: false });
        break;
      }
      case 'X': {
        nominalW = 580;
        DiagonalPrimitive.addDiagonal(this.ctx, p, 60, capH, nominalW - 60, 0, stem, code, { isDownstroke: true });
        DiagonalPrimitive.addDiagonal(this.ctx, p, 60, 0, nominalW - 60, capH, stem, code, { isDownstroke: false });
        SerifPrimitive.addSerifs(this.ctx, p, 60, 0, stem, 'both', code);
        SerifPrimitive.addSerifs(this.ctx, p, nominalW - 60, 0, stem, 'both', code);
        break;
      }
      case 'Y': {
        nominalW = 580;
        const cX = Math.round((nominalW - stem) / 2);
        const midY = Math.round(capH * 0.46);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, midY, code, { botTerminal: true });
        DiagonalPrimitive.addDiagonal(this.ctx, p, 60, capH, cX + stem / 2, midY, stem, code, { isDownstroke: true });
        DiagonalPrimitive.addDiagonal(this.ctx, p, nominalW - 60, capH, cX + stem / 2, midY, stem, code, { isDownstroke: false });
        SerifPrimitive.addSerifs(this.ctx, p, cX, 0, stem, 'bot', code);
        break;
      }
      case 'Z': {
        nominalW = 540;
        StemPrimitive.addStem(this.ctx, p, 60, capH - hStem, nominalW - 120, hStem, code);
        StemPrimitive.addStem(this.ctx, p, 60, 0, nominalW - 120, hStem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, nominalW - 60, capH - hStem, 60, hStem, stem, code, { isDownstroke: true });
        break;
      }
    }

    return new Glyph({
      name: char,
      unicode: code,
      advanceWidth: this.ctx.getAdvanceWidth(nominalW),
      path: p,
    });
  }

  // =========================================================================
  // LOWERCASE GLYPHS (a - z)
  // =========================================================================
  private createLowercaseGlyph(char: string, code: number): Glyph {
    const p = new Path();
    const xH = this.ctx.xH;
    const asc = this.ctx.asc;
    const desc = this.ctx.desc;
    const stem = Math.round(this.ctx.stem * 0.92);
    const hStem = Math.round(this.ctx.hStem * 0.92);

    let nominalW = 480;

    switch (char) {
      case 'a': {
        nominalW = 500;
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100 - stem, xH, stem, hStem, code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 50 - stem, 0, stem, xH, code, { topTerminal: true, botTerminal: true });
        break;
      }
      case 'b': {
        nominalW = 520;
        StemPrimitive.addStem(this.ctx, p, 50, 0, stem, asc, code, { topTerminal: true, botTerminal: true });
        RingPrimitive.addRing(this.ctx, p, 50 + stem, 0, nominalW - 100 - stem, xH, stem, hStem, code);
        SerifPrimitive.addSerifs(this.ctx, p, 50, 0, stem, 'both', code);
        break;
      }
      case 'c': {
        nominalW = 460;
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, xH, stem, hStem, code);
        // Cut right aperture
        const cutH = Math.round(xH * 0.44);
        const cutY = Math.round((xH - cutH) / 2);
        const p1 = this.ctx.pt(nominalW / 2, cutY, code, 410);
        const p2 = this.ctx.pt(nominalW + 20, cutY, code, 411);
        const p3 = this.ctx.pt(nominalW + 20, cutY + cutH, code, 412);
        const p4 = this.ctx.pt(nominalW / 2, cutY + cutH, code, 413);
        p.moveTo(p1.x, p1.y);
        p.lineTo(p2.x, p2.y);
        p.lineTo(p3.x, p3.y);
        p.lineTo(p4.x, p4.y);
        p.close();
        break;
      }
      case 'd': {
        nominalW = 520;
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100 - stem, xH, stem, hStem, code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 50 - stem, 0, stem, asc, code, { topTerminal: true, botTerminal: true });
        SerifPrimitive.addSerifs(this.ctx, p, nominalW - 50 - stem, 0, stem, 'both', code);
        break;
      }
      case 'e': {
        nominalW = 480;
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, xH, stem, hStem, code);
        const barY = Math.round(xH * 0.48);
        StemPrimitive.addStem(this.ctx, p, 50, barY, nominalW - 100, hStem, code);
        break;
      }
      case 'f': {
        nominalW = 340;
        StemPrimitive.addStem(this.ctx, p, 70, 0, stem, asc - 40, code, { botTerminal: true });
        StemPrimitive.addStem(this.ctx, p, 70, asc - 40, Math.round(nominalW * 0.65), hStem, code, { rightTerminal: true });
        StemPrimitive.addStem(this.ctx, p, 30, xH - hStem, nominalW - 60, hStem, code);
        break;
      }
      case 'g': {
        nominalW = 500;
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100 - stem, xH, stem, hStem, code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 50 - stem, desc, stem, xH - desc, code, { botTerminal: true });
        StemPrimitive.addStem(this.ctx, p, 50, desc, nominalW - 100, hStem, code, { leftTerminal: true });
        break;
      }
      case 'h': {
        nominalW = 520;
        StemPrimitive.addStem(this.ctx, p, 50, 0, stem, asc, code, { topTerminal: true, botTerminal: true });
        RingPrimitive.addRing(this.ctx, p, 50 + stem, 0, nominalW - 100 - stem, xH, stem, hStem, code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 50 - stem, 0, stem, xH, code, { botTerminal: true });
        break;
      }
      case 'i': {
        nominalW = 280;
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, xH, code, { topTerminal: true, botTerminal: true });
        // Dot
        StemPrimitive.addStem(this.ctx, p, cX, xH + Math.round(xH * 0.22), stem, stem, code, { topTerminal: true, botTerminal: true });
        break;
      }
      case 'j': {
        nominalW = 300;
        const cX = Math.round(nominalW * 0.55);
        StemPrimitive.addStem(this.ctx, p, cX, desc + 40, stem, xH - desc - 40, code);
        RingPrimitive.addRing(this.ctx, p, 40, desc, cX + stem - 40, Math.round(xH * 0.50), stem, hStem, code);
        // Dot
        StemPrimitive.addStem(this.ctx, p, cX, xH + Math.round(xH * 0.22), stem, stem, code);
        break;
      }
      case 'k': {
        nominalW = 480;
        StemPrimitive.addStem(this.ctx, p, 50, 0, stem, asc, code, { topTerminal: true, botTerminal: true });
        const midY = Math.round(xH * 0.40);
        DiagonalPrimitive.addDiagonal(this.ctx, p, 50 + stem, midY, nominalW - 50, xH, stem, code, { isDownstroke: false });
        DiagonalPrimitive.addDiagonal(this.ctx, p, Math.round(nominalW * 0.45), Math.round(xH * 0.48), nominalW - 50, 0, stem, code, { isDownstroke: true });
        break;
      }
      case 'l': {
        nominalW = 280;
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, asc, code, { topTerminal: true, botTerminal: true });
        SerifPrimitive.addSerifs(this.ctx, p, cX, 0, stem, 'both', code);
        break;
      }
      case 'm': {
        nominalW = 720;
        StemPrimitive.addStem(this.ctx, p, 50, 0, stem, xH, code);
        const midX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, midX, 0, stem, xH, code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 50 - stem, 0, stem, xH, code);
        RingPrimitive.addRing(this.ctx, p, 50, 0, midX - 50 + stem, xH, stem, hStem, code);
        RingPrimitive.addRing(this.ctx, p, midX, 0, nominalW - 50 - midX, xH, stem, hStem, code);
        break;
      }
      case 'n': {
        nominalW = 520;
        StemPrimitive.addStem(this.ctx, p, 50, 0, stem, xH, code, { topTerminal: true, botTerminal: true });
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, xH, stem, hStem, code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 50 - stem, 0, stem, xH, code, { botTerminal: true });
        break;
      }
      case 'o': {
        nominalW = 500;
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, xH, stem, hStem, code);
        break;
      }
      case 'p': {
        nominalW = 520;
        StemPrimitive.addStem(this.ctx, p, 50, desc, stem, xH - desc, code, { topTerminal: true, botTerminal: true });
        RingPrimitive.addRing(this.ctx, p, 50 + stem, 0, nominalW - 100 - stem, xH, stem, hStem, code);
        break;
      }
      case 'q': {
        nominalW = 520;
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100 - stem, xH, stem, hStem, code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 50 - stem, desc, stem, xH - desc, code, { topTerminal: true, botTerminal: true });
        break;
      }
      case 'r': {
        nominalW = 380;
        StemPrimitive.addStem(this.ctx, p, 50, 0, stem, xH, code, { topTerminal: true, botTerminal: true });
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 70, xH, stem, hStem, code);
        // Cut out bottom loop to leave top shoulder
        const p1 = this.ctx.pt(50 + stem, 0, code, 420);
        const p2 = this.ctx.pt(nominalW, 0, code, 421);
        const p3 = this.ctx.pt(nominalW, Math.round(xH * 0.55), code, 422);
        const p4 = this.ctx.pt(50 + stem, Math.round(xH * 0.55), code, 423);
        p.moveTo(p1.x, p1.y);
        p.lineTo(p2.x, p2.y);
        p.lineTo(p3.x, p3.y);
        p.lineTo(p4.x, p4.y);
        p.close();
        break;
      }
      case 's': {
        nominalW = 440;
        const midY = Math.round(xH * 0.50);
        RingPrimitive.addRing(this.ctx, p, 50, midY - hStem / 2, nominalW - 100, xH - midY + hStem / 2, stem, hStem, code);
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, midY + hStem / 2, stem, hStem, code);
        break;
      }
      case 't': {
        nominalW = 360;
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, Math.round(asc * 0.85), code, { botTerminal: true });
        StemPrimitive.addStem(this.ctx, p, 30, xH - hStem, nominalW - 60, hStem, code);
        break;
      }
      case 'u': {
        nominalW = 500;
        StemPrimitive.addStem(this.ctx, p, 50, Math.round(xH * 0.35), stem, Math.round(xH * 0.65), code, { topTerminal: true });
        StemPrimitive.addStem(this.ctx, p, nominalW - 50 - stem, 0, stem, xH, code, { topTerminal: true, botTerminal: true });
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, Math.round(xH * 0.70), stem, hStem, code);
        break;
      }
      case 'v': {
        nominalW = 480;
        DiagonalPrimitive.addApex(this.ctx, p, nominalW / 2, 0, 40, xH, nominalW - 40 - stem, xH, stem, code);
        break;
      }
      case 'w': {
        nominalW = 680;
        const q1 = Math.round(nominalW * 0.28);
        const q3 = Math.round(nominalW * 0.72);
        DiagonalPrimitive.addDiagonal(this.ctx, p, 40, xH, q1, 0, stem, code, { isDownstroke: true });
        DiagonalPrimitive.addDiagonal(this.ctx, p, q1, 0, nominalW / 2, xH, stem, code, { isDownstroke: false });
        DiagonalPrimitive.addDiagonal(this.ctx, p, nominalW / 2, xH, q3, 0, stem, code, { isDownstroke: true });
        DiagonalPrimitive.addDiagonal(this.ctx, p, q3, 0, nominalW - 40, xH, stem, code, { isDownstroke: false });
        break;
      }
      case 'x': {
        nominalW = 460;
        DiagonalPrimitive.addDiagonal(this.ctx, p, 50, xH, nominalW - 50, 0, stem, code, { isDownstroke: true });
        DiagonalPrimitive.addDiagonal(this.ctx, p, 50, 0, nominalW - 50, xH, stem, code, { isDownstroke: false });
        break;
      }
      case 'y': {
        nominalW = 480;
        DiagonalPrimitive.addDiagonal(this.ctx, p, 40, xH, nominalW / 2, 0, stem, code, { isDownstroke: true });
        DiagonalPrimitive.addDiagonal(this.ctx, p, nominalW - 40, xH, 40, desc, stem, code, { isDownstroke: false });
        break;
      }
      case 'z': {
        nominalW = 440;
        StemPrimitive.addStem(this.ctx, p, 50, xH - hStem, nominalW - 100, hStem, code);
        StemPrimitive.addStem(this.ctx, p, 50, 0, nominalW - 100, hStem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, nominalW - 50, xH - hStem, 50, hStem, stem, code, { isDownstroke: true });
        break;
      }
    }

    return new Glyph({
      name: char,
      unicode: code,
      advanceWidth: this.ctx.getAdvanceWidth(nominalW),
      path: p,
    });
  }

  // =========================================================================
  // NUMERALS (0 - 9)
  // =========================================================================
  private createNumberGlyph(char: string, code: number): Glyph {
    const p = new Path();
    const capH = this.ctx.capH;
    const stem = this.ctx.stem;
    const hStem = this.ctx.hStem;
    let nominalW = 520;

    switch (char) {
      case '0': {
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, capH, stem, hStem, code);
        break;
      }
      case '1': {
        nominalW = 340;
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, capH, code, { botTerminal: true });
        StemPrimitive.addStem(this.ctx, p, cX - Math.round(stem * 0.8), capH - hStem, Math.round(stem * 0.8), hStem, code);
        SerifPrimitive.addSerifs(this.ctx, p, cX, 0, stem, 'bot', code);
        break;
      }
      case '2': {
        RingPrimitive.addRing(this.ctx, p, 50, Math.round(capH * 0.45), nominalW - 100, Math.round(capH * 0.55), stem, hStem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, nominalW - 50, Math.round(capH * 0.55), 50, 0, stem, code);
        StemPrimitive.addStem(this.ctx, p, 50, 0, nominalW - 100, hStem, code);
        break;
      }
      case '3': {
        const midY = Math.round(capH * 0.50);
        RingPrimitive.addRing(this.ctx, p, 50, midY, nominalW - 100, capH - midY, stem, hStem, code);
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, midY, stem, hStem, code);
        break;
      }
      case '4': {
        const barY = Math.round(capH * 0.35);
        const stemX = nominalW - 70 - stem;
        StemPrimitive.addStem(this.ctx, p, stemX, 0, stem, capH, code);
        StemPrimitive.addStem(this.ctx, p, 40, barY, nominalW - 80, hStem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, stemX, capH, 40, barY, stem, code);
        break;
      }
      case '5': {
        const midY = Math.round(capH * 0.52);
        StemPrimitive.addStem(this.ctx, p, 50, capH - hStem, nominalW - 100, hStem, code);
        StemPrimitive.addStem(this.ctx, p, 50, midY, stem, capH - midY, code);
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, midY + hStem / 2, stem, hStem, code);
        break;
      }
      case '6': {
        const midY = Math.round(capH * 0.55);
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, midY, stem, hStem, code);
        StemPrimitive.addStem(this.ctx, p, 50, 0, stem, capH, code, { topTerminal: true });
        StemPrimitive.addStem(this.ctx, p, 50, capH - hStem, nominalW - 140, hStem, code);
        break;
      }
      case '7': {
        StemPrimitive.addStem(this.ctx, p, 50, capH - hStem, nominalW - 100, hStem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, nominalW - 50, capH, nominalW * 0.35, 0, stem, code);
        break;
      }
      case '8': {
        const midY = Math.round(capH * 0.50);
        RingPrimitive.addRing(this.ctx, p, 60, midY, nominalW - 120, capH - midY, stem, hStem, code);
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, midY, stem, hStem, code);
        break;
      }
      case '9': {
        const midY = Math.round(capH * 0.45);
        RingPrimitive.addRing(this.ctx, p, 50, midY, nominalW - 100, capH - midY, stem, hStem, code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 50 - stem, 0, stem, capH, code, { botTerminal: true });
        StemPrimitive.addStem(this.ctx, p, 80, 0, nominalW - 130, hStem, code);
        break;
      }
    }

    return new Glyph({
      name: char,
      unicode: code,
      advanceWidth: this.ctx.getAdvanceWidth(nominalW),
      path: p,
    });
  }

  // =========================================================================
  // PUNCTUATION & SYMBOLS
  // =========================================================================
  private createPunctuationGlyph(char: string, code: number): Glyph {
    const p = new Path();
    const capH = this.ctx.capH;
    const stem = this.ctx.stem;
    const hStem = this.ctx.hStem;
    let nominalW = 280;

    switch (char) {
      case '.': {
        nominalW = 260;
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, stem, code);
        break;
      }
      case ',': {
        nominalW = 260;
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, stem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, cX + stem, stem / 2, cX - 10, -Math.round(stem * 0.8), stem * 0.6, code);
        break;
      }
      case '!': {
        nominalW = 280;
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, Math.round(capH * 0.28), stem, Math.round(capH * 0.72), code, { topTerminal: true, botTerminal: true });
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, stem, code);
        break;
      }
      case '?': {
        nominalW = 460;
        RingPrimitive.addRing(this.ctx, p, 50, Math.round(capH * 0.45), nominalW - 100, Math.round(capH * 0.55), stem, hStem, code);
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, Math.round(capH * 0.26), stem, Math.round(capH * 0.24), code);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, stem, code);
        break;
      }
      case ':': {
        nominalW = 260;
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, stem, code);
        StemPrimitive.addStem(this.ctx, p, cX, Math.round(this.ctx.xH * 0.7), stem, stem, code);
        break;
      }
      case ';': {
        nominalW = 260;
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, stem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, cX + stem, stem / 2, cX - 10, -Math.round(stem * 0.8), stem * 0.6, code);
        StemPrimitive.addStem(this.ctx, p, cX, Math.round(this.ctx.xH * 0.7), stem, stem, code);
        break;
      }
      case '-': {
        nominalW = 380;
        const midY = Math.round(this.ctx.xH * 0.50);
        StemPrimitive.addStem(this.ctx, p, 40, midY - hStem / 2, nominalW - 80, hStem, code);
        break;
      }
      case '_': {
        nominalW = 480;
        StemPrimitive.addStem(this.ctx, p, 20, 0, nominalW - 40, hStem, code);
        break;
      }
      case '+': {
        nominalW = 480;
        const midY = Math.round(this.ctx.xH * 0.50);
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, 40, midY - hStem / 2, nominalW - 80, hStem, code);
        StemPrimitive.addStem(this.ctx, p, cX, midY - (nominalW - 80) / 2, stem, nominalW - 80, code);
        break;
      }
      case '=': {
        nominalW = 480;
        const midY = Math.round(this.ctx.xH * 0.50);
        StemPrimitive.addStem(this.ctx, p, 40, midY + Math.round(hStem * 0.8), nominalW - 80, hStem, code);
        StemPrimitive.addStem(this.ctx, p, 40, midY - Math.round(hStem * 1.8), nominalW - 80, hStem, code);
        break;
      }
      case '/': {
        nominalW = 420;
        DiagonalPrimitive.addDiagonal(this.ctx, p, nominalW - 40, capH, 40, 0, stem, code);
        break;
      }
      case '(': {
        nominalW = 320;
        RingPrimitive.addRing(this.ctx, p, 40, -100, (nominalW - 80) * 2, capH + 200, stem, hStem, code);
        break;
      }
      case ')': {
        nominalW = 320;
        RingPrimitive.addRing(this.ctx, p, -(nominalW - 80), -100, (nominalW - 80) * 2, capH + 200, stem, hStem, code);
        break;
      }
      case "'": {
        nominalW = 220;
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, capH - Math.round(stem * 1.6), stem, Math.round(stem * 1.6), code);
        break;
      }
      case '"': {
        nominalW = 340;
        StemPrimitive.addStem(this.ctx, p, 60, capH - Math.round(stem * 1.6), stem, Math.round(stem * 1.6), code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 60 - stem, capH - Math.round(stem * 1.6), stem, Math.round(stem * 1.6), code);
        break;
      }
      case '@': {
        nominalW = 680;
        RingPrimitive.addRing(this.ctx, p, 40, 0, nominalW - 80, capH, stem, hStem, code);
        RingPrimitive.addRing(this.ctx, p, 160, Math.round(capH * 0.25), nominalW - 320, Math.round(capH * 0.50), stem * 0.8, hStem * 0.8, code);
        break;
      }
      case '#': {
        nominalW = 560;
        const c1 = Math.round(nominalW * 0.35);
        const c2 = Math.round(nominalW * 0.65);
        StemPrimitive.addStem(this.ctx, p, c1 - stem / 2, 0, stem, capH, code);
        StemPrimitive.addStem(this.ctx, p, c2 - stem / 2, 0, stem, capH, code);
        const b1 = Math.round(capH * 0.35);
        const b2 = Math.round(capH * 0.65);
        StemPrimitive.addStem(this.ctx, p, 30, b1 - hStem / 2, nominalW - 60, hStem, code);
        StemPrimitive.addStem(this.ctx, p, 30, b2 - hStem / 2, nominalW - 60, hStem, code);
        break;
      }
      case '$': {
        nominalW = 540;
        const midY = Math.round(capH * 0.50);
        RingPrimitive.addRing(this.ctx, p, 50, midY - hStem / 2, nominalW - 100, capH - midY + hStem / 2, stem, hStem, code);
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, midY + hStem / 2, stem, hStem, code);
        const cX = Math.round((nominalW - stem * 0.6) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, -40, stem * 0.6, capH + 80, code);
        break;
      }
      case '%': {
        nominalW = 620;
        DiagonalPrimitive.addDiagonal(this.ctx, p, nominalW - 50, capH, 50, 0, stem, code);
        RingPrimitive.addRing(this.ctx, p, 50, Math.round(capH * 0.55), Math.round(capH * 0.38), Math.round(capH * 0.38), stem * 0.7, hStem * 0.7, code);
        RingPrimitive.addRing(this.ctx, p, nominalW - 50 - Math.round(capH * 0.38), Math.round(capH * 0.08), Math.round(capH * 0.38), Math.round(capH * 0.38), stem * 0.7, hStem * 0.7, code);
        break;
      }
      case '&': {
        nominalW = 580;
        RingPrimitive.addRing(this.ctx, p, 60, Math.round(capH * 0.45), nominalW - 160, Math.round(capH * 0.55), stem, hStem, code);
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 120, Math.round(capH * 0.55), stem, hStem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, 60, 0, nominalW - 40, Math.round(capH * 0.45), stem, code);
        break;
      }
    }

    return new Glyph({
      name: char,
      unicode: code,
      advanceWidth: this.ctx.getAdvanceWidth(nominalW),
      path: p,
    });
  }

  // =========================================================================
  // DEVANAGARI SCRIPT
  // =========================================================================
  private generateDevanagariGlyphs(glyphs: Glyph[]): void {
    const capH = this.ctx.capH;
    const stem = this.ctx.stem;
    const hStem = this.ctx.hStem;

    // Unicode Range 0x0905 - 0x0939 (Devanagari Characters)
    const devanagariChars = [
      { code: 0x0905, name: 'dvA' }, // अ
      { code: 0x0906, name: 'dvAA' }, // आ
      { code: 0x0915, name: 'dvKA' }, // क
      { code: 0x0916, name: 'dvKHA' }, // ख
      { code: 0x0917, name: 'dvGA' }, // ग
      { code: 0x0918, name: 'dvGHA' }, // घ
      { code: 0x091a, name: 'dvCA' }, // च
      { code: 0x091c, name: 'dvJA' }, // ज
      { code: 0x0924, name: 'dvTA' }, // त
      { code: 0x0925, name: 'dvTHA' }, // थ
      { code: 0x0926, name: 'dvDA' }, // द
      { code: 0x0927, name: 'dvDHA' }, // ध
      { code: 0x0928, name: 'dvNA' }, // न
      { code: 0x092a, name: 'dvPA' }, // प
      { code: 0x092b, name: 'dvPHA' }, // फ
      { code: 0x092c, name: 'dvBA' }, // ब
      { code: 0x092d, name: 'dvBHA' }, // भ
      { code: 0x092e, name: 'dvMA' }, // म
      { code: 0x092f, name: 'dvYA' }, // य
      { code: 0x0930, name: 'dvRA' }, // र
      { code: 0x0932, name: 'dvLA' }, // ल
      { code: 0x0935, name: 'dvVA' }, // व
      { code: 0x0938, name: 'dvSA' }, // स
      { code: 0x0939, name: 'dvHA' }, // ह
    ];

    for (const d of devanagariChars) {
      const p = new Path();
      const nominalW = 600;

      // 1. Shirorekha (Top Hanging Headline)
      StemPrimitive.addStem(this.ctx, p, 30, capH - hStem, nominalW - 60, hStem, d.code);

      // 2. Main Right Vertical Stem (Kana / Kharā Danda)
      const stemX = nominalW - 60 - stem;
      StemPrimitive.addStem(this.ctx, p, stemX, 0, stem, capH - hStem, d.code);

      // 3. Left loop body
      RingPrimitive.addRing(this.ctx, p, 60, Math.round(capH * 0.15), nominalW - 120 - stem, Math.round(capH * 0.55), stem, hStem, d.code);

      glyphs.push(
        new Glyph({
          name: d.name,
          unicode: d.code,
          advanceWidth: this.ctx.getAdvanceWidth(nominalW),
          path: p,
        })
      );
    }
  }
}
