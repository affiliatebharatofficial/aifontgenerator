import { Path } from 'opentype.js';
import { GlyphGeometryContext } from '../context';

export interface StemOptions {
  topTerminal?: boolean;
  botTerminal?: boolean;
  leftTerminal?: boolean;
  rightTerminal?: boolean;
  isVertical?: boolean;
  contrastRatio?: number;
}

export class StemPrimitive {
  /**
   * Renders a vertical or horizontal stem contour with full style DNA awareness.
   */
  public static addStem(
    ctx: GlyphGeometryContext,
    path: Path,
    x: number,
    y: number,
    w: number,
    h: number,
    glyphCode: number = 0,
    options?: StemOptions
  ): void {
    const isVertical = options?.isVertical !== false;
    const terminal = ctx.dna.terminalStyle;
    const corner = ctx.dna.cornerStyle;
    const family = ctx.dna.styleFamily;

    // 1. DRIPPING / MELTING TERMINALS (Horror dripping, melting droplets)
    if (ctx.terminalModifier === 'DRIPPING') {

      const dripH = Math.round(w * 1.15 * ctx.terminalStrength);
      const fangH = Math.round(w * 0.45);

      const p1 = ctx.pt(x, options?.botTerminal ? y - dripH * 0.4 : y, glyphCode, 10);
      const p2 = ctx.pt(x + w, y, glyphCode, 11);
      const p3 = ctx.pt(x + w, options?.topTerminal ? y + h + fangH : y + h, glyphCode, 12);
      const p4 = ctx.pt(x, y + h, glyphCode, 13);

      path.moveTo(p1.x, p1.y);
      path.lineTo(p2.x, p2.y);

      if (ctx.strokeModifier === 'CRACKED' || ctx.cornerModifier === 'CRACKED') {
        const fracY = y + Math.round(h * 0.45);
        const fracDepth = Math.max(8, Math.round(w * 0.35));
        const pFrac1 = ctx.pt(x + w, fracY - 12, glyphCode, 60);
        const pFracTip = ctx.pt(x + w - fracDepth, fracY, glyphCode, 61);
        const pFrac2 = ctx.pt(x + w, fracY + 12, glyphCode, 62);
        path.lineTo(pFrac1.x, pFrac1.y);
        path.lineTo(pFracTip.x, pFracTip.y);
        path.lineTo(pFrac2.x, pFrac2.y);
      }

      path.lineTo(p3.x, p3.y);
      path.lineTo(p4.x, p4.y);

      if (ctx.strokeModifier === 'CRACKED' || ctx.cornerModifier === 'CRACKED') {
        const fracY2 = y + Math.round(h * 0.68);
        const fracDepth = Math.max(8, Math.round(w * 0.35));
        const pFrac3 = ctx.pt(x, fracY2 + 10, glyphCode, 63);
        const pFracTip2 = ctx.pt(x + fracDepth, fracY2, glyphCode, 64);
        const pFrac4 = ctx.pt(x, fracY2 - 10, glyphCode, 65);
        path.lineTo(pFrac3.x, pFrac3.y);
        path.lineTo(pFracTip2.x, pFracTip2.y);
        path.lineTo(pFrac4.x, pFrac4.y);
      }

      if (options?.botTerminal) {
        const pDropTip = ctx.pt(x + w * 0.5, y - dripH, glyphCode, 14);
        const pDropR = ctx.pt(x + w * 0.85, y - dripH * 0.55, glyphCode, 15);
        const pDropL = ctx.pt(x + w * 0.15, y - dripH * 0.55, glyphCode, 16);
        path.lineTo(p1.x, p1.y);
        path.bezierCurveTo(pDropL.x, pDropL.y, pDropTip.x, pDropTip.y, pDropTip.x, pDropTip.y);
        path.bezierCurveTo(pDropR.x, pDropR.y, p2.x, p2.y, p2.x, p2.y);
      }
      path.close();
      return;
    }

    // 2. HORROR / OCCULT / FANG: Jagged fang spurs & chiseled irregular contours
    if (family === 'HORROR' || family === 'OCCULT' || terminal === 'SHARP' || ctx.terminalModifier === 'FANG') {
      const fangH = Math.round(w * 0.55 * ctx.terminalStrength);
      const p1 = ctx.pt(x, options?.botTerminal ? y - fangH : y, glyphCode, 10);
      const p2 = ctx.pt(x + w, y, glyphCode, 11);
      const p3 = ctx.pt(x + w, options?.topTerminal ? y + h + fangH : y + h, glyphCode, 12);
      const p4 = ctx.pt(x, y + h, glyphCode, 13);

      path.moveTo(p1.x, p1.y);
      path.lineTo(p2.x, p2.y);

      if (ctx.strokeModifier === 'CRACKED' || ctx.cornerModifier === 'CRACKED') {
        const fracY = y + Math.round(h * 0.45);
        const fracDepth = Math.max(8, Math.round(w * 0.35));
        const pFrac1 = ctx.pt(x + w, fracY - 12, glyphCode, 60);
        const pFracTip = ctx.pt(x + w - fracDepth, fracY, glyphCode, 61);
        const pFrac2 = ctx.pt(x + w, fracY + 12, glyphCode, 62);
        path.lineTo(pFrac1.x, pFrac1.y);
        path.lineTo(pFracTip.x, pFracTip.y);
        path.lineTo(pFrac2.x, pFrac2.y);
      }

      path.lineTo(p3.x, p3.y);
      path.lineTo(p4.x, p4.y);

      if (ctx.strokeModifier === 'CRACKED' || ctx.cornerModifier === 'CRACKED') {
        const fracY2 = y + Math.round(h * 0.68);
        const fracDepth = Math.max(8, Math.round(w * 0.35));
        const pFrac3 = ctx.pt(x, fracY2 + 10, glyphCode, 63);
        const pFracTip2 = ctx.pt(x + fracDepth, fracY2, glyphCode, 64);
        const pFrac4 = ctx.pt(x, fracY2 - 10, glyphCode, 65);
        path.lineTo(pFrac3.x, pFrac3.y);
        path.lineTo(pFracTip2.x, pFracTip2.y);
        path.lineTo(pFrac4.x, pFrac4.y);
      }

      path.close();
      return;
    }



    // 2. BUBBLE / CARTOON: Full pill rounded end caps (semicircular terminals)
    if (family === 'BUBBLE' || family === 'CARTOON' || terminal === 'ROUND') {
      const radius = Math.round(w / 2);
      const k = 0.55228 * radius;

      const pBot = ctx.pt(x + radius, y, glyphCode, 20);
      const pRightBot = ctx.pt(x + w, options?.botTerminal ? y + radius : y, glyphCode, 21);
      const pRightTop = ctx.pt(x + w, options?.topTerminal ? y + h - radius : y + h, glyphCode, 22);
      const pTop = ctx.pt(x + radius, y + h, glyphCode, 23);
      const pLeftTop = ctx.pt(x, options?.topTerminal ? y + h - radius : y + h, glyphCode, 24);
      const pLeftBot = ctx.pt(x, options?.botTerminal ? y + radius : y, glyphCode, 25);

      path.moveTo(pLeftBot.x, pLeftBot.y);

      if (options?.botTerminal) {
        path.bezierCurveTo(
          ctx.pt(x, y + radius - k, glyphCode, 26).x,
          ctx.pt(x, y + radius - k, glyphCode, 26).y,
          ctx.pt(x + radius - k, y, glyphCode, 27).x,
          ctx.pt(x + radius - k, y, glyphCode, 27).y,
          pBot.x,
          pBot.y
        );
        path.bezierCurveTo(
          ctx.pt(x + radius + k, y, glyphCode, 28).x,
          ctx.pt(x + radius + k, y, glyphCode, 28).y,
          ctx.pt(x + w, y + radius - k, glyphCode, 29).x,
          ctx.pt(x + w, y + radius - k, glyphCode, 29).y,
          pRightBot.x,
          pRightBot.y
        );
      } else {
        path.lineTo(pRightBot.x, pRightBot.y);
      }

      path.lineTo(pRightTop.x, pRightTop.y);

      if (options?.topTerminal) {
        path.bezierCurveTo(
          ctx.pt(x + w, y + h - radius + k, glyphCode, 30).x,
          ctx.pt(x + w, y + h - radius + k, glyphCode, 30).y,
          ctx.pt(x + radius + k, y + h, glyphCode, 31).x,
          ctx.pt(x + radius + k, y + h, glyphCode, 31).y,
          pTop.x,
          pTop.y
        );
        path.bezierCurveTo(
          ctx.pt(x + radius - k, y + h, glyphCode, 32).x,
          ctx.pt(x + radius - k, y + h, glyphCode, 32).y,
          ctx.pt(x, y + h - radius + k, glyphCode, 33).x,
          ctx.pt(x, y + h - radius + k, glyphCode, 33).y,
          pLeftTop.x,
          pLeftTop.y
        );
      } else {
        path.lineTo(pLeftTop.x, pLeftTop.y);
      }

      path.close();
      return;
    }

    // 3. FUTURISTIC: 45-degree chamfered techno vertices
    if (family === 'FUTURISTIC' || corner === 'CHAMFERED') {
      const c = Math.min(22, Math.round(w * 0.42));
      const p1 = ctx.pt(x, y + (options?.botTerminal ? c : 0), glyphCode, 40);
      const p2 = ctx.pt(x + (options?.botTerminal ? c : 0), y, glyphCode, 41);
      const p3 = ctx.pt(x + w, y, glyphCode, 42);
      const p4 = ctx.pt(x + w, y + h - (options?.topTerminal ? c : 0), glyphCode, 43);
      const p5 = ctx.pt(x + w - (options?.topTerminal ? c : 0), y + h, glyphCode, 44);
      const p6 = ctx.pt(x, y + h, glyphCode, 45);

      path.moveTo(p1.x, p1.y);
      path.lineTo(p2.x, p2.y);
      path.lineTo(p3.x, p3.y);
      path.lineTo(p4.x, p4.y);
      path.lineTo(p5.x, p5.y);
      path.lineTo(p6.x, p6.y);
      path.close();
      return;
    }

    // 4. GOTHIC / BLACKLETTER: Diamond wedge terminals
    if (family === 'GOTHIC' || family === 'BLACKLETTER' || terminal === 'WEDGE') {
      const d = Math.round(w * 0.65);
      const p1 = ctx.pt(x, y + (options?.botTerminal ? d : 0), glyphCode, 50);
      const p2 = ctx.pt(x + w / 2, options?.botTerminal ? y - d * 0.5 : y, glyphCode, 51);
      const p3 = ctx.pt(x + w, y + (options?.botTerminal ? d : 0), glyphCode, 52);
      const p4 = ctx.pt(x + w, y + h - (options?.topTerminal ? d : 0), glyphCode, 53);
      const p5 = ctx.pt(x + w / 2, options?.topTerminal ? y + h + d * 0.5 : y + h, glyphCode, 54);
      const p6 = ctx.pt(x, y + h - (options?.topTerminal ? d : 0), glyphCode, 55);

      path.moveTo(p1.x, p1.y);
      path.lineTo(p2.x, p2.y);
      path.lineTo(p3.x, p3.y);
      path.lineTo(p4.x, p4.y);
      path.lineTo(p5.x, p5.y);
      path.lineTo(p6.x, p6.y);
      path.close();
      return;
    }

    // 5. HANDWRITTEN / BRUSH: Organic tapered and rounded corners
    if (family === 'HANDWRITTEN' || family === 'BRUSH' || family === 'SCRIPT') {
      const p1 = ctx.pt(x, y, glyphCode, 60);
      const p2 = ctx.pt(x + w * 1.05, y + 4, glyphCode, 61);
      const p3 = ctx.pt(x + w * 0.95, y + h, glyphCode, 62);
      const p4 = ctx.pt(x - 2, y + h - 2, glyphCode, 63);

      path.moveTo(p1.x, p1.y);
      path.lineTo(p2.x, p2.y);
      path.lineTo(p3.x, p3.y);
      path.lineTo(p4.x, p4.y);
      path.close();
      return;
    }

    // 6. STANDARD GEOMETRIC RECTANGULAR STEM
    const p1 = ctx.pt(x, y, glyphCode, 1);
    const p2 = ctx.pt(x + w, y, glyphCode, 2);
    const p3 = ctx.pt(x + w, y + h, glyphCode, 3);
    const p4 = ctx.pt(x, y + h, glyphCode, 4);

    path.moveTo(p1.x, p1.y);
    path.lineTo(p2.x, p2.y);
    path.lineTo(p3.x, p3.y);
    path.lineTo(p4.x, p4.y);
    path.close();
  }
}
