import { Path } from 'opentype.js';
import { GlyphGeometryContext } from '../context';

export type SerifPlacement = 'top' | 'bot' | 'both' | 'top-left' | 'top-right' | 'bot-left' | 'bot-right';

export class SerifPrimitive {
  /**
   * Adds serifs, brackets, slab feet, or dagger spurs to a stem endpoint.
   */
  public static addSerifs(
    ctx: GlyphGeometryContext,
    path: Path,
    x: number,
    y: number,
    stemW: number,
    pos: SerifPlacement,
    glyphCode: number = 0
  ): void {
    const family = ctx.dna.styleFamily;
    const terminal = ctx.dna.terminalStyle;
    const isSerif =
      family === 'SERIF' ||
      family === 'DIDONE_SERIF' ||
      family === 'SLAB_SERIF' ||
      terminal === 'SERIFED' ||
      ctx.dna.decorationLevel === 'STRONG';

    if (!isSerif && family !== 'HORROR' && family !== 'OCCULT') {
      return;
    }

    // 1. DRIPPING SPURS
    if (ctx.terminalModifier === 'DRIPPING') {
      const dripW = Math.round(stemW * 0.70);
      const dripH = Math.round(stemW * 1.25 * ctx.terminalStrength);

      if (pos === 'bot' || pos === 'both') {
        const p1 = ctx.pt(x - dripW * 0.4, y, glyphCode, 90);
        const p2 = ctx.pt(x + stemW + dripW * 0.4, y, glyphCode, 91);
        const pDropTip = ctx.pt(x + stemW * 0.5, y - dripH, glyphCode, 92);
        const pDropR = ctx.pt(x + stemW * 0.85, y - dripH * 0.6, glyphCode, 93);
        const pDropL = ctx.pt(x + stemW * 0.15, y - dripH * 0.6, glyphCode, 94);

        path.moveTo(p1.x, p1.y);
        path.lineTo(p2.x, p2.y);
        path.bezierCurveTo(pDropR.x, pDropR.y, pDropTip.x, pDropTip.y, pDropTip.x, pDropTip.y);
        path.bezierCurveTo(pDropL.x, pDropL.y, p1.x, p1.y, p1.x, p1.y);
        path.close();
      }
      return;
    }

    // 2. HORROR / OCCULT / FANG: Sharp Piercing Dagger Spurs
    if (family === 'HORROR' || family === 'OCCULT' || terminal === 'SHARP' || ctx.terminalModifier === 'FANG') {
      const spikeW = Math.round(stemW * 0.65);
      const spikeH = Math.round(stemW * 0.60 * ctx.terminalStrength);

      if (pos === 'bot' || pos === 'both') {
        const p1 = ctx.pt(x - spikeW, y, glyphCode, 100);
        const p2 = ctx.pt(x + stemW + spikeW, y, glyphCode, 101);
        const p3 = ctx.pt(x + stemW / 2, y - spikeH, glyphCode, 102);

        path.moveTo(p1.x, p1.y);
        path.lineTo(p2.x, p2.y);
        path.lineTo(p3.x, p3.y);
        path.close();
      }

      if (pos === 'top' || pos === 'both') {
        const p1 = ctx.pt(x - spikeW, y, glyphCode, 103);
        const p2 = ctx.pt(x + stemW + spikeW, y, glyphCode, 104);
        const p3 = ctx.pt(x + stemW / 2, y + spikeH, glyphCode, 105);

        path.moveTo(p1.x, p1.y);
        path.lineTo(p2.x, p2.y);
        path.lineTo(p3.x, p3.y);
        path.close();
      }
      return;
    }


    // 2. SLAB SERIF: Heavy rectangular slabs
    if (family === 'SLAB_SERIF') {
      const overhang = Math.max(20, Math.round(stemW * 0.45));
      const sH = Math.max(16, Math.round(ctx.hStem * 1.1));

      if (pos === 'bot' || pos === 'both') {
        const p1 = ctx.pt(x - overhang, y, glyphCode, 110);
        const p2 = ctx.pt(x + stemW + overhang, y, glyphCode, 111);
        const p3 = ctx.pt(x + stemW + overhang, y + sH, glyphCode, 112);
        const p4 = ctx.pt(x - overhang, y + sH, glyphCode, 113);
        path.moveTo(p1.x, p1.y);
        path.lineTo(p2.x, p2.y);
        path.lineTo(p3.x, p3.y);
        path.lineTo(p4.x, p4.y);
        path.close();
      }

      if (pos === 'top' || pos === 'both') {
        const p1 = ctx.pt(x - overhang, y, glyphCode, 114);
        const p2 = ctx.pt(x + stemW + overhang, y, glyphCode, 115);
        const p3 = ctx.pt(x + stemW + overhang, y - sH, glyphCode, 116);
        const p4 = ctx.pt(x - overhang, y - sH, glyphCode, 117);
        path.moveTo(p1.x, p1.y);
        path.lineTo(p2.x, p2.y);
        path.lineTo(p3.x, p3.y);
        path.lineTo(p4.x, p4.y);
        path.close();
      }
      return;
    }

    // 3. DIDONE / LUXURY / CLASSICAL SERIF: Refined bracketed or unbracketed hairline serifs
    const overhang = Math.max(16, Math.round(stemW * 0.48));
    const sH = family === 'DIDONE_SERIF' ? Math.max(6, Math.round(ctx.hStem * 0.55)) : Math.max(10, Math.round(ctx.hStem * 0.8));

    if (pos === 'bot' || pos === 'both') {
      const p1 = ctx.pt(x - overhang, y, glyphCode, 120);
      const p2 = ctx.pt(x + stemW + overhang, y, glyphCode, 121);
      const p3 = ctx.pt(x + stemW + overhang, y + sH, glyphCode, 122);
      const p4 = ctx.pt(x - overhang, y + sH, glyphCode, 123);
      path.moveTo(p1.x, p1.y);
      path.lineTo(p2.x, p2.y);
      path.lineTo(p3.x, p3.y);
      path.lineTo(p4.x, p4.y);
      path.close();
    }

    if (pos === 'top' || pos === 'both') {
      const p1 = ctx.pt(x - overhang, y, glyphCode, 124);
      const p2 = ctx.pt(x + stemW + overhang, y, glyphCode, 125);
      const p3 = ctx.pt(x + stemW + overhang, y - sH, glyphCode, 126);
      const p4 = ctx.pt(x - overhang, y - sH, glyphCode, 127);
      path.moveTo(p1.x, p1.y);
      path.lineTo(p2.x, p2.y);
      path.lineTo(p3.x, p3.y);
      path.lineTo(p4.x, p4.y);
      path.close();
    }
  }
}
