import type {
  FontStyleDNA,
  StyleFamily,
  PromptDesignModifiers,
} from './dna';


export interface PromptAnalysis {
  baseFamily: StyleFamily;
  modifiers: PromptDesignModifiers;
  activeModifiers: string[];
  rawTags: string[];
  targetScript?: 'LATIN' | 'LATIN_EXTENDED' | 'DEVANAGARI' | 'MIXED';
  unsupportedScript?: 'ARABIC' | 'JAPANESE' | 'CHINESE' | 'KOREAN' | 'CYRILLIC' | 'GREEK';
}


export class PromptIntelligenceEngine {
  /**
   * Main entry point: Extracts Base Style Family and all fine-grained Design Modifiers.
   */
  public static analyzePrompt(prompt: string, categoryHint?: string): PromptAnalysis {
    const text = ` ${prompt.toLowerCase()} `;
    const cat = (categoryHint || '').toLowerCase();

    // 1. Extract Base Style Family
    const baseFamily = this.extractBaseStyleFamily(text, cat);

    // 2. Script Intent & Unsupported Script Detection
    let targetScript: 'LATIN' | 'LATIN_EXTENDED' | 'DEVANAGARI' | 'MIXED' | undefined = undefined;
    let unsupportedScript: 'ARABIC' | 'JAPANESE' | 'CHINESE' | 'KOREAN' | 'CYRILLIC' | 'GREEK' | undefined = undefined;

    if (/\b(devanagari|hindi|marathi|sanskrit|nepali)\b/i.test(text) || cat === 'devanagari') {
      targetScript = /\b(latin|english)\b/i.test(text) ? 'MIXED' : 'DEVANAGARI';
    } else if (/\b(latin extended|french|german|spanish|italian|portuguese|polish|czech|turkish|accented)\b/i.test(text)) {
      targetScript = 'LATIN_EXTENDED';
    }

    if (/\b(arabic|urdu|persian)\b/i.test(text)) {
      unsupportedScript = 'ARABIC';
    } else if (/\b(japanese|kanji|hiragana|katakana)\b/i.test(text)) {
      unsupportedScript = 'JAPANESE';
    } else if (/\b(chinese|mandarin|hanzi)\b/i.test(text)) {
      unsupportedScript = 'CHINESE';
    } else if (/\b(korean|hangul)\b/i.test(text)) {
      unsupportedScript = 'KOREAN';
    } else if (/\b(cyrillic|russian)\b/i.test(text)) {
      unsupportedScript = 'CYRILLIC';
    } else if (/\b(greek)\b/i.test(text)) {
      unsupportedScript = 'GREEK';
    }

    // 3. Extract Detailed Modifiers
    const modifiers: PromptDesignModifiers = {};
    const activeModifiers: string[] = [];
    const rawTags: string[] = [];


    // --- WIDTH MODIFIERS ---
    if (/\b(ultra[-\s]?condensed|compressed)\b/i.test(text)) {
      modifiers.width = 'ULTRA_CONDENSED';
      modifiers.widthScaleOverride = 0.72;
      activeModifiers.push('ULTRA_CONDENSED');
      rawTags.push('width:ultra_condensed');
    } else if (/\b(condensed|narrow|skinny|slim|thin width)\b/i.test(text)) {
      modifiers.width = 'NARROW';
      modifiers.widthScaleOverride = 0.80;
      activeModifiers.push('NARROW');
      rawTags.push('width:narrow');
    } else if (/\b(ultra[-\s]?expanded)\b/i.test(text)) {
      modifiers.width = 'ULTRA_EXPANDED';
      modifiers.widthScaleOverride = 1.35;
      activeModifiers.push('ULTRA_EXPANDED');
      rawTags.push('width:ultra_expanded');
    } else if (/\b(expanded|wide|broad|spacious|wide letters)\b/i.test(text)) {
      modifiers.width = 'WIDE';
      modifiers.widthScaleOverride = 1.22;
      activeModifiers.push('WIDE');
      rawTags.push('width:wide');
    }

    // --- HEIGHT MODIFIERS ---
    if (/\b(elongated|stretched|very tall)\b/i.test(text)) {
      modifiers.height = 'ELONGATED';
      modifiers.heightScaleOverride = 1.22;
      activeModifiers.push('ELONGATED');
      rawTags.push('height:elongated');
    } else if (/\b(tall|vertical|high|tall capitals|tall letters|high ascenders)\b/i.test(text)) {
      modifiers.height = 'TALL';
      modifiers.heightScaleOverride = 1.14;
      activeModifiers.push('TALL');
      rawTags.push('height:tall');
    } else if (/\b(short|squat|low|compact height|short capitals)\b/i.test(text)) {
      modifiers.height = 'SHORT';
      modifiers.heightScaleOverride = 0.88;
      activeModifiers.push('SHORT');
      rawTags.push('height:short');
    }

    // --- WEIGHT MODIFIERS ---
    if (/\b(hairline|ultra thin|extra thin)\b/i.test(text)) {
      modifiers.weight = 'HAIRLINE';
      modifiers.strokeWeightOverride = 0.035;
      activeModifiers.push('HAIRLINE');
      rawTags.push('weight:hairline');
    } else if (/\b(thin|light|fine stroke)\b/i.test(text) && !/\b(thin and thick|thick and thin)\b/i.test(text)) {
      modifiers.weight = 'THIN';
      modifiers.strokeWeightOverride = 0.055;
      activeModifiers.push('THIN');
      rawTags.push('weight:thin');
    } else if (/\b(ultra bold|extra bold|black|fat letters|heavy black)\b/i.test(text)) {
      modifiers.weight = 'BLACK';
      modifiers.strokeWeightOverride = 0.24;
      activeModifiers.push('BLACK');
      rawTags.push('weight:black');
    } else if (/\b(bold|heavy|thick|boldface)\b/i.test(text) && !/\b(thin and thick|thick and thin)\b/i.test(text)) {
      modifiers.weight = 'BOLD';
      modifiers.strokeWeightOverride = 0.16;
      activeModifiers.push('BOLD');
      rawTags.push('weight:bold');
    }

    // --- CONTRAST MODIFIERS ---
    if (/\b(dramatic contrast|extreme contrast|high contrast|didone|fashion editorial|vogue|thick and thin|thin and thick)\b/i.test(text)) {
      modifiers.contrast = 'HIGH';
      modifiers.contrastOverride = 0.88;
      activeModifiers.push('HIGH_CONTRAST');
      rawTags.push('contrast:high');
    } else if (/\b(monoline|uniform stroke|consistent thickness|low contrast|even thickness)\b/i.test(text)) {
      modifiers.contrast = 'LOW';
      modifiers.contrastOverride = 0.08;
      activeModifiers.push('MONOLINE');
      rawTags.push('contrast:low');
    }

    // --- TERMINAL MODIFIERS ---
    if (/\b(dripping|drip|drippy|droplet|blood drip|slime|dripping terminals)\b/i.test(text)) {
      modifiers.terminals = 'DRIPPING';
      modifiers.terminalStrength = 0.88;
      activeModifiers.push('DRIPPING');
      rawTags.push('terminal:dripping');
    } else if (/\b(fang|fangs|claw|vampire|dagger|spiked terminals|piercing)\b/i.test(text)) {
      modifiers.terminals = 'FANG';
      modifiers.terminalStrength = 0.82;
      activeModifiers.push('FANG');
      rawTags.push('terminal:fang');
    } else if (/\b(melting|melted|liquid|oozing)\b/i.test(text)) {
      modifiers.terminals = 'MELTING';
      modifiers.terminalStrength = 0.78;
      activeModifiers.push('MELTING');
      rawTags.push('terminal:melting');
    } else if (/\b(hairline serif|unbracketed serif|razor serif)\b/i.test(text)) {
      modifiers.terminals = 'HAIRLINE';
      activeModifiers.push('HAIRLINE_SERIF');
      rawTags.push('terminal:hairline_serif');
    } else if (/\b(wedge terminals|wedge|chisel|blackletter cut)\b/i.test(text)) {
      modifiers.terminals = 'WEDGE';
      activeModifiers.push('WEDGE');
      rawTags.push('terminal:wedge');
    } else if (/\b(rounded terminals|round tips|pill terminals|soft ends)\b/i.test(text)) {
      modifiers.terminals = 'ROUND';
      activeModifiers.push('ROUND_TERMINALS');
      rawTags.push('terminal:round');
    } else if (/\b(flat terminals|cut terminals|square terminals|blunt ends)\b/i.test(text)) {
      modifiers.terminals = 'FLAT';
      activeModifiers.push('FLAT_TERMINALS');
      rawTags.push('terminal:flat');
    } else if (/\b(serifed|bracketed serif|slab serif)\b/i.test(text)) {
      modifiers.terminals = 'SERIFED';
      activeModifiers.push('SERIFED');
      rawTags.push('terminal:serifed');
    }

    // --- CORNER & STROKE MODIFIERS ---
    if (/\b(cracked|fractured|broken|shattered|damaged|distressed|cracked strokes)\b/i.test(text)) {
      modifiers.corners = 'CRACKED';
      modifiers.strokes = 'CRACKED';
      modifiers.distortionStrength = 0.65;
      activeModifiers.push('CRACKED');
      rawTags.push('strokes:cracked');
    } else if (/\b(scratched|scratch|scratches|grunge|decay|rotting)\b/i.test(text)) {
      modifiers.strokes = 'SCRATCHED';
      modifiers.distortionStrength = 0.55;
      activeModifiers.push('SCRATCHED');
      rawTags.push('strokes:scratched');
    } else if (/\b(chamfered|beveled|faceted|angled corners|45 degree|cyber cuts)\b/i.test(text)) {
      modifiers.corners = 'CHAMFERED';
      activeModifiers.push('CHAMFERED');
      rawTags.push('corners:chamfered');
    } else if (/\b(sharp corners|sharp edges|hard corners|sharp cuts)\b/i.test(text)) {
      modifiers.corners = 'SHARP';
      modifiers.angularity = 'HIGH';
      activeModifiers.push('SHARP');
      rawTags.push('corners:sharp');
    } else if (/\b(soft corners|rounded corners|smooth corners)\b/i.test(text)) {
      modifiers.corners = 'ROUND';
      modifiers.roundness = 'HIGH';
      activeModifiers.push('ROUND');
      rawTags.push('corners:round');
    } else if (/\b(sharp|pointed|aggressive)\b/i.test(text)) {
      modifiers.angularity = 'HIGH';
      activeModifiers.push('SHARP');
      rawTags.push('angularity:high');
    }


    // --- COUNTER MODIFIERS ---
    if (/\b(open counters|large counters|airy counters|spacious counters|airy)\b/i.test(text)) {
      modifiers.counters = 'OPEN';
      activeModifiers.push('OPEN_COUNTERS');
      rawTags.push('counters:open');
    } else if (/\b(tight counters|small counters|dense counters|closed counters|compact counters)\b/i.test(text)) {
      modifiers.counters = 'TIGHT';
      activeModifiers.push('TIGHT_COUNTERS');
      rawTags.push('counters:tight');
    }

    // --- BASELINE MODIFIERS ---
    if (/\b(bouncy|bouncy baseline|dancing baseline|jumping)\b/i.test(text)) {
      modifiers.baseline = 'BOUNCY';
      activeModifiers.push('BOUNCY_BASELINE');
      rawTags.push('baseline:bouncy');
    } else if (/\b(irregular baseline|uneven baseline|staggered baseline|wobbly)\b/i.test(text)) {
      modifiers.baseline = 'IRREGULAR';
      activeModifiers.push('IRREGULAR_BASELINE');
      rawTags.push('baseline:irregular');
    } else if (/\b(handwritten baseline|organic baseline)\b/i.test(text)) {
      modifiers.baseline = 'HANDWRITTEN';
      activeModifiers.push('HANDWRITTEN_BASELINE');
      rawTags.push('baseline:handwritten');
    } else if (/\b(straight baseline|stable baseline|rigid baseline|flat baseline)\b/i.test(text)) {
      modifiers.baseline = 'FLAT';
      activeModifiers.push('FLAT_BASELINE');
      rawTags.push('baseline:flat');
    }

    // --- SPACING MODIFIERS ---
    if (/\b(tight spacing|condensed spacing|close letters|tight tracking)\b/i.test(text)) {
      modifiers.spacing = 'TIGHT';
      activeModifiers.push('TIGHT_SPACING');
      rawTags.push('spacing:tight');
    } else if (/\b(wide spacing|loose spacing|spaced out|open tracking)\b/i.test(text)) {
      modifiers.spacing = 'WIDE';
      activeModifiers.push('WIDE_SPACING');
      rawTags.push('spacing:wide');
    }

    // --- SLANT / ITALIC MODIFIERS ---
    if (/\b(italic|slanted|oblique|leaning forward|forward slant)\b/i.test(text)) {
      modifiers.slant = 'ITALIC';
      activeModifiers.push('ITALIC');
      rawTags.push('slant:italic');
    } else if (/\b(reverse italic|back slanted|back slant|leaning back)\b/i.test(text)) {
      modifiers.slant = 'REVERSE';
      activeModifiers.push('REVERSE_ITALIC');
      rawTags.push('slant:reverse');
    }

    return {
      baseFamily,
      modifiers,
      activeModifiers,
      rawTags,
      targetScript,
      unsupportedScript,
    };
  }


