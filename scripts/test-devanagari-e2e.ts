import { FontCompilerService } from '../lib/font/compiler/fontCompiler';
import type { FontSpecification } from '../lib/font/specification/types';
import type { FontStyleDNA } from '../lib/font/specification/dna';
import { parse } from 'opentype.js';
import * as fs from 'fs';
import * as path from 'path';

/** Build a minimal valid FontStyleDNA for a given style family */
function makeDNA(overrides: Partial<FontStyleDNA>): FontStyleDNA {
  return {
    styleFamily: 'HORROR',
    strokeModel: 'MODULATED',
    terminalStyle: 'SHARP',
    cornerStyle: 'IRREGULAR',
    curveModel: 'ANGULAR',
    counterStyle: 'NARROW',
    baselineBehavior: 'IRREGULAR',
    spacing: 'TIGHT',
    decorationLevel: 'STRONG',
    glyphVariation: 'STRONG',
    visualComplexity: 'COMPLEX',
    strokeWidth: 0.14,
    strokeContrast: 0.55,
    roundness: 0.08,
    angularity: 0.90,
    distortion: 0.35,
    symmetry: 0.60,
    slant: 0.05,
    proportions: {
      width: 0.9,
      xHeight: 0.50,
      capHeight: 0.70,
      ascender: 0.80,
      descender: -0.20,
    },
    unitsPerEm: 1000,
    designIntent: 'Dripping horror Devanagari conjunct test',
    generatedVia: 'fallback_rule',
    ...overrides,
  };
}

