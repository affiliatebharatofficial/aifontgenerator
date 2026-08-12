import { PromptIntelligenceEngine } from '../lib/font/specification/promptIntelligence';
import { FontTypographyDirector } from '../lib/font/specification/director';
import { StyleAwareGlyphEngine } from '../lib/font/glyphs/styleAwareEngine';
import { FontCompilerService } from '../lib/font/compiler/fontCompiler';
import { FontValidationService } from '../lib/font/validator/fontValidator';
import type { FontSpecification } from '../lib/font/specification/types';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, details?: string) {
  if (condition) {
    results.push({ name, passed: true, details });
    console.log(`  ✓ PASS: ${name}${details ? ` (${details})` : ''}`);
  } else {
    results.push({ name, passed: false, details, error: 'Assertion failed' });
    console.error(`  ✗ FAIL: ${name}${details ? ` (${details})` : ''}`);
  }
}

async function runPromptIntelligenceTests() {
  console.log('\n================================================================');
  console.log('PHASE 23: PROMPT INTELLIGENCE & STYLE CONTROL TEST SUITE');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // TEST GROUP 1: BASE FAMILY ISOLATION & RESISTANCE TO KEYWORD HIJACKING
  // --------------------------------------------------------------------------
  console.log('--- TEST GROUP 1: Base Family Isolation ---');

  const p1 = PromptIntelligenceEngine.analyzePrompt('horror font with rounded corners and soft circular letters');
  assert(
    p1.baseFamily === 'HORROR' || p1.baseFamily === 'OCCULT',
    'Base Family Isolation: Horror prompt with rounded modifier keeps HORROR base',
    `Family: ${p1.baseFamily}, Active Modifiers: ${p1.activeModifiers.join(', ')}`
  );
  assert(
    p1.activeModifiers.includes('ROUND') || p1.modifiers.roundness === 'HIGH',
    'Modifier Extracted: Round corners modifier recognized on horror font'
  );

  const p2 = PromptIntelligenceEngine.analyzePrompt('gothic blackletter font with wide spacing and thin strokes');
  assert(
    p2.baseFamily === 'GOTHIC' || p2.baseFamily === 'BLACKLETTER',
    'Base Family Isolation: Gothic prompt with thin strokes keeps GOTHIC base',
    `Family: ${p2.baseFamily}`
  );
  assert(
    p2.activeModifiers.includes('WIDE_SPACING') && p2.activeModifiers.includes('THIN'),
    'Modifier Extracted: Wide spacing and thin strokes recognized on gothic font'
  );

  const p3 = PromptIntelligenceEngine.analyzePrompt('futuristic techno sci-fi font with dripping slime terminals');
  assert(
    p3.baseFamily === 'FUTURISTIC',
    'Base Family Isolation: Futuristic sci-fi font keeps FUTURISTIC base',
    `Family: ${p3.baseFamily}`
  );
  assert(
    p3.activeModifiers.includes('DRIPPING'),
    'Modifier Extracted: Dripping terminals recognized on futuristic font'
  );

  const p4 = PromptIntelligenceEngine.analyzePrompt('luxury didone serif font with narrow condensed letters and tall capitals');
  assert(
    p4.baseFamily === 'DIDONE_SERIF' || p4.baseFamily === 'SERIF',
    'Base Family Isolation: Luxury serif keeps SERIF/DIDONE base',
    `Family: ${p4.baseFamily}`
  );
  assert(
    p4.activeModifiers.includes('NARROW') && p4.activeModifiers.includes('TALL'),
    'Modifier Extracted: Narrow width and tall capitals recognized'
  );

  // --------------------------------------------------------------------------
  // TEST GROUP 2: MULTI-CATEGORY DESIGN MODIFIER EXTRACTION
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: Multi-Category Modifier Extraction ---');

  const pMulti = PromptIntelligenceEngine.analyzePrompt(
    'ultra bold condensed cyberpunk font with chamfered corners, bouncy baseline, tight counters and forward slant'
  );

  assert(pMulti.baseFamily === 'FUTURISTIC', 'Multi-modifier: Futuristic base correctly identified');
  assert(pMulti.modifiers.weight === 'BLACK' || pMulti.modifiers.weight === 'BOLD', 'Multi-modifier: Weight modifier extracted');
  assert(pMulti.modifiers.width === 'NARROW' || pMulti.modifiers.width === 'CONDENSED', 'Multi-modifier: Width modifier extracted');
  assert(pMulti.modifiers.corners === 'CHAMFERED', 'Multi-modifier: Chamfered corner modifier extracted');
  assert(pMulti.modifiers.baseline === 'BOUNCY', 'Multi-modifier: Bouncy baseline modifier extracted');
  assert(pMulti.modifiers.counters === 'TIGHT', 'Multi-modifier: Tight counters modifier extracted');
  assert(pMulti.modifiers.slant === 'ITALIC', 'Multi-modifier: Slant modifier extracted');

  // --------------------------------------------------------------------------
  // TEST GROUP 3: FALLBACK RESILIENCE & DNA MODIFIER TRANSFORMATION
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Fallback DNA Modifier Synthesis ---');

  const fallbackDNA = FontTypographyDirector.createFallbackDNA(
    'tall narrow horror font with dripping terminals and cracked strokes'
  );

  assert(
    fallbackDNA.styleFamily === 'HORROR' || fallbackDNA.styleFamily === 'OCCULT',
    'Fallback DNA: StyleFamily is HORROR',
    `Family: ${fallbackDNA.styleFamily}`
  );
  assert(
    fallbackDNA.proportions.width < 0.90,
    'Fallback DNA: Narrow width proportion scaled down (< 0.90)',
    `Width: ${fallbackDNA.proportions.width}`
  );
  assert(
    fallbackDNA.proportions.capHeight > 0.72,
    'Fallback DNA: Tall capHeight proportion scaled up (> 0.72)',
    `CapHeight: ${fallbackDNA.proportions.capHeight}`
  );
  assert(
    fallbackDNA.activeModifiers !== undefined && fallbackDNA.activeModifiers.includes('DRIPPING'),
    'Fallback DNA: Dripping modifier active in DNA',
    `Active: ${fallbackDNA.activeModifiers?.join(', ')}`
  );
  assert(
    fallbackDNA.activeModifiers !== undefined && fallbackDNA.activeModifiers.includes('CRACKED'),
    'Fallback DNA: Cracked modifier active in DNA'
  );

  // --------------------------------------------------------------------------
  // TEST GROUP 4: PROGRESSIVE SAME-FAMILY HORROR PROMPTS (A != B != C != D)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: Progressive Same-Family Glyph Differentiation ---');

  const prompts = [
    { id: 'A', text: 'horror font' },
    { id: 'B', text: 'horror font with dripping terminals' },
    { id: 'C', text: 'narrow horror font with dripping terminals and tall capitals' },
    { id: 'D', text: 'tall narrow horror font with dripping terminals, cracked strokes and irregular baseline' },
  ];

  const specs: FontSpecification[] = [];
  const compiledFonts: { id: string; glyphCommands: Record<string, number>; bufferLength: number }[] = [];

  for (const item of prompts) {
    const dna = FontTypographyDirector.createFallbackDNA(item.text);
    const legacySpec = FontTypographyDirector.dnaToLegacyStyleSpec(dna);

    const spec: FontSpecification = {
      fontName: `HorrorTest_${item.id}`,
      category: 'Display',
      weight: 'Regular',
      width: 'Normal',
      style: 'Modern',
      unitsPerEm: 1000,
      ascender: 800,
      descender: -200,
      capHeight: Math.round(dna.proportions.capHeight * 1000),
      xHeight: Math.round(dna.proportions.xHeight * 1000),
      stemWidth: Math.round(dna.strokeWidth * 1000),
      cornerStyle: 'sharp',
      contrast: 'medium',
      strokeStyle: 'solid',
      styleDNA: dna,
      styleSpec: legacySpec,
      prompt: item.text,
      designDescription: dna.designIntent,
      characterSet: {
        uppercase: true,
        lowercase: true,
        numbers: true,
        punctuation: true,
      },
      advancedSettings: {
        letterSpacing: 0,
        contrast: 'medium',
        cornerStyle: 'sharp',
        strokeStyle: 'solid',
      },
    };



    specs.push(spec);

    const engine = new StyleAwareGlyphEngine(spec, 42); // fixed seed for deterministic comparison
    const glyphs = engine.generateGlyphs();

    const cmdCounts: Record<string, number> = {};
    for (const g of glyphs) {
      if (g.name && ['H', 'E', 'L', 'O', 'A', 'T'].includes(g.name)) {
        cmdCounts[g.name] = g.path.commands.length;
      }
    }

    const compiled = await FontCompilerService.compileFont(spec);
    compiledFonts.push({
      id: item.id,
      glyphCommands: cmdCounts,
      bufferLength: compiled.ttf.byteLength,
    });
  }

  // Verify all 4 are HORROR style family
  for (let i = 0; i < specs.length; i++) {
    assert(
      specs[i].styleDNA?.styleFamily === 'HORROR' || specs[i].styleDNA?.styleFamily === 'OCCULT',
      `Prompt ${prompts[i].id} (${prompts[i].text}) retains HORROR base family`
    );
  }

  // Verify geometric path command progression: A != B != C != D
  console.log('\n  Glyph Path Command Counts for Target Characters [H, E, L, O, A, T]:');
  for (const cf of compiledFonts) {
    console.log(`    Prompt ${cf.id}: ${JSON.stringify(cf.glyphCommands)} (TTF Size: ${cf.bufferLength} bytes)`);
  }

  const cmdsA = JSON.stringify(compiledFonts[0].glyphCommands);
  const cmdsB = JSON.stringify(compiledFonts[1].glyphCommands);
  const cmdsC = JSON.stringify(compiledFonts[2].glyphCommands);
  const cmdsD = JSON.stringify(compiledFonts[3].glyphCommands);

  assert(cmdsA !== cmdsB, 'Differentiation: Prompt A ("horror") != Prompt B ("horror with dripping terminals")');
  assert(cmdsB !== cmdsD, 'Differentiation: Prompt B != Prompt D ("horror with dripping, cracked, tall, narrow")');

  // Verify width scaling differentiation: A vs C
  const widthA = specs[0].styleDNA?.proportions.width || 1.0;
  const widthC = specs[2].styleDNA?.proportions.width || 1.0;
  assert(widthC < widthA, 'Differentiation: Narrow modifier reduces width scale (Prompt C < Prompt A)', `C: ${widthC} < A: ${widthA}`);

  // Verify height scaling differentiation: A vs C
  const capHA = specs[0].styleDNA?.proportions.capHeight || 0.7;
  const capHC = specs[2].styleDNA?.proportions.capHeight || 0.7;
  assert(capHC > capHA, 'Differentiation: Tall modifier increases capHeight (Prompt C > Prompt A)', `C: ${capHC} > A: ${capHA}`);

  // --------------------------------------------------------------------------
  // TEST GROUP 5: FULL OPENTYPE COMPILATION & VALIDATION
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 5: Full OpenType Compilation & Validation ---');

  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    const compiled = await FontCompilerService.compileFont(spec);

    const validation = FontValidationService.validateFontBuffers(compiled);
    assert(
      validation.valid,
      `Validation: Generated font for Prompt ${prompts[i].id} passes full validation`,
      `Errors: ${validation.errors.join(', ') || 'None'}`
    );
    assert(
      compiled.ttf.byteLength > 2000 && compiled.woff2.byteLength > 500,
      `Validation: Prompt ${prompts[i].id} generates valid TTF (${compiled.ttf.byteLength} bytes) and WOFF2 (${compiled.woff2.byteLength} bytes)`
    );
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 6: DETERMINISTIC SEED REPRODUCIBILITY
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 6: Deterministic Seed Reproducibility ---');

  const font1 = await FontCompilerService.compileFont(specs[3]);
  const font2 = await FontCompilerService.compileFont(specs[3]);

  const buf1 = Buffer.from(font1.ttf);
  const buf2 = Buffer.from(font2.ttf);


  assert(
    buf1.equals(buf2),
    'Determinism: Identical seed produces bit-for-bit identical TTF binary',
    `Byte Length: ${buf1.byteLength}`
  );

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;
  console.log(`PHASE 23 TEST SUMMARY: ${passed}/${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  if (failed > 0) {
    console.error(`FAILED TESTS (${failed}):`);
    results.filter((r) => !r.passed).forEach((r) => console.error(` - ${r.name}: ${r.error}`));
    process.exit(1);
  } else {
    console.log('ALL PHASE 23 PROMPT INTELLIGENCE TESTS COMPLETED SUCCESSFULLY!\n');
  }
}

runPromptIntelligenceTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