  /**
   * Extracts Base Style Family without being hijacked by descriptive modifier terms.
   */
  private static extractBaseStyleFamily(text: string, cat: string): StyleFamily {
    // 1. Explicit Category Override if strongly specified
    if (cat === 'devanagari' || text.includes('devanagari') || text.includes('hindi') || text.includes('sanskrit')) {
      return 'DEVANAGARI' as StyleFamily;
    }
    if (cat === 'monospace' || text.includes('monospace') || text.includes('terminal code') || text.includes('programming font') || text.includes('fixed-width')) {
      return 'MONOSPACE';
    }

    // 2. HORROR / OCCULT (Highest priority for distinct decorative category)
    if (
      text.includes('horror') ||
      text.includes('scary') ||
      text.includes('creepy') ||
      text.includes('blood') ||
      text.includes('halloween') ||
      text.includes('monster') ||
      text.includes('zombie') ||
      text.includes('haunted') ||
      text.includes('spooky') ||
      text.includes('occult')
    ) {
      return text.includes('occult') ? 'OCCULT' : 'HORROR';
    }

    // 3. GOTHIC / BLACKLETTER
    if (
      text.includes('gothic') ||
      text.includes('blackletter') ||
      text.includes('fraktur') ||
      text.includes('medieval') ||
      text.includes('tattoo')
    ) {
      return 'GOTHIC';
    }

    // 4. BUBBLE / CARTOON
    if (
      text.includes('bubble') ||
      text.includes('balloon') ||
      text.includes('inflated') ||
      text.includes('puffy') ||
      text.includes('cartoon') ||
      text.includes('comic')
    ) {
      return text.includes('cartoon') || text.includes('comic') ? 'CARTOON' : 'BUBBLE';
    }

    // 5. FUTURISTIC / CYBERPUNK / SCI-FI
    if (
      text.includes('futuristic') ||
      text.includes('cyberpunk') ||
      text.includes('sci-fi') ||
      text.includes('scifi') ||
      text.includes('techno') ||
      text.includes('robot') ||
      text.includes('space') ||
      text.includes('digital') ||
      text.includes('cyber')
    ) {
      return 'FUTURISTIC';
    }

    // 6. HANDWRITTEN / SCRIPT / BRUSH
    if (
      text.includes('handwritten') ||
      text.includes('handwriting') ||
      text.includes('script') ||
      text.includes('signature') ||
      text.includes('calligraphy') ||
      text.includes('brush') ||
      text.includes('marker') ||
      text.includes('cursive')
    ) {
      if (text.includes('brush')) return 'BRUSH';
      if (text.includes('script') || text.includes('cursive') || text.includes('signature')) return 'SCRIPT';
      return 'HANDWRITTEN';
    }

    // 7. LUXURY SERIF / DIDONE / SLAB SERIF / SERIF
    if (
      text.includes('luxury') ||
      text.includes('editorial') ||
      text.includes('didot') ||
      text.includes('bodoni') ||
      text.includes('vogue') ||
      text.includes('slab') ||
      text.includes('serif')
    ) {
      if (text.includes('slab') || text.includes('rockwell')) return 'SLAB_SERIF';
      if (text.includes('luxury') || text.includes('didot') || text.includes('editorial') || text.includes('vogue')) return 'DIDONE_SERIF';
      return 'SERIF';
    }

    // 8. RETRO / PSYCHEDELIC
    if (text.includes('retro') || text.includes('vintage') || text.includes('groovy') || text.includes('70s') || text.includes('psychedelic')) {
      return text.includes('psychedelic') ? 'PSYCHEDELIC' : 'RETRO';
    }

    // 9. GEOMETRIC / GROTESK / SANS
    if (text.includes('grotesk') || text.includes('neo-grotesque')) return 'GROTESK';
    if (text.includes('geometric') || text.includes('bauhaus') || text.includes('futura')) return 'GEOMETRIC';
    if (text.includes('sans')) return 'SANS';

    // Default Fallback
    return 'GEOMETRIC';
  }

