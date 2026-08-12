import { Path } from 'opentype.js';
import { GlyphGeometryContext } from '../context';

export interface RingOptions {
  openRight?: boolean;
  openLeft?: boolean;
  openTop?: boolean;
  openBot?: boolean;
  cutLeft?: boolean;
}

export class RingPrimitive {
  /**
   * Generates a closed ring contour (outer hull + inner counter) with full Style DNA curvature and counter dynamics.
   */
  public static addRing(
    ctx: GlyphGeometryContext,
    path: Path,
    x: number,
    y: number,
    w: number,
    h: number,
    sX: number,
    sY: number,
    glyphCode: number = 0,
    options?: RingOptions
  ): void {
    const family = ctx.dna.styleFamily;
    const curve = ctx.dna.curveModel;
    const counter = ctx.dna.counterStyle;

    // 1. FUTURISTIC / ANGULAR: Octagonal Techno Ring
    if (family === 'FUTURISTIC' || curve === 'ANGULAR' || counter === 'ANGULAR') {
      const c = Math.min(32, Math.round(w * 0.28));
      // Outer Contour
      path.moveTo(ctx.pt(x + c, y + h, glyphCode, 200).x, ctx.pt(x + c, y + h, glyphCode, 200).y);
      path.lineTo(ctx.pt(x + w - c, y + h, glyphCode, 201).x, ctx.pt(x + w - c, y + h, glyphCode, 201).y);
      path.lineTo(ctx.pt(x + w, y + h - c, glyphCode, 202).x, ctx.pt(x + w, y + h - c, glyphCode, 202).y);
      path.lineTo(ctx.pt(x + w, y + c, glyphCode, 203).x, ctx.pt(x + w, y + c, glyphCode, 203).y);
      path.lineTo(ctx.pt(x + w - c, y, glyphCode, 204).x, ctx.pt(x + w - c, y, glyphCode, 204).y);
      path.lineTo(ctx.pt(x + c, y, glyphCode, 205).x, ctx.pt(x + c, y, glyphCode, 205).y);
      path.lineTo(ctx.pt(x, y + c, glyphCode, 206).x, ctx.pt(x, y + c, glyphCode, 206).y);
      path.lineTo(ctx.pt(x, y + h - c, glyphCode, 207).x, ctx.pt(x, y + h - c, glyphCode, 207).y);
      path.close();

      // Inner Counter
      const ic = Math.max(6, Math.round(c - Math.min(sX, sY) * 0.5));
      path.moveTo(ctx.pt(x + sX + ic, y + h - sY, glyphCode, 208).x, ctx.pt(x + sX + ic, y + h - sY, glyphCode, 208).y);
      path.lineTo(ctx.pt(x + sX, y + h - sY - ic, glyphCode, 209).x, ctx.pt(x + sX, y + h - sY - ic, glyphCode, 209).y);
      path.lineTo(ctx.pt(x + sX, y + sY + ic, glyphCode, 210).x, ctx.pt(x + sX, y + sY + ic, glyphCode, 210).y);
      path.lineTo(ctx.pt(x + sX + ic, y + sY, glyphCode, 211).x, ctx.pt(x + sX + ic, y + sY, glyphCode, 211).y);
      path.lineTo(ctx.pt(x + w - sX - ic, y + sY, glyphCode, 212).x, ctx.pt(x + w - sX - ic, y + sY, glyphCode, 212).y);
      path.lineTo(ctx.pt(x + w - sX, y + sY + ic, glyphCode, 213).x, ctx.pt(x + w - sX, y + sY + ic, glyphCode, 213).y);
      path.lineTo(ctx.pt(x + w - sX, y + h - sY - ic, glyphCode, 214).x, ctx.pt(x + w - sX, y + h - sY - ic, glyphCode, 214).y);
      path.lineTo(ctx.pt(x + w - sX - ic, y + h - sY, glyphCode, 215).x, ctx.pt(x + w - sX - ic, y + h - sY, glyphCode, 215).y);
      path.close();
      return;
    }

    // 2. HORROR / OCCULT: Jagged Sharp Hexagonal Ring
    if (family === 'HORROR' || family === 'OCCULT' || curve === 'IRREGULAR') {
      const midY = y + Math.round(h * 0.5);
      // Outer
      path.moveTo(ctx.pt(x + w / 2, y + h + 15, glyphCode, 220).x, ctx.pt(x + w / 2, y + h + 15, glyphCode, 220).y);
      path.lineTo(ctx.pt(x + w + 8, midY, glyphCode, 221).x, ctx.pt(x + w + 8, midY, glyphCode, 221).y);
      path.lineTo(ctx.pt(x + w / 2, y - 15, glyphCode, 222).x, ctx.pt(x + w / 2, y - 15, glyphCode, 222).y);
      path.lineTo(ctx.pt(x - 8, midY, glyphCode, 223).x, ctx.pt(x - 8, midY, glyphCode, 223).y);
      path.close();

      // Inner Narrow Slit Counter
      path.moveTo(ctx.pt(x + w / 2, y + h - sY - 5, glyphCode, 224).x, ctx.pt(x + w / 2, y + h - sY - 5, glyphCode, 224).y);
      path.lineTo(ctx.pt(x + sX, midY, glyphCode, 225).x, ctx.pt(x + sX, midY, glyphCode, 225).y);
      path.lineTo(ctx.pt(x + w / 2, y + sY + 5, glyphCode, 226).x, ctx.pt(x + w / 2, y + sY + 5, glyphCode, 226).y);
      path.lineTo(ctx.pt(x + w - sX, midY, glyphCode, 227).x, ctx.pt(x + w - sX, midY, glyphCode, 227).y);
      path.close();
      return;
    }

    // 3. GOTHIC / BLACKLETTER: Pointed Arch Oval
    if (family === 'GOTHIC' || family === 'BLACKLETTER') {
      const d = Math.round(w * 0.45);
      // Outer Pointed Arch
      path.moveTo(ctx.pt(x + w / 2, y + h + 20, glyphCode, 230).x, ctx.pt(x + w / 2, y + h + 20, glyphCode, 230).y);
      path.lineTo(ctx.pt(x + w, y + h - d, glyphCode, 231).x, ctx.pt(x + w, y + h - d, glyphCode, 231).y);
      path.lineTo(ctx.pt(x + w, y + d, glyphCode, 232).x, ctx.pt(x + w, y + d, glyphCode, 232).y);
      path.lineTo(ctx.pt(x + w / 2, y - 20, glyphCode, 233).x, ctx.pt(x + w / 2, y - 20, glyphCode, 233).y);
      path.lineTo(ctx.pt(x, y + d, glyphCode, 234).x, ctx.pt(x, y + d, glyphCode, 234).y);
      path.lineTo(ctx.pt(x, y + h - d, glyphCode, 235).x, ctx.pt(x, y + h - d, glyphCode, 235).y);
      path.close();

      // Inner Counter
      path.moveTo(ctx.pt(x + w / 2, y + h - sY, glyphCode, 236).x, ctx.pt(x + w / 2, y + h - sY, glyphCode, 236).y);
      path.lineTo(ctx.pt(x + sX, y + h - d, glyphCode, 237).x, ctx.pt(x + sX, y + h - d, glyphCode, 237).y);
      path.lineTo(ctx.pt(x + sX, y + d, glyphCode, 238).x, ctx.pt(x + sX, y + d, glyphCode, 238).y);
      path.lineTo(ctx.pt(x + w / 2, y + sY, glyphCode, 239).x, ctx.pt(x + w / 2, y + sY, glyphCode, 239).y);
      path.lineTo(ctx.pt(x + w - sX, y + d, glyphCode, 240).x, ctx.pt(x + w - sX, y + d, glyphCode, 240).y);
      path.lineTo(ctx.pt(x + w - sX, y + h - d, glyphCode, 241).x, ctx.pt(x + w - sX, y + h - d, glyphCode, 241).y);
      path.close();
      return;
    }

    // 4. BUBBLE / SANS / SERIF / STANDARD BEZIER ELLIPTICAL RING
    const ov = ctx.overshoot;
    const effY = y - ov;
    const effH = h + ov * 2;
    const rX = w / 2;
    const rY = effH / 2;
    const cX = x + rX;
    const cY = effY + rY;

    // Bézier control point multiplier (0.55228 for circular, modified by roundness)
    const kFactor = family === 'BUBBLE' ? 0.58 : 0.55228;
    const kX = rX * kFactor;
    const kY = rY * kFactor;

    // Outer Contour (Clockwise)
    path.moveTo(ctx.pt(cX, effY + effH, glyphCode, 250).x, ctx.pt(cX, effY + effH, glyphCode, 250).y);
    path.bezierCurveTo(
      ctx.pt(cX + kX, effY + effH, glyphCode, 251).x,
      ctx.pt(cX + kX, effY + effH, glyphCode, 251).y,
      ctx.pt(x + w, cY + kY, glyphCode, 252).x,
      ctx.pt(x + w, cY + kY, glyphCode, 252).y,
      ctx.pt(x + w, cY, glyphCode, 253).x,
      ctx.pt(x + w, cY, glyphCode, 253).y
    );
    path.bezierCurveTo(
      ctx.pt(x + w, cY - kY, glyphCode, 254).x,
      ctx.pt(x + w, cY - kY, glyphCode, 254).y,
      ctx.pt(cX + kX, effY, glyphCode, 255).x,
      ctx.pt(cX + kX, effY, glyphCode, 255).y,
      ctx.pt(cX, effY, glyphCode, 256).x,
      ctx.pt(cX, effY, glyphCode, 256).y
    );
    path.bezierCurveTo(
      ctx.pt(cX - kX, effY, glyphCode, 257).x,
      ctx.pt(cX - kX, effY, glyphCode, 257).y,
      ctx.pt(x, cY - kY, glyphCode, 258).x,
      ctx.pt(x, cY - kY, glyphCode, 258).y,
      ctx.pt(x, cY, glyphCode, 259).x,
      ctx.pt(x, cY, glyphCode, 259).y
    );
    path.bezierCurveTo(
      ctx.pt(x, cY + kY, glyphCode, 260).x,
      ctx.pt(x, cY + kY, glyphCode, 260).y,
      ctx.pt(cX - kX, effY + effH, glyphCode, 261).x,
      ctx.pt(cX - kX, effY + effH, glyphCode, 261).y,
      ctx.pt(cX, effY + effH, glyphCode, 262).x,
      ctx.pt(cX, effY + effH, glyphCode, 262).y
    );
    path.close();

    // Inner Counter (Counter-Clockwise)
    const inRX = Math.max(10, rX - sX);
    const inRY = Math.max(10, rY - sY);
    const inKX = inRX * kFactor;
    const inKY = inRY * kFactor;

    path.moveTo(ctx.pt(cX, y + h - sY, glyphCode, 270).x, ctx.pt(cX, y + h - sY, glyphCode, 270).y);
    path.bezierCurveTo(
      ctx.pt(cX - inKX, y + h - sY, glyphCode, 271).x,
      ctx.pt(cX - inKX, y + h - sY, glyphCode, 271).y,
      ctx.pt(x + sX, cY + inKY, glyphCode, 272).x,
      ctx.pt(x + sX, cY + inKY, glyphCode, 272).y,
      ctx.pt(x + sX, cY, glyphCode, 273).x,
      ctx.pt(x + sX, cY, glyphCode, 273).y
    );
    path.bezierCurveTo(
      ctx.pt(x + sX, cY - inKY, glyphCode, 274).x,
      ctx.pt(x + sX, cY - inKY, glyphCode, 274).y,
      ctx.pt(cX - inKX, y + sY, glyphCode, 275).x,
      ctx.pt(cX - inKX, y + sY, glyphCode, 275).y,
      ctx.pt(cX, y + sY, glyphCode, 276).x,
      ctx.pt(cX, y + sY, glyphCode, 276).y
    );
    path.bezierCurveTo(
      ctx.pt(cX + inKX, y + sY, glyphCode, 277).x,
      ctx.pt(cX + inKX, y + sY, glyphCode, 277).y,
      ctx.pt(x + w - sX, cY - inKY, glyphCode, 278).x,
      ctx.pt(x + w - sX, cY - inKY, glyphCode, 278).y,
      ctx.pt(x + w - sX, cY, glyphCode, 279).x,
      ctx.pt(x + w - sX, cY, glyphCode, 279).y
    );
    path.bezierCurveTo(
      ctx.pt(x + w - sX, cY + inKY, glyphCode, 280).x,
      ctx.pt(x + w - sX, cY + inKY, glyphCode, 280).y,
      ctx.pt(cX + inKX, y + h - sY, glyphCode, 281).x,
      ctx.pt(cX + inKX, y + h - sY, glyphCode, 281).y,
      ctx.pt(cX, y + h - sY, glyphCode, 282).x,
      ctx.pt(cX, y + h - sY, glyphCode, 282).y
    );
    path.close();

  }
}
