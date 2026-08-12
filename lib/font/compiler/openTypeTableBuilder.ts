import type { Glyph } from 'opentype.js';
import { DEVANAGARI_CONJUNCT_RULES } from '../shaping/devanagariShaper';

export class OpenTypeTableBuilder {
  /**
   * Constructs valid OpenType GSUB table data for opentype.js font compiler.
   * Maps Devanagari sequence components (e.g. ka + virama + ra) to target conjunct glyph indices.
   */
  public static buildGsubTable(glyphs: Glyph[]): Record<string, unknown> | undefined {
    // 1. Create a map of Unicode code point to Glyph Index in the compiled glyph array
    const codeToGlyphIndex = new Map<number, number>();
    glyphs.forEach((g, idx) => {
      if (g.unicode !== undefined) {
        codeToGlyphIndex.set(g.unicode, idx);
      }
    });

    // Group ligatures by first component glyph index
    // Lookup Type 4 Format 1 expects:
    // - coverage: { format: 1, glyphs: [firstGlyphIdx, ...] }
    // - ligatureSets: [ [ { ligGlyph: targetIndex, components: [secondGlyphIdx, thirdGlyphIdx] } ], ... ]
    const ligSetByFirstGlyph = new Map<number, Array<{ ligGlyph: number; components: number[] }>>();

    for (const rule of DEVANAGARI_CONJUNCT_RULES) {
      const targetIndex = codeToGlyphIndex.get(rule.code);
      if (targetIndex === undefined) continue;

      const compIndices: number[] = [];
      let valid = true;
      for (const compCode of rule.components) {
        const idx = codeToGlyphIndex.get(compCode);
        if (idx === undefined) {
          valid = false;
          break;
        }
        compIndices.push(idx);
      }

      if (!valid || compIndices.length < 2) continue;

      const firstGlyphIdx = compIndices[0];
      const remainingComponents = compIndices.slice(1);

      if (!ligSetByFirstGlyph.has(firstGlyphIdx)) {
        ligSetByFirstGlyph.set(firstGlyphIdx, []);
      }
      ligSetByFirstGlyph.get(firstGlyphIdx)!.push({
        ligGlyph: targetIndex,
        components: remainingComponents,
      });
    }

    if (ligSetByFirstGlyph.size === 0) {
      return undefined;
    }

    const coverageGlyphs: number[] = Array.from(ligSetByFirstGlyph.keys()).sort((a, b) => a - b);
    const ligatureSets: Array<Array<{ ligGlyph: number; components: number[] }>> = coverageGlyphs.map(
      (firstGlyphIdx) => ligSetByFirstGlyph.get(firstGlyphIdx)!
    );

    const gsubTable = {
      scripts: [
        {
          tag: 'deva',
          script: {
            defaultLangSys: { reqFeatureIndex: 65535, featureIndexes: [0, 1, 2] },
            langSysRecords: [],
          },
        },
        {
          tag: 'dev2',
          script: {
            defaultLangSys: { reqFeatureIndex: 65535, featureIndexes: [0, 1, 2] },
            langSysRecords: [],
          },
        },
        {
          tag: 'DFLT',
          script: {
            defaultLangSys: { reqFeatureIndex: 65535, featureIndexes: [0, 1, 2] },
            langSysRecords: [],
          },
        },
      ],
      features: [
        { tag: 'liga', feature: { featureParams: 0, lookupListIndexes: [0] } },
        { tag: 'akhn', feature: { featureParams: 0, lookupListIndexes: [0] } },
        { tag: 'nukt', feature: { featureParams: 0, lookupListIndexes: [0] } },
      ],
      lookups: [
        {
          lookupType: 4,
          lookupFlag: 0,
          subtables: [
            {
              substFormat: 1,
              coverage: { format: 1, glyphs: coverageGlyphs },
              ligatureSets: ligatureSets,
            },
          ],
        },
      ],
    };

    return gsubTable;
  }
}
