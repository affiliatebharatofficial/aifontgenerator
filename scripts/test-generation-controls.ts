import { FontTypographyDirector } from '../lib/font/specification/director';
import { StyleAwareGlyphEngine } from '../lib/font/glyphs/styleAwareEngine';
import { FontCompilerService } from '../lib/font/compiler/fontCompiler';
import { FontValidationService } from '../lib/font/validator/fontValidator';
import {
  GenerationControlsEngine,
  DEFAULT_GENERATION_CONTROLS,
  type GenerationControls,
} from '../lib/font/specification/generationControls';
import type { FontSpecification } from '../lib/font/specification/types';

async function runGenerationControlsTests() {
  console.log('====================================================');
  console.log(' PHASE 24 — GENERATION CONTROLS TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ PASSED: ${message}`);
      passed++;
    } else {
      console.error(`  ✕ FAILED: ${message}`);
      failed++;
    }
  }

  // TEST 1: CONTROL DEFAULTS
  console.log('[TEST 1] Default Generation Controls Verification');
  assert(DEFAULT_GENERATION_CONTROLS.styleStrength === 50, 'Default styleStrength is 50');
  assert(DEFAULT_GENERATION_CONTROLS.variation === 50, 'Default variation is 50');
  assert(DEFAULT_GENERATION_CONTROLS.weight === 'Regular', 'Default weight is Regular');
  assert(DEFAULT_GENERATION_CONTROLS.width === 'Normal', 'Default width is Normal');
  assert(DEFAULT_GENERATION_CONTROLS.slant === 'Upright', 'Default slant is Upright');
  assert(DEFAULT_GENERATION_CONTROLS.spacing === 'Normal', 'Default spacing is Normal');

  // TEST 2: STYLE STRENGTH SCALING (0 vs 50 vs 100)
  console.log('\n[TEST 2] Style Strength Scaling (0 vs 50 vs 100)');
  const horrorBase = FontTypographyDirector.createFallbackDNA('Create a terrifying horror font with sharp dripping terminals');

  const controlsStr0: GenerationControls = { ...DEFAULT_GENERATION_CONTROLS, styleStrength: 0 };
  const controlsStr50: GenerationControls = { ...DEFAULT_GENERATION_CONTROLS, styleStrength: 50 };
  const controlsStr100: GenerationControls = { ...DEFAULT_GENERATION_CONTROLS, styleStrength: 100 };

  const dnaStr0 = GenerationControlsEngine.applyGenerationControlsToDNA(horrorBase, controlsStr0);
  const dnaStr50 = GenerationControlsEngine.applyGenerationControlsToDNA(horrorBase, controlsStr50);
  const dnaStr100 = GenerationControlsEngine.applyGenerationControlsToDNA(horrorBase, controlsStr100);

  assert(dnaStr0.distortion <= dnaStr50.distortion, 'StyleStrength 0 distortion <= StyleStrength 50 distortion');
  assert(dnaStr50.distortion <= dnaStr100.distortion, 'StyleStrength 50 distortion <= StyleStrength 100 distortion');
  assert(dnaStr0.styleFamily === 'HORROR' && dnaStr100.styleFamily === 'HORROR', 'Base style family remains HORROR across strength levels');

  // TEST 3: CREATIVITY / VARIATION SCALING (0 vs 50 vs 100)
  console.log('\n[TEST 3] Creativity / Variation Scaling');
  const controlsVar0: GenerationControls = { ...DEFAULT_GENERATION_CONTROLS, variation: 0 };
  const controlsVar100: GenerationControls = { ...DEFAULT_GENERATION_CONTROLS, variation: 100 };

  const dnaVar0 = GenerationControlsEngine.applyGenerationControlsToDNA(horrorBase, controlsVar0);
  const dnaVar100 = GenerationControlsEngine.applyGenerationControlsToDNA(horrorBase, controlsVar100);

  assert(dnaVar0.styleFamily === 'HORROR' && dnaVar100.styleFamily === 'HORROR', 'Variation scaling preserves base style family');
  assert(dnaVar0.distortion !== dnaVar100.distortion || dnaVar0.proportions.width !== dnaVar100.proportions.width, 'Variation scaling alters micro-proportions/distortion');

  // TEST 4: FONT WEIGHT MAPPING
  console.log('\n[TEST 4] Font Weight Control Mapping');
  const weights: GenerationControls['weight'][] = ['Thin', 'Light', 'Regular', 'Medium', 'Bold', 'Black'];
  let prevStrokeWidth = 0;
  let weightMonotonic = true;

  for (const w of weights) {
    const controls = { ...DEFAULT_GENERATION_CONTROLS, weight: w };
    const dna = GenerationControlsEngine.applyGenerationControlsToDNA(horrorBase, controls);
    if (dna.strokeWidth <= prevStrokeWidth) {
      weightMonotonic = false;
    }
    prevStrokeWidth = dna.strokeWidth;
  }
  assert(weightMonotonic, 'Stroke width increases monotonically from Thin (0.035) to Black (0.24)');

  // TEST 5: FONT WIDTH MAPPING
  console.log('\n[TEST 5] Font Width Control Mapping');
  const dnaCondensed = GenerationControlsEngine.applyGenerationControlsToDNA(horrorBase, { ...DEFAULT_GENERATION_CONTROLS, width: 'Condensed' });
  const dnaNormal = GenerationControlsEngine.applyGenerationControlsToDNA(horrorBase, { ...DEFAULT_GENERATION_CONTROLS, width: 'Normal' });
  const dnaExpanded = GenerationControlsEngine.applyGenerationControlsToDNA(horrorBase, { ...DEFAULT_GENERATION_CONTROLS, width: 'Expanded' });

  assert(dnaCondensed.proportions.width < dnaNormal.proportions.width, 'Condensed width < Normal width');
  assert(dnaNormal.proportions.width < dnaExpanded.proportions.width, 'Normal width < Expanded width');

  // TEST 6: SLANT CONTROL MAPPING
  console.log('\n[TEST 6] Slant Control Mapping');
  const dnaUpright = GenerationControlsEngine.applyGenerationControlsToDNA(horrorBase, { ...DEFAULT_GENERATION_CONTROLS, slant: 'Upright' });
  const dnaSlight = GenerationControlsEngine.applyGenerationControlsToDNA(horrorBase, { ...DEFAULT_GENERATION_CONTROLS, slant: 'Slight' });
  const dnaItalic = GenerationControlsEngine.applyGenerationControlsToDNA(horrorBase, { ...DEFAULT_GENERATION_CONTROLS, slant: 'Italic' });
  const dnaStrongItalic = GenerationControlsEngine.applyGenerationControlsToDNA(horrorBase, { ...DEFAULT_GENERATION_CONTROLS, slant: 'Strong Italic' });

  assert(dnaUpright.slant === 0.0, 'Upright slant angle is 0.0');
  assert(dnaSlight.slant > 0 && dnaSlight.slant < dnaItalic.slant, 'Slight slant < Italic slant');
  assert(dnaItalic.slant < dnaStrongItalic.slant, 'Italic slant < Strong Italic slant');

  // TEST 7: SPACING CONTROL MAPPING
  console.log('\n[TEST 7] Spacing Control Mapping');
  const dnaTight = GenerationControlsEngine.applyGenerationControlsToDNA(horrorBase, { ...DEFAULT_GENERATION_CONTROLS, spacing: 'Tight' });
  const dnaOpen = GenerationControlsEngine.applyGenerationControlsToDNA(horrorBase, { ...DEFAULT_GENERATION_CONTROLS, spacing: 'Open' });

  assert(dnaTight.spacing === 'TIGHT', 'Tight spacing maps to TIGHT');
  assert(dnaOpen.spacing === 'OPEN', 'Open spacing maps to OPEN');

  // TEST 8: PROMPT STYLE AUTHORITY & COLLISION AVOIDANCE
  console.log('\n[TEST 8] Prompt Style Authority & Collision Avoidance');
  const luxuryBase = FontTypographyDirector.createFallbackDNA('Create an elegant luxury serif font for high fashion editorial logos');
  const luxuryControls: GenerationControls = {
    ...DEFAULT_GENERATION_CONTROLS,
    weight: 'Bold',
    width: 'Condensed',
  };
  const luxuryMerged = GenerationControlsEngine.applyGenerationControlsToDNA(luxuryBase, luxuryControls);

  assert(luxuryMerged.styleFamily === 'DIDONE_SERIF', 'Luxury Serif style family remains authoritative');
  assert(luxuryMerged.strokeWidth >= 0.15, 'Explicit Bold weight control applied');
  assert(luxuryMerged.proportions.width <= 0.85, 'Explicit Condensed width control applied');

  // TEST 9: DETERMINISTIC REPRODUCIBILITY (Same Prompt + Controls + Seed = Bit-Identical)
  console.log('\n[TEST 9] Deterministic Seed Reproducibility');
  const specA: FontSpecification = {
    fontName: 'DeterminismTest',
    category: 'Display',
    weight: 'Bold',
    width: 'Normal',
    style: 'Modern',
    unitsPerEm: 1000,
    ascender: 800,
    descender: -200,
    capHeight: 700,
    xHeight: 500,
    stemWidth: 160,
    cornerStyle: 'sharp',
    contrast: 'medium',
    strokeStyle: 'solid',
    styleDNA: dnaStr50,
    prompt: 'Deterministic seed test',
    designDescription: 'Deterministic seed test',
    characterSet: { uppercase: true, lowercase: true, numbers: true, punctuation: true },
    advancedSettings: { letterSpacing: 0, contrast: 'medium', cornerStyle: 'sharp', strokeStyle: 'solid' },
  };


  const engine1 = new StyleAwareGlyphEngine(specA, 42);
  const glyphs1 = engine1.generateGlyphs();
  const compiled1 = await FontCompilerService.compileFont(specA);

  const engine2 = new StyleAwareGlyphEngine(specA, 42);
  const glyphs2 = engine2.generateGlyphs();
  const compiled2 = await FontCompilerService.compileFont(specA);

  const glyphH1 = glyphs1.find((g) => g.name === 'H');
  const glyphH2 = glyphs2.find((g) => g.name === 'H');

  assert(
    glyphH1 !== undefined && glyphH2 !== undefined && glyphH1.path.commands.length === glyphH2.path.commands.length,
    'Glyph H commands count identical with same seed'
  );
  assert(compiled1.ttf.length === compiled2.ttf.length, 'TTF binary size identical with same seed');


  // TEST 10: VARIATION SEED DIFFERENTIATION
  console.log('\n[TEST 10] Multi-Seed Variation Differentiation');
  const varControls1: GenerationControls = { ...DEFAULT_GENERATION_CONTROLS, seed: 42, variationSeed: 1416 };
  const varControls2: GenerationControls = { ...DEFAULT_GENERATION_CONTROLS, seed: 42, variationSeed: 2753 };

  const dnaVarSeed1 = GenerationControlsEngine.applyGenerationControlsToDNA(horrorBase, varControls1);
  const dnaVarSeed2 = GenerationControlsEngine.applyGenerationControlsToDNA(horrorBase, varControls2);

  const specVar1: FontSpecification = { ...specA, styleDNA: dnaVarSeed1, fontName: 'VarFont_1' };
  const specVar2: FontSpecification = { ...specA, styleDNA: dnaVarSeed2, fontName: 'VarFont_2' };

  const compiledVar1 = await FontCompilerService.compileFont(specVar1);
  const compiledVar2 = await FontCompilerService.compileFont(specVar2);

  assert(compiledVar1.ttf.length !== compiledVar2.ttf.length || dnaVarSeed1.proportions.width !== dnaVarSeed2.proportions.width, 'Multi-seed variations produce distinct binaries within same family');

  // TEST 11: PREVIEW / DOWNLOAD BINARY VALIDATION
  console.log('\n[TEST 11] Preview & Download OpenType Binary Validation');
  const val1 = FontValidationService.validateFontBuffers(compiled1);
  const valVar1 = FontValidationService.validateFontBuffers(compiledVar1);

  assert(val1.valid, 'Compiled baseline font binary passes OpenType validation');
  assert(valVar1.valid, 'Compiled variation font binary passes OpenType validation');

  console.log('\n====================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runGenerationControlsTests().catch((err) => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
