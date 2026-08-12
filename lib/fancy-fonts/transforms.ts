/**
 * Helper to transform text using a dictionary mapping of single characters to Unicode strings.
 * Uses Array.from(text) to safely iterate over multi-byte code points (preserving emojis & surrogate pairs).
 */
export function mapChars(text: string, charMap: Record<string, string>): string {
  return Array.from(text)
    .map((ch) => charMap[ch] || ch)
    .join('');
}

/**
 * Helper to generate mapping dictionary for contiguous character ranges.
 */
function buildRangeMap(
  upperStartCodePoint: number,
  lowerStartCodePoint: number,
  digitStartCodePoint?: number,
  overrides: Record<string, string> = {}
): Record<string, string> {
  const map: Record<string, string> = {};

  // Upper case A-Z
  for (let i = 0; i < 26; i++) {
    const char = String.fromCharCode(65 + i);
    map[char] = String.fromCodePoint(upperStartCodePoint + i);
  }

  // Lower case a-z
  for (let i = 0; i < 26; i++) {
    const char = String.fromCharCode(97 + i);
    map[char] = String.fromCodePoint(lowerStartCodePoint + i);
  }

  // Digits 0-9
  if (digitStartCodePoint !== undefined) {
    for (let i = 0; i < 10; i++) {
      const char = String(i);
      map[char] = String.fromCodePoint(digitStartCodePoint + i);
    }
  }

  // Overrides for standard Unicode legacy exceptions
  return { ...map, ...overrides };
}

/**
 * 1. Bold (Mathematical Bold)
 */
export const boldMap = buildRangeMap(0x1d400, 0x1d41a, 0x1d7ce);
export const transformBold = (text: string) => mapChars(text, boldMap);

/**
 * 2. Italic (Mathematical Italic)
 * Exception: 'h' -> U+210E (Planck constant / italic h)
 */
export const italicMap = buildRangeMap(0x1d434, 0x1d44e, undefined, {
  h: 'ℎ',
});
export const transformItalic = (text: string) => mapChars(text, italicMap);

/**
 * 3. Bold Italic (Mathematical Bold Italic)
 */
export const boldItalicMap = buildRangeMap(0x1d468, 0x1d482);
export const transformBoldItalic = (text: string) => mapChars(text, boldItalicMap);

/**
 * 4. Script / Cursive (Mathematical Script)
 * Unicode standard exceptions for Script A-Z, a-z:
 * B: U+212C, E: U+2130, F: U+2131, H: U+210B, I: U+2110, L: U+2112, M: U+2133, R: U+211B
 * e: U+212F, g: U+210A, o: U+2134
 */
export const scriptMap = buildRangeMap(0x1d4d0, 0x1d4ea, undefined, {
  B: 'ℬ',
  E: 'ℰ',
  F: 'ℱ',
  H: 'ℋ',
  I: 'ℐ',
  L: 'ℒ',
  M: 'ℳ',
  R: 'ℛ',
  e: 'ℯ',
  g: 'ℊ',
  o: 'ℴ',
});
export const transformScript = (text: string) => mapChars(text, scriptMap);

/**
 * 5. Bold Script (Mathematical Bold Script)
 */
export const boldScriptMap = buildRangeMap(0x1d4d0, 0x1d4ea);
export const transformBoldScript = (text: string) => mapChars(text, boldScriptMap);

/**
 * 6. Fraktur / Gothic (Mathematical Fraktur)
 * Exceptions: C: U+212D, H: U+210C, I: U+2111, R: U+211C, Z: U+2128
 */
export const frakturMap = buildRangeMap(0x1d504, 0x1d51e, undefined, {
  C: 'ℭ',
  H: 'ℌ',
  I: 'ℑ',
  R: 'ℜ',
  Z: 'ℨ',
});
export const transformFraktur = (text: string) => mapChars(text, frakturMap);

/**
 * 7. Bold Fraktur (Mathematical Bold Fraktur)
 */
export const boldFrakturMap = buildRangeMap(0x1d56c, 0x1d586);
export const transformBoldFraktur = (text: string) => mapChars(text, boldFrakturMap);

/**
 * 8. Double Struck / Blackboard Bold
 * Exceptions: C: U+2102, H: U+210D, N: U+2115, P: U+2119, Q: U+211D, R: U+211D, Z: U+2124
 */
export const doubleStruckMap = buildRangeMap(0x1d538, 0x1d552, 0x1d7d8, {
  C: 'ℂ',
  H: 'ℍ',
  N: 'ℕ',
  P: 'ℙ',
  Q: 'ℚ',
  R: 'ℝ',
  Z: 'ℤ',
});
export const transformDoubleStruck = (text: string) => mapChars(text, doubleStruckMap);

/**
 * 9. Sans Serif
 */
export const sansMap = buildRangeMap(0x1d5a0, 0x1d5ba, 0x1d7e2);
export const transformSans = (text: string) => mapChars(text, sansMap);

/**
 * 10. Sans Serif Bold
 */
