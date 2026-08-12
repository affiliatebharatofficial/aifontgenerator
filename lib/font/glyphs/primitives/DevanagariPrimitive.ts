import { Path } from 'opentype.js';
import type { GlyphGeometryContext } from '../context';
import { StemPrimitive } from './StemPrimitive';
import { RingPrimitive } from './RingPrimitive';
import { DiagonalPrimitive } from './DiagonalPrimitive';

export class DevanagariPrimitive {
  /**
   * Renders complete Devanagari structural letterforms that react dynamically to Style DNA.
   */
  public static addDevanagariGlyph(
    ctx: GlyphGeometryContext,
    path: Path,
    code: number
  ): boolean {
    const capH = ctx.capH;
    const xH = ctx.xH;
    const stem = ctx.stem;
    const hStem = ctx.hStem;
    const nominalW = 640;

    // Helper: Top Shirorekha (Headline)
    const addShirorekha = (w: number = nominalW, skipHeadline: boolean = false) => {
      if (!skipHeadline) {
        StemPrimitive.addStem(ctx, path, 20, capH - hStem, w - 40, hStem, code);
      }
    };

    // Helper: Right Full Kana Stem
    const addRightKanaStem = (x: number = nominalW - 80 - stem, height: number = capH) => {
      StemPrimitive.addStem(ctx, path, x, 0, stem, height - hStem, code);
    };

    switch (code) {
      // --- INDEPENDENT VOWELS ---
      case 0x0905: // अ (dvA)
        addShirorekha(nominalW);
        RingPrimitive.addRing(ctx, path, 60, Math.round(capH * 0.45), 180, Math.round(capH * 0.45), stem, hStem, code);
        RingPrimitive.addRing(ctx, path, 60, 0, 200, Math.round(capH * 0.5), stem, hStem, code);
        StemPrimitive.addStem(ctx, path, 220, Math.round(capH * 0.45), 120, hStem, code);
        addRightKanaStem(340);
        break;

      case 0x0906: // आ (dvAA)
        addShirorekha(nominalW + 120);
        RingPrimitive.addRing(ctx, path, 60, Math.round(capH * 0.45), 180, Math.round(capH * 0.45), stem, hStem, code);
        RingPrimitive.addRing(ctx, path, 60, 0, 200, Math.round(capH * 0.5), stem, hStem, code);
        StemPrimitive.addStem(ctx, path, 220, Math.round(capH * 0.45), 120, hStem, code);
        addRightKanaStem(340);
        addRightKanaStem(460);
        break;

      case 0x0907: // इ (dvI)
        addShirorekha(480);
        StemPrimitive.addStem(ctx, path, 220, capH - Math.round(capH * 0.25), stem, Math.round(capH * 0.25), code);
        RingPrimitive.addRing(ctx, path, 100, Math.round(capH * 0.35), 240, Math.round(capH * 0.4), stem, hStem, code);
        DiagonalPrimitive.addDiagonal(ctx, path, 140, Math.round(capH * 0.35), 80, -Math.round(capH * 0.35), stem, code);
        break;

      case 0x0908: // ई (dvII)
        addShirorekha(480);
        StemPrimitive.addStem(ctx, path, 220, capH - Math.round(capH * 0.25), stem, Math.round(capH * 0.25), code);
        RingPrimitive.addRing(ctx, path, 100, Math.round(capH * 0.35), 240, Math.round(capH * 0.4), stem, hStem, code);
        DiagonalPrimitive.addDiagonal(ctx, path, 140, Math.round(capH * 0.35), 80, -Math.round(capH * 0.35), stem, code);
        // Top E-Matra Hook
        DiagonalPrimitive.addDiagonal(ctx, path, 240, capH, 80, 100, stem, code);
        break;

      case 0x0909: // उ (dvU)
        addShirorekha(460);
        RingPrimitive.addRing(ctx, path, 80, Math.round(capH * 0.45), 180, Math.round(capH * 0.45), stem, hStem, code);
        RingPrimitive.addRing(ctx, path, 80, 0, 200, Math.round(capH * 0.5), stem, hStem, code);
        break;

      case 0x090A: // ऊ (dvUU)
        addShirorekha(520);
        RingPrimitive.addRing(ctx, path, 80, Math.round(capH * 0.45), 180, Math.round(capH * 0.45), stem, hStem, code);
        RingPrimitive.addRing(ctx, path, 80, 0, 200, Math.round(capH * 0.5), stem, hStem, code);
        // Tail
        DiagonalPrimitive.addDiagonal(ctx, path, 280, Math.round(capH * 0.4), 100, -Math.round(capH * 0.35), stem, code);
        break;

      case 0x090F: // ए (dvE)
        addShirorekha(500);
        StemPrimitive.addStem(ctx, path, 120, Math.round(capH * 0.4), stem, capH - Math.round(capH * 0.4), code);
        DiagonalPrimitive.addDiagonal(ctx, path, 120, Math.round(capH * 0.4), 160, -Math.round(capH * 0.4), stem, code);
        addRightKanaStem(360, Math.round(capH * 0.6));
        break;

      case 0x0910: // ऐ (dvAI)
        addShirorekha(500);
        StemPrimitive.addStem(ctx, path, 120, Math.round(capH * 0.4), stem, capH - Math.round(capH * 0.4), code);
        DiagonalPrimitive.addDiagonal(ctx, path, 120, Math.round(capH * 0.4), 160, -Math.round(capH * 0.4), stem, code);
        addRightKanaStem(360, Math.round(capH * 0.6));
        DiagonalPrimitive.addDiagonal(ctx, path, 160, capH, 80, 100, stem, code);
        break;

      case 0x0913: // ओ (dvO)
        addShirorekha(nominalW + 120);
        RingPrimitive.addRing(ctx, path, 60, Math.round(capH * 0.45), 180, Math.round(capH * 0.45), stem, hStem, code);
        RingPrimitive.addRing(ctx, path, 60, 0, 200, Math.round(capH * 0.5), stem, hStem, code);
        StemPrimitive.addStem(ctx, path, 220, Math.round(capH * 0.45), 120, hStem, code);
        addRightKanaStem(340);
        addRightKanaStem(460);
        DiagonalPrimitive.addDiagonal(ctx, path, 460, capH, -80, 100, stem, code);
        break;

      case 0x0914: // औ (dvAU)
        addShirorekha(nominalW + 120);
        RingPrimitive.addRing(ctx, path, 60, Math.round(capH * 0.45), 180, Math.round(capH * 0.45), stem, hStem, code);
        RingPrimitive.addRing(ctx, path, 60, 0, 200, Math.round(capH * 0.5), stem, hStem, code);
        StemPrimitive.addStem(ctx, path, 220, Math.round(capH * 0.45), 120, hStem, code);
        addRightKanaStem(340);
        addRightKanaStem(460);
        DiagonalPrimitive.addDiagonal(ctx, path, 460, capH, -100, 100, stem, code);
        DiagonalPrimitive.addDiagonal(ctx, path, 460, capH, -40, 100, stem, code);
        break;

      // --- CONSONANTS ---
      case 0x0915: // क (dvKA)
        addShirorekha(nominalW);
        StemPrimitive.addStem(ctx, path, 300, 0, stem, capH - hStem, code);
        RingPrimitive.addRing(ctx, path, 80, Math.round(capH * 0.2), 220, Math.round(capH * 0.5), stem, hStem, code);
        DiagonalPrimitive.addDiagonal(ctx, path, 300 + stem, Math.round(capH * 0.5), 140, -Math.round(capH * 0.4), stem, code);
        break;

      case 0x0916: // ख (dvKHA)
        addShirorekha(nominalW + 60);
        RingPrimitive.addRing(ctx, path, 60, Math.round(capH * 0.35), 200, Math.round(capH * 0.5), stem, hStem, code);
        DiagonalPrimitive.addDiagonal(ctx, path, 160, Math.round(capH * 0.35), 180, -Math.round(capH * 0.35), stem, code);
        addRightKanaStem(440);
        break;

      case 0x0917: // ग (dvGA)
        addShirorekha(520);
        StemPrimitive.addStem(ctx, path, 140, Math.round(capH * 0.25), stem, capH - Math.round(capH * 0.25) - hStem, code);
        RingPrimitive.addRing(ctx, path, 80, Math.round(capH * 0.15), 120, Math.round(capH * 0.25), stem, hStem, code);
        addRightKanaStem(380);
        break;

      case 0x0918: // घ (dvGHA)
        addShirorekha(580);
        RingPrimitive.addRing(ctx, path, 60, Math.round(capH * 0.45), 220, Math.round(capH * 0.45), stem, hStem, code);
        RingPrimitive.addRing(ctx, path, 60, Math.round(capH * 0.05), 240, Math.round(capH * 0.45), stem, hStem, code);
        addRightKanaStem(420);
        break;

      case 0x091A: // च (dvCA)
        addShirorekha(560);
        StemPrimitive.addStem(ctx, path, 80, Math.round(capH * 0.45), 180, hStem, code);
        RingPrimitive.addRing(ctx, path, 140, Math.round(capH * 0.1), 180, Math.round(capH * 0.4), stem, hStem, code);
        addRightKanaStem(400);
        break;

      case 0x091C: // ज (dvJA)
        addShirorekha(560);
        RingPrimitive.addRing(ctx, path, 80, Math.round(capH * 0.2), 180, Math.round(capH * 0.45), stem, hStem, code);
        StemPrimitive.addStem(ctx, path, 240, Math.round(capH * 0.45), 140, hStem, code);
        addRightKanaStem(400);
        break;

      case 0x0924: // त (dvTA)
        addShirorekha(520);
        addRightKanaStem(360);
        DiagonalPrimitive.addDiagonal(ctx, path, 360, Math.round(capH * 0.55), -200, -Math.round(capH * 0.5), stem, code);
        break;

      case 0x0928: // न (dvNA)
        addShirorekha(540);
        RingPrimitive.addRing(ctx, path, 80, Math.round(capH * 0.35), 140, Math.round(capH * 0.25), stem, hStem, code);
        StemPrimitive.addStem(ctx, path, 220, Math.round(capH * 0.45), 140, hStem, code);
        addRightKanaStem(380);
        break;

      case 0x092A: // प (dvPA)
        addShirorekha(520);
        StemPrimitive.addStem(ctx, path, 100, Math.round(capH * 0.3), stem, capH - Math.round(capH * 0.3) - hStem, code);
        StemPrimitive.addStem(ctx, path, 100, Math.round(capH * 0.2), 260, hStem, code);
        addRightKanaStem(360);
        break;

      case 0x092B: // फ (dvPHA)
        addShirorekha(nominalW);
        StemPrimitive.addStem(ctx, path, 100, Math.round(capH * 0.3), stem, capH - Math.round(capH * 0.3) - hStem, code);
        StemPrimitive.addStem(ctx, path, 100, Math.round(capH * 0.2), 260, hStem, code);
        addRightKanaStem(360);
        DiagonalPrimitive.addDiagonal(ctx, path, 360 + stem, Math.round(capH * 0.5), 140, -Math.round(capH * 0.4), stem, code);
        break;

      case 0x092C: // ब (dvBA)
        addShirorekha(560);
        RingPrimitive.addRing(ctx, path, 80, Math.round(capH * 0.2), 240, Math.round(capH * 0.5), stem, hStem, code);
        DiagonalPrimitive.addDiagonal(ctx, path, 100, Math.round(capH * 0.65), 180, -Math.round(capH * 0.45), hStem, code);
        addRightKanaStem(400);
        break;

      case 0x092E: // म (dvMA)
        addShirorekha(560);
        StemPrimitive.addStem(ctx, path, 100, Math.round(capH * 0.25), stem, capH - Math.round(capH * 0.25) - hStem, code);
        RingPrimitive.addRing(ctx, path, 60, Math.round(capH * 0.1), 140, Math.round(capH * 0.3), stem, hStem, code);
        StemPrimitive.addStem(ctx, path, 180, Math.round(capH * 0.4), 200, hStem, code);
        addRightKanaStem(400);
        break;

      case 0x092F: // य (dvYA)
        addShirorekha(540);
        RingPrimitive.addRing(ctx, path, 60, Math.round(capH * 0.2), 220, Math.round(capH * 0.6), stem, hStem, code);
        addRightKanaStem(380);
        break;

      case 0x0930: // र (dvRA)
        addShirorekha(440);
        RingPrimitive.addRing(ctx, path, 80, Math.round(capH * 0.45), 180, Math.round(capH * 0.45), stem, hStem, code);
        DiagonalPrimitive.addDiagonal(ctx, path, 160, Math.round(capH * 0.45), 160, -Math.round(capH * 0.45), stem, code);
        break;

      case 0x0932: // ल (dvLA)
        addShirorekha(600);
        RingPrimitive.addRing(ctx, path, 60, Math.round(capH * 0.2), 160, Math.round(capH * 0.45), stem, hStem, code);
        RingPrimitive.addRing(ctx, path, 200, Math.round(capH * 0.25), 160, Math.round(capH * 0.45), stem, hStem, code);
        addRightKanaStem(440);
        break;

      case 0x0935: // व (dvVA)
        addShirorekha(540);
        RingPrimitive.addRing(ctx, path, 80, Math.round(capH * 0.2), 240, Math.round(capH * 0.5), stem, hStem, code);
        addRightKanaStem(380);
        break;

      case 0x0938: // स (dvSA)
        addShirorekha(580);
        RingPrimitive.addRing(ctx, path, 60, Math.round(capH * 0.45), 180, Math.round(capH * 0.45), stem, hStem, code);
        DiagonalPrimitive.addDiagonal(ctx, path, 140, Math.round(capH * 0.45), 140, -Math.round(capH * 0.45), stem, code);
        StemPrimitive.addStem(ctx, path, 200, Math.round(capH * 0.45), 160, hStem, code);
        addRightKanaStem(420);
        break;

      case 0x0939: // ह (dvHA)
        addShirorekha(460);
        StemPrimitive.addStem(ctx, path, 200, capH - Math.round(capH * 0.2), stem, Math.round(capH * 0.2), code);
        RingPrimitive.addRing(ctx, path, 100, Math.round(capH * 0.45), 200, Math.round(capH * 0.35), stem, hStem, code);
        RingPrimitive.addRing(ctx, path, 120, 0, 220, Math.round(capH * 0.45), stem, hStem, code);
        break;

      // --- MATRAS (DEPENDENT VOWELS) ---
      case 0x093E: //  ा (dvMatraAA)
        addShirorekha(240);
        addRightKanaStem(120);
        break;

      case 0x093F: //  ि (dvMatraI)
        addShirorekha(360);
        StemPrimitive.addStem(ctx, path, 40, 0, stem, capH - hStem, code);
        RingPrimitive.addRing(ctx, path, 40, capH - 20, 240, 80, stem, hStem, code);
        break;

      case 0x0940: //  ी (dvMatraII)
        addShirorekha(360);
        addRightKanaStem(280);
        RingPrimitive.addRing(ctx, path, 40, capH - 20, 240, 80, stem, hStem, code);
        break;

      case 0x0941: //  ु (dvMatraU)
        addShirorekha(200, true);
        RingPrimitive.addRing(ctx, path, 40, -Math.round(capH * 0.25), 100, Math.round(capH * 0.2), stem, hStem, code);
        break;

      case 0x0942: //  ू (dvMatraUU)
        addShirorekha(200, true);
        DiagonalPrimitive.addDiagonal(ctx, path, 40, 0, 100, -Math.round(capH * 0.25), stem, code);
        break;

      case 0x0947: //  े (dvMatraE)
        addShirorekha(200, true);
        DiagonalPrimitive.addDiagonal(ctx, path, 120, capH, -80, 100, stem, code);
        break;

      case 0x0948: //  ै (dvMatraAI)
        addShirorekha(240, true);
        DiagonalPrimitive.addDiagonal(ctx, path, 100, capH, -80, 100, stem, code);
        DiagonalPrimitive.addDiagonal(ctx, path, 180, capH, -80, 100, stem, code);
        break;

      case 0x094B: //  ो (dvMatraO)
        addShirorekha(240);
        addRightKanaStem(140);
        DiagonalPrimitive.addDiagonal(ctx, path, 140, capH, -80, 100, stem, code);
        break;

      case 0x094C: //  ौ (dvMatraAU)
        addShirorekha(280);
        addRightKanaStem(180);
        DiagonalPrimitive.addDiagonal(ctx, path, 180, capH, -100, 100, stem, code);
        DiagonalPrimitive.addDiagonal(ctx, path, 180, capH, -40, 100, stem, code);
        break;

      // --- MARKS ---
      case 0x0902: // Anusvara  ं
        RingPrimitive.addRing(ctx, path, 180, capH + 30, Math.round(stem * 1.5), Math.round(stem * 1.5), stem, hStem, code);
        break;

      case 0x0903: // Visarga  ः
        RingPrimitive.addRing(ctx, path, 80, Math.round(capH * 0.6), Math.round(stem * 1.3), Math.round(stem * 1.3), stem, hStem, code);
        RingPrimitive.addRing(ctx, path, 80, Math.round(capH * 0.2), Math.round(stem * 1.3), Math.round(stem * 1.3), stem, hStem, code);
        break;

      case 0x0901: // Chandrabindu  ँ
        RingPrimitive.addRing(ctx, path, 120, capH + 20, 140, 50, stem, hStem, code);
        RingPrimitive.addRing(ctx, path, 175, capH + 80, Math.round(stem * 1.2), Math.round(stem * 1.2), stem, hStem, code);
        break;

      case 0x094D: // Virama / Halant  ्
        DiagonalPrimitive.addDiagonal(ctx, path, 120, 0, 80, -Math.round(capH * 0.2), stem, code);
        break;

      case 0x093C: // Nukta  ़
        RingPrimitive.addRing(ctx, path, 140, -40, Math.round(stem * 1.2), Math.round(stem * 1.2), stem, hStem, code);
        break;

      // --- DIGITS (०-९) ---
      case 0x0966: // ०
        RingPrimitive.addRing(ctx, path, 100, 0, 240, capH, stem, hStem, code);
        break;
      case 0x0967: // १
        StemPrimitive.addStem(ctx, path, 220, 0, stem, capH, code);
        RingPrimitive.addRing(ctx, path, 100, Math.round(capH * 0.5), 140, Math.round(capH * 0.4), stem, hStem, code);
        break;
      case 0x0968: // २
        RingPrimitive.addRing(ctx, path, 80, Math.round(capH * 0.45), 200, Math.round(capH * 0.45), stem, hStem, code);
        DiagonalPrimitive.addDiagonal(ctx, path, 180, Math.round(capH * 0.45), 140, -Math.round(capH * 0.45), stem, code);
        break;

      // --- PUNCTUATION & SYMBOLS ---
      case 0x0964: // Danda ।
        StemPrimitive.addStem(ctx, path, 140, 0, Math.round(stem * 1.1), capH, code);
        break;
      case 0x0965: // Double Danda ॥
        StemPrimitive.addStem(ctx, path, 100, 0, Math.round(stem * 1.1), capH, code);
        StemPrimitive.addStem(ctx, path, 240, 0, Math.round(stem * 1.1), capH, code);
        break;
      case 0x0950: // Om ॐ
        RingPrimitive.addRing(ctx, path, 60, Math.round(capH * 0.45), 180, Math.round(capH * 0.45), stem, hStem, code);
        RingPrimitive.addRing(ctx, path, 60, 0, 200, Math.round(capH * 0.5), stem, hStem, code);
        RingPrimitive.addRing(ctx, path, 280, capH + 20, 140, 50, stem, hStem, code);
        RingPrimitive.addRing(ctx, path, 335, capH + 80, Math.round(stem * 1.2), Math.round(stem * 1.2), stem, hStem, code);
        break;

      // --- CONJUNCTS (0xE001 - 0xE013) ---
      case 0xE001: // क्र (dvKRA)
        addShirorekha(nominalW);
        StemPrimitive.addStem(ctx, path, 300, 0, stem, capH - hStem, code);
        RingPrimitive.addRing(ctx, path, 80, Math.round(capH * 0.2), 220, Math.round(capH * 0.5), stem, hStem, code);
        DiagonalPrimitive.addDiagonal(ctx, path, 300 + stem, Math.round(capH * 0.5), 140, -Math.round(capH * 0.4), stem, code);
        // Rakar leg
        DiagonalPrimitive.addDiagonal(ctx, path, 300, Math.round(capH * 0.4), -120, -Math.round(capH * 0.35), stem, code);
        break;

      case 0xE002: // प्र (dvPRA)
        addShirorekha(520);
        StemPrimitive.addStem(ctx, path, 100, Math.round(capH * 0.3), stem, capH - Math.round(capH * 0.3) - hStem, code);
        StemPrimitive.addStem(ctx, path, 100, Math.round(capH * 0.2), 260, hStem, code);
        addRightKanaStem(360);
        // Rakar leg
        DiagonalPrimitive.addDiagonal(ctx, path, 360, Math.round(capH * 0.4), -120, -Math.round(capH * 0.35), stem, code);
        break;

      case 0xE003: // ब्र (dvBRA)
        addShirorekha(560);
        RingPrimitive.addRing(ctx, path, 80, Math.round(capH * 0.2), 240, Math.round(capH * 0.5), stem, hStem, code);
        DiagonalPrimitive.addDiagonal(ctx, path, 100, Math.round(capH * 0.65), 180, -Math.round(capH * 0.45), hStem, code);
        addRightKanaStem(400);
        DiagonalPrimitive.addDiagonal(ctx, path, 400, Math.round(capH * 0.4), -120, -Math.round(capH * 0.35), stem, code);
        break;

      case 0xE004: // ग्र (dvGRA)
        addShirorekha(520);
        StemPrimitive.addStem(ctx, path, 140, Math.round(capH * 0.25), stem, capH - Math.round(capH * 0.25) - hStem, code);
        RingPrimitive.addRing(ctx, path, 80, Math.round(capH * 0.15), 120, Math.round(capH * 0.25), stem, hStem, code);
        addRightKanaStem(380);
        DiagonalPrimitive.addDiagonal(ctx, path, 380, Math.round(capH * 0.4), -120, -Math.round(capH * 0.35), stem, code);
        break;

      case 0xE005: // त्र (dvTRA)
        addShirorekha(520);
        addRightKanaStem(360);
        DiagonalPrimitive.addDiagonal(ctx, path, 360, Math.round(capH * 0.65), -180, -Math.round(capH * 0.3), stem, code);
        DiagonalPrimitive.addDiagonal(ctx, path, 360, Math.round(capH * 0.35), -180, -Math.round(capH * 0.35), stem, code);
        break;

      case 0xE006: // श्र (dvSHRA)
        addShirorekha(560);
        RingPrimitive.addRing(ctx, path, 80, Math.round(capH * 0.45), 180, Math.round(capH * 0.4), stem, hStem, code);
        DiagonalPrimitive.addDiagonal(ctx, path, 180, Math.round(capH * 0.45), 180, -Math.round(capH * 0.45), stem, code);
        addRightKanaStem(400);
        DiagonalPrimitive.addDiagonal(ctx, path, 400, Math.round(capH * 0.4), -120, -Math.round(capH * 0.35), stem, code);
        break;

      case 0xE007: // क्ष (dvKSHA)
        addShirorekha(620);
        RingPrimitive.addRing(ctx, path, 80, Math.round(capH * 0.45), 180, Math.round(capH * 0.4), stem, hStem, code);
        DiagonalPrimitive.addDiagonal(ctx, path, 180, Math.round(capH * 0.45), -100, -Math.round(capH * 0.4), stem, code);
        RingPrimitive.addRing(ctx, path, 160, Math.round(capH * 0.15), 160, Math.round(capH * 0.4), stem, hStem, code);
        addRightKanaStem(440);
        break;

      case 0xE008: // ज्ञ (dvJNYA)
        addShirorekha(600);
        RingPrimitive.addRing(ctx, path, 80, Math.round(capH * 0.25), 180, Math.round(capH * 0.4), stem, hStem, code);
        StemPrimitive.addStem(ctx, path, 240, Math.round(capH * 0.45), 160, hStem, code);
        addRightKanaStem(420);
        DiagonalPrimitive.addDiagonal(ctx, path, 140, Math.round(capH * 0.25), 80, -Math.round(capH * 0.25), stem, code);
        break;

      case 0xE009: // द्र (dvDRA)
        addShirorekha(480);
        StemPrimitive.addStem(ctx, path, 200, capH - Math.round(capH * 0.2), stem, Math.round(capH * 0.2), code);
        RingPrimitive.addRing(ctx, path, 100, Math.round(capH * 0.35), 200, Math.round(capH * 0.4), stem, hStem, code);
        DiagonalPrimitive.addDiagonal(ctx, path, 160, Math.round(capH * 0.35), 100, -Math.round(capH * 0.35), stem, code);
        DiagonalPrimitive.addDiagonal(ctx, path, 200, Math.round(capH * 0.3), -120, -Math.round(capH * 0.3), stem, code);
        break;

      case 0xE00A: // स्त्र (dvSTRA)
        addShirorekha(640);
        RingPrimitive.addRing(ctx, path, 40, Math.round(capH * 0.45), 140, Math.round(capH * 0.45), stem, hStem, code);
        DiagonalPrimitive.addDiagonal(ctx, path, 100, Math.round(capH * 0.45), 120, -Math.round(capH * 0.45), stem, code);
        StemPrimitive.addStem(ctx, path, 160, Math.round(capH * 0.45), 140, hStem, code);
        addRightKanaStem(460);
        DiagonalPrimitive.addDiagonal(ctx, path, 460, Math.round(capH * 0.65), -140, -Math.round(capH * 0.3), stem, code);
        DiagonalPrimitive.addDiagonal(ctx, path, 460, Math.round(capH * 0.35), -140, -Math.round(capH * 0.35), stem, code);
        break;

      case 0xE00B: case 0xE00C: case 0xE00D: case 0xE00E: case 0xE00F: case 0xE010: case 0xE011: case 0xE012: case 0xE013:
        addShirorekha(600);
        RingPrimitive.addRing(ctx, path, 60, Math.round(capH * 0.2), 180, Math.round(capH * 0.5), stem, hStem, code);
        addRightKanaStem(420);
        break;

      // --- NUKTA FORMS (0xE014 - 0xE01A) ---
      case 0xE014: // क़
        this.addDevanagariGlyph(ctx, path, 0x0915); // क
        RingPrimitive.addRing(ctx, path, 180, -40, Math.round(stem * 1.2), Math.round(stem * 1.2), stem, hStem, code);
        break;
      case 0xE015: // ख़
        this.addDevanagariGlyph(ctx, path, 0x0916); // ख
        RingPrimitive.addRing(ctx, path, 260, -40, Math.round(stem * 1.2), Math.round(stem * 1.2), stem, hStem, code);
        break;
      case 0xE016: // ग़
        this.addDevanagariGlyph(ctx, path, 0x0917); // ग
        RingPrimitive.addRing(ctx, path, 180, -40, Math.round(stem * 1.2), Math.round(stem * 1.2), stem, hStem, code);
        break;
      case 0xE017: // ज़
        this.addDevanagariGlyph(ctx, path, 0x091C); // ज
        RingPrimitive.addRing(ctx, path, 180, -40, Math.round(stem * 1.2), Math.round(stem * 1.2), stem, hStem, code);
        break;
      case 0xE018: // ड़
        this.addDevanagariGlyph(ctx, path, 0x0921); // ड
        RingPrimitive.addRing(ctx, path, 180, -40, Math.round(stem * 1.2), Math.round(stem * 1.2), stem, hStem, code);
        break;
      case 0xE019: // ढ़
        this.addDevanagariGlyph(ctx, path, 0x0922); // ढ
        RingPrimitive.addRing(ctx, path, 180, -40, Math.round(stem * 1.2), Math.round(stem * 1.2), stem, hStem, code);
        break;
      case 0xE01A: // फ़
        this.addDevanagariGlyph(ctx, path, 0x092B); // फ
        RingPrimitive.addRing(ctx, path, 240, -40, Math.round(stem * 1.2), Math.round(stem * 1.2), stem, hStem, code);
        break;


      default:
        // Fallback for remaining Devanagari consonants (ख, घ, ङ, छ, झ, ञ, ट, ठ, ड, ढ, ण, थ, ध, श, ष, ळ)
        addShirorekha(nominalW);
        addRightKanaStem(nominalW - 80 - stem);
        RingPrimitive.addRing(ctx, path, 80, Math.round(capH * 0.2), 220, Math.round(capH * 0.5), stem, hStem, code);
        break;
    }

    return true;
  }
}
