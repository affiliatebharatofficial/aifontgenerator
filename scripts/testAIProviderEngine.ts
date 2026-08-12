import { generateFontSpecification } from '../lib/font/specification/provider';

async function main() {
  console.log('--- Testing AI Font Specification Pipeline End-to-End ---');

  const prompt = 'Geometric futuristic cyberpunk stencil font with sharp angles';
  console.log(`User Prompt: "${prompt}"`);

  try {
    const spec = await generateFontSpecification({
      prompt,
      category: 'Sans Serif',
      weight: 'Bold',
      width: 'Normal',
      style: 'Futuristic',
      characterSet: { uppercase: true, lowercase: true, numbers: true, punctuation: true },
      advancedSettings: { cornerStyle: 'sharp', contrast: 'high', strokeStyle: 'solid', letterSpacing: 0 },
    });

    console.log('\nAI Specification Pipeline Successful!');
    console.log(`Font Name: ${spec.fontName}`);
    console.log(`Stem Width: ${spec.stemWidth}`);
    console.log(`Ascender / Descender: ${spec.ascender} / ${spec.descender}`);
    console.log(`Design Description: ${spec.designDescription}`);

    console.log('\n--- Test Completed Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('\nAI Specification Pipeline Error:', err);
    process.exit(1);
  }
}

main();
