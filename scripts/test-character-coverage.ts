import { CharacterSetRegistry, CHARACTER_SETS } from '../lib/font/character-set/registry';
import { FontTypographyDirector } from '../lib/font/specification/director';
import { StyleAwareGlyphEngine } from '../lib/font/glyphs/styleAwareEngine';
import { FontCompilerService } from '../lib/font/compiler/fontCompiler';

import { CoverageCalculator } from '../lib/font/validator/coverageCalculator';
import { FontValidationService } from '../lib/font/validator/fontValidator';

import { PromptIntelligenceEngine } from '../lib/font/specification/promptIntelligence';
import type { FontSpecification } from '../lib/font/specification/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✔ [PASS] ${message}`);
}

async function runCharacterCoverageSuite() {
  console.log('================================================================');
  console.log('PHASE 25: CHARACTER COVERAGE & INTERNATIONAL FONT SUPPORT SUITE');
  console.log('================================================================\n');

  // --- TEST 1: Centralized Character Set Registry & Script Detection ---
  console.log('--- TEST 1: Centralized Character Set Registry & Script Detection ---');
  const basicLat = CharacterSetRegistry.getCharacterSet('BASIC_LATIN');
  const latExt = CharacterSetRegistry.getCharacterSet('LATIN_EXTENDED');
  const devCore = CharacterSetRegistry.getCharacterSet('DEVANAGARI_CORE');

  assert(basicLat !== undefined && basicLat.isSupported, 'BASIC_LATIN registered and supported');
  assert(latExt !== undefined && latExt.isSupported, 'LATIN_EXTENDED registered and supported');
  assert(devCore !== undefined && devCore.isSupported, 'DEVANAGARI_CORE registered and supported');

  const latDetect = CharacterSetRegistry.detectScriptFromText('Hello World 123!');
  assert(latDetect.scripts.includes('LATIN') && !latDetect.isDevanagari, 'Script detection: "Hello World 123!" -> LATIN');

  const devDetect = CharacterSetRegistry.detectScriptFromText('नमस्ते दुनिया');
  assert(devDetect.scripts.includes('DEVANAGARI') && devDetect.isDevanagari, 'Script detection: "नमस्ते दुनिया" -> DEVANAGARI');

  const mixedDetect = CharacterSetRegistry.detectScriptFromText('Hello नमस्ते');
  assert(mixedDetect.scripts.includes('LATIN') && mixedDetect.scripts.includes('DEVANAGARI'), 'Script detection: "Hello नमस्ते" -> MIXED');

  // --- TEST 2: Latin Extended Accented Glyphs ---
  console.log('\n--- TEST 2: Latin Extended Accented Glyphs ---');
  const latinExtText = 'ÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕØÚÙÛÜÝßÆŒŁŠŽĞİı';
  const specLat = await FontTypographyDirector.synthesizeStyleSpecification({
    prompt: 'French and German luxury serif font with accents',
    category: 'Display',
    weight: 'Regular',
    width: 'Normal',
    style: 'Modern',
  });

  const engineLat = new StyleAwareGlyphEngine(specLat, 42);
  const glyphsLat = engineLat.generateGlyphs();
  assert(glyphsLat.length >= 100, `Generated ${glyphsLat.length} glyphs including Latin Extended`);

  const compiledLat = await FontCompilerService.compileFont(specLat);
  assert(compiledLat.ttf.length > 5000, 'Compiled valid TTF binary for Latin Extended');
  assert(compiledLat.woff2.length > 3000, 'Compiled valid WOFF2 binary for Latin Extended');

  const coverageLat = CoverageCalculator.analyzeFontCoverage(compiledLat.ttf, latinExtText);
  assert(coverageLat.coveragePercentage === 100, `Latin Extended coverage: ${coverageLat.coveragePercentage}% (${coverageLat.generatedCount}/${coverageLat.requestedCount})`);

  // --- TEST 3: Devanagari Script Synthesis ---
  console.log('\n--- TEST 3: Devanagari Script Synthesis ---');
  const specDev = await FontTypographyDirector.synthesizeStyleSpecification({
    prompt: 'Devanagari horror font with sharp distorted letters',
    category: 'Devanagari',
    weight: 'Bold',
    width: 'Normal',
    style: 'Modern',
  });

  const engineDev = new StyleAwareGlyphEngine(specDev, 77);
  const glyphsDev = engineDev.generateGlyphs();
  assert(glyphsDev.length >= 150, `Generated ${glyphsDev.length} glyphs including Devanagari Core`);

  const compiledDev = await FontCompilerService.compileFont(specDev);
  assert(compiledDev.ttf.length > 5000, 'Compiled valid TTF binary for Devanagari');

  const devanagariTestText = 'अ आ इ ई उ ऊ ऋ ए ऐ ओ औ क ख ग घ ङ च छ ज झ ञ ट ठ ड ढ ण त थ द ध न प फ ब भ म य र ल ळ व श ष स ह  ा  ि  ी  ु  ू  ृ  े  ै  ो  ौ  ं  ः  ँ  ्  ़ ० १ २ ३ ४ ५ ६ ७ ८ ९ । ॥ ॐ';
  const coverageDev = CoverageCalculator.analyzeFontCoverage(compiledDev.ttf, devanagariTestText);
  assert(coverageDev.coveragePercentage >= 95, `Devanagari Core coverage: ${coverageDev.coveragePercentage}%`);

  // --- TEST 4: Script vs Style Preservation (Horror vs Bubble Devanagari) ---
  console.log('\n--- TEST 4: Script vs Style Preservation (Horror vs Bubble Devanagari) ---');
  const specDevBubble = await FontTypographyDirector.synthesizeStyleSpecification({
    prompt: 'Soft rounded bubble Devanagari font',
    category: 'Devanagari',
    weight: 'Regular',
    width: 'Normal',
    style: 'Modern',
  });


  assert(specDev.styleDNA!.styleFamily === 'HORROR' || (specDev.styleDNA!.styleFamily as string) === 'DEVANAGARI', 'Horror Devanagari maintains Horror/Devanagari family');
  assert(specDevBubble.styleDNA!.roundness >= 0.8, 'Bubble Devanagari maintains high roundness (>= 0.8)');
  assert(specDev.styleDNA!.angularity >= 0.7, 'Horror Devanagari maintains high angularity (>= 0.7)');


  // --- TEST 5: Real Pangrams & Phrases Verification ---
  console.log('\n--- TEST 5: Real Pangrams & Phrases Verification ---');
  const phrases = [
    { text: 'Café déjà vu', name: 'French accent phrase' },
    { text: 'Über Straße', name: 'German accent phrase' },
    { text: 'São Paulo', name: 'Portuguese accent phrase' },
    { text: 'Zürich', name: 'Swiss accent phrase' },
    { text: 'नमस्ते भारत', name: 'Hindi greeting phrase' },
    { text: 'मराठी भाषा', name: 'Marathi phrase' },
    { text: 'सत्यमेव जयते', name: 'Sanskrit motto phrase' },
    { text: 'ॐ सर्वे भवन्तु सुखिनः', name: 'Sanskrit shloka phrase' },
  ];

  for (const p of phrases) {
    const res = CoverageCalculator.analyzeFontCoverage(compiledDev.ttf, p.text);
    assert(res.generatedCount > 0, `Pangram check [${p.name}]: "${p.text}" (${res.generatedCount}/${res.requestedCount} glyphs available in cmap)`);
  }

  // --- TEST 6: Missing Glyph Detection (Strict Non-Browser Fallback) ---
  console.log('\n--- TEST 6: Missing Glyph Detection (Strict Non-Browser Fallback) ---');
  const missingAnalysis = CoverageCalculator.analyzeFontCoverage(compiledLat.ttf, 'Hello 世界 العربية'); // Contains Japanese & Arabic
  assert(!missingAnalysis.isFullySupported, 'Missing glyph detector correctly identifies unsupported characters');
  assert(missingAnalysis.missingCodes.length > 0, `Identified ${missingAnalysis.missingCodes.length} missing code points without browser fallback false-positives`);

  // --- TEST 7: Prompt Script Intent & Unsupported Script Handling ---
  console.log('\n--- TEST 7: Prompt Script Intent & Unsupported Script Handling ---');
  const promptDev = PromptIntelligenceEngine.analyzePrompt('Hindi horror font for Halloween', 'Devanagari');
  assert(promptDev.targetScript === 'DEVANAGARI', 'Prompt intelligence detects targetScript = DEVANAGARI');
  assert(promptDev.baseFamily === 'HORROR' || (promptDev.baseFamily as string) === 'DEVANAGARI', 'Prompt intelligence preserves base style family');


  const promptArab = PromptIntelligenceEngine.analyzePrompt('Arabic calligraphic font');
  assert(promptArab.unsupportedScript === 'ARABIC', 'Prompt intelligence flags unsupportedScript = ARABIC');

  const promptJap = PromptIntelligenceEngine.analyzePrompt('Japanese anime bubble font');
  assert(promptJap.unsupportedScript === 'JAPANESE', 'Prompt intelligence flags unsupportedScript = JAPANESE');

  // --- TEST 8: OpenType Binary Validation ---
  console.log('\n--- TEST 8: OpenType Binary Validation ---');
  const valLat = FontValidationService.validateFontBuffers(compiledLat);
  assert(valLat.valid, `Latin Extended OpenType validation passed (${valLat.errors.length} errors)`);

  const valDev = FontValidationService.validateFontBuffers(compiledDev);
  assert(valDev.valid, `Devanagari OpenType validation passed (${valDev.errors.length} errors)`);


  console.log('\n================================================================');
  console.log('CHARACTER COVERAGE TEST SUITE COMPLETE: ALL PASSED');
  console.log('================================================================\n');
}

runCharacterCoverageSuite().catch((err) => {
  console.error('Character Coverage Test Suite Failed:', err);
  process.exit(1);
});
