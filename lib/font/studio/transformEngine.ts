import { Path, Glyph } from 'opentype.js';
import type { GlyphTransformParams, GlyphOverride, GlyphGroupType } from './types';
import { DEFAULT_TRANSFORM_PARAMS } from './types';

export class GlyphTransformEngine {
  /**
   * Applies non-destructive transform overrides to an opentype.js Glyph,
   * returning a cloned glyph with transformed vector outline and metrics.
   */
  public static applyTransform(
    baseGlyph: Glyph,
    override?: GlyphOverride | GlyphTransformParams
  ): Glyph {
    if (!override) return baseGlyph;

    const params: GlyphTransformParams = 'transforms' in override ? override.transforms : override;

    // Clone base path
    const originalPath = baseGlyph.path;
    if (!originalPath || originalPath.commands.length === 0) {
      // Space or empty glyph
      const baseAdv = baseGlyph.advanceWidth || 500;
      const newAdv = Math.max(
        100,
        Math.round(baseAdv * params.scaleX + (params.advanceWidthDelta || 0))
      );
      return new Glyph({
        name: baseGlyph.name || undefined,
        unicode: baseGlyph.unicode,
        unicodes: baseGlyph.unicodes,
        advanceWidth: newAdv,
        path: new Path(),
      });
    }

    // Clone commands
    const clonedPath = new Path();
    const origCommands = originalPath.commands;

    // Calculate original bounding box center for centered scaling
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const rawCmd of origCommands) {
      const cmd = rawCmd as { type: string; x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number };
      if (cmd.x !== undefined && Number.isFinite(cmd.x)) {
        minX = Math.min(minX, cmd.x);
        maxX = Math.max(maxX, cmd.x);
      }
      if (cmd.y !== undefined && Number.isFinite(cmd.y)) {
        minY = Math.min(minY, cmd.y);
        maxY = Math.max(maxY, cmd.y);
      }
    }

    if (!Number.isFinite(minX)) minX = 0;
    if (!Number.isFinite(maxX)) maxX = 500;
    if (!Number.isFinite(minY)) minY = 0;
    if (!Number.isFinite(maxY)) maxY = 700;

    const centerX = (minX + maxX) / 2;
    const slantRad = (params.slant * Math.PI) / 180;
    const tanSlant = Math.tan(slantRad);

    // Transform individual path points
    for (const rawCmd of origCommands) {
      const cmd = rawCmd as { type: string; x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number };
      const type = cmd.type;

      const transformPoint = (x?: number, y?: number): { x: number; y: number } => {
        if (x === undefined || !Number.isFinite(x)) x = 0;
        if (y === undefined || !Number.isFinite(y)) y = 0;

        // 1. Scale around X-center and Y-baseline (0)
        let tx = centerX + (x - centerX) * params.scaleX;
        let ty = y * params.scaleY;

        // 2. Stroke delta modification (expansion/contraction from center)
        if (params.strokeDelta !== 1.0) {
          const dx = tx - (centerX + params.moveX);
          tx += dx * (params.strokeDelta - 1.0) * 0.25;
        }

        // 3. Slant (italic shear relative to baseline)
        if (params.slant !== 0) {
          tx += ty * tanSlant;
        }

        // 4. Move / translation
        tx += params.moveX + (params.lsbDelta || 0);
        ty += params.moveY;

        // 5. Roundness / Corner softening if applicable
        if (params.roundnessDelta !== 0 && (type === 'L' || type === 'C')) {
          // Micro-adjustment for bezier control influence
          tx += Math.sign(tx - centerX) * params.roundnessDelta * 5;
        }

        return { x: Math.round(tx * 10) / 10, y: Math.round(ty * 10) / 10 };
      };

      if (type === 'M') {
        const p = transformPoint(cmd.x, cmd.y);
        clonedPath.moveTo(p.x, p.y);
      } else if (type === 'L') {
        const p = transformPoint(cmd.x, cmd.y);
        clonedPath.lineTo(p.x, p.y);
      } else if (type === 'C') {
        const p1 = transformPoint(cmd.x1, cmd.y1);
        const p2 = transformPoint(cmd.x2, cmd.y2);
        const p = transformPoint(cmd.x, cmd.y);
        clonedPath.curveTo(p1.x, p1.y, p2.x, p2.y, p.x, p.y);
      } else if (type === 'Q') {
        const p1 = transformPoint(cmd.x1, cmd.y1);
        const p = transformPoint(cmd.x, cmd.y);
        clonedPath.quadTo(p1.x, p1.y, p.x, p.y);
      } else if (type === 'Z') {
        clonedPath.closePath();
      }
    }

    // Advance width computation
    const baseAdvance = baseGlyph.advanceWidth || 600;
    const newAdvanceWidth = Math.max(
      150,
      Math.round(
        baseAdvance * params.scaleX +
          (params.advanceWidthDelta || 0) +
          (params.lsbDelta || 0) +
          (params.rsbDelta || 0)
      )
    );

