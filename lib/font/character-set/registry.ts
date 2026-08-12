export type ScriptType = 'LATIN' | 'DEVANAGARI' | 'CYRILLIC' | 'GREEK' | 'ARABIC' | 'JAPANESE' | 'CHINESE' | 'KOREAN';

export interface GlyphMetadata {
  code: number;
  name: string;
  char: string;
  category: 'uppercase' | 'lowercase' | 'digit' | 'punctuation' | 'vowel' | 'consonant' | 'matra' | 'mark' | 'symbol';
}

export interface CharacterSetDefinition {
  id: string;
  name: string;
  script: ScriptType;
  unicodeRanges: { start: number; end: number; name: string }[];
  glyphList: GlyphMetadata[];
  languageCodes: string[];
  isSupported: boolean;
}

// 1. BASIC LATIN (A-Z, a-z, 0-9, Punctuation)
const BASIC_LATIN_GLYPHS: GlyphMetadata[] = [];
for (let c = 65; c <= 90; c++) {
  BASIC_LATIN_GLYPHS.push({ code: c, name: String.fromCharCode(c), char: String.fromCharCode(c), category: 'uppercase' });
}
for (let c = 97; c <= 122; c++) {
  BASIC_LATIN_GLYPHS.push({ code: c, name: String.fromCharCode(c), char: String.fromCharCode(c), category: 'lowercase' });
}
for (let c = 48; c <= 57; c++) {
  BASIC_LATIN_GLYPHS.push({ code: c, name: String.fromCharCode(c), char: String.fromCharCode(c), category: 'digit' });
}
const punctMap: Record<number, string> = {
  32: 'space', 33: 'exclam', 34: 'quotedbl', 35: 'numbersign', 36: 'dollar', 37: 'percent', 38: 'ampersand', 39: 'quotesingle',
  40: 'parenleft', 41: 'parenright', 42: 'asterisk', 43: 'plus', 44: 'comma', 45: 'hyphen', 46: 'period', 47: 'slash',
  58: 'colon', 59: 'semicolon', 60: 'less', 61: 'equal', 62: 'greater', 63: 'question', 64: 'at',
  91: 'bracketleft', 92: 'backslash', 93: 'bracketright', 94: 'asciicircum', 95: 'underscore', 96: 'grave',
  123: 'braceleft', 124: 'bar', 125: 'braceright', 126: 'asciitilde'
};
Object.entries(punctMap).forEach(([codeStr, name]) => {
  const code = Number(codeStr);
  BASIC_LATIN_GLYPHS.push({ code, name, char: String.fromCharCode(code), category: 'punctuation' });
});

