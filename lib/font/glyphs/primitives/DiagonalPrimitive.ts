import { Path } from 'opentype.js';
import { GlyphGeometryContext } from '../context';

export class DiagonalPrimitive {
  /**
   * Renders an angled polygon stroke from (x1, y1) to (x2, y2) with width w.
   */
  public static addDiagonal(
    ctx: GlyphGeometryContext,
    path: Path,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    w: number,
    glyphCode: number = 0,
    options?: { isDownstroke?: boolean }
  ): void {
    const isDownstroke = options?.isDownstroke ?? true;
    const effectiveW = isDownstroke ? w : Math.max(10, Math.round(w * ctx.contrastRatio));

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;

    // Perpendicular normal offset
    const nx = (-dy / len) * (effectiveW / 2);
    const ny = (dx / len) * (effectiveW / 2);

    const p1 = ctx.pt(x1 + nx, y1 + ny, glyphCode, 300);
    const p2 = ctx.pt(x2 + nx, y2 + ny, glyphCode, 301);
    const p3 = ctx.pt(x2 - nx, y2 - ny, glyphCode, 302);
    const p4 = ctx.pt(x1 - nx, y1 - ny, glyphCode, 303);

    path.moveTo(p1.x, p1.y);
    path.lineTo(p2.x, p2.y);
    path.lineTo(p3.x, p3.y);
    path.lineTo(p4.x, p4.y);
    path.close();
  }

  /**
   * Renders a triangular V or A apex junction.
   */
  public static addApex(
    ctx: GlyphGeometryContext,
    path: Path,
    xTop: number,
    yTop: number,
    xLeft: number,
    yLeft: number,
    xRight: number,
    yRight: number,
    stemW: number,
    glyphCode: number = 0
  ): void {
    const thinW = Math.max(10, Math.round(stemW * ctx.contrastRatio));

    const pTop = ctx.pt(xTop, yTop, glyphCode, 310);
    const pRightBot = ctx.pt(xRight + stemW, yRight, glyphCode, 311);
    const pRightIn = ctx.pt(xRight, yRight, glyphCode, 312);
    const pInApex = ctx.pt(xTop, yTop - stemW * 0.9, glyphCode, 313);
    const pLeftIn = ctx.pt(xLeft + thinW, yLeft, glyphCode, 314);
    const pLeftBot = ctx.pt(xLeft, yLeft, glyphCode, 315);

    path.moveTo(pTop.x, pTop.y);
    path.lineTo(pRightBot.x, pRightBot.y);
    path.lineTo(pRightIn.x, pRightIn.y);
    path.lineTo(pInApex.x, pInApex.y);
    path.lineTo(pLeftIn.x, pLeftIn.y);
    path.lineTo(pLeftBot.x, pLeftBot.y);
    path.close();
  }
}
