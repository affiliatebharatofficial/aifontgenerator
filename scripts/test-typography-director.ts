import { FontTypographyDirector } from '../lib/font/specification/director';
import { validateFontStyleDNA } from '../lib/font/specification/dnaValidator';
import { FontCompilerService } from '../lib/font/compiler/fontCompiler';

async function runTypographyDirectorSuite() {
  console.log('================================================================');
  console.log('PHASE 21: AI TYPOGRAPHY DIRECTOR & STYLE DNA TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, message: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✔ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  }

  // -------------------------------------------------------------
  // TEST 1: CORE STYLE FAMILIES VALIDATION
  // -------------------------------------------------------------
  console.log('--- TEST 1: Core Style Families Interpretation ---');

  const corePrompts = [
    { name: 'Horror', prompt: 'Create a terrifying horror font with sharp distorted letters.', expectedFamily: 'HORROR' },
    { name: 'Bubble', prompt: 'Create a soft rounded bubble font with circular inflated letters.', expectedFamily: 'BUBBLE' },
    { name: 'Luxury Serif', prompt: 'Create an elegant luxury fashion serif typeface with high contrast.', expectedFamily: ['DIDONE_SERIF', 'SERIF'] },
    { name: 'Futuristic', prompt: 'Create an ultra-thin futuristic geometric font with chamfered angles.', expectedFamily: 'FUTURISTIC' },
    { name: 'Handwritten', prompt: 'Create a loose handwritten brush font with organic curves.', expectedFamily: ['HANDWRITTEN', 'BRUSH', 'SCRIPT'] },
    { name: 'Gothic', prompt: 'Create a medieval gothic blackletter font with sharp diamond cuts.', expectedFamily: ['BLACKLETTER', 'GOTHIC'] },
    { name: 'Monospace', prompt: 'Create a monospace terminal code font for software developers.', expectedFamily: 'MONOSPACE' },
  ];

  const results: Record<string, ReturnType<typeof FontTypographyDirector.createFallbackDNA>> = {};

  for (const t of corePrompts) {
    const dna = FontTypographyDirector.createFallbackDNA(t.prompt);
    results[t.name] = dna;

    const matches = Array.isArray(t.expectedFamily)
      ? t.expectedFamily.includes(dna.styleFamily)
      : dna.styleFamily === t.expectedFamily;

    assert(matches, `${t.name}: styleFamily "${dna.styleFamily}" matches expected.`);
    assert(typeof dna.strokeWidth === 'number' && dna.strokeWidth >= 0.02 && dna.strokeWidth <= 0.30, `${t.name}: strokeWidth (${dna.strokeWidth}) within bounds.`);
    assert(typeof dna.roundness === 'number' && dna.roundness >= 0.0 && dna.roundness <= 1.0, `${t.name}: roundness (${dna.roundness}) within bounds.`);
    assert(typeof dna.distortion === 'number' && dna.distortion >= 0.0 && dna.distortion <= 1.0, `${t.name}: distortion (${dna.distortion}) within bounds.`);
  }

  // -------------------------------------------------------------
  // TEST 2: CROSS-PROMPT DIFFERENTIATION
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Cross-Prompt Differentiation ---');
  const horrorDNA = results['Horror'];
  const bubbleDNA = results['Bubble'];
  const luxuryDNA = results['Luxury Serif'];
  const futureDNA = results['Futuristic'];
  const handDNA = results['Handwritten'];

  assert(horrorDNA.styleFamily !== bubbleDNA.styleFamily, 'Horror vs Bubble: Distinct Style Families');
  assert(horrorDNA.angularity > bubbleDNA.angularity, `Horror angularity (${horrorDNA.angularity}) > Bubble angularity (${bubbleDNA.angularity})`);
  assert(bubbleDNA.roundness > horrorDNA.roundness, `Bubble roundness (${bubbleDNA.roundness}) > Horror roundness (${horrorDNA.roundness})`);
  assert(luxuryDNA.strokeContrast > bubbleDNA.strokeContrast, `Luxury contrast (${luxuryDNA.strokeContrast}) > Bubble contrast (${bubbleDNA.strokeContrast})`);
  assert(futureDNA.cornerStyle === 'CHAMFERED' && horrorDNA.cornerStyle === 'IRREGULAR', 'Futuristic chamfered corners vs Horror irregular corners');
  assert(handDNA.baselineBehavior === 'HANDWRITTEN', 'Handwritten baseline behavior is dynamic');

  console.log('\nStyle DNA Comparison Matrix:');
  console.table(
    Object.entries(results).map(([name, d]) => ({
      Style: name,
      Family: d.styleFamily,
      Stroke: d.strokeModel,
      Terminal: d.terminalStyle,
      Corner: d.cornerStyle,
      Curve: d.curveModel,
      Contrast: d.strokeContrast,
      Roundness: d.roundness,
      Angularity: d.angularity,
      Distortion: d.distortion,
    }))
  );

  // -------------------------------------------------------------
  // TEST 3: SAME-STYLE VARIATION & CONSISTENCY
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Same-Style Variation & Consistency ---');
  const h1 = FontTypographyDirector.createFallbackDNA('Scary horror font');
  const h2 = FontTypographyDirector.createFallbackDNA('Terrifying haunted horror typeface');
  const h3 = FontTypographyDirector.createFallbackDNA('Dark occult mystical ritual symbols font');

  assert(h1.styleFamily === 'HORROR' && h2.styleFamily === 'HORROR', 'Both horror prompts map to HORROR family');
  assert(h3.styleFamily === 'OCCULT' || h3.styleFamily === 'HORROR', 'Occult prompt maps to OCCULT/HORROR family');
  assert(h1.distortion >= 0.50 && h2.distortion >= 0.50, 'All horror prompts exhibit high distortion');

  // -------------------------------------------------------------
  // TEST 4: UNKNOWN / ABSTRACT PROMPT
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Unknown / Abstract Prompt Handling ---');
  const abstractDNA = FontTypographyDirector.createFallbackDNA('Make something mysterious and elegant.');
  assert(abstractDNA.styleFamily !== undefined, `Abstract prompt synthesized valid StyleFamily: ${abstractDNA.styleFamily}`);
  assert(abstractDNA.strokeContrast >= 0.0 && abstractDNA.strokeContrast <= 1.0, 'Abstract prompt produced valid strokeContrast');
  assert(abstractDNA.proportions.capHeight >= abstractDNA.proportions.xHeight, 'Proportions maintain capHeight >= xHeight hierarchy');

  // -------------------------------------------------------------
  // TEST 5: MULTILINGUAL / NON-LATIN PROMPTS
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Multilingual Prompt Handling ---');
  const hindiDNA = FontTypographyDirector.createFallbackDNA('एक सुंदर और बोल्ड हिंदी देवनागरी फॉन्ट');
  const spanishDNA = FontTypographyDirector.createFallbackDNA('Una fuente de terror espeluznante con letras afiladas');
  const arabicDNA = FontTypographyDirector.createFallbackDNA('خط عربي حديث وأنيق');
  const japaneseDNA = FontTypographyDirector.createFallbackDNA('未来的でサイバーパンクな幾何学フォント');

  assert(hindiDNA.styleFamily !== undefined, 'Hindi prompt produces valid Style DNA');
  assert(spanishDNA.styleFamily !== undefined, 'Spanish prompt produces valid Style DNA');
  assert(arabicDNA.styleFamily !== undefined, 'Arabic prompt produces valid Style DNA');
  assert(japaneseDNA.styleFamily !== undefined, 'Japanese prompt produces valid Style DNA');

  // -------------------------------------------------------------
  // TEST 6: STRICT SCHEMA & OUT-OF-RANGE BOUNDS CLAMPING
  // -------------------------------------------------------------
  console.log('\n--- TEST 6: Strict Bounds Clamping & Sanitization ---');
  const malformedInput = {
    styleFamily: 'INVALID_FAMILY_NAME',
    strokeWidth: 999.9, // Out of bounds
    strokeContrast: -5.0, // Out of bounds
    roundness: NaN, // Invalid number
    angularity: Infinity, // Invalid number
    distortion: -1.0, // Out of bounds
    symmetry: 2.5, // Out of bounds
    slant: 15.0, // Out of bounds
    proportions: {
      width: -0.5,
      xHeight: 0.99,
      capHeight: 0.10, // Invalid: capHeight < xHeight
      ascender: 0.05,
      descender: -10.0,
    },
  };

  const sanitized = validateFontStyleDNA(malformedInput, 'Test malformed prompt');

  assert(sanitized.styleFamily === 'GEOMETRIC', 'Invalid StyleFamily gracefully falls back to GEOMETRIC');
  assert(sanitized.strokeWidth === 0.30, `strokeWidth 999 clamped to max 0.30 (got ${sanitized.strokeWidth})`);
  assert(sanitized.strokeContrast === 0.0, `strokeContrast -5 clamped to min 0.0 (got ${sanitized.strokeContrast})`);
  assert(!isNaN(sanitized.roundness), 'NaN roundness clamped to safe default');
  assert(isFinite(sanitized.angularity), 'Infinity angularity clamped to safe default');
  assert(sanitized.distortion === 0.0, `distortion -1.0 clamped to min 0.0 (got ${sanitized.distortion})`);
  assert(sanitized.symmetry === 1.0, `symmetry 2.5 clamped to max 1.0 (got ${sanitized.symmetry})`);
  assert(sanitized.slant === 0.45, `slant 15.0 clamped to max 0.45 (got ${sanitized.slant})`);
  assert(sanitized.proportions.capHeight >= sanitized.proportions.xHeight, 'Proportion hierarchical correction enforced');

  // -------------------------------------------------------------
  // TEST 7: END-TO-END FONT COMPILER BACKWARDS COMPATIBILITY
  // -------------------------------------------------------------
  console.log('\n--- TEST 7: End-to-End Font Specification & Compilation Parity ---');
  const fullSpec = await FontTypographyDirector.synthesizeStyleSpecification({
    prompt: 'Terrifying horror display font with sharp fangs',
    fontName: 'DreadFang Display',
    category: 'Display',
    weight: 'Bold',
    width: 'Normal',
    style: 'Modern',
    characterSet: { uppercase: true, lowercase: true, numbers: true, punctuation: true },
    advancedSettings: { letterSpacing: 0, contrast: 'medium', cornerStyle: 'sharp', strokeStyle: 'solid' },
  });

  assert(fullSpec.styleDNA !== undefined, 'Synthesized FontSpecification includes complete styleDNA');
  assert(fullSpec.styleSpec !== undefined, 'Synthesized FontSpecification preserves legacy styleSpec');
  assert(fullSpec.stemWidth > 0, `Computed stemWidth is positive (${fullSpec.stemWidth} units)`);

  const fontBuffers = await FontCompilerService.compileFont(fullSpec);
  assert(fontBuffers.ttf.length > 500, `Compiled TTF binary size valid (${fontBuffers.ttf.length} bytes)`);
  assert(fontBuffers.woff2.length > 200, `Compiled WOFF2 binary size valid (${fontBuffers.woff2.length} bytes)`);

  console.log('\n================================================================');
  console.log(`TEST SUITE COMPLETE: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTypographyDirectorSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
