import { Path } from 'opentype.js';
import type { GlyphGeometryContext } from '../context';
import { StemPrimitive } from './StemPrimitive';
import { RingPrimitive } from './RingPrimitive';

export class LatinExtendedPrimitive {
  /**
   * Renders accented Latin glyphs by synthesizing base glyph outlines with accent primitives.
   */
  public static addAccentedGlyph(
    ctx: GlyphGeometryContext,
    path: Path,
    code: number,
    basePathGenerator: (p: Path, code: number) => void
  ): boolean {
    const capH = ctx.capH;
    const xH = ctx.xH;
    const stem = ctx.stem;
    const hStem = ctx.hStem;

    // 1. Draw Base Contour
    const baseCodeMap: Record<number, number> = {
      0x00C0: 65, 0x00C1: 65, 0x00C2: 65, 0x00C3: 65, 0x00C4: 65, 0x00C5: 65, // A
      0x00C7: 67, // C
      0x00C8: 69, 0x00C9: 69, 0x00CA: 69, 0x00CB: 69, // E
      0x00CC: 73, 0x00CD: 73, 0x00CE: 73, 0x00CF: 73, // I
      0x00D1: 78, // N
      0x00D2: 79, 0x00D3: 79, 0x00D4: 79, 0x00D5: 79, 0x00D6: 79, 0x00D8: 79, // O
      0x00D9: 85, 0x00DA: 85, 0x00DB: 85, 0x00DC: 85, // U
      0x00DD: 89, // Y
      0x0141: 76, // L
      0x0160: 83, // S
      0x017D: 90, // Z
      0x011E: 71, // G
      0x0130: 73, // I

      0x00E0: 97, 0x00E1: 97, 0x00E2: 97, 0x00E3: 97, 0x00E4: 97, 0x00E5: 97, // a
      0x00E7: 99, // c
      0x00E8: 101, 0x00E9: 101, 0x00EA: 101, 0x00EB: 101, // e
      0x00EC: 105, 0x00ED: 105, 0x00EE: 105, 0x00EF: 105, // i
      0x00F1: 110, // n
      0x00F2: 111, 0x00F3: 111, 0x00F4: 111, 0x00F5: 111, 0x00F6: 111, 0x00F8: 111, // o
      0x00F9: 117, 0x00FA: 117, 0x00FB: 117, 0x00FC: 117, // u
      0x00FD: 121, // y
      0x0142: 108, // l
      0x0161: 115, // s
      0x017F: 122, // z
      0x011F: 103, // g
      0x0131: 105, // dotless i
    };

    const baseCode = baseCodeMap[code];
    if (!baseCode && code !== 0x00C6 && code !== 0x00DF && code !== 0x0152 && code !== 0x00E6 && code !== 0x0153) {
      return false;
    }

    if (baseCode) {
      basePathGenerator(path, baseCode);
    }

    // Determine target height for mark (Cap height for uppercase, x-height for lowercase)
    const isUpper = code <= 0x0130 && code !== 0x00DF && code !== 0x0131;
    const topY = isUpper ? capH + 20 : xH + 20;
    const centerX = 260;

    // 2. Add Mark Primitives
    switch (code) {
      // ACUTE (Á, É, Í, Ó, Ú, Ý, á, é, í, ó, ú, ý)
      case 0x00C1: case 0x00C9: case 0x00CD: case 0x00D3: case 0x00DA: case 0x00DD:
      case 0x00E1: case 0x00E9: case 0x00ED: case 0x00F3: case 0x00FA: case 0x00FD:
        StemPrimitive.addStem(ctx, path, centerX - 15, topY, stem, 80, code);
        break;

      // GRAVE (À, È, Ì, Ò, Ù, à, è, ì, ò, ù)
      case 0x00C0: case 0x00C8: case 0x00CC: case 0x00D2: case 0x00D9:
      case 0x00E0: case 0x00E8: case 0x00EC: case 0x00F2: case 0x00F9:
        StemPrimitive.addStem(ctx, path, centerX - 15, topY + 80, stem, -80, code);
        break;

      // CIRCUMFLEX (Â, Ê, Î, Ô, Û, â, ê, î, ô, û)
      case 0x00C2: case 0x00CA: case 0x00CE: case 0x00D4: case 0x00DB:
      case 0x00E2: case 0x00EA: case 0x00EE: case 0x00F4: case 0x00FB:
        StemPrimitive.addStem(ctx, path, centerX - 30, topY, stem, 60, code);
        StemPrimitive.addStem(ctx, path, centerX + 10, topY + 60, stem, -60, code);
        break;

      // DIAERESIS / UMLAUT (Ä, Ë, Ï, Ö, Ü, ä, ë, ï, ö, ü)
      case 0x00C4: case 0x00CB: case 0x00CF: case 0x00D6: case 0x00DC:
      case 0x00E4: case 0x00EB: case 0x00EF: case 0x00F6: case 0x00FC:
        RingPrimitive.addRing(ctx, path, centerX - 40, topY, Math.round(stem * 1.2), Math.round(stem * 1.2), Math.round(stem * 0.4), hStem, code);
        RingPrimitive.addRing(ctx, path, centerX + 20, topY, Math.round(stem * 1.2), Math.round(stem * 1.2), Math.round(stem * 0.4), hStem, code);
        break;

      // TILDE (Ã, Õ, Ñ, ã, õ, ñ)
      case 0x00C3: case 0x00D5: case 0x00D1:
      case 0x00E3: case 0x00F5: case 0x00F1:
        StemPrimitive.addStem(ctx, path, centerX - 40, topY + 20, Math.round(stem * 0.8), 30, code);
        StemPrimitive.addStem(ctx, path, centerX, topY + 50, Math.round(stem * 0.8), -30, code);
        break;

      // RING ABOVE (Å, å)
      case 0x00C5: case 0x00E5:
        RingPrimitive.addRing(ctx, path, centerX - 25, topY + 10, 50, 50, stem, hStem, code);
        break;

      // CEDILLA (Ç, ç)
      case 0x00C7: case 0x00E7:
        StemPrimitive.addStem(ctx, path, centerX - 10, -50, Math.round(stem * 0.8), -60, code);
        break;

      // CARON / HACEK (Š, Ž, š, ž)
      case 0x0160: case 0x017D: case 0x0161: case 0x017E:
        StemPrimitive.addStem(ctx, path, centerX - 30, topY + 60, stem, -60, code);
        StemPrimitive.addStem(ctx, path, centerX + 10, topY, stem, 60, code);
        break;

      // BREVE (Ğ, ğ)
      case 0x011E: case 0x011F:
        RingPrimitive.addRing(ctx, path, centerX - 30, topY, 60, 40, stem, hStem, code);
        break;

      // L-SLASH (Ł, ł)
      case 0x0141: case 0x0142:
        StemPrimitive.addStem(ctx, path, 140, Math.round(capH * 0.45), 100, Math.round(stem * 0.9), code);
        break;

      // LIGATURES: Æ, æ, Œ, œ, ß
      case 0x00C6: case 0x00E6: // AE
        basePathGenerator(path, 65); // A
        basePathGenerator(path, 69); // E
        break;
      case 0x0152: case 0x0153: // OE
        basePathGenerator(path, 79); // O
        basePathGenerator(path, 69); // E
        break;
      case 0x00DF: // Eszett (ß)
        StemPrimitive.addStem(ctx, path, 60, 0, stem, capH, code);
        RingPrimitive.addRing(ctx, path, 60 + stem, Math.round(capH * 0.5), 140, Math.round(capH * 0.5), stem, hStem, code);
        RingPrimitive.addRing(ctx, path, 60 + stem, 0, 160, Math.round(capH * 0.55), stem, hStem, code);
        break;
    }

    return true;
  }
}
