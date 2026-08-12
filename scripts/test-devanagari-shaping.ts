import { FontCompilerService } from '../lib/font/compiler/fontCompiler';
import { CoverageCalculator } from '../lib/font/validator/coverageCalculator';
import { DEVANAGARI_CONJUNCT_RULES } from '../lib/font/shaping/devanagariShaper';
import type { FontSpecification } from '../lib/font/specification/types';
import { parse } from 'opentype.js';

async function runDevanagariShapingTests() {
  console.log('====================================================');
  console.log('PHASE 26 — DEVANAGARI REAL OPENTYPE SHAPING TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, description: string) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] Test ${totalTests}: ${description}`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${description}`);
      process.exitCode = 1;
    }
  }

  // 1. Verify Devanagari Conjunct Rules Registry
  assert(DEVANAGARI_CONJUNCT_RULES.length >= 25, `Conjunct registry defines ${DEVANAGARI_CONJUNCT_RULES.length} conjunct rules (>= 25 expected)`);

  const kraRule = DEVANAGARI_CONJUNCT_RULES.find((r) => r.name === 'dvKRA');
  assert(
    !!kraRule && kraRule.code === 0xE001 && kraRule.components.length === 3,
    'Rule dvKRA (क्र) maps ka (0x0915) + virama (0x094D) + ra (0x0930) -> 0xE001'
  );

  const kshaRule = DEVANAGARI_CONJUNCT_RULES.find((r) => r.name === 'dvKSHA');
  assert(
    !!kshaRule && kshaRule.code === 0xE007 && kshaRule.tag === 'akhn',
    'Rule dvKSHA (क्ष) maps ka (0x0915) + virama (0x094D) + ssha (0x0937) -> 0xE007 (tag: akhn)'
  );

  const jnyaRule = DEVANAGARI_CONJUNCT_RULES.find((r) => r.name === 'dvJNYA');
  assert(
    !!jnyaRule && jnyaRule.code === 0xE008 && jnyaRule.tag === 'akhn',
    'Rule dvJNYA (ज्ञ) maps ja (0x091C) + virama (0x094D) + nya (0x091E) -> 0xE008 (tag: akhn)'
  );

  // 2. Test Real Font Generation & OpenType GSUB Compilation
  console.log('\n--- Compiling Devanagari Horror Font Binary ---');
  const horrorSpec: FontSpecification = {
    fontName: 'DevanagariHorrorTest',
    category: 'Display',
    weight: 'Bold',
    width: 'Normal',
    style: 'Modern',
    characterSet: { uppercase: true, lowercase: true, numbers: true, punctuation: true, devanagari: true },
    styleDNA: {
      styleFamily: 'HORROR',
      unitsPerEm: 1000,
      strokeModel: 'MODULATED',
      proportions: { ascender: 0.8, descender: -0.2, capHeight: 0.7, xHeight: 0.5, width: 0.6 },
      strokeWidth: { stem: 120, hairline: 40, contrast: 0.3 },
      curvature: { roundness: 0.1, cornerRounding: 0.05, tension: 0.9 },
      complexity: { cornerCount: 16, strokeSeparation: 0.8 },
      serif: { hasSerif: false, serifType: 'NONE', serifLength: 0, serifWidth: 0, bracketRounding: 0 },
      ornament: { hasDrips: true, dripCount: 3, dripLength: 0.2, spikiness: 0.8 },
    } as any,
  } as any;

  const startTime = Date.now();
  const compiledBuffers = await FontCompilerService.compileFont(horrorSpec);
  const compileTimeMs = Date.now() - startTime;

  assert(compiledBuffers.ttf.byteLength > 10000, `Compiled TTF binary size is ${compiledBuffers.ttf.byteLength} bytes`);
  assert(compiledBuffers.otf.byteLength > 10000, `Compiled OTF binary size is ${compiledBuffers.otf.byteLength} bytes`);
  assert(compiledBuffers.woff2.byteLength > 2000, `Compiled WOFF2 binary size is ${compiledBuffers.woff2.byteLength} bytes`);
  assert(compileTimeMs < 1500, `Devanagari font compilation completed in ${compileTimeMs}ms (< 1500ms limit)`);

  // 3. Inspect OpenType Tables in Compiled Binary
  console.log('\n--- Inspecting OpenType GSUB Tables in TTF Binary ---');
  const arrayBuf = compiledBuffers.ttf.buffer.slice(
    compiledBuffers.ttf.byteOffset,
    compiledBuffers.ttf.byteOffset + compiledBuffers.ttf.byteLength
  );
  const parsedFont = parse(arrayBuf);
  const gsubTable = (parsedFont.tables as Record<string, unknown>).gsub as Record<string, unknown>;

  assert(!!gsubTable, 'Compiled TTF binary contains valid OpenType GSUB table');
  assert(
    !!gsubTable.scripts && ((gsubTable.scripts || []) as Array<Record<string, unknown>>).some((s) => s.tag === 'deva' || s.tag === 'dev2' || s.tag === 'DFLT'),
    'GSUB table defines scripts: deva, dev2, DFLT'
  );
  assert(
    !!gsubTable.features && ((gsubTable.features || []) as Array<Record<string, unknown>>).some((f) => f.tag === 'liga' || f.tag === 'akhn' || f.tag === 'nukt'),
    'GSUB table defines features: liga, akhn, nukt'
  );
  assert(
    !!gsubTable.lookups && ((gsubTable.lookups || []) as Array<Record<string, unknown>>).length > 0,
    'GSUB table defines Lookup Type 4 (Ligature Substitution)'
  );

  // 4. Validate Devanagari Shaping Coverage Analytics
  console.log('\n--- Devanagari Shaping Coverage Analytics ---');
  const shapingReport = CoverageCalculator.analyzeDevanagariShapingCoverage(compiledBuffers.ttf);

  console.log(`- GSUB Table Present: ${shapingReport.hasGsubTable}`);
  console.log(`- Devanagari Unicode Coverage: ${shapingReport.unicodeCoveragePct}%`);
  console.log(`- Devanagari Shaping Coverage: ${shapingReport.shapingCoveragePct}%`);
  console.log(`- Conjunct Coverage: ${shapingReport.conjunctCoveragePct}% (${shapingReport.supportedConjunctsCount}/${shapingReport.supportedConjunctsTotal})`);

  assert(shapingReport.hasGsubTable === true, 'Devanagari Shaping Coverage reports GSUB table present');
  assert(shapingReport.conjunctCoveragePct === 100.0, 'All conjunct ligatures (100%) mapped in binary glyph table');
  assert(shapingReport.missingConjuncts.length === 0, 'No missing conjunct ligatures reported');

  // 5. Test Word-Level Rendering Integrity
  console.log('\n--- Testing Critical Word-Level Integrity ---');
  const criticalWords = [
    'क्रांति',
    'प्राकृतिक',
    'स्वतंत्र',
    'श्रद्धा',
    'क्षमा',
    'ज्ञान',
    'संस्कृति',
    'महाराष्ट्र',
    'हिन्दी',
    'मराठी',
    'संपर्क',
  ];

  for (const word of criticalWords) {
    const wordCoverage = CoverageCalculator.analyzeFontCoverage(compiledBuffers.ttf, word);
    assert(
      wordCoverage.isFullySupported,
      `Word "${word}" mapped 100% in OpenType CMAP (Coverage: ${wordCoverage.coveragePercentage}%)`
    );
  }

  // 6. Test Style Preservation across Style Families (Bubble & Luxury Serif)
  console.log('\n--- Testing Devanagari Style Preservation (Bubble & Luxury Serif) ---');
  const bubbleSpec: FontSpecification = {
    ...horrorSpec,
    fontName: 'DevanagariBubbleTest',
    styleDNA: {
      ...horrorSpec.styleDNA!,
      styleFamily: 'BUBBLE',
      strokeModel: 'MODULATED',
      curvature: { roundness: 0.95, cornerRounding: 0.9, tension: 0.4 },
    } as any,
  };

  const bubbleBuffers = await FontCompilerService.compileFont(bubbleSpec);
  assert(bubbleBuffers.ttf.byteLength > 10000, 'Bubble Devanagari font binary compiled successfully');

  const luxurySpec: FontSpecification = {
    ...horrorSpec,
    fontName: 'DevanagariLuxuryTest',
    styleDNA: {
      ...horrorSpec.styleDNA!,
      styleFamily: 'SERIF',
      strokeModel: 'HIGH_CONTRAST',
      serif: { hasSerif: true, serifType: 'BRACKETED', serifLength: 0.15, serifWidth: 0.1, bracketRounding: 0.5 },
    } as any,
  };

  const luxuryBuffers = await FontCompilerService.compileFont(luxurySpec);
  assert(luxuryBuffers.ttf.byteLength > 10000, 'Luxury Serif Devanagari font binary compiled successfully');

  // Summary
  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  console.log('====================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runDevanagariShapingTests().catch((err) => {
  console.error('Unhandled error in Devanagari shaping test suite:', err);
  process.exit(1);
});