// 2. LATIN EXTENDED (Latin-1 Supplement & Latin Extended-A)
const LATIN_EXTENDED_GLYPHS: GlyphMetadata[] = [
  // Uppercase Accents
  { code: 0x00C0, name: 'Agrave', char: 'À', category: 'uppercase' },
  { code: 0x00C1, name: 'Aacute', char: 'Á', category: 'uppercase' },
  { code: 0x00C2, name: 'Acircumflex', char: 'Â', category: 'uppercase' },
  { code: 0x00C3, name: 'Atilde', char: 'Ã', category: 'uppercase' },
  { code: 0x00C4, name: 'Adieresis', char: 'Ä', category: 'uppercase' },
  { code: 0x00C5, name: 'Aring', char: 'Å', category: 'uppercase' },
  { code: 0x00C6, name: 'AE', char: 'Æ', category: 'uppercase' },
  { code: 0x00C7, name: 'Ccedilla', char: 'Ç', category: 'uppercase' },
  { code: 0x00C8, name: 'Egrave', char: 'È', category: 'uppercase' },
  { code: 0x00C9, name: 'Eacute', char: 'É', category: 'uppercase' },
  { code: 0x00CA, name: 'Ecircumflex', char: 'Ê', category: 'uppercase' },
  { code: 0x00CB, name: 'Edieresis', char: 'Ë', category: 'uppercase' },
  { code: 0x00CC, name: 'Igrave', char: 'Ì', category: 'uppercase' },
  { code: 0x00CD, name: 'Iacute', char: 'Í', category: 'uppercase' },
  { code: 0x00CE, name: 'Icircumflex', char: 'Î', category: 'uppercase' },
  { code: 0x00CF, name: 'Idieresis', char: 'Ï', category: 'uppercase' },
  { code: 0x00D1, name: 'Ntilde', char: 'Ñ', category: 'uppercase' },
  { code: 0x00D2, name: 'Ograve', char: 'Ò', category: 'uppercase' },
  { code: 0x00D3, name: 'Oacute', char: 'Ó', category: 'uppercase' },
  { code: 0x00D4, name: 'Ocircumflex', char: 'Ô', category: 'uppercase' },
  { code: 0x00D5, name: 'Otilde', char: 'Õ', category: 'uppercase' },
  { code: 0x00D6, name: 'Odieresis', char: 'Ö', category: 'uppercase' },
  { code: 0x00D8, name: 'Oslash', char: 'Ø', category: 'uppercase' },
  { code: 0x00D9, name: 'Ugrave', char: 'Ù', category: 'uppercase' },
  { code: 0x00DA, name: 'Uacute', char: 'Ú', category: 'uppercase' },
  { code: 0x00DB, name: 'Ucircumflex', char: 'Û', category: 'uppercase' },
  { code: 0x00DC, name: 'Udieresis', char: 'Ü', category: 'uppercase' },
  { code: 0x00DD, name: 'Yacute', char: 'Ý', category: 'uppercase' },
  { code: 0x00DF, name: 'germandbls', char: 'ß', category: 'lowercase' },
  { code: 0x0152, name: 'OE', char: 'Œ', category: 'uppercase' },
  { code: 0x0141, name: 'Lslash', char: 'Ł', category: 'uppercase' },
  { code: 0x0160, name: 'Scaron', char: 'Š', category: 'uppercase' },
  { code: 0x017D, name: 'Zcaron', char: 'Ž', category: 'uppercase' },
  { code: 0x011E, name: 'Gbreve', char: 'Ğ', category: 'uppercase' },
  { code: 0x0130, name: 'Idotaccent', char: 'İ', category: 'uppercase' },

  // Lowercase Accents
  { code: 0x00E0, name: 'agrave', char: 'à', category: 'lowercase' },
  { code: 0x00E1, name: 'aacute', char: 'á', category: 'lowercase' },
  { code: 0x00E2, name: 'acircumflex', char: 'â', category: 'lowercase' },
  { code: 0x00E3, name: 'atilde', char: 'ã', category: 'lowercase' },
  { code: 0x00E4, name: 'adieresis', char: 'ä', category: 'lowercase' },
  { code: 0x00E5, name: 'aring', char: 'å', category: 'lowercase' },
  { code: 0x00E6, name: 'ae', char: 'æ', category: 'lowercase' },
  { code: 0x00E7, name: 'ccedilla', char: 'ç', category: 'lowercase' },
  { code: 0x00E8, name: 'egrave', char: 'è', category: 'lowercase' },
  { code: 0x00E9, name: 'eacute', char: 'é', category: 'lowercase' },
  { code: 0x00EA, name: 'ecircumflex', char: 'ê', category: 'lowercase' },
  { code: 0x00EB, name: 'edieresis', char: 'ë', category: 'lowercase' },
  { code: 0x00EC, name: 'igrave', char: 'ì', category: 'lowercase' },
  { code: 0x00ED, name: 'i-acute', char: 'í', category: 'lowercase' },
  { code: 0x00EE, name: 'icircumflex', char: 'î', category: 'lowercase' },
  { code: 0x00EF, name: 'idieresis', char: 'ï', category: 'lowercase' },
  { code: 0x00F1, name: 'ntilde', char: 'ñ', category: 'lowercase' },
  { code: 0x00F2, name: 'ograve', char: 'ò', category: 'lowercase' },
  { code: 0x00F3, name: 'oacute', char: 'ó', category: 'lowercase' },
  { code: 0x00F4, name: 'ocircumflex', char: 'ô', category: 'lowercase' },
  { code: 0x00F5, name: 'otilde', char: 'õ', category: 'lowercase' },
  { code: 0x00F6, name: 'odieresis', char: 'ö', category: 'lowercase' },
  { code: 0x00F8, name: 'oslash', char: 'ø', category: 'lowercase' },
  { code: 0x00F9, name: 'ugrave', char: 'ù', category: 'lowercase' },
  { code: 0x00FA, name: 'uacute', char: 'ú', category: 'lowercase' },
  { code: 0x00FB, name: 'ucircumflex', char: 'û', category: 'lowercase' },
  { code: 0x00FC, name: 'udieresis', char: 'ü', category: 'lowercase' },
  { code: 0x00FD, name: 'yacute', char: 'ý', category: 'lowercase' },
  { code: 0x0153, name: 'oe', char: 'œ', category: 'lowercase' },
  { code: 0x0142, name: 'lslash', char: 'ł', category: 'lowercase' },
  { code: 0x0161, name: 'scaron', char: 'š', category: 'lowercase' },
  { code: 0x017E, name: 'zcaron', char: 'ž', category: 'lowercase' },
  { code: 0x011F, name: 'gbreve', char: 'ğ', category: 'lowercase' },
  { code: 0x0131, name: 'dotlessi', char: 'ı', category: 'lowercase' },
];