export const sansBoldMap = buildRangeMap(0x1d5d4, 0x1d5ee, 0x1d7ec);
export const transformSansBold = (text: string) => mapChars(text, sansBoldMap);

/**
 * 11. Sans Serif Italic
 */
export const sansItalicMap = buildRangeMap(0x1d608, 0x1d622);
export const transformSansItalic = (text: string) => mapChars(text, sansItalicMap);

/**
 * 12. Sans Serif Bold Italic
 */
export const sansBoldItalicMap = buildRangeMap(0x1d63c, 0x1d656);
export const transformSansBoldItalic = (text: string) => mapChars(text, sansBoldItalicMap);

/**
 * 13. Monospace
 */
export const monospaceMap = buildRangeMap(0x1d670, 0x1d68a, 0x1d7f6);
export const transformMonospace = (text: string) => mapChars(text, monospaceMap);

/**
 * 14. Small Caps
 */
export const smallCapsMap: Record<string, string> = {
  a: 'ᴀ',
  b: 'ʙ',
  c: 'ᴄ',
  d: 'ᴅ',
  e: 'ᴇ',
  f: 'ꜰ',
  g: 'ɢ',
  h: 'ʜ',
  i: 'ɪ',
  j: 'ᴊ',
  k: 'ᴋ',
  l: 'ʟ',
  m: 'ᴍ',
  n: 'ɴ',
  o: 'ᴏ',
  p: 'ᴘ',
  q: 'ꞯ',
  r: 'ʀ',
  s: 'ꜱ',
  t: 'ᴛ',
  u: 'ᴜ',
  v: 'ᴠ',
  w: 'ᴡ',
  x: 'x',
  y: 'ʏ',
  z: 'ᴢ',
};
export const transformSmallCaps = (text: string) => mapChars(text, smallCapsMap);

/**
 * 15. Fullwidth / Vaporwave
 */
export const transformFullwidth = (text: string) => {
  return Array.from(text)
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (ch === ' ') return '  ';
      if (code >= 33 && code <= 126) {
        return String.fromCharCode(code + 65248);
      }
      return ch;
    })
    .join('');
};

/**
 * 16. Circled (Enclosed Alphanumerics)
 * A-Z: U+24B6 to U+24CF
 * a-z: U+24D0 to U+24E9
 * 1-9: U+2460 to U+2468
 * 0: U+24EA
 */
export const circledMap: Record<string, string> = (() => {
  const map: Record<string, string> = { '0': '⓪' };
  for (let i = 0; i < 26; i++) {
    map[String.fromCharCode(65 + i)] = String.fromCodePoint(0x24b6 + i);
    map[String.fromCharCode(97 + i)] = String.fromCodePoint(0x24d0 + i);
  }
  for (let i = 1; i <= 9; i++) {
    map[String(i)] = String.fromCodePoint(0x2460 + i - 1);
  }
  return map;
})();
export const transformCircled = (text: string) => mapChars(text, circledMap);

/**
 * 17. Parenthesized Alphanumerics
 * a-z: U+249C to U+24B5
 * 1-9: U+2474 to U+247C
 */
export const parenthesizedMap: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (let i = 0; i < 26; i++) {
    map[String.fromCharCode(97 + i)] = String.fromCodePoint(0x249c + i);
    map[String.fromCharCode(65 + i)] = String.fromCodePoint(0x249c + i);
  }
  for (let i = 1; i <= 9; i++) {
    map[String(i)] = String.fromCodePoint(0x2474 + i - 1);
  }
  return map;
})();
export const transformParenthesized = (text: string) => mapChars(text, parenthesizedMap);

/**
 * 18. Squared (Squared Alphanumerics)
 * A-Z: U+1F130 to U+1F149
 * a-z: U+1F130 to U+1F149
 */
export const squaredMap: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (let i = 0; i < 26; i++) {
    const sq = String.fromCodePoint(0x1f130 + i);
    map[String.fromCharCode(65 + i)] = sq;
    map[String.fromCharCode(97 + i)] = sq;
  }
  return map;
})();
export const transformSquared = (text: string) => mapChars(text, squaredMap);

/**
 * 19. Superscript
 */
export const superscriptMap: Record<string, string> = {
  a: 'ᵃ',
  b: 'ᵇ',
  c: 'ᶜ',
  d: 'ᵈ',
  e: 'ᵉ',
  f: 'ᶠ',
  g: 'ᵍ',
  h: 'ʰ',
  i: 'ⁱ',
  j: 'ʲ',
  k: 'ᵏ',
  l: 'ˡ',
  m: 'ᵐ',
  n: 'ⁿ',
  o: 'ᵒ',
  p: 'ᵖ',
  r: 'ʳ',
  s: 'ˢ',
  t: 'ᵗ',
  u: 'ᵘ',
  v: 'ᵛ',
  w: 'ʷ',
  x: 'ˣ',
  y: 'ʸ',
  z: 'ᶻ',
  A: 'ᴬ',
  B: 'ᴮ',
  D: 'ᴰ',
  E: 'ᴱ',
  G: 'ᴳ',
  H: 'ᴴ',
  I: 'ᴵ',
  J: 'ᴶ',
  K: 'ᴷ',
  L: 'ᴸ',
  M: 'ᴹ',
  N: 'ᴺ',
  O: 'ᴼ',
  P: 'ᴾ',
  R: 'ᴿ',
  T: 'ᵀ',
  U: 'ᵁ',
  V: 'ⱽ',
  W: 'ᵂ',
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
  '=': '⁼',
  '(': '⁽',
  ')': '⁾',
};
export const transformSuperscript = (text: string) => mapChars(text, superscriptMap);

