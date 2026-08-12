import { Path, Glyph } from 'opentype.js';
import type { CharacterAssignment } from './types';

/**
 * Vectorization engine for handwriting glyph contours.
 * Converts thresholded pixel grids into smooth vector contour paths (`opentype.Path`)
 * mapped to OpenType font coordinate metrics (unitsPerEm = 1000, baseline = 0, ascender = 800, descender = -200).
 */
export class HandwritingVectorizerEngine {
  /**
   * Generates a complete array of vector opentype.Glyph objects from approved character assignments.
   */
  public static vectorizeAssignments(assignments: CharacterAssignment[]): Glyph[] {
    const glyphs: Glyph[] = [];

    // 1. Mandatory .notdef fallback glyph (Unicode 0)
    glyphs.push(this.createNotDefGlyph());

    // 2. Mandatory Space glyph (Unicode 32)
    glyphs.push(
      new Glyph({
        name: 'space',
        unicode: 32,
        advanceWidth: 260,
        path: new Path(),
      })
    );

    // 3. Process each approved character assignment
    for (const assignment of assignments) {
      if (!assignment.approved) continue;

      const item = assignment.item;
      const char = assignment.char;
      const unicode = assignment.unicode;

      const glyph = this.createHandwritingGlyph(char, unicode, item.grid);
      glyphs.push(glyph);
    }

    return glyphs;
  }

  /**
   * Converts a 2D binary pixel grid into an OpenType Glyph with vector contour path.
   */
  private static createHandwritingGlyph(
    char: string,
    unicode: number,
    grid: number[][]
  ): Glyph {
    const path = new Path();
    const size = grid.length || 32;

    // Define OpenType typography metrics
    let adv = 600;
    let yBottom = 0; // Baseline
    let ySpan = 700; // Cap height / ascender span

    if (/[a-z]/.test(char)) {
      adv = 520;
      ySpan = 500; // x-height
      if (['g', 'j', 'p', 'q', 'y'].includes(char)) {
        yBottom = -180; // Descender
        ySpan = 650;
      } else if (['b', 'd', 'f', 'h', 'k', 'l', 't'].includes(char)) {
        ySpan = 720; // Ascender
      }
    } else if (/[0-9]/.test(char)) {
      adv = 560;
      ySpan = 700;
    } else if (/[.,!?;:'"-]/.test(char)) {
      adv = 320;
      ySpan = 400;
    }

    const marginX = 60;
    const drawWidth = adv - marginX * 2;

    // Vectorize active pixels into rectangular contour paths
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === 1) {
          // Convert grid (row, col) to OpenType coordinates (y goes UP)
          const x1 = marginX + (c / size) * drawWidth;
          const x2 = marginX + ((c + 1.2) / size) * drawWidth;

          const y1 = yBottom + ((size - r) / size) * ySpan;
          const y2 = yBottom + ((size - r - 1.2) / size) * ySpan;

          // Draw contour rectangle
          path.moveTo(x1, y1);
          path.lineTo(x2, y1);
          path.lineTo(x2, y2);
          path.lineTo(x1, y2);
          path.close();
        }
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
   * Required OpenType .notdef fallback glyph box.
   */
  private static createNotDefGlyph(): Glyph {
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
}
