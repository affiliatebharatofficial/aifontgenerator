import { FontTypographyDirector } from '../lib/font/specification/director';
import { StyleAwareGlyphEngine } from '../lib/font/glyphs/styleAwareEngine';
import { FontCompilerService } from '../lib/font/compiler/fontCompiler';
import opentype from 'opentype.js';

async function runStyleAwareEngineSuite() {
  console.log('================================================================');
  console.log('PHASE 21 PART 2: REAL STYLE-AWARE GLYPH ENGINE TEST SUITE');
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
  // TEST 1: CORE STYLE GENERATION & STRUCTURAL DIFFERENCES
  // -------------------------------------------------------------
  console.log('--- TEST 1: Core Style Outlines and Geometries ---');

  const testPrompts = [
    { name: 'Horror', prompt: 'Create a terrifying horror font with sharp distorted letters.' },
    { name: 'Bubble', prompt: 'Create a soft rounded bubble font with circular inflated letters.' },
    { name: 'Luxury Serif', prompt: 'Create an elegant luxury fashion serif typeface with high contrast.' },
    { name: 'Futuristic', prompt: 'Create an ultra-thin futuristic geometric font with chamfered angles.' },
    { name: 'Handwritten', prompt: 'Create a loose handwritten brush font with organic curves.' },
    { name: 'Gothic', prompt: 'Create a medieval gothic blackletter font with sharp diamond cuts.' },
    { name: 'Monospace', prompt: 'Create a monospace terminal code font for software developers.' },
  ];

  const styleEngines: Record<string, StyleAwareGlyphEngine> = {};
  const styleGlyphs: Record<string, opentype.Glyph[]> = {};
  const styleBuffers: Record<string, { ttf: Buffer; woff2: Buffer }> = {};

  for (const t of testPrompts) {
    const spec = await FontTypographyDirector.synthesizeStyleSpecification({
      prompt: t.prompt,
      fontName: `${t.name} Font`,
      characterSet: { uppercase: true, lowercase: true, numbers: true, punctuation: true },
    });

    const engine = new StyleAwareGlyphEngine(spec);
    const glyphs = engine.generateGlyphs();
    const buffers = await FontCompilerService.compileFont(spec);

    styleEngines[t.name] = engine;
    styleGlyphs[t.name] = glyphs;
    styleBuffers[t.name] = buffers;

    assert(glyphs.length >= 70, `${t.name}: Generated ${glyphs.length} glyphs.`);
    assert(buffers.ttf.length > 500, `${t.name}: Compiled TTF buffer (${buffers.ttf.length} bytes).`);
    assert(buffers.woff2.length > 200, `${t.name}: Compiled WOFF2 buffer (${buffers.woff2.length} bytes).`);
  }

  // -------------------------------------------------------------
  // TEST 2: STRUCTURAL GLYPH COMMAND ANALYSIS
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Structural Differences on Critical Characters ---');

  const charsToInspect = ['A', 'B', 'C', 'a', 'e', 'g', 'r', 's', 't'];

  console.log('\nPath Command Count Matrix across Styles:');
  const matrixRows: Array<Record<string, string | number>> = [];

  for (const [name, glyphs] of Object.entries(styleGlyphs)) {
    const row: Record<string, string | number> = { Style: name };
    for (const ch of charsToInspect) {
      const g = glyphs.find((item) => item.name === ch);
      row[ch] = g ? g.path.commands.length : 0;
    }
    matrixRows.push(row);
  }
  console.table(matrixRows);

  const horrorGlyphs = styleGlyphs['Horror'];
  const bubbleGlyphs = styleGlyphs['Bubble'];
  const luxuryGlyphs = styleGlyphs['Luxury Serif'];
  const futureGlyphs = styleGlyphs['Futuristic'];
  const gothicGlyphs = styleGlyphs['Gothic'];

  const horrorA = horrorGlyphs.find((g) => g.name === 'A')!;
  const bubbleA = bubbleGlyphs.find((g) => g.name === 'A')!;
  const luxuryA = luxuryGlyphs.find((g) => g.name === 'A')!;
  const futureA = futureGlyphs.find((g) => g.name === 'A')!;

  assert(horrorA.path.commands.length > 0 && bubbleA.path.commands.length > 0, 'Glyph A paths generated');
  assert(
    luxuryA.path.commands.length !== bubbleA.path.commands.length ||
    luxuryA.path.commands.length !== futureA.path.commands.length,
    'Luxury Serif vs Bubble vs Futuristic: Distinct path construction'
  );

  // Check stem curve commands for Bubble vs Futuristic
  const bubbleO = bubbleGlyphs.find((g) => g.name === 'O')!;
  const futureO = futureGlyphs.find((g) => g.name === 'O')!;
  const bubbleCurves = bubbleO.path.commands.filter((c) => c.type === 'C' || c.type === 'Q').length;
  const futureLines = futureO.path.commands.filter((c) => c.type === 'L').length;

  assert(bubbleCurves >= 8, `Bubble 'O' uses smooth Bézier curves (${bubbleCurves} curve commands).`);
  assert(futureLines >= 8, `Futuristic 'O' uses octagonal chamfered lines (${futureLines} line commands).`);

  // -------------------------------------------------------------
  // TEST 3: MONOSPACE ADVANCE WIDTH UNIFORMITY
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Monospace Equal Advance Width Verification ---');

  const monoGlyphs = styleGlyphs['Monospace'];
  const sampleMonoChars = ['A', 'B', 'C', 'W', 'M', 'i', 'l', '.', '1'];
  const monoWidths = sampleMonoChars.map((ch) => {
    const g = monoGlyphs.find((item) => item.name === ch);
    return g?.advanceWidth || 0;
  });

  const allEqual = monoWidths.every((w) => w === monoWidths[0] && w > 0);
  assert(allEqual, `Monospace: All characters (${sampleMonoChars.join(', ')}) share exact advanceWidth = ${monoWidths[0]}`);

  // Proportional font check (e.g. Luxury Serif W > i)
  const luxW = luxuryGlyphs.find((g) => g.name === 'W')?.advanceWidth ?? 800;
  const luxI = luxuryGlyphs.find((g) => g.name === 'i')?.advanceWidth ?? 300;
  assert(luxW > luxI, `Proportional Luxury Serif: 'W' (${luxW}) wider than 'i' (${luxI})`);


  // -------------------------------------------------------------
  // TEST 4: BLENDED STYLES & INTERPOLATION
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Blended Styles (Futuristic Horror & Retro Psychedelic) ---');

  const blendPrompts = [
    { name: 'Futuristic Horror', prompt: 'Cyberpunk futuristic horror font with sharp angular distortion' },
    { name: 'Retro Groovy', prompt: '70s groovy disco psychedelic typeface with curved loops' },
  ];

  for (const b of blendPrompts) {
    const spec = await FontTypographyDirector.synthesizeStyleSpecification({
      prompt: b.prompt,
      fontName: b.name,
      characterSet: { uppercase: true, lowercase: true, numbers: true, punctuation: true },
    });

    const buffers = await FontCompilerService.compileFont(spec);
    assert(spec.styleDNA !== undefined, `${b.name}: Synthesized combined Style DNA.`);
    assert(buffers.ttf.length > 500, `${b.name}: Successfully compiled font binary.`);
  }

  // -------------------------------------------------------------
  // TEST 5: DETERMINISTIC SEED REPRODUCIBILITY
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Deterministic Seed Reproducibility ---');

  const horrorSpec = await FontTypographyDirector.synthesizeStyleSpecification({
    prompt: 'Terrifying haunted horror typeface with sharp spikes',
    fontName: 'GhostSpike',
    characterSet: { uppercase: true, lowercase: true, numbers: true, punctuation: true },
  });

  const engineSeedA1 = new StyleAwareGlyphEngine(horrorSpec, 424242);
  const glyphsA1 = engineSeedA1.generateGlyphs();

  const engineSeedA2 = new StyleAwareGlyphEngine(horrorSpec, 424242);
  const glyphsA2 = engineSeedA2.generateGlyphs();

  const engineSeedB = new StyleAwareGlyphEngine(horrorSpec, 999999);
  const glyphsB = engineSeedB.generateGlyphs();

  const gA1 = glyphsA1.find((g) => g.name === 'A')!;
  const gA2 = glyphsA2.find((g) => g.name === 'A')!;
  const gB = glyphsB.find((g) => g.name === 'A')!;

  const cmdsA1 = JSON.stringify(gA1.path.commands);
  const cmdsA2 = JSON.stringify(gA2.path.commands);
  const cmdsB = JSON.stringify(gB.path.commands);

  assert(cmdsA1 === cmdsA2, 'Same Seed (424242) produces exact byte-identical glyph commands.');
  assert(cmdsA1 !== cmdsB, 'Different Seed (999999) produces controlled distortion variation.');

  // -------------------------------------------------------------
  // TEST 6: FONT BINARY OPENTYPE TABLE PARSING
  // -------------------------------------------------------------
  console.log('\n--- TEST 6: OpenType Binary Parsing & Table Verification ---');

  for (const [name, buf] of Object.entries(styleBuffers)) {
    const parsedFont = opentype.parse(buf.ttf.buffer.slice(buf.ttf.byteOffset, buf.ttf.byteOffset + buf.ttf.byteLength));
    assert(parsedFont.unitsPerEm === 1000, `${name}: Valid OpenType unitsPerEm (1000).`);
    assert(parsedFont.numGlyphs >= 70, `${name}: Valid glyph count (${parsedFont.numGlyphs} glyphs).`);
    assert(parsedFont.tables.cmap !== undefined, `${name}: Valid cmap character map table.`);
    assert(parsedFont.tables.head !== undefined, `${name}: Valid head table.`);
  }

  // -------------------------------------------------------------
  // TEST 7: PHRASE RENDERING
  // -------------------------------------------------------------
  console.log('\n--- TEST 7: Full Phrase Compilation & Glyph Mapping ---');
  const phrase = 'The quick brown fox jumps over the lazy dog.';
  for (const [name, buf] of Object.entries(styleBuffers)) {
    const parsed = opentype.parse(buf.ttf.buffer.slice(buf.ttf.byteOffset, buf.ttf.byteOffset + buf.ttf.byteLength));
    const path = parsed.getPath(phrase, 0, 100, 72);
    assert(path.commands.length > 50, `${name}: Rendered full pangram phrase (${path.commands.length} path commands).`);
  }

  console.log('\n================================================================');
  console.log(`STYLE-AWARE GLYPH ENGINE TEST SUITE: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runStyleAwareEngineSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
