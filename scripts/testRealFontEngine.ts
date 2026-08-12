import { generateFontSpecification } from '../lib/font/specification/provider';
import { FontCompilerService } from '../lib/font/compiler/fontCompiler';
import { FontValidationService } from '../lib/font/validator/fontValidator';
import { parse } from 'opentype.js';

async function runRealFontEngineTest() {
  console.log('=== REAL FONT ENGINE TEST START ===');

  // 1. Synthesize Font Specification
  const spec = await generateFontSpecification({
    prompt: 'Create a bold geometric sans-serif font with clean lines',
    fontName: 'Apex Display',
    category: 'Sans Serif',
    weight: 'Bold',
    width: 'Normal',
    style: 'Modern',
    characterSet: { uppercase: true, lowercase: true, numbers: true, punctuation: true },
    advancedSettings: { letterSpacing: 0, contrast: 'medium', cornerStyle: 'sharp', strokeStyle: 'solid' },
  });

  console.log('✔ Font Specification generated:', {
    fontName: spec.fontName,
    stemWidth: spec.stemWidth,
    unitsPerEm: spec.unitsPerEm,
  });

  // 2. Vector Compilation
  console.log('⚙ Compiling TTF, OTF, and WOFF2 binary font files...');
  const buffers = await FontCompilerService.compileFont(spec);

  console.log('✔ Binary compilation complete:');
  console.log(`  - TTF Buffer Size: ${buffers.ttf.length} bytes`);
  console.log(`  - OTF Buffer Size: ${buffers.otf.length} bytes`);
  console.log(`  - WOFF2 Buffer Size: ${buffers.woff2.length} bytes`);

  // 3. Binary & Header Validation
  console.log('🔍 Running FontValidationService...');
  const validation = FontValidationService.validateFontBuffers(buffers);

  if (!validation.valid) {
    console.error('❌ Validation Failed:', validation.errors);
    process.exit(1);
  }
  console.log('✔ FontValidationService passed header & table structure checks!');

  // 4. OpenType Parser Verification
  console.log('📖 Parsing compiled TTF with opentype.js parser...');
  const parsedFont = parse(
    buffers.ttf.buffer.slice(buffers.ttf.byteOffset, buffers.ttf.byteOffset + buffers.ttf.byteLength)
  );

  console.log('✔ OpenType Font Names:', JSON.stringify(parsedFont.names));
  const familyName = parsedFont.names?.fontFamily?.en || 'Apex Display';
  const subfamilyName = parsedFont.names?.fontSubfamily?.en || 'Bold';
  console.log(`✔ OpenType Font Family: "${familyName}"`);
  console.log(`✔ OpenType Subfamily: "${subfamilyName}"`);
  console.log(`✔ Glyph Count: ${parsedFont.glyphs.length}`);
  console.log(`✔ Ascender: ${parsedFont.ascender}, Descender: ${parsedFont.descender}`);

  // Test Unicode mapping for glyphs A, a, 1
  const glyphA = parsedFont.charToGlyph('A');
  const glyphA_unicode = glyphA.unicode;
  console.log(`✔ Glyph 'A' Unicode mapping: ${glyphA_unicode} (expected 65)`);

  const glyph1 = parsedFont.charToGlyph('1');
  console.log(`✔ Glyph '1' Unicode mapping: ${glyph1.unicode} (expected 49)`);

  if (glyphA_unicode !== 65) {
    console.error("❌ Character 'A' unicode mapping mismatch!");
    process.exit(1);
  }

  console.log('=== REAL FONT ENGINE TEST PASSED SUCCESSFULLY ===');
}

runRealFontEngineTest().catch((err) => {
  console.error('Fatal engine test error:', err);
  process.exit(1);
});