// 3. DEVANAGARI CORE (Vowels, Consonants, Matras, Marks, Digits, Punctuation)
const DEVANAGARI_GLYPHS: GlyphMetadata[] = [
  // Independent Vowels
  { code: 0x0905, name: 'dvA', char: 'अ', category: 'vowel' },
  { code: 0x0906, name: 'dvAA', char: 'आ', category: 'vowel' },
  { code: 0x0907, name: 'dvI', char: 'इ', category: 'vowel' },
  { code: 0x0908, name: 'dvII', char: 'ई', category: 'vowel' },
  { code: 0x0909, name: 'dvU', char: 'उ', category: 'vowel' },
  { code: 0x090A, name: 'dvUU', char: 'ऊ', category: 'vowel' },
  { code: 0x090B, name: 'dvR', char: 'ऋ', category: 'vowel' },
  { code: 0x090F, name: 'dvE', char: 'ए', category: 'vowel' },
  { code: 0x0910, name: 'dvAI', char: 'ऐ', category: 'vowel' },
  { code: 0x0913, name: 'dvO', char: 'ओ', category: 'vowel' },
  { code: 0x0914, name: 'dvAU', char: 'औ', category: 'vowel' },

  // Consonants
  { code: 0x0915, name: 'dvKA', char: 'क', category: 'consonant' },
  { code: 0x0916, name: 'dvKHA', char: 'ख', category: 'consonant' },
  { code: 0x0917, name: 'dvGA', char: 'ग', category: 'consonant' },
  { code: 0x0918, name: 'dvGHA', char: 'घ', category: 'consonant' },
  { code: 0x0919, name: 'dvNGA', char: 'ङ', category: 'consonant' },
  { code: 0x091A, name: 'dvCA', char: 'च', category: 'consonant' },
  { code: 0x091B, name: 'dvCHA', char: 'छ', category: 'consonant' },
  { code: 0x091C, name: 'dvJA', char: 'ज', category: 'consonant' },
  { code: 0x091D, name: 'dvJHA', char: 'झ', category: 'consonant' },
  { code: 0x091E, name: 'dvNYA', char: 'ञ', category: 'consonant' },
  { code: 0x091F, name: 'dvTTA', char: 'ट', category: 'consonant' },
  { code: 0x0920, name: 'dvTTHA', char: 'ठ', category: 'consonant' },
  { code: 0x0921, name: 'dvDDA', char: 'ड', category: 'consonant' },
  { code: 0x0922, name: 'dvDDHA', char: 'ढ', category: 'consonant' },
  { code: 0x0923, name: 'dvNNA', char: 'ण', category: 'consonant' },
  { code: 0x0924, name: 'dvTA', char: 'त', category: 'consonant' },
  { code: 0x0925, name: 'dvTHA', char: 'थ', category: 'consonant' },
  { code: 0x0926, name: 'dvDA', char: 'द', category: 'consonant' },
  { code: 0x0927, name: 'dvDHA', char: 'ध', category: 'consonant' },
  { code: 0x0928, name: 'dvNA', char: 'न', category: 'consonant' },
  { code: 0x092A, name: 'dvPA', char: 'प', category: 'consonant' },
  { code: 0x092B, name: 'dvPHA', char: 'फ', category: 'consonant' },
  { code: 0x092C, name: 'dvBA', char: 'ब', category: 'consonant' },
  { code: 0x092D, name: 'dvBHA', char: 'भ', category: 'consonant' },
  { code: 0x092E, name: 'dvMA', char: 'म', category: 'consonant' },
  { code: 0x092F, name: 'dvYA', char: 'य', category: 'consonant' },
  { code: 0x0930, name: 'dvRA', char: 'र', category: 'consonant' },
  { code: 0x0932, name: 'dvLA', char: 'ल', category: 'consonant' },
  { code: 0x0933, name: 'dvLLA', char: 'ळ', category: 'consonant' },
  { code: 0x0935, name: 'dvVA', char: 'व', category: 'consonant' },
  { code: 0x0936, name: 'dvSHA', char: 'श', category: 'consonant' },
  { code: 0x0937, name: 'dvSSHA', char: 'ष', category: 'consonant' },
  { code: 0x0938, name: 'dvSA', char: 'स', category: 'consonant' },
  { code: 0x0939, name: 'dvHA', char: 'ह', category: 'consonant' },

  // Matras (Dependent Vowels)
  { code: 0x093E, name: 'dvMatraAA', char: 'ा', category: 'matra' },
  { code: 0x093F, name: 'dvMatraI', char: 'ि', category: 'matra' },
  { code: 0x0940, name: 'dvMatraII', char: 'ी', category: 'matra' },
  { code: 0x0941, name: 'dvMatraU', char: 'ु', category: 'matra' },
  { code: 0x0942, name: 'dvMatraUU', char: 'ू', category: 'matra' },
  { code: 0x0943, name: 'dvMatraR', char: 'ृ', category: 'matra' },
  { code: 0x0947, name: 'dvMatraE', char: 'े', category: 'matra' },
  { code: 0x0948, name: 'dvMatraAI', char: 'ै', category: 'matra' },
  { code: 0x094B, name: 'dvMatraO', char: 'ो', category: 'matra' },
  { code: 0x094C, name: 'dvMatraAU', char: 'ौ', category: 'matra' },

  // Combining Marks
  { code: 0x0901, name: 'dvChandrabindu', char: 'ँ', category: 'mark' },
  { code: 0x0902, name: 'dvAnusvara', char: 'ं', category: 'mark' },
  { code: 0x0903, name: 'dvVisarga', char: 'ः', category: 'mark' },
  { code: 0x093C, name: 'dvNukta', char: '़', category: 'mark' },
  { code: 0x094D, name: 'dvVirama', char: '्', category: 'mark' },

  // Digits
  { code: 0x0966, name: 'dvZero', char: '०', category: 'digit' },
  { code: 0x0967, name: 'dvOne', char: '१', category: 'digit' },
  { code: 0x0968, name: 'dvTwo', char: '२', category: 'digit' },
  { code: 0x0969, name: 'dvThree', char: '३', category: 'digit' },
  { code: 0x096A, name: 'dvFour', char: '४', category: 'digit' },
  { code: 0x096B, name: 'dvFive', char: '५', category: 'digit' },
  { code: 0x096C, name: 'dvSix', char: '६', category: 'digit' },
  { code: 0x096D, name: 'dvSeven', char: '७', category: 'digit' },
  { code: 0x096E, name: 'dvEight', char: '८', category: 'digit' },
  { code: 0x096F, name: 'dvNine', char: '९', category: 'digit' },

  // Punctuation & Symbols
  { code: 0x0964, name: 'dvDanda', char: '।', category: 'punctuation' },
  { code: 0x0965, name: 'dvDoubleDanda', char: '॥', category: 'punctuation' },
  { code: 0x0950, name: 'dvOm', char: 'ॐ', category: 'symbol' },
];

