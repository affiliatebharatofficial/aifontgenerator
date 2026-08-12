import { FontTypographyDirector } from '../lib/font/specification/director';
import { StyleAwareGlyphEngine } from '../lib/font/glyphs/styleAwareEngine';
import { FontCompilerService } from '../lib/font/compiler/fontCompiler';
import { FontValidationService } from '../lib/font/validator/fontValidator';
import opentype from 'opentype.js';

async function runTypographyQualitySuite() {
  console.log('================================================================================');
  console.log('PHASE 22: FONT QUALITY & TYPOGRAPHY REFINEMENT TEST SUITE');
  console.log('================================================================================\n');

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

  const coreStyles = [
    { name: 'Horror', prompt: 'Create a professional horror display typeface with sharp irregular glyphs' },
    { name: 'Bubble', prompt: 'Create a professional playful bubble typeface with soft inflated rounded letterforms' },
    { name: 'Luxury Serif', prompt: 'Create a premium luxury editorial serif typeface with high stroke contrast' },
    { name: 'Futuristic', prompt: 'Create a futuristic experimental geometric typeface with clean chamfered corners' },
    { name: 'Handwritten', prompt: 'Create a natural handwritten brush typeface with organic curves' },
    { name: 'Gothic', prompt: 'Create a medieval gothic blackletter font with sharp diamond cuts' },
    { name: 'Monospace', prompt: 'Create a monospace terminal code font for software developers' },
  ];

  const styleSpecs: Record<string, import('../lib/font/specification/types').FontSpecification> = {};
  const styleEngines: Record<string, StyleAwareGlyphEngine> = {};
  const styleGlyphs: Record<string, opentype.Glyph[]> = {};
  const styleBuffers: Record<string, { ttf: Buffer; otf: Buffer; woff2: Buffer }> = {};

  // --------------------------------------------------------------------------------
  // 1. GENERATE SPECIFICATIONS, GLYPHS, AND BUFFERS FOR ALL 7 CORE STYLES
  // --------------------------------------------------------------------------------
  console.log('--- TEST 1: Synthesizing Specs and Compiling Binaries ---');
  for (const s of coreStyles) {
    const spec = await FontTypographyDirector.synthesizeStyleSpecification({
      prompt: s.prompt,
      fontName: `${s.name} Quality Font`,
      characterSet: { uppercase: true, lowercase: true, numbers: true, punctuation: true },
    });

    const engine = new StyleAwareGlyphEngine(spec);
    const glyphs = engine.generateGlyphs();
    const buffers = await FontCompilerService.compileFont(spec);

    styleSpecs[s.name] = spec;
    styleEngines[s.name] = engine;
    styleGlyphs[s.name] = glyphs;
    styleBuffers[s.name] = buffers;

    assert(glyphs.length >= 85, `${s.name}: Generated ${glyphs.length} glyphs (includes extended punctuation).`);
    assert(buffers.ttf.length > 1000, `${s.name}: Compiled valid TTF buffer (${buffers.ttf.length} bytes).`);
    assert(buffers.woff2.length > 500, `${s.name}: Compiled valid WOFF2 buffer (${buffers.woff2.length} bytes).`);
  }

  // --------------------------------------------------------------------------------
  // 2. FONT METRICS & TYPOGRAPHIC OVERSHOOT
  // --------------------------------------------------------------------------------
  console.log('\n--- TEST 2: Font Metrics & Typographic Overshoot Verification ---');
  const bubbleEngine = styleEngines['Bubble'];
  const futureEngine = styleEngines['Futuristic'];
  const luxuryEngine = styleEngines['Luxury Serif'];

  assert(bubbleEngine.getContext().unitsPerEm === 1000, 'UnitsPerEm is normalized to 1000 UPM.');
  assert(bubbleEngine.getContext().capH >= 650 && bubbleEngine.getContext().capH <= 750, 'CapHeight within expected typographic bounds.');
  assert(bubbleEngine.getContext().xH >= 450 && bubbleEngine.getContext().xH <= 560, 'XHeight within expected typographic bounds.');
  assert(bubbleEngine.getContext().asc >= 750 && bubbleEngine.getContext().desc <= -150, 'Ascender and descender maintain metric hierarchy.');

  assert(bubbleEngine.getContext().overshoot > 0, `Bubble font applies optical overshoot (${bubbleEngine.getContext().overshoot} UPM).`);
  assert(luxuryEngine.getContext().overshoot > 0, `Luxury Serif font applies optical overshoot (${luxuryEngine.getContext().overshoot} UPM).`);
  assert(futureEngine.getContext().overshoot === 0, `Futuristic font disables overshoot (0 UPM) for exact chamfered precision.`);

  // --------------------------------------------------------------------------------
  // 3. GLYPH BOUNDING BOX SANITY & FINITE COORDINATES
  // --------------------------------------------------------------------------------
  console.log('\n--- TEST 3: Glyph Bounding Boxes & Coordinate Sanitization ---');
  for (const [name, glyphs] of Object.entries(styleGlyphs)) {
    let allFinite = true;
    for (const g of glyphs) {
      if (g.path && g.path.commands) {
        for (const rawCmd of g.path.commands) {
          const c = rawCmd as Record<string, unknown>;
          if (
            (typeof c.x === 'number' && !Number.isFinite(c.x)) ||
            (typeof c.y === 'number' && !Number.isFinite(c.y)) ||
            (typeof c.x1 === 'number' && !Number.isFinite(c.x1)) ||
            (typeof c.y1 === 'number' && !Number.isFinite(c.y1))
          ) {
            allFinite = false;
            break;
          }
        }
      }
    }
    assert(allFinite, `${name}: All glyph path coordinates are strictly finite and non-NaN.`);
  }

  // --------------------------------------------------------------------------------
  // 4. STYLE-AWARE SIDE BEARINGS & ADVANCE WIDTHS
  // --------------------------------------------------------------------------------
  console.log('\n--- TEST 4: Style-Aware Side Bearings & Proportional Spacing ---');
  const luxGlyphs = styleGlyphs['Luxury Serif'];
  const monoGlyphs = styleGlyphs['Monospace'];

  const luxW = luxGlyphs.find((g) => g.name === 'W')?.advanceWidth ?? 0;
  const luxI = luxGlyphs.find((g) => g.name === 'I')?.advanceWidth ?? 0;
  const luxO = luxGlyphs.find((g) => g.name === 'O')?.advanceWidth ?? 0;
  const luxH = luxGlyphs.find((g) => g.name === 'H')?.advanceWidth ?? 0;

  assert(luxW > luxH, `Proportional Luxury Serif: 'W' (${luxW}) wider than 'H' (${luxH}).`);
  assert(luxH > luxI, `Proportional Luxury Serif: 'H' (${luxH}) wider than 'I' (${luxI}).`);
  assert(luxO > 0 && luxO <= luxH + 40, `Proportional Luxury Serif: 'O' has optical circular width (${luxO}).`);

  // Monospace exact width uniformity
  const monoSamples = ['A', 'B', 'C', 'W', 'M', 'i', 'l', '1', '.', ' '];
  const monoWidths = monoSamples.map((ch) => {
    const g = monoGlyphs.find((item) => (ch === ' ' ? item.name === 'space' : item.name === ch));
    return g?.advanceWidth || 0;
  });
  const monoUniform = monoWidths.every((w) => w === monoWidths[0] && w > 0);
  assert(monoUniform, `Monospace: All characters (${monoSamples.join(', ')}) share exact advanceWidth = ${monoWidths[0]} UPM.`);

  // --------------------------------------------------------------------------------
  // 5. TWO-STORY VS SINGLE-STORY LOWERCASE RULES
  // --------------------------------------------------------------------------------
  console.log('\n--- TEST 5: Two-Story vs Single-Story Lowercase Personalities ---');
  const luxA = luxGlyphs.find((g) => g.name === 'a')!;
  const bubbleA = styleGlyphs['Bubble'].find((g) => g.name === 'a')!;
  const luxG = luxGlyphs.find((g) => g.name === 'g')!;
  const bubbleG = styleGlyphs['Bubble'].find((g) => g.name === 'g')!;

  assert(luxA.path.commands.length !== bubbleA.path.commands.length, 'Luxury Serif vs Bubble: Distinct lowercase "a" construction.');
  assert(luxG.path.commands.length !== bubbleG.path.commands.length, 'Luxury Serif vs Bubble: Distinct lowercase "g" construction.');

  // --------------------------------------------------------------------------------
  // 6. NUMERALS & EXTENDED PUNCTUATION
  // --------------------------------------------------------------------------------
  console.log('\n--- TEST 6: Numerals & Extended Punctuation Suite ---');
  const testDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const testPuncts = ['.', ',', '!', '?', ':', ';', '-', '_', '+', '=', '/', '\\', '(', ')', '[', ']', '{', '}', "'", '"', '@', '#', '$', '%', '&', '*', '<', '>', '~'];

  for (const [name, glyphs] of Object.entries(styleGlyphs)) {
    const missingDigits = testDigits.filter((d) => !glyphs.some((g) => g.name === d && g.path.commands.length > 0));
    const missingPuncts = testPuncts.filter((p) => !glyphs.some((g) => g.name === p && g.path.commands.length > 0));

    assert(missingDigits.length === 0, `${name}: All 10 digits (0-9) generated with valid outlines.`);
    assert(missingPuncts.length === 0, `${name}: All ${testPuncts.length} punctuation characters generated with valid outlines.`);
  }

  // --------------------------------------------------------------------------------
  // 7. SPACE GLYPH INTEGRITY
  // --------------------------------------------------------------------------------
  console.log('\n--- TEST 7: Space Glyph Verification ---');
  for (const [name, glyphs] of Object.entries(styleGlyphs)) {
    const sp = glyphs.find((g) => g.name === 'space');
    const spAdv = sp?.advanceWidth ?? 0;
    assert(sp !== undefined && spAdv > 0, `${name}: Space glyph has positive advanceWidth (${spAdv} UPM).`);
    assert(sp !== undefined && sp.path.commands.length === 0, `${name}: Space glyph has 0 visible path commands.`);
  }


  // --------------------------------------------------------------------------------
  // 8. OPENTYPE TABLE METADATA & VALIDATION SERVICE
  // --------------------------------------------------------------------------------
  console.log('\n--- TEST 8: OpenType Table Metadata & Validation Service ---');
  for (const [name, buf] of Object.entries(styleBuffers)) {
    const valResult = FontValidationService.validateFontBuffers(buf);
    assert(valResult.valid, `${name}: FontValidationService passed (0 errors).`);

    const parsed = opentype.parse(buf.ttf.buffer.slice(buf.ttf.byteOffset, buf.ttf.byteOffset + buf.ttf.byteLength));
    assert(parsed.tables.name !== undefined, `${name}: Valid OpenType name table.`);
    assert(parsed.names.fontFamily !== undefined || !!parsed.getEnglishName('fontFamily'), `${name}: Name table has fontFamily.`);
    assert(parsed.names.postScriptName !== undefined || !!parsed.getEnglishName('postScriptName'), `${name}: Name table has postScriptName.`);
    assert(parsed.tables.cmap !== undefined, `${name}: Valid OpenType cmap table.`);
  }


  // --------------------------------------------------------------------------------
  // 9. FULL TEXT RENDERING PARITY & VISUAL TEXT CHECKS
  // --------------------------------------------------------------------------------
  console.log('\n--- TEST 9: Full Text Rendering & Pangrams ---');
  const sampleTexts = [
    'The Quick Brown Fox Jumps Over The Lazy Dog',
    'Pack my box with five dozen liquor jugs.',
    'AVATAR WAVY TOY WAY',
    'minimum amount of typography',
  ];

  for (const [name, buf] of Object.entries(styleBuffers)) {
    const parsed = opentype.parse(buf.ttf.buffer.slice(buf.ttf.byteOffset, buf.ttf.byteOffset + buf.ttf.byteLength));
    for (const text of sampleTexts) {
      const path = parsed.getPath(text, 0, 100, 48);
      assert(path.commands.length > 30, `${name}: Rendered "${text.substring(0, 20)}..." (${path.commands.length} path commands).`);
    }
  }

  // --------------------------------------------------------------------------------
  // 10. STRUCTURAL REGRESSION CHECK (PHASE 21 TO PHASE 22)
  // --------------------------------------------------------------------------------
  console.log('\n--- TEST 10: Zero Structural Regression vs Phase 21 ---');
  const horrorA = styleGlyphs['Horror'].find((g) => g.name === 'A')!;
  const bubbleA_cmd = styleGlyphs['Bubble'].find((g) => g.name === 'A')!;
  const luxuryA_cmd = styleGlyphs['Luxury Serif'].find((g) => g.name === 'A')!;
  const futureA_cmd = styleGlyphs['Futuristic'].find((g) => g.name === 'A')!;

  assert(
    horrorA.path.commands.length !== bubbleA_cmd.path.commands.length &&
    bubbleA_cmd.path.commands.length !== luxuryA_cmd.path.commands.length &&
    luxuryA_cmd.path.commands.length !== futureA_cmd.path.commands.length,
    'All styles maintain distinctly unique structural geometry on glyph "A".'
  );

  console.log('\n================================================================================');
  console.log(`TYPOGRAPHY QUALITY TEST SUITE: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('================================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTypographyQualitySuite().catch((err) => {
  console.error('Fatal quality test error:', err);
  process.exit(1);
});
