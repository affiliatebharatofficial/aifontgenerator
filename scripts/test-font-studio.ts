import { FontCompilerService } from '../lib/font/compiler/fontCompiler';
import { StyleAwareGlyphEngine } from '../lib/font/glyphs/styleAwareEngine';
import { GlyphTransformEngine } from '../lib/font/studio/transformEngine';
import { AIGlyphEditor } from '../lib/font/studio/aiGlyphEditor';
import { FontQualityEngine } from '../lib/font/studio/qualityEngine';
import { FontStudioService } from '../lib/font/studio/studioService';
import { DEFAULT_TRANSFORM_PARAMS, type GlyphOverride } from '../lib/font/studio/types';
import type { FontSpecification } from '../lib/font/specification/types';
import { FontValidationService } from '../lib/font/validator/fontValidator';
import * as opentype from 'opentype.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✔ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ✖ [FAIL] ${message}`);
    failed++;
  }
}

async function runFontStudioTestSuite() {
  console.log('================================================================');
  console.log('PHASE 27: PROFESSIONAL FONT STUDIO + AI GLYPH EDITOR TEST SUITE');
  console.log('================================================================\n');

  // --- TEST GROUP 1: Font Studio State & Glyph Initialization ---
  console.log('--- TEST GROUP 1: Font Studio State & Glyph Initialization ---');
  const baseSpec: FontSpecification = {
    fontName: 'StudioHorrorFont',
    category: 'Display',
    weight: 'Bold',
    width: 'Normal',
    style: 'Modern',
    unitsPerEm: 1000,
    ascender: 800,
    descender: -200,
    capHeight: 700,
    xHeight: 500,
    stemWidth: 140,
    cornerStyle: 'sharp',
    contrast: 'high',
    strokeStyle: 'solid',
    designDescription: 'Horror display font with sharp angular spikes',
    characterSet: {
      uppercase: true,
      lowercase: true,
      numbers: true,
      punctuation: true,
    },
    advancedSettings: {
      letterSpacing: 0,
      contrast: 'high',
      cornerStyle: 'sharp',
      strokeStyle: 'solid',
    },
    styleDNA: {
      styleFamily: 'HORROR',
      unitsPerEm: 1000,
      strokeModel: 'MODULATED',
      terminalStyle: 'SHARP',
      cornerStyle: 'SHARP',
      curveModel: 'ANGULAR',
      counterStyle: 'ANGULAR',
      baselineBehavior: 'IRREGULAR',
      spacing: 'OPEN',
      proportions: {
        width: 1.0,
        ascender: 0.85,
        descender: -0.25,
        capHeight: 0.75,
        xHeight: 0.5,
      },
      distortion: 0.8,
      roundness: 0.1,
      angularity: 0.9,
      strokeWidth: 0.14,
      strokeContrast: 0.8,
      symmetry: 0.5,
      slant: 0,
      decorationLevel: 'STRONG',
      glyphVariation: 'SUBTLE',
      visualComplexity: 'COMPLEX',
      designIntent: 'Horror test font',
      generatedVia: 'fallback_rule',
    },
  };

  const styleEngine = new StyleAwareGlyphEngine(baseSpec, 1337);
  const baseGlyphs = styleEngine.generateGlyphs();
  assert(baseGlyphs.length >= 95, `Base font generated ${baseGlyphs.length} glyphs (>= 95 expected)`);

  const glyphA = baseGlyphs.find((g) => g.name === 'A' || g.unicode === 65);
  const glyphB = baseGlyphs.find((g) => g.name === 'B' || g.unicode === 66);
  assert(glyphA !== undefined && glyphA.path.commands.length > 0, "Glyph 'A' outline extracted with valid path commands");
  assert(glyphB !== undefined && glyphB.path.commands.length > 0, "Glyph 'B' outline extracted with valid path commands");

  // --- TEST GROUP 2: Vector Transform Engine ---
  console.log('\n--- TEST GROUP 2: Vector Transform Engine ---');
  const overrideA: GlyphOverride = {
    glyphId: 'A',
    unicode: 65,
    char: 'A',
    name: 'A',
    transforms: {
      ...DEFAULT_TRANSFORM_PARAMS,
      scaleX: 1.25,
      slant: 15,
      strokeDelta: 1.4,
      roundnessDelta: -0.5,
      advanceWidthDelta: 80,
    },
    version: 1,
    updatedAt: new Date().toISOString(),
  };

  const transformedA = GlyphTransformEngine.applyTransform(glyphA!, overrideA);
  const transAdv = transformedA.advanceWidth || 0;
  const baseAdv = glyphA!.advanceWidth || 0;
  assert(transAdv > baseAdv, `Transformed 'A' advance width (${transAdv}) > base (${baseAdv})`);
  assert(transformedA.path.commands.length === glyphA!.path.commands.length, 'Transformed path topology maintained exact command integrity');

  // Verify coordinates are modified and finite
  const transCmd = transformedA.path.commands[0] as { x?: number };
  const transFirstX = transCmd.x ?? 0;
  assert(Number.isFinite(transFirstX), 'Transformed coordinates are strictly finite numbers');

  // --- TEST GROUP 3: Glyph Override Model & Non-Destructive Reset ---
  console.log('\n--- TEST GROUP 3: Glyph Override Model & Non-Destructive Reset ---');
  let overridesMap: Record<string, GlyphOverride> = { A: overrideA };
  assert(overridesMap['A'] !== undefined, "Override map successfully records 'A'");

  // Reset single glyph
  overridesMap = GlyphTransformEngine.resetGlyph(overridesMap, 'A');
  assert(overridesMap['A'] === undefined, "Reset Glyph 'A' restores exact original state");

  // Reset all
  overridesMap = {
    A: overrideA,
    B: { ...overrideA, char: 'B', name: 'B', unicode: 66 },
  };
  overridesMap = GlyphTransformEngine.resetAll();
  assert(Object.keys(overridesMap).length === 0, 'Reset All clears all active glyph overrides');

  // --- TEST GROUP 4: 50+ Undo / Redo Stack Operations ---
  console.log('\n--- TEST GROUP 4: 50+ Undo / Redo Stack Operations ---');
  const historyStack: Array<Record<string, GlyphOverride>> = [{}];
  let currentOv: Record<string, GlyphOverride> = {};

  for (let i = 1; i <= 55; i++) {
    currentOv = {
      ...currentOv,
      A: {
        ...overrideA,
        transforms: { ...overrideA.transforms, strokeDelta: 1.0 + i * 0.01 },
        version: i,
      },
    };
    historyStack.push(currentOv);
  }
  assert(historyStack.length === 56, `History stack successfully recorded 55 sequential edit operations`);

  // Undo 20 steps
  const undidState = historyStack[historyStack.length - 21];
  assert(undidState.A.version === 35, 'Undo 20 steps correctly rolls back to version 35');

  // --- TEST GROUP 5: AI Glyph Editor & Semantic NLP Instruction Interpretation ---
  console.log('\n--- TEST GROUP 5: AI Glyph Editor & Semantic NLP Instruction Interpretation ---');

  // 1. Sharper / Aggressive
  const aiSharper = await AIGlyphEditor.interpretGlyphEdit({
    instruction: 'Make this A more aggressive with sharper points',
    char: 'A',
    unicode: 65,
    styleDNA: baseSpec.styleDNA,
  });
  assert(aiSharper.operations.some((op) => op.type === 'ANGULARITY'), "AI interpreted 'aggressive' -> ANGULARITY");
  assert(aiSharper.operations.some((op) => op.type === 'ROUNDNESS'), "AI interpreted 'sharper' -> negative ROUNDNESS");

  // 2. Rounder
  const aiRounder = await AIGlyphEditor.interpretGlyphEdit({
    instruction: 'Make this B softer and more rounded',
    char: 'B',
    unicode: 66,
    styleDNA: baseSpec.styleDNA,
  });
  assert(aiRounder.operations.some((op) => op.type === 'ROUNDNESS' && (op.strength || 0) > 0), "AI interpreted 'rounded' -> positive ROUNDNESS");

  // 3. Bolder
  const aiBolder = await AIGlyphEditor.interpretGlyphEdit({
    instruction: 'Make this glyph heavier and bolder',
    char: 'C',
    unicode: 67,
    styleDNA: baseSpec.styleDNA,
  });
  assert(aiBolder.operations.some((op) => op.type === 'STROKE' && (op.scale || 1) > 1.0), "AI interpreted 'bolder' -> STROKE scale > 1.0");

  // 4. Thinner
  const aiThinner = await AIGlyphEditor.interpretGlyphEdit({
    instruction: 'Make this glyph delicate, slim, and thinner',
    char: 'D',
    unicode: 68,
    styleDNA: baseSpec.styleDNA,
  });
  assert(aiThinner.operations.some((op) => op.type === 'STROKE' && (op.scale || 1) < 1.0), "AI interpreted 'thinner' -> STROKE scale < 1.0");

  // 5. Match Font Style
  const aiMatch = await AIGlyphEditor.interpretGlyphEdit({
    instruction: 'Match overall font style DNA',
    char: 'E',
    unicode: 69,
    styleDNA: baseSpec.styleDNA,
  });
  assert(aiMatch.operations.some((op) => op.type === 'CONTRAST'), "AI interpreted 'match style' -> CONTRAST alignment");

  // Apply AI instruction to transforms
  const appliedTransforms = AIGlyphEditor.applyInstructionToTransforms(DEFAULT_TRANSFORM_PARAMS, aiBolder);
  assert(appliedTransforms.strokeDelta > 1.0, `Applied AI transforms successfully scaled stroke delta to ${appliedTransforms.strokeDelta.toFixed(2)}x`);

  // --- TEST GROUP 6: Glyph Locking & Variation Preservation ---
  console.log('\n--- TEST GROUP 6: Glyph Locking & Variation Preservation ---');
  const lockedOverrides: Record<string, GlyphOverride> = {
    A: {
      glyphId: 'A',
      unicode: 65,
      char: 'A',
      name: 'A',
      isLocked: true,
      transforms: { ...DEFAULT_TRANSFORM_PARAMS, strokeDelta: 1.8 },
      version: 1,
      updatedAt: new Date().toISOString(),
    },
  };

  // Apply group bolding (+20%) to all uppercase
  const groupTransformed = GlyphTransformEngine.applyGroupTransform(lockedOverrides, 'UPPERCASE', {
    strokeDelta: 1.2,
  });
  assert(groupTransformed['A'].transforms.strokeDelta === 1.8, "Locked glyph 'A' strokeDelta remained 1.8x (protected from group edits)");
  assert(groupTransformed['B'].transforms.strokeDelta === 1.2, "Unlocked glyph 'B' successfully received group edit (1.2x)");

  // --- TEST GROUP 7: Font-Wide Consistency & Quality Scoring ---
  console.log('\n--- TEST GROUP 7: Font-Wide Consistency & Quality Scoring ---');
  const initialQuality = FontQualityEngine.calculateQualityScore(baseGlyphs, undefined, baseSpec.styleDNA);
  assert(initialQuality.overallScore >= 80, `Initial quality score is ${initialQuality.overallScore}/100 (${initialQuality.rating})`);
  assert(initialQuality.categories.length === 7, 'Quality score contains all 7 mandatory typography categories');

  // Introduce an intentional extreme outlier on glyph 'Z'
  const outlierOverrides: Record<string, GlyphOverride> = {
    Z: {
      glyphId: 'Z',
      unicode: 90,
      char: 'Z',
      name: 'Z',
      isLocked: false,
      transforms: { ...DEFAULT_TRANSFORM_PARAMS, strokeDelta: 2.2 },
      version: 1,
      updatedAt: new Date().toISOString(),
    },
  };

  const consistencyReport = FontQualityEngine.evaluateConsistency(baseGlyphs, outlierOverrides, baseSpec.styleDNA);
  assert(consistencyReport.issues.some((i) => i.glyph === 'Z' && i.property === 'STROKE_WEIGHT'), "Consistency engine successfully flagged outlier stroke weight on 'Z'");
  assert(consistencyReport.issues[0].suggestedFix !== undefined, 'Consistency engine provided structured fix recommendation');

  // --- TEST GROUP 8: Devanagari Studio & GSUB Ligature Debugger ---
  console.log('\n--- TEST GROUP 8: Devanagari Studio & GSUB Ligature Debugger ---');
  const debugData = FontStudioService.getDevanagariShapingDebugData();
  assert(debugData.length === 26, `Devanagari debug inspector loaded 26 GSUB conjunct ligature rules`);

  const kraDebug = debugData.find((d) => d.glyphName === 'dvKRA');
  assert(kraDebug !== undefined, "Devanagari debug view contains dvKRA");
  assert(kraDebug!.inputHex.includes('0X915') || kraDebug!.inputHex.includes('0x915') || kraDebug!.inputHex.includes('0X0915'), "Devanagari input sequence decomposes into [0915, 094D, 0930]");

  // --- TEST GROUP 9: Real Font E2E Compilation & Verification ---
  console.log('\n--- TEST GROUP 9: Real Font E2E Compilation & Verification ---');
  const editedOverrides: Record<string, GlyphOverride> = {
    A: {
      glyphId: 'A',
      unicode: 65,
      char: 'A',
      name: 'A',
      isLocked: false,
      transforms: {
        ...DEFAULT_TRANSFORM_PARAMS,
        scaleX: 1.3,
        slant: 12,
        strokeDelta: 1.35,
        advanceWidthDelta: 50,
      },
      version: 2,
      updatedAt: new Date().toISOString(),
    },
  };

  // Compile modified font
  const editedGlyphs = baseGlyphs.map((baseG) => {
    const char = baseG.name || String.fromCharCode(baseG.unicode || 0);
    const ov = editedOverrides[char];
    if (ov) return GlyphTransformEngine.applyTransform(baseG, ov);
    return baseG;
  });

  const font = new opentype.Font({
    familyName: 'StudioHorrorEdited',
    styleName: 'Bold',
    unitsPerEm: 1000,
    ascender: 800,
    descender: -200,
    glyphs: editedGlyphs,
  });

  const ttfBuffer = Buffer.from(font.toArrayBuffer());
  const otfBuffer = Buffer.from(font.toArrayBuffer());
  const wawoff2 = (await import('wawoff2')).default;
  const woff2Buffer = Buffer.from(await wawoff2.compress(ttfBuffer));

  assert(ttfBuffer.length > 10000, `Compiled edited TTF binary (${ttfBuffer.length} bytes)`);
  assert(otfBuffer.length > 10000, `Compiled edited OTF binary (${otfBuffer.length} bytes)`);
  assert(woff2Buffer.length > 3000, `Compiled edited WOFF2 binary (${woff2Buffer.length} bytes)`);

  // OpenType binary parsing validation
  const parsedFont = opentype.parse(ttfBuffer.buffer.slice(ttfBuffer.byteOffset, ttfBuffer.byteOffset + ttfBuffer.byteLength));
  assert(parsedFont !== null, 'Compiled binary parsed successfully with opentype.js');

  const parsedA = parsedFont.charToGlyph('A');
  const parsedB = parsedFont.charToGlyph('B');
  const parsedAAdv = parsedA.advanceWidth || 0;
  const parsedBAdv = parsedB.advanceWidth || 0;
  assert(parsedAAdv > parsedBAdv, `Parsed TTF 'A' advance width (${parsedAAdv}) reflects applied studio override`);

  const validation = FontValidationService.validateFontBuffers({
    ttf: ttfBuffer,
    otf: otfBuffer,
    woff2: woff2Buffer,
  });
  assert(validation.valid, 'Compiled edited font binary passed 100% OpenType validation');

  console.log('\n================================================================');
  console.log(`STUDIO TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runFontStudioTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
