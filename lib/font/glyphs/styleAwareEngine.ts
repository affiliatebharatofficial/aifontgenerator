import { Path, Glyph } from 'opentype.js';
import type { FontSpecification } from '../specification/types';
import { GlyphGeometryContext } from './context';
import { StemPrimitive } from './primitives/StemPrimitive';
import { SerifPrimitive } from './primitives/SerifPrimitive';
import { RingPrimitive } from './primitives/RingPrimitive';
import { DiagonalPrimitive } from './primitives/DiagonalPrimitive';
import { LatinExtendedPrimitive } from './primitives/LatinExtendedPrimitive';
import { DevanagariPrimitive } from './primitives/DevanagariPrimitive';
import { CHARACTER_SETS } from '../character-set/registry';
import { DEVANAGARI_CONJUNCT_RULES } from '../shaping/devanagariShaper';



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

  /**
   * Sanitizes glyph commands, bounds, and metrics.
   * Rejects/corrects NaN, Infinity, and runaway values.
   */
  private sanitizeGlyph(glyph: Glyph): Glyph {
    // 1. Check path validity
    if (!glyph.path || glyph.path.commands.length === 0) {
      if (glyph.name !== 'space') {
        const p = new Path();
        const w = Math.max(120, glyph.advanceWidth || 500);
        const h = this.ctx.capH;
        StemPrimitive.addStem(this.ctx, p, 50, 0, 20, h, glyph.unicode || 0);
        StemPrimitive.addStem(this.ctx, p, w - 70, 0, 20, h, glyph.unicode || 0);
        glyph.path = p;
      }
    }

    // 2. Validate all command coordinates for NaN or Infinity
    if (glyph.path && glyph.path.commands) {
      for (const rawCmd of glyph.path.commands) {
        const cmd = rawCmd as Record<string, unknown>;
        if (typeof cmd.x === 'number' && (!Number.isFinite(cmd.x) || Number.isNaN(cmd.x))) cmd.x = 0;
        if (typeof cmd.y === 'number' && (!Number.isFinite(cmd.y) || Number.isNaN(cmd.y))) cmd.y = 0;
        if (typeof cmd.x1 === 'number' && (!Number.isFinite(cmd.x1) || Number.isNaN(cmd.x1))) cmd.x1 = 0;
        if (typeof cmd.y1 === 'number' && (!Number.isFinite(cmd.y1) || Number.isNaN(cmd.y1))) cmd.y1 = 0;
        if (typeof cmd.x2 === 'number' && (!Number.isFinite(cmd.x2) || Number.isNaN(cmd.x2))) cmd.x2 = 0;
        if (typeof cmd.y2 === 'number' && (!Number.isFinite(cmd.y2) || Number.isNaN(cmd.y2))) cmd.y2 = 0;
      }
    }

    // 3. Ensure advanceWidth is positive and finite
    const adv = glyph.advanceWidth;
    if (adv === undefined || !Number.isFinite(adv) || adv <= 0) {
      glyph.advanceWidth = this.ctx.getAdvanceWidth(500);
    }


    return glyph;
  }

  public generateGlyphs(): Glyph[] {
    const glyphs: Glyph[] = [];

    // 1. .notdef
    glyphs.push(this.createNotDefGlyph());

    // 2. Space (empty path with positive advance width)
    const spaceWidth = this.ctx.getAdvanceWidth(320, 'straight');
    glyphs.push(
      this.sanitizeGlyph(
        new Glyph({
          name: 'space',
          unicode: 32,
          advanceWidth: spaceWidth,
          path: new Path(),
        })
      )
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
        { char: '\\', code: 92 },
        { char: '(', code: 40 },
        { char: ')', code: 41 },
        { char: '[', code: 91 },
        { char: ']', code: 93 },
        { char: '{', code: 123 },
        { char: '}', code: 125 },
        { char: "'", code: 39 },
        { char: '"', code: 34 },
        { char: '@', code: 64 },
        { char: '#', code: 35 },
        { char: '$', code: 36 },
        { char: '%', code: 37 },
        { char: '&', code: 38 },
        { char: '*', code: 42 },
        { char: '<', code: 60 },
        { char: '>', code: 62 },
        { char: '~', code: 126 },
      ];
      puncts.forEach((p) => {
        glyphs.push(this.createPunctuationGlyph(p.char, p.code));
      });
    }

    // 7. Latin Extended Accented Glyphs (French, German, Spanish, Portuguese, Italian, Polish, Czech, Turkish, etc.)
    this.generateLatinExtendedGlyphs(glyphs);

    // 8. Devanagari script if enabled
    const isDevanagari =
      (this.ctx.dna.styleFamily as string) === 'DEVANAGARI' ||
      this.spec.characterSet.devanagari === true ||
      (this.spec.category || '').toLowerCase() === 'devanagari' ||
      (this.spec.designDescription || '').toLowerCase().includes('hindi') ||
      (this.spec.designDescription || '').toLowerCase().includes('devanagari');

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

    return this.sanitizeGlyph(
      new Glyph({
        name: '.notdef',
        unicode: 0,
        advanceWidth: this.ctx.getAdvanceWidth(w, 'straight'),
        path: p,
      })
    );
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
    let shape: 'straight' | 'round' | 'diagonal_left' | 'diagonal_right' | 'open_right' | 'open_left' | 'narrow' | 'wide' = 'straight';

    switch (char) {
      case 'A': {
        nominalW = 620;
        shape = 'diagonal_left';
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
        shape = 'open_right';
        StemPrimitive.addStem(this.ctx, p, 60, 0, stem, capH, code, { topTerminal: true, botTerminal: true });
        const midY = Math.round(capH * 0.50);
        RingPrimitive.addRing(this.ctx, p, 60 + stem, midY, nominalW - 120 - stem, capH - midY, stem, hStem, code);
        RingPrimitive.addRing(this.ctx, p, 60 + stem, 0, nominalW - 100 - stem, midY, stem, hStem, code);
        SerifPrimitive.addSerifs(this.ctx, p, 60, 0, stem, 'both', code);
        break;
      }
      case 'C': {
        nominalW = 580;
        shape = 'open_right';
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
        shape = 'round';
        StemPrimitive.addStem(this.ctx, p, 60, 0, stem, capH, code, { topTerminal: true, botTerminal: true });
        RingPrimitive.addRing(this.ctx, p, 60, 0, nominalW - 100, capH, stem, hStem, code);
        SerifPrimitive.addSerifs(this.ctx, p, 60, 0, stem, 'both', code);
        break;
      }
      case 'E': {
        nominalW = 540;
        shape = 'open_right';
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
        shape = 'open_right';
        StemPrimitive.addStem(this.ctx, p, 60, 0, stem, capH, code, { topTerminal: true, botTerminal: true });
        StemPrimitive.addStem(this.ctx, p, 60 + stem, capH - hStem, nominalW - 120 - stem, hStem, code, { rightTerminal: true });
        const midY = Math.round(capH * 0.50);
        StemPrimitive.addStem(this.ctx, p, 60 + stem, midY - hStem / 2, Math.round((nominalW - 150 - stem) * 0.85), hStem, code, { rightTerminal: true });
        SerifPrimitive.addSerifs(this.ctx, p, 60, 0, stem, 'bot', code);
        break;
      }
      case 'G': {
        nominalW = 600;
        shape = 'round';
        RingPrimitive.addRing(this.ctx, p, 60, 0, nominalW - 120, capH, stem, hStem, code);
        const midY = Math.round(capH * 0.44);
        StemPrimitive.addStem(this.ctx, p, nominalW - 60 - stem, 0, stem, midY, code);
        StemPrimitive.addStem(this.ctx, p, Math.round(nominalW * 0.48), midY - hStem, Math.round(nominalW * 0.52 - 60), hStem, code);
        break;
      }
      case 'H': {
        nominalW = 620;
        shape = 'straight';
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
        shape = 'narrow';
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, capH, code, { topTerminal: true, botTerminal: true });
        SerifPrimitive.addSerifs(this.ctx, p, cX, 0, stem, 'both', code);
        break;
      }
      case 'J': {
        nominalW = 440;
        shape = 'open_left';
        const cX = nominalW - 60 - stem;
        StemPrimitive.addStem(this.ctx, p, cX, Math.round(capH * 0.25), stem, Math.round(capH * 0.75), code, { topTerminal: true });
        RingPrimitive.addRing(this.ctx, p, 60, 0, cX + stem - 60, Math.round(capH * 0.50), stem, hStem, code);
        SerifPrimitive.addSerifs(this.ctx, p, cX, capH, stem, 'top', code);
        break;
      }
      case 'K': {
        nominalW = 580;
        shape = 'open_right';
        StemPrimitive.addStem(this.ctx, p, 60, 0, stem, capH, code, { topTerminal: true, botTerminal: true });
        const midY = Math.round(capH * 0.44);
        DiagonalPrimitive.addDiagonal(this.ctx, p, 60 + stem, midY, nominalW - 60, capH, stem, code, { isDownstroke: false });
        DiagonalPrimitive.addDiagonal(this.ctx, p, Math.round(nominalW * 0.45), Math.round(capH * 0.50), nominalW - 60, 0, stem, code, { isDownstroke: true });
        SerifPrimitive.addSerifs(this.ctx, p, 60, 0, stem, 'both', code);
        break;
      }
      case 'L': {
        nominalW = 480;
        shape = 'open_right';
        StemPrimitive.addStem(this.ctx, p, 60, 0, stem, capH, code, { topTerminal: true, botTerminal: true });
        StemPrimitive.addStem(this.ctx, p, 60 + stem, 0, nominalW - 120 - stem, hStem, code, { rightTerminal: true });
        SerifPrimitive.addSerifs(this.ctx, p, 60, capH, stem, 'top', code);
        SerifPrimitive.addSerifs(this.ctx, p, nominalW - 60, 0, stem, 'bot-right', code);
        break;
      }
      case 'M': {
        nominalW = 720;
        shape = 'wide';
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
        shape = 'straight';
        StemPrimitive.addStem(this.ctx, p, 60, 0, stem, capH, code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 60 - stem, 0, stem, capH, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, 60, capH, nominalW - 60, 0, stem, code, { isDownstroke: true });
        SerifPrimitive.addSerifs(this.ctx, p, 60, 0, stem, 'both', code);
        SerifPrimitive.addSerifs(this.ctx, p, nominalW - 60 - stem, 0, stem, 'both', code);
        break;
      }
      case 'O': {
        nominalW = 620;
        shape = 'round';
        RingPrimitive.addRing(this.ctx, p, 60, 0, nominalW - 120, capH, stem, hStem, code);
        break;
      }
      case 'P': {
        nominalW = 560;
        shape = 'open_right';
        StemPrimitive.addStem(this.ctx, p, 60, 0, stem, capH, code, { topTerminal: true, botTerminal: true });
        const midY = Math.round(capH * 0.45);
        RingPrimitive.addRing(this.ctx, p, 60 + stem, midY, nominalW - 120 - stem, capH - midY, stem, hStem, code);
        SerifPrimitive.addSerifs(this.ctx, p, 60, 0, stem, 'both', code);
        break;
      }
      case 'Q': {
        nominalW = 620;
        shape = 'round';
        RingPrimitive.addRing(this.ctx, p, 60, 0, nominalW - 120, capH, stem, hStem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, Math.round(nominalW * 0.48), Math.round(capH * 0.25), nominalW - 30, -Math.round(capH * 0.12), stem, code, { isDownstroke: true });
        break;
      }
      case 'R': {
        nominalW = 580;
        shape = 'open_right';
        StemPrimitive.addStem(this.ctx, p, 60, 0, stem, capH, code, { topTerminal: true, botTerminal: true });
        const midY = Math.round(capH * 0.50);
        RingPrimitive.addRing(this.ctx, p, 60 + stem, midY, nominalW - 120 - stem, capH - midY, stem, hStem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, Math.round(nominalW * 0.45), midY, nominalW - 60, 0, stem, code, { isDownstroke: true });
        SerifPrimitive.addSerifs(this.ctx, p, 60, 0, stem, 'both', code);
        break;
      }
      case 'S': {
        nominalW = 540;
        shape = 'round';
        const midY = Math.round(capH * 0.50);
        RingPrimitive.addRing(this.ctx, p, 60, midY - hStem / 2, nominalW - 120, capH - midY + hStem / 2, stem, hStem, code);
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, midY + hStem / 2, stem, hStem, code);
        break;
      }
      case 'T': {
        nominalW = 560;
        shape = 'diagonal_right';
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, capH - hStem, code, { botTerminal: true });
        StemPrimitive.addStem(this.ctx, p, 40, capH - hStem, nominalW - 80, hStem, code, { leftTerminal: true, rightTerminal: true });
        SerifPrimitive.addSerifs(this.ctx, p, cX, 0, stem, 'bot', code);
        break;
      }
      case 'U': {
        nominalW = 600;
        shape = 'round';
        const curveH = Math.round(capH * 0.40);
        StemPrimitive.addStem(this.ctx, p, 60, curveH, stem, capH - curveH, code, { topTerminal: true });
        StemPrimitive.addStem(this.ctx, p, nominalW - 60 - stem, curveH, stem, capH - curveH, code, { topTerminal: true });
        RingPrimitive.addRing(this.ctx, p, 60, 0, nominalW - 120, curveH * 2, stem, hStem, code);
        SerifPrimitive.addSerifs(this.ctx, p, 60, capH, stem, 'top', code);
        SerifPrimitive.addSerifs(this.ctx, p, nominalW - 60 - stem, capH, stem, 'top', code);
        break;
      }
      case 'V': {
        nominalW = 600;
        shape = 'diagonal_right';
        const xCenter = nominalW / 2;
        DiagonalPrimitive.addDiagonal(this.ctx, p, 50, capH, xCenter, 0, stem, code, { isDownstroke: true });
        DiagonalPrimitive.addDiagonal(this.ctx, p, xCenter, 0, nominalW - 50, capH, stem, code, { isDownstroke: false });
        SerifPrimitive.addSerifs(this.ctx, p, 50, capH, stem, 'top', code);
        SerifPrimitive.addSerifs(this.ctx, p, nominalW - 50, capH, stem, 'top', code);
        break;
      }
      case 'W': {
        nominalW = 800;
        shape = 'wide';
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
        shape = 'diagonal_right';
        DiagonalPrimitive.addDiagonal(this.ctx, p, 60, capH, nominalW - 60, 0, stem, code, { isDownstroke: true });
        DiagonalPrimitive.addDiagonal(this.ctx, p, 60, 0, nominalW - 60, capH, stem, code, { isDownstroke: false });
        SerifPrimitive.addSerifs(this.ctx, p, 60, 0, stem, 'both', code);
        SerifPrimitive.addSerifs(this.ctx, p, nominalW - 60, 0, stem, 'both', code);
        break;
      }
      case 'Y': {
        nominalW = 580;
        shape = 'diagonal_right';
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
        shape = 'straight';
        StemPrimitive.addStem(this.ctx, p, 60, capH - hStem, nominalW - 120, hStem, code);
        StemPrimitive.addStem(this.ctx, p, 60, 0, nominalW - 120, hStem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, nominalW - 60, capH - hStem, 60, hStem, stem, code, { isDownstroke: true });
        break;
      }
    }

    return this.sanitizeGlyph(
      new Glyph({
        name: char,
        unicode: code,
        advanceWidth: this.ctx.getAdvanceWidth(nominalW, shape),
        path: p,
      })
    );
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
    let shape: 'straight' | 'round' | 'diagonal_left' | 'diagonal_right' | 'open_right' | 'open_left' | 'narrow' | 'wide' = 'straight';

    switch (char) {
      case 'a': {
        const isTwoStory =
          this.ctx.dna.styleFamily === 'DIDONE_SERIF' ||
          this.ctx.dna.styleFamily === 'SERIF' ||
          this.ctx.dna.styleFamily === 'SLAB_SERIF' ||
          this.ctx.dna.styleFamily === 'GROTESK';
        shape = 'round';
        if (isTwoStory) {
          nominalW = 500;
          StemPrimitive.addStem(this.ctx, p, 50, xH - hStem, nominalW - 100, hStem, code, { leftTerminal: true });
          StemPrimitive.addStem(this.ctx, p, nominalW - 50 - stem, Math.round(xH * 0.4), stem, Math.round(xH * 0.6), code);
          const bowlH = Math.round(xH * 0.58);
          RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100 - stem, bowlH, stem, hStem, code);
          StemPrimitive.addStem(this.ctx, p, nominalW - 50 - stem, 0, stem, bowlH, code, { botTerminal: true });
        } else {
          nominalW = 480;
          RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100 - stem, xH, stem, hStem, code);
          StemPrimitive.addStem(this.ctx, p, nominalW - 50 - stem, 0, stem, xH, code, { topTerminal: true, botTerminal: true });
        }
        break;
      }
      case 'b': {
        nominalW = 520;
        shape = 'straight';
        StemPrimitive.addStem(this.ctx, p, 50, 0, stem, asc, code, { topTerminal: true, botTerminal: true });
        RingPrimitive.addRing(this.ctx, p, 50 + stem, 0, nominalW - 100 - stem, xH, stem, hStem, code);
        SerifPrimitive.addSerifs(this.ctx, p, 50, 0, stem, 'both', code);
        break;
      }
      case 'c': {
        nominalW = 460;
        shape = 'open_right';
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, xH, stem, hStem, code);
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
        shape = 'round';
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100 - stem, xH, stem, hStem, code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 50 - stem, 0, stem, asc, code, { topTerminal: true, botTerminal: true });
        SerifPrimitive.addSerifs(this.ctx, p, nominalW - 50 - stem, 0, stem, 'both', code);
        break;
      }
      case 'e': {
        nominalW = 480;
        shape = 'round';
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, xH, stem, hStem, code);
        const barY = Math.round(xH * 0.48);
        StemPrimitive.addStem(this.ctx, p, 50, barY, nominalW - 100, hStem, code);
        break;
      }
      case 'f': {
        nominalW = 340;
        shape = 'narrow';
        StemPrimitive.addStem(this.ctx, p, 70, 0, stem, asc - 40, code, { botTerminal: true });
        StemPrimitive.addStem(this.ctx, p, 70, asc - 40, Math.round(nominalW * 0.65), hStem, code, { rightTerminal: true });
        StemPrimitive.addStem(this.ctx, p, 30, xH - hStem, nominalW - 60, hStem, code);
        break;
      }
      case 'g': {
        const isDoubleStory = this.ctx.dna.styleFamily === 'DIDONE_SERIF' || this.ctx.dna.styleFamily === 'SERIF';
        shape = 'round';
        if (isDoubleStory) {
          nominalW = 520;
          const upperH = Math.round(xH * 0.55);
          RingPrimitive.addRing(this.ctx, p, 60, xH - upperH, nominalW - 120, upperH, stem, hStem, code);
          StemPrimitive.addStem(this.ctx, p, nominalW - 60, xH - hStem, 30, hStem, code, { rightTerminal: true });
          const lowerH = Math.round(-desc * 0.85);
          RingPrimitive.addRing(this.ctx, p, 50, desc + 20, nominalW - 100, lowerH, stem, hStem, code);
          StemPrimitive.addStem(this.ctx, p, Math.round(nominalW * 0.6), desc + lowerH, Math.round(stem * 0.8), xH - upperH - (desc + lowerH), code);
        } else {
          nominalW = 500;
          RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100 - stem, xH, stem, hStem, code);
          StemPrimitive.addStem(this.ctx, p, nominalW - 50 - stem, desc, stem, xH - desc, code, { botTerminal: true });
          StemPrimitive.addStem(this.ctx, p, 50, desc, nominalW - 100, hStem, code, { leftTerminal: true });
        }
        break;
      }
      case 'h': {
        nominalW = 520;
        shape = 'straight';
        StemPrimitive.addStem(this.ctx, p, 50, 0, stem, asc, code, { topTerminal: true, botTerminal: true });
        RingPrimitive.addRing(this.ctx, p, 50 + stem, 0, nominalW - 100 - stem, xH, stem, hStem, code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 50 - stem, 0, stem, xH, code, { botTerminal: true });
        break;
      }
      case 'i': {
        nominalW = 280;
        shape = 'narrow';
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, xH, code, { topTerminal: true, botTerminal: true });
        StemPrimitive.addStem(this.ctx, p, cX, xH + Math.round(xH * 0.22), stem, stem, code, { topTerminal: true, botTerminal: true });
        break;
      }
      case 'j': {
        nominalW = 300;
        shape = 'narrow';
        const cX = Math.round(nominalW * 0.55);
        StemPrimitive.addStem(this.ctx, p, cX, desc + 40, stem, xH - desc - 40, code);
        RingPrimitive.addRing(this.ctx, p, 40, desc, cX + stem - 40, Math.round(xH * 0.5), stem, hStem, code);
        StemPrimitive.addStem(this.ctx, p, cX, xH + Math.round(xH * 0.22), stem, stem, code);
        break;
      }
      case 'k': {
        nominalW = 480;
        shape = 'open_right';
        StemPrimitive.addStem(this.ctx, p, 50, 0, stem, asc, code, { topTerminal: true, botTerminal: true });
        const midY = Math.round(xH * 0.4);
        DiagonalPrimitive.addDiagonal(this.ctx, p, 50 + stem, midY, nominalW - 50, xH, stem, code, { isDownstroke: false });
        DiagonalPrimitive.addDiagonal(this.ctx, p, Math.round(nominalW * 0.45), Math.round(xH * 0.48), nominalW - 50, 0, stem, code, { isDownstroke: true });
        break;
      }
      case 'l': {
        nominalW = 280;
        shape = 'narrow';
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, asc, code, { topTerminal: true, botTerminal: true });
        SerifPrimitive.addSerifs(this.ctx, p, cX, 0, stem, 'both', code);
        break;
      }
      case 'm': {
        nominalW = 720;
        shape = 'wide';
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
        shape = 'straight';
        StemPrimitive.addStem(this.ctx, p, 50, 0, stem, xH, code, { topTerminal: true, botTerminal: true });
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, xH, stem, hStem, code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 50 - stem, 0, stem, xH, code, { botTerminal: true });
        break;
      }
      case 'o': {
        nominalW = 500;
        shape = 'round';
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, xH, stem, hStem, code);
        break;
      }
      case 'p': {
        nominalW = 520;
        shape = 'straight';
        StemPrimitive.addStem(this.ctx, p, 50, desc, stem, xH - desc, code, { topTerminal: true, botTerminal: true });
        RingPrimitive.addRing(this.ctx, p, 50 + stem, 0, nominalW - 100 - stem, xH, stem, hStem, code);
        break;
      }
      case 'q': {
        nominalW = 520;
        shape = 'round';
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100 - stem, xH, stem, hStem, code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 50 - stem, desc, stem, xH - desc, code, { topTerminal: true, botTerminal: true });
        break;
      }
      case 'r': {
        nominalW = 380;
        shape = 'open_right';
        StemPrimitive.addStem(this.ctx, p, 50, 0, stem, xH, code, { topTerminal: true, botTerminal: true });
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 70, xH, stem, hStem, code);
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
        shape = 'round';
        const midY = Math.round(xH * 0.5);
        RingPrimitive.addRing(this.ctx, p, 50, midY - hStem / 2, nominalW - 100, xH - midY + hStem / 2, stem, hStem, code);
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, midY + hStem / 2, stem, hStem, code);
        break;
      }
      case 't': {
        nominalW = 360;
        shape = 'narrow';
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, Math.round(asc * 0.85), code, { botTerminal: true });
        StemPrimitive.addStem(this.ctx, p, 30, xH - hStem, nominalW - 60, hStem, code);
        break;
      }
      case 'u': {
        nominalW = 500;
        shape = 'round';
        const curveH = Math.round(xH * 0.4);
        StemPrimitive.addStem(this.ctx, p, 50, curveH, stem, xH - curveH, code, { topTerminal: true });
        StemPrimitive.addStem(this.ctx, p, nominalW - 50 - stem, 0, stem, xH, code, { topTerminal: true, botTerminal: true });
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, curveH * 2, stem, hStem, code);
        break;
      }
      case 'v': {
        nominalW = 500;
        shape = 'diagonal_right';
        const xCenter = nominalW / 2;
        DiagonalPrimitive.addDiagonal(this.ctx, p, 40, xH, xCenter, 0, stem, code, { isDownstroke: true });
        DiagonalPrimitive.addDiagonal(this.ctx, p, xCenter, 0, nominalW - 40, xH, stem, code, { isDownstroke: false });
        break;
      }
      case 'w': {
        nominalW = 680;
        shape = 'wide';
        const q1 = Math.round(nominalW * 0.28);
        const q3 = Math.round(nominalW * 0.72);
        DiagonalPrimitive.addDiagonal(this.ctx, p, 40, xH, q1, 0, stem, code, { isDownstroke: true });
        DiagonalPrimitive.addDiagonal(this.ctx, p, q1, 0, nominalW / 2, xH, stem, code, { isDownstroke: false });
        DiagonalPrimitive.addDiagonal(this.ctx, p, nominalW / 2, xH, q3, 0, stem, code, { isDownstroke: true });
        DiagonalPrimitive.addDiagonal(this.ctx, p, q3, 0, nominalW - 40, xH, stem, code, { isDownstroke: false });
        break;
      }
      case 'x': {
        nominalW = 480;
        shape = 'diagonal_right';
        DiagonalPrimitive.addDiagonal(this.ctx, p, 50, xH, nominalW - 50, 0, stem, code, { isDownstroke: true });
        DiagonalPrimitive.addDiagonal(this.ctx, p, 50, 0, nominalW - 50, xH, stem, code, { isDownstroke: false });
        break;
      }
      case 'y': {
        nominalW = 500;
        shape = 'diagonal_right';
        const xCenter = nominalW / 2;
        DiagonalPrimitive.addDiagonal(this.ctx, p, 40, xH, xCenter, 0, stem, code, { isDownstroke: true });
        DiagonalPrimitive.addDiagonal(this.ctx, p, nominalW - 40, xH, 40, desc, stem, code, { isDownstroke: false });
        break;
      }
      case 'z': {
        nominalW = 440;
        shape = 'straight';
        StemPrimitive.addStem(this.ctx, p, 50, xH - hStem, nominalW - 100, hStem, code);
        StemPrimitive.addStem(this.ctx, p, 50, 0, nominalW - 100, hStem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, nominalW - 50, xH - hStem, 50, hStem, stem, code, { isDownstroke: true });
        break;
      }
    }

    return this.sanitizeGlyph(
      new Glyph({
        name: char,
        unicode: code,
        advanceWidth: this.ctx.getAdvanceWidth(nominalW, shape),
        path: p,
      })
    );
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
    let shape: 'straight' | 'round' | 'diagonal_left' | 'diagonal_right' | 'open_right' | 'open_left' | 'narrow' | 'wide' = 'straight';

    switch (char) {
      case '0': {
        shape = 'round';
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, capH, stem, hStem, code);
        break;
      }
      case '1': {
        nominalW = 340;
        shape = 'narrow';
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, capH, code, { botTerminal: true });
        StemPrimitive.addStem(this.ctx, p, cX - Math.round(stem * 0.8), capH - hStem, Math.round(stem * 0.8), hStem, code);
        SerifPrimitive.addSerifs(this.ctx, p, cX, 0, stem, 'bot', code);
        break;
      }
      case '2': {
        shape = 'straight';
        RingPrimitive.addRing(this.ctx, p, 50, Math.round(capH * 0.45), nominalW - 100, Math.round(capH * 0.55), stem, hStem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, nominalW - 50, Math.round(capH * 0.55), 50, 0, stem, code);
        StemPrimitive.addStem(this.ctx, p, 50, 0, nominalW - 100, hStem, code);
        break;
      }
      case '3': {
        shape = 'round';
        const midY = Math.round(capH * 0.5);
        RingPrimitive.addRing(this.ctx, p, 50, midY, nominalW - 100, capH - midY, stem, hStem, code);
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, midY, stem, hStem, code);
        break;
      }
      case '4': {
        shape = 'straight';
        const barY = Math.round(capH * 0.35);
        const stemX = nominalW - 70 - stem;
        StemPrimitive.addStem(this.ctx, p, stemX, 0, stem, capH, code);
        StemPrimitive.addStem(this.ctx, p, 40, barY, nominalW - 80, hStem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, stemX, capH, 40, barY, stem, code);
        break;
      }
      case '5': {
        shape = 'round';
        const midY = Math.round(capH * 0.52);
        StemPrimitive.addStem(this.ctx, p, 50, capH - hStem, nominalW - 100, hStem, code);
        StemPrimitive.addStem(this.ctx, p, 50, midY, stem, capH - midY, code);
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, midY + hStem / 2, stem, hStem, code);
        break;
      }
      case '6': {
        shape = 'round';
        const midY = Math.round(capH * 0.55);
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, midY, stem, hStem, code);
        StemPrimitive.addStem(this.ctx, p, 50, 0, stem, capH, code, { topTerminal: true });
        StemPrimitive.addStem(this.ctx, p, 50, capH - hStem, nominalW - 140, hStem, code);
        break;
      }
      case '7': {
        shape = 'straight';
        StemPrimitive.addStem(this.ctx, p, 50, capH - hStem, nominalW - 100, hStem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, nominalW - 50, capH, nominalW * 0.35, 0, stem, code);
        break;
      }
      case '8': {
        shape = 'round';
        const midY = Math.round(capH * 0.5);
        RingPrimitive.addRing(this.ctx, p, 60, midY, nominalW - 120, capH - midY, stem, hStem, code);
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, midY, stem, hStem, code);
        break;
      }
      case '9': {
        shape = 'round';
        const midY = Math.round(capH * 0.45);
        RingPrimitive.addRing(this.ctx, p, 50, midY, nominalW - 100, capH - midY, stem, hStem, code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 50 - stem, 0, stem, capH, code, { botTerminal: true });
        StemPrimitive.addStem(this.ctx, p, 80, 0, nominalW - 130, hStem, code);
        break;
      }
    }

    return this.sanitizeGlyph(
      new Glyph({
        name: char,
        unicode: code,
        advanceWidth: this.ctx.getAdvanceWidth(nominalW, shape),
        path: p,
      })
    );
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
    let shape: 'straight' | 'round' | 'diagonal_left' | 'diagonal_right' | 'open_right' | 'open_left' | 'narrow' | 'wide' = 'straight';

    switch (char) {
      case '.': {
        nominalW = 260;
        shape = 'narrow';
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, stem, code);
        break;
      }
      case ',': {
        nominalW = 260;
        shape = 'narrow';
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, stem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, cX + stem, stem / 2, cX - 10, -Math.round(stem * 0.8), stem * 0.6, code);
        break;
      }
      case '!': {
        nominalW = 280;
        shape = 'narrow';
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, Math.round(capH * 0.28), stem, Math.round(capH * 0.72), code, { topTerminal: true, botTerminal: true });
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, stem, code);
        break;
      }
      case '?': {
        nominalW = 460;
        shape = 'round';
        RingPrimitive.addRing(this.ctx, p, 50, Math.round(capH * 0.45), nominalW - 100, Math.round(capH * 0.55), stem, hStem, code);
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, Math.round(capH * 0.26), stem, Math.round(capH * 0.24), code);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, stem, code);
        break;
      }
      case ':': {
        nominalW = 260;
        shape = 'narrow';
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, stem, code);
        StemPrimitive.addStem(this.ctx, p, cX, Math.round(this.ctx.xH * 0.7), stem, stem, code);
        break;
      }
      case ';': {
        nominalW = 260;
        shape = 'narrow';
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, 0, stem, stem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, cX + stem, stem / 2, cX - 10, -Math.round(stem * 0.8), stem * 0.6, code);
        StemPrimitive.addStem(this.ctx, p, cX, Math.round(this.ctx.xH * 0.7), stem, stem, code);
        break;
      }
      case '-': {
        nominalW = 380;
        const midY = Math.round(this.ctx.xH * 0.5);
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
        const midY = Math.round(this.ctx.xH * 0.5);
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, 40, midY - hStem / 2, nominalW - 80, hStem, code);
        StemPrimitive.addStem(this.ctx, p, cX, midY - (nominalW - 80) / 2, stem, nominalW - 80, code);
        break;
      }
      case '=': {
        nominalW = 480;
        const midY = Math.round(this.ctx.xH * 0.5);
        StemPrimitive.addStem(this.ctx, p, 40, midY + Math.round(hStem * 0.8), nominalW - 80, hStem, code);
        StemPrimitive.addStem(this.ctx, p, 40, midY - Math.round(hStem * 1.8), nominalW - 80, hStem, code);
        break;
      }
      case '/': {
        nominalW = 420;
        DiagonalPrimitive.addDiagonal(this.ctx, p, nominalW - 40, capH, 40, 0, stem, code);
        break;
      }
      case '\\': {
        nominalW = 420;
        DiagonalPrimitive.addDiagonal(this.ctx, p, 40, capH, nominalW - 40, 0, stem, code);
        break;
      }
      case '(': {
        nominalW = 320;
        shape = 'narrow';
        RingPrimitive.addRing(this.ctx, p, 40, -100, (nominalW - 80) * 2, capH + 200, stem, hStem, code);
        break;
      }
      case ')': {
        nominalW = 320;
        shape = 'narrow';
        RingPrimitive.addRing(this.ctx, p, -(nominalW - 80), -100, (nominalW - 80) * 2, capH + 200, stem, hStem, code);
        break;
      }
      case '[': {
        nominalW = 320;
        shape = 'narrow';
        StemPrimitive.addStem(this.ctx, p, 60, -40, stem, capH + 80, code);
        StemPrimitive.addStem(this.ctx, p, 60, capH + 40 - hStem, nominalW - 120, hStem, code);
        StemPrimitive.addStem(this.ctx, p, 60, -40, nominalW - 120, hStem, code);
        break;
      }
      case ']': {
        nominalW = 320;
        shape = 'narrow';
        StemPrimitive.addStem(this.ctx, p, nominalW - 60 - stem, -40, stem, capH + 80, code);
        StemPrimitive.addStem(this.ctx, p, 60, capH + 40 - hStem, nominalW - 120, hStem, code);
        StemPrimitive.addStem(this.ctx, p, 60, -40, nominalW - 120, hStem, code);
        break;
      }
      case '{': {
        nominalW = 340;
        shape = 'narrow';
        const midY = Math.round(capH * 0.5);
        StemPrimitive.addStem(this.ctx, p, 80, -40, stem, capH + 80, code);
        StemPrimitive.addStem(this.ctx, p, 40, midY - hStem / 2, 40, hStem, code);
        StemPrimitive.addStem(this.ctx, p, 80, capH + 40 - hStem, 60, hStem, code);
        StemPrimitive.addStem(this.ctx, p, 80, -40, 60, hStem, code);
        break;
      }
      case '}': {
        nominalW = 340;
        shape = 'narrow';
        const midY = Math.round(capH * 0.5);
        StemPrimitive.addStem(this.ctx, p, nominalW - 80 - stem, -40, stem, capH + 80, code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 80, midY - hStem / 2, 40, hStem, code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 140, capH + 40 - hStem, 60, hStem, code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 140, -40, 60, hStem, code);
        break;
      }
      case "'": {
        nominalW = 220;
        shape = 'narrow';
        const cX = Math.round((nominalW - stem) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, capH - Math.round(stem * 1.6), stem, Math.round(stem * 1.6), code);
        break;
      }
      case '"': {
        nominalW = 340;
        shape = 'narrow';
        StemPrimitive.addStem(this.ctx, p, 60, capH - Math.round(stem * 1.6), stem, Math.round(stem * 1.6), code);
        StemPrimitive.addStem(this.ctx, p, nominalW - 60 - stem, capH - Math.round(stem * 1.6), stem, Math.round(stem * 1.6), code);
        break;
      }
      case '@': {
        nominalW = 680;
        shape = 'wide';
        RingPrimitive.addRing(this.ctx, p, 40, 0, nominalW - 80, capH, stem, hStem, code);
        RingPrimitive.addRing(this.ctx, p, 160, Math.round(capH * 0.25), nominalW - 320, Math.round(capH * 0.5), stem * 0.8, hStem * 0.8, code);
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
        shape = 'round';
        const midY = Math.round(capH * 0.5);
        RingPrimitive.addRing(this.ctx, p, 50, midY - hStem / 2, nominalW - 100, capH - midY + hStem / 2, stem, hStem, code);
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 100, midY + hStem / 2, stem, hStem, code);
        const cX = Math.round((nominalW - stem * 0.6) / 2);
        StemPrimitive.addStem(this.ctx, p, cX, -40, stem * 0.6, capH + 80, code);
        break;
      }
      case '%': {
        nominalW = 620;
        shape = 'wide';
        DiagonalPrimitive.addDiagonal(this.ctx, p, nominalW - 50, capH, 50, 0, stem, code);
        RingPrimitive.addRing(this.ctx, p, 50, Math.round(capH * 0.55), Math.round(capH * 0.38), Math.round(capH * 0.38), stem * 0.7, hStem * 0.7, code);
        RingPrimitive.addRing(this.ctx, p, nominalW - 50 - Math.round(capH * 0.38), Math.round(capH * 0.08), Math.round(capH * 0.38), Math.round(capH * 0.38), stem * 0.7, hStem * 0.7, code);
        break;
      }
      case '&': {
        nominalW = 580;
        shape = 'wide';
        RingPrimitive.addRing(this.ctx, p, 60, Math.round(capH * 0.45), nominalW - 160, Math.round(capH * 0.55), stem, hStem, code);
        RingPrimitive.addRing(this.ctx, p, 50, 0, nominalW - 120, Math.round(capH * 0.55), stem, hStem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, 60, 0, nominalW - 40, Math.round(capH * 0.45), stem, code);
        break;
      }
      case '*': {
        nominalW = 380;
        shape = 'narrow';
        const cX = nominalW / 2;
        const cY = Math.round(capH * 0.65);
        const rad = Math.round(capH * 0.18);
        DiagonalPrimitive.addDiagonal(this.ctx, p, cX - rad, cY, cX + rad, cY, hStem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, cX - rad * 0.7, cY - rad * 0.7, cX + rad * 0.7, cY + rad * 0.7, hStem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, cX - rad * 0.7, cY + rad * 0.7, cX + rad * 0.7, cY - rad * 0.7, hStem, code);
        break;
      }
      case '<': {
        nominalW = 420;
        shape = 'straight';
        const midY = Math.round(this.ctx.xH * 0.5);
        DiagonalPrimitive.addDiagonal(this.ctx, p, nominalW - 50, this.ctx.xH, 50, midY, stem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, 50, midY, nominalW - 50, 0, stem, code);
        break;
      }
      case '>': {
        nominalW = 420;
        shape = 'straight';
        const midY = Math.round(this.ctx.xH * 0.5);
        DiagonalPrimitive.addDiagonal(this.ctx, p, 50, this.ctx.xH, nominalW - 50, midY, stem, code);
        DiagonalPrimitive.addDiagonal(this.ctx, p, nominalW - 50, midY, 50, 0, stem, code);
        break;
      }
      case '~': {
        nominalW = 440;
        shape = 'straight';
        const midY = Math.round(this.ctx.xH * 0.6);
        StemPrimitive.addStem(this.ctx, p, 40, midY, nominalW - 80, hStem, code);
        break;
      }
    }

    return this.sanitizeGlyph(
      new Glyph({
        name: char,
        unicode: code,
        advanceWidth: this.ctx.getAdvanceWidth(nominalW, shape),
        path: p,
      })
    );
  }

  // =========================================================================
  // LATIN EXTENDED ACCENTED GLYPHS
  // =========================================================================
  private generateLatinExtendedGlyphs(glyphs: Glyph[]): void {
    const latExt = CHARACTER_SETS.LATIN_EXTENDED;
    if (!latExt) return;

    for (const g of latExt.glyphList) {
      if (g.code <= 126) continue; // Skip basic latin handled above

      const p = new Path();
      const success = LatinExtendedPrimitive.addAccentedGlyph(
        this.ctx,
        p,
        g.code,
        (pathObj, baseCode) => {
          let baseGlyph: Glyph | null = null;
          if (baseCode >= 65 && baseCode <= 90) {
            baseGlyph = this.createUppercaseGlyph(String.fromCharCode(baseCode), baseCode);
          } else if (baseCode >= 97 && baseCode <= 122) {
            baseGlyph = this.createLowercaseGlyph(String.fromCharCode(baseCode), baseCode);
          }
          if (baseGlyph && baseGlyph.path) {
            pathObj.commands.push(...baseGlyph.path.commands);
          }
        }

      );

      if (success) {
        glyphs.push(
          this.sanitizeGlyph(
            new Glyph({
              name: g.name,
              unicode: g.code,
              advanceWidth: this.ctx.getAdvanceWidth(520, 'straight'),
              path: p,
            })
          )
        );
      }
    }
  }

  // =========================================================================
  // DEVANAGARI SCRIPT
  // =========================================================================
  private generateDevanagariGlyphs(glyphs: Glyph[]): void {
    const devCore = CHARACTER_SETS.DEVANAGARI_CORE;
    if (devCore) {
      for (const d of devCore.glyphList) {
        const p = new Path();
        DevanagariPrimitive.addDevanagariGlyph(this.ctx, p, d.code);

        glyphs.push(
          this.sanitizeGlyph(
            new Glyph({
              name: d.name,
              unicode: d.code,
              advanceWidth: this.ctx.getAdvanceWidth(640, 'straight'),
              path: p,
            })
          )
        );
      }
    }

    // Generate conjunct ligatures and nukta glyph forms
    for (const rule of DEVANAGARI_CONJUNCT_RULES) {
      const p = new Path();
      DevanagariPrimitive.addDevanagariGlyph(this.ctx, p, rule.code);

      glyphs.push(
        this.sanitizeGlyph(
          new Glyph({
            name: rule.name,
            unicode: rule.code,
            advanceWidth: this.ctx.getAdvanceWidth(640, 'straight'),
            path: p,
          })
        )
      );
    }
  }
}