    return new Glyph({
      name: baseGlyph.name || undefined,
      unicode: baseGlyph.unicode,
      unicodes: baseGlyph.unicodes,
      advanceWidth: newAdvanceWidth,
      path: clonedPath,
    });
  }

  /**
   * Applies group transformation across a set of target glyph characters.
   */
  public static applyGroupTransform(
    existingOverrides: Record<string, GlyphOverride>,
    groupType: GlyphGroupType,
    transformDelta: Partial<GlyphTransformParams>
  ): Record<string, GlyphOverride> {
    const updated = { ...existingOverrides };
    const targetChars = this.getGroupCharacters(groupType);

    for (const char of targetChars) {
      const current = updated[char] || {
        glyphId: char,
        unicode: char.charCodeAt(0),
        char,
        name: char,
        isLocked: false,
        transforms: { ...DEFAULT_TRANSFORM_PARAMS },
        version: 1,
        updatedAt: new Date().toISOString(),
      };

      // If locked, skip
      if (current.isLocked) continue;

      updated[char] = {
        ...current,
        transforms: {
          scaleX: Math.min(2.0, Math.max(0.5, current.transforms.scaleX * (transformDelta.scaleX ?? 1.0))),
          scaleY: Math.min(2.0, Math.max(0.5, current.transforms.scaleY * (transformDelta.scaleY ?? 1.0))),
          moveX: current.transforms.moveX + (transformDelta.moveX ?? 0),
          moveY: current.transforms.moveY + (transformDelta.moveY ?? 0),
          slant: Math.min(30, Math.max(-30, current.transforms.slant + (transformDelta.slant ?? 0))),
          strokeDelta: Math.min(2.5, Math.max(0.4, current.transforms.strokeDelta * (transformDelta.strokeDelta ?? 1.0))),
          roundnessDelta: Math.min(1.0, Math.max(-1.0, current.transforms.roundnessDelta + (transformDelta.roundnessDelta ?? 0))),
          advanceWidthDelta: current.transforms.advanceWidthDelta + (transformDelta.advanceWidthDelta ?? 0),
          lsbDelta: current.transforms.lsbDelta + (transformDelta.lsbDelta ?? 0),
          rsbDelta: current.transforms.rsbDelta + (transformDelta.rsbDelta ?? 0),
        },
        version: (current.version || 1) + 1,
        updatedAt: new Date().toISOString(),
      };
    }

    return updated;
  }

  public static getGroupCharacters(groupType: GlyphGroupType): string[] {
    switch (groupType) {
      case 'UPPERCASE':
        return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      case 'LOWERCASE':
        return 'abcdefghijklmnopqrstuvwxyz'.split('');
      case 'NUMERALS':
        return '0123456789'.split('');
      case 'PUNCTUATION':
        return '.,!?:;-"\'()[]{}@#$%&*+=/\\|<>~`'.split('');
      case 'DEVANAGARI_CONSONANTS':
        return 'कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह'.split('');
      case 'DEVANAGARI_MARKS':
        return 'ािीुूृेैोौ्ंःँ'.split('');
      case 'ALL':
      default:
        return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?:;-"\'()'.split('');
    }
  }

  /**
   * Resets a single glyph override back to original defaults.
   */
  public static resetGlyph(
    existingOverrides: Record<string, GlyphOverride>,
    glyphId: string
  ): Record<string, GlyphOverride> {
    const next = { ...existingOverrides };
    delete next[glyphId];
    return next;
  }

  /**
   * Resets all glyph overrides.
   */
  public static resetAll(): Record<string, GlyphOverride> {
    return {};
  }

  /**
   * Applies structured AIGlyphInstruction operations to transform parameters.
   */
  public static applyInstructionToTransforms(
    current: GlyphTransformParams,
    instruction: import('./types').AIGlyphInstruction
  ): GlyphTransformParams {
    const next = { ...current };

    for (const op of instruction.operations) {
      switch (op.type) {
        case 'STROKE':
          if (op.scale) next.strokeDelta = Math.min(2.5, Math.max(0.4, next.strokeDelta * op.scale));
          break;
        case 'WIDTH':
          if (op.scale) next.scaleX = Math.min(2.0, Math.max(0.5, next.scaleX * op.scale));
          break;
        case 'HEIGHT':
          if (op.scale) next.scaleY = Math.min(2.0, Math.max(0.5, next.scaleY * op.scale));
          break;
        case 'SLANT':
          if (op.strength) next.slant = Math.min(30, Math.max(-30, next.slant + op.strength));
          break;
        case 'ROUNDNESS':
          if (op.strength) next.roundnessDelta = Math.min(1.0, Math.max(-1.0, next.roundnessDelta + op.strength));
          break;
        case 'ANGULARITY':
          if (op.strength) next.roundnessDelta = Math.min(1.0, Math.max(-1.0, next.roundnessDelta - op.strength));
          break;
        case 'SPACING':
          if (op.strength) next.advanceWidthDelta += op.strength * 50;
          break;
        case 'PROPORTION':
          next.scaleX = next.scaleX * 0.9 + 0.1;
          next.scaleY = next.scaleY * 0.9 + 0.1;
          break;
        case 'CONTRAST':
          next.strokeDelta = 1.0;
          break;
      }
    }

    return next;
  }
}