export const CHARACTER_SETS: Record<string, CharacterSetDefinition> = {
  BASIC_LATIN: {
    id: 'BASIC_LATIN',
    name: 'Basic Latin',
    script: 'LATIN',
    unicodeRanges: [{ start: 0x0020, end: 0x007E, name: 'Basic Latin' }],
    glyphList: BASIC_LATIN_GLYPHS,
    languageCodes: ['en'],
    isSupported: true,
  },
  LATIN_EXTENDED: {
    id: 'LATIN_EXTENDED',
    name: 'Latin Extended (Western / Central European)',
    script: 'LATIN',
    unicodeRanges: [
      { start: 0x0020, end: 0x007E, name: 'Basic Latin' },
      { start: 0x00C0, end: 0x00FF, name: 'Latin-1 Supplement' },
      { start: 0x0100, end: 0x017F, name: 'Latin Extended-A' },
    ],
    glyphList: [...BASIC_LATIN_GLYPHS, ...LATIN_EXTENDED_GLYPHS],
    languageCodes: ['en', 'fr', 'de', 'es', 'it', 'pt', 'nl', 'pl', 'cs', 'ro', 'tr', 'vi'],
    isSupported: true,
  },
  DEVANAGARI_CORE: {
    id: 'DEVANAGARI_CORE',
    name: 'Devanagari (Hindi / Marathi / Sanskrit)',
    script: 'DEVANAGARI',
    unicodeRanges: [{ start: 0x0900, end: 0x097F, name: 'Devanagari' }],
    glyphList: DEVANAGARI_GLYPHS,
    languageCodes: ['hi', 'mr', 'sa', 'ne'],
    isSupported: true,
  },
};

export class CharacterSetRegistry {
  public static getCharacterSet(id: string): CharacterSetDefinition | undefined {
    return CHARACTER_SETS[id];
  }

  public static getSupportedCharacterSets(): CharacterSetDefinition[] {
    return Object.values(CHARACTER_SETS).filter((cs) => cs.isSupported);
  }

  public static detectScriptFromText(text: string): { scripts: ScriptType[]; isDevanagari: boolean; isLatinExtended: boolean } {
    let hasDevanagari = false;
    let hasLatinExt = false;
    let hasLatin = false;

    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code >= 0x0900 && code <= 0x097F) {
        hasDevanagari = true;
      } else if ((code >= 0x00C0 && code <= 0x00FF) || (code >= 0x0100 && code <= 0x017F)) {
        hasLatinExt = true;
      } else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
        hasLatin = true;
      }
    }

    const scripts: ScriptType[] = [];
    if (hasDevanagari) scripts.push('DEVANAGARI');
    if (hasLatin || hasLatinExt) scripts.push('LATIN');

    return {
      scripts,
      isDevanagari: hasDevanagari,
      isLatinExtended: hasLatinExt,
    };
  }
}