  /**
   * Applies extracted design modifiers onto a base FontStyleDNA safely with bounds clamping.
   */
  public static applyModifiersToDNA(baseDNA: FontStyleDNA, modifiers: PromptDesignModifiers, activeModifiers: string[]): FontStyleDNA {
    const updated: FontStyleDNA = {
      ...baseDNA,
      modifiers: { ...modifiers },
      activeModifiers: [...activeModifiers],
      proportions: { ...baseDNA.proportions },
    };

    // 1. Width Transformation
    if (modifiers.widthScaleOverride !== undefined) {
      updated.proportions.width = Math.max(0.65, Math.min(1.45, modifiers.widthScaleOverride));
    } else if (modifiers.width === 'ULTRA_CONDENSED') {
      updated.proportions.width = Math.max(0.65, updated.proportions.width * 0.75);
    } else if (modifiers.width === 'NARROW' || modifiers.width === 'CONDENSED') {
      updated.proportions.width = Math.max(0.72, updated.proportions.width * 0.82);
    } else if (modifiers.width === 'WIDE' || modifiers.width === 'EXPANDED') {
      updated.proportions.width = Math.min(1.35, updated.proportions.width * 1.22);
    } else if (modifiers.width === 'ULTRA_EXPANDED') {
      updated.proportions.width = Math.min(1.45, updated.proportions.width * 1.38);
    }

    // 2. Height Transformation
    if (modifiers.heightScaleOverride !== undefined) {
      updated.proportions.capHeight = Math.max(0.60, Math.min(0.85, baseDNA.proportions.capHeight * modifiers.heightScaleOverride));
      updated.proportions.xHeight = Math.max(0.38, Math.min(0.65, baseDNA.proportions.xHeight * modifiers.heightScaleOverride));
    } else if (modifiers.height === 'TALL' || modifiers.height === 'ELONGATED') {
      const scale = modifiers.height === 'ELONGATED' ? 1.18 : 1.12;
      updated.proportions.capHeight = Math.min(0.82, updated.proportions.capHeight * scale);
      updated.proportions.xHeight = Math.min(0.60, updated.proportions.xHeight * scale);
    } else if (modifiers.height === 'SHORT') {
      updated.proportions.capHeight = Math.max(0.62, updated.proportions.capHeight * 0.88);
      updated.proportions.xHeight = Math.max(0.42, updated.proportions.xHeight * 0.88);
    }

    // 3. Weight Transformation
    if (modifiers.strokeWeightOverride !== undefined) {
      updated.strokeWidth = Math.max(0.02, Math.min(0.28, modifiers.strokeWeightOverride));
    } else if (modifiers.weight === 'HAIRLINE') {
      updated.strokeWidth = Math.max(0.02, updated.strokeWidth * 0.45);
    } else if (modifiers.weight === 'THIN') {
      updated.strokeWidth = Math.max(0.04, updated.strokeWidth * 0.65);
    } else if (modifiers.weight === 'BOLD') {
      updated.strokeWidth = Math.min(0.20, Math.max(0.14, updated.strokeWidth * 1.4));
    } else if (modifiers.weight === 'BLACK') {
      updated.strokeWidth = Math.min(0.28, Math.max(0.22, updated.strokeWidth * 1.8));
    }

    // 4. Contrast Transformation
    if (modifiers.contrastOverride !== undefined) {
      updated.strokeContrast = Math.max(0.0, Math.min(1.0, modifiers.contrastOverride));
    } else if (modifiers.contrast === 'HIGH' || modifiers.contrast === 'EXTREME') {
      updated.strokeContrast = Math.max(0.80, updated.strokeContrast);
      updated.strokeModel = 'HIGH_CONTRAST';
    } else if (modifiers.contrast === 'LOW') {
      updated.strokeContrast = Math.min(0.12, updated.strokeContrast);
      updated.strokeModel = 'MONOLINE';
    }

    // 5. Terminals Transformation
    if (modifiers.terminals) {
      if (modifiers.terminals === 'DRIPPING') {
        updated.terminalStyle = 'SHARP';
        updated.decorationLevel = 'MODERATE';
      } else if (modifiers.terminals === 'FANG') {
        updated.terminalStyle = 'SHARP';
        updated.angularity = Math.max(0.80, updated.angularity);
      } else if (modifiers.terminals === 'ROUND') {
        updated.terminalStyle = 'ROUND';
      } else if (modifiers.terminals === 'FLAT') {
        updated.terminalStyle = 'FLAT';
      } else if (modifiers.terminals === 'WEDGE') {
        updated.terminalStyle = 'WEDGE';
      } else if (modifiers.terminals === 'SERIFED') {
        updated.terminalStyle = 'SERIFED';
      }
    }

    // 6. Corners & Strokes Transformation
    if (modifiers.corners === 'CHAMFERED') {
      updated.cornerStyle = 'CHAMFERED';
      updated.angularity = Math.max(0.75, updated.angularity);
    } else if (modifiers.corners === 'SHARP') {
      updated.cornerStyle = 'SHARP';
      updated.angularity = Math.max(0.70, updated.angularity);
      updated.roundness = Math.min(0.20, updated.roundness);
    } else if (modifiers.corners === 'ROUND') {
      updated.cornerStyle = 'ROUND';
      updated.roundness = Math.max(0.70, updated.roundness);
      updated.angularity = Math.min(0.20, updated.angularity);
    } else if (modifiers.corners === 'CRACKED') {
      updated.cornerStyle = 'IRREGULAR';
      updated.distortion = Math.max(0.55, updated.distortion);
    }

    // 7. Counters Transformation
    if (modifiers.counters === 'OPEN') {
      updated.counterStyle = 'OPEN';
    } else if (modifiers.counters === 'TIGHT') {
      updated.counterStyle = 'NARROW';
    }

    // 8. Baseline Transformation
    if (modifiers.baseline) {
      if (modifiers.baseline === 'BOUNCY') updated.baselineBehavior = 'BOUNCY';
      else if (modifiers.baseline === 'IRREGULAR') updated.baselineBehavior = 'IRREGULAR';
      else if (modifiers.baseline === 'HANDWRITTEN') updated.baselineBehavior = 'HANDWRITTEN';
      else if (modifiers.baseline === 'FLAT') updated.baselineBehavior = 'STABLE';
    }

    // 9. Spacing Transformation
    if (modifiers.spacing === 'TIGHT') updated.spacing = 'TIGHT';
    else if (modifiers.spacing === 'WIDE') updated.spacing = 'OPEN';

    // 10. Slant Transformation
    if (modifiers.slant === 'ITALIC') {
      updated.slant = Math.max(0.18, updated.slant || 0.18);
    } else if (modifiers.slant === 'REVERSE') {
      updated.slant = -0.15;
    }

    return updated;
  }

  /**
   * Merges AI-interpreted DNA with deterministic prompt modifiers as a safety layer.
   */
  public static mergeAIDNAWithPromptModifiers(aiDNA: FontStyleDNA, prompt: string): FontStyleDNA {
    const analysis = this.analyzePrompt(prompt);
    // Apply any explicit modifiers from the prompt onto the AI DNA
    return this.applyModifiersToDNA(aiDNA, analysis.modifiers, analysis.activeModifiers);
  }
}