/**
 * 20. Subscript
 */
export const subscriptMap: Record<string, string> = {
  a: 'ₐ',
  e: 'ₑ',
  h: 'ₕ',
  i: 'ᵢ',
  j: 'ⱼ',
  k: 'ₖ',
  l: 'ₗ',
  m: 'ₘ',
  n: 'ₙ',
  o: 'ₒ',
  p: 'ₚ',
  r: 'ᵣ',
  s: 'ₛ',
  t: 'ₜ',
  u: 'ᵤ',
  v: 'ᵥ',
  x: 'ₓ',
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
  '+': '₊',
  '-': '₋',
  '=': '₌',
  '(': '₍',
  ')': '₎',
};
export const transformSubscript = (text: string) => mapChars(text, subscriptMap);

/**
 * 21. Bubble (Negative Circled / Dark Bubble)
 * A-Z: U+1F150 to U+1F169
 * 1-9: U+278A to U+2792
 * 0: U+24FF
 */
export const bubbleMap: Record<string, string> = (() => {
  const map: Record<string, string> = { '0': '⓿' };
  for (let i = 0; i < 26; i++) {
    const bub = String.fromCodePoint(0x1f150 + i);
    map[String.fromCharCode(65 + i)] = bub;
    map[String.fromCharCode(97 + i)] = bub;
  }
  for (let i = 1; i <= 9; i++) {
    map[String(i)] = String.fromCodePoint(0x278a + i - 1);
  }
  return map;
})();
export const transformBubble = (text: string) => mapChars(text, bubbleMap);

/**
 * 22. Strikethrough (Combining Long Stroke Overlay U+0336)
 */
export const transformStrikethrough = (text: string) => {
  return Array.from(text)
    .map((ch) => (/\s/.test(ch) ? ch : ch + '\u0336'))
    .join('');
};

/**
 * 23. Underline (Combining Low Line U+0332)
 */
export const transformUnderline = (text: string) => {
  return Array.from(text)
    .map((ch) => (/\s/.test(ch) ? ch : ch + '\u0332'))
    .join('');
};

/**
 * 24. Slash (Combining Short Solidus Overlay U+0337)
 */
export const transformSlash = (text: string) => {
  return Array.from(text)
    .map((ch) => (/\s/.test(ch) ? ch : ch + '\u0337'))
    .join('');
};

/**
 * 25. Reverse / Mirrored
 * Reverse character map table + reversed string order
 */
export const reverseCharMap: Record<string, string> = {
  a: 'ɐ',
  b: 'q',
  c: 'ɔ',
  d: 'p',
  e: 'ǝ',
  f: 'ɟ',
  g: 'ƃ',
  h: 'ɥ',
  i: 'ı',
  j: 'ɾ',
  k: 'ʞ',
  l: 'l',
  m: 'ɯ',
  n: 'u',
  o: 'o',
  p: 'd',
  q: 'b',
  r: 'ɹ',
  s: 's',
  t: 'ʇ',
  u: 'n',
  v: 'ʌ',
  w: 'ʍ',
  x: 'x',
  y: 'ʎ',
  z: 'z',
  A: '∀',
  B: '𐐒',
  C: 'Ɔ',
  D: 'Ɐ',
  E: 'Ǝ',
  F: 'Ⅎ',
  G: '⅁',
  H: 'H',
  I: 'I',
  J: 'ſ',
  K: 'Ʞ',
  L: 'Ꞁ',
  M: 'W',
  N: 'N',
  O: 'O',
  P: 'Ԁ',
  Q: 'Ό',
  R: 'ᴚ',
  S: 'S',
  T: '┴',
  U: '∩',
  V: 'Λ',
  W: 'M',
  X: 'X',
  Y: '⅄',
  Z: 'Z',
  '1': '⇂',
  '2': 'ᄅ',
  '3': 'Ɛ',
  '4': 'ㄣ',
  '5': 'ϛ',
  '6': '9',
  '7': 'ㄥ',
  '8': '8',
  '9': '6',
  '0': '0',
  '.': '˙',
  ',': "'",
  "'": ',',
  '"': ',,',
  '!': '¡',
  '?': '¿',
};

export const transformReverse = (text: string) => {
  const charArray = Array.from(text);
  return charArray
    .map((ch) => reverseCharMap[ch] || ch)
    .reverse()
    .join('');
};