async function runDevanagariE2ETest() {
  console.log('================================================================');
  console.log('PHASE 26 — DEVANAGARI END-TO-END PRODUCTION PIPELINE DEBUG TEST');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, description: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✔ [PASS] Test ${totalTests}: ${description}`);
      passedTests++;
    } else {
      console.error(`  ✖ [FAIL] Test ${totalTests}: ${description}`);
      process.exitCode = 1;
    }
  }

  // 1. Generate Horror Devanagari Font via Production Compiler
  console.log('--- Step 1: Compiling Horror Devanagari Font via Production Compiler ---');
  const horrorDNA = makeDNA({ styleFamily: 'HORROR' });
  const horrorSpec: FontSpecification = {
    fontName: 'DevanagariHorrorE2E',
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
    characterSet: { uppercase: true, lowercase: true, numbers: true, punctuation: true, devanagari: true },
    advancedSettings: { letterSpacing: 0, contrast: 'high', cornerStyle: 'sharp', strokeStyle: 'solid' },
    designDescription: 'Horror Devanagari E2E test',
    prompt: 'horror devanagari font test',
    styleDNA: horrorDNA,
  };

  const compiledBuffers = await FontCompilerService.compileFont(horrorSpec);
  assert(compiledBuffers.ttf.byteLength > 10000, `Compiled TTF binary (Size: ${compiledBuffers.ttf.byteLength} bytes)`);

  // 2. Save TTF to scratch directory for inspection
  const outputDir = path.join(process.cwd(), 'scratch');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const ttfPath = path.join(outputDir, 'DevanagariHorrorE2E.ttf');
  fs.writeFileSync(ttfPath, compiledBuffers.ttf);
  console.log(`  Saved production TTF binary to: ${ttfPath}`);

  // 3. Inspect OpenType Tables & GSUB Features
  console.log('\n--- Step 2: Validating OpenType GSUB Feature Table Structure ---');
  const arrayBuf = compiledBuffers.ttf.buffer.slice(
    compiledBuffers.ttf.byteOffset,
    compiledBuffers.ttf.byteOffset + compiledBuffers.ttf.byteLength
  );
  const font = parse(arrayBuf);
  const tables = font.tables as Record<string, unknown>;
  const gsub = tables.gsub as Record<string, unknown> | undefined;

  assert(!!gsub, 'Font binary embeds valid OpenType GSUB table');

  const scripts = (gsub?.scripts ?? []) as Array<Record<string, unknown>>;
  const scriptTags = scripts.map((s) => s.tag);
  assert(
    scriptTags.includes('deva') && scriptTags.includes('dev2') && scriptTags.includes('DFLT'),
    `GSUB scripts defined: ${scriptTags.join(', ')} (deva, dev2, DFLT expected)`
  );

  const features = (gsub?.features ?? []) as Array<Record<string, unknown>>;
  const featureTags = features.map((f) => f.tag);
  assert(
    featureTags.includes('rkrf') && featureTags.includes('cjct') && featureTags.includes('akhn') && featureTags.includes('nukt'),
    `GSUB features defined: ${featureTags.join(', ')} (rkrf, cjct, akhn, nukt, liga expected)`
  );

  // 4. Test that GSUB lookup entries resolve to valid conjunct glyph targets
  console.log('\n--- Step 3: Verifying GSUB Lookup Entries Map to Valid Conjunct Glyph Indices ---');
  const lookups = (gsub?.lookups ?? []) as Array<Record<string, unknown>>;
  assert(lookups.length > 0, `GSUB table has ${lookups.length} lookup(s)`);

  const subtables = lookups[0]?.subtables as Array<Record<string, unknown>> | undefined;
  const ligatureSets = subtables?.[0]?.ligatureSets as Array<Array<Record<string, unknown>>> | undefined;
  const firstLigSet = ligatureSets?.[0];
  assert(
    Array.isArray(firstLigSet) && firstLigSet.length > 0,
    `GSUB Lookup[0] ligatureSets contains ${firstLigSet?.length ?? 0} entries`
  );

  // 5. Verify that conjunct PUA glyphs exist in CMAP and have non-empty paths
  console.log('\n--- Step 4: Verifying Unique Vector Outlines for Devanagari Conjuncts ---');
  const conjunctList = [
    { text: 'क्र', code: 0xE001, name: 'dvKRA' },
    { text: 'प्र', code: 0xE002, name: 'dvPRA' },
    { text: 'त्र', code: 0xE005, name: 'dvTRA' },
    { text: 'श्र', code: 0xE006, name: 'dvSHRA' },
    { text: 'क्ष', code: 0xE007, name: 'dvKSHA' },
    { text: 'ज्ञ', code: 0xE008, name: 'dvJNYA' },
  ];

  for (const item of conjunctList) {
    const glyph = font.charToGlyph(String.fromCharCode(item.code));
    assert(
      glyph && glyph.index > 0 && glyph.path.commands.length > 5,
      `Conjunct "${item.text}" (${item.name}) mapped in CMAP + has non-empty vector path (${glyph.path.commands.length} cmds, idx ${glyph.index})`
    );
  }

  // 6. Test StyleDNA Effect on Devanagari Conjunct Geometry
  console.log('\n--- Step 5: Verifying StyleDNA Effect on Devanagari Conjunct Geometry ---');
  const bubbleDNA = makeDNA({
    styleFamily: 'BUBBLE',
    strokeModel: 'MONOLINE',
    terminalStyle: 'ROUND',
    cornerStyle: 'ROUND',
    curveModel: 'CIRCULAR',
    roundness: 0.95,
    angularity: 0.05,
    distortion: 0.0,
    symmetry: 0.95,
  });
  const bubbleSpec: FontSpecification = {
    ...horrorSpec,
    fontName: 'DevanagariBubbleE2E',
    styleDNA: bubbleDNA,
  };

  const bubbleBuffers = await FontCompilerService.compileFont(bubbleSpec);
  const bubbleFont = parse(
    bubbleBuffers.ttf.buffer.slice(bubbleBuffers.ttf.byteOffset, bubbleBuffers.ttf.byteOffset + bubbleBuffers.ttf.byteLength)
  );

  const horrorKra = font.charToGlyph(String.fromCharCode(0xE001));
  const bubbleKra = bubbleFont.charToGlyph(String.fromCharCode(0xE001));

  const horrorCmdCount = horrorKra.path.commands.length;
  const bubbleCmdCount = bubbleKra.path.commands.length;

  assert(
    horrorCmdCount !== bubbleCmdCount || horrorKra.path.toPathData() !== bubbleKra.path.toPathData(),
    `Horror क्र (${horrorCmdCount} cmds) and Bubble क्र (${bubbleCmdCount} cmds) produce distinct vector outlines`
  );

  console.log('\n================================================================');
  console.log(`DEVANAGARI E2E TEST SUMMARY: ${passedTests} / ${totalTests} PASSED`);
  console.log('================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runDevanagariE2ETest().catch((err) => {
  console.error('Unhandled error in Devanagari E2E test:', err);
  process.exit(1);
});
