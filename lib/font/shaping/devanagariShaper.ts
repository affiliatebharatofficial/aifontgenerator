export interface ConjunctRule {
  name: string;
  code: number; // PUA Code Point e.g. 0xE001
  components: number[]; // e.g. [0x0915, 0x094D, 0x0930] for क्र
  tag: 'liga' | 'akhn' | 'rphf' | 'half' | 'nukt';
}

export const DEVANAGARI_CONJUNCT_RULES: ConjunctRule[] = [
  { name: 'dvKRA', code: 0xE001, components: [0x0915, 0x094D, 0x0930], tag: 'liga' }, // क्र
  { name: 'dvPRA', code: 0xE002, components: [0x092A, 0x094D, 0x0930], tag: 'liga' }, // प्र
  { name: 'dvBRA', code: 0xE003, components: [0x092C, 0x094D, 0x0930], tag: 'liga' }, // ब्र
  { name: 'dvGRA', code: 0xE004, components: [0x0917, 0x094D, 0x0930], tag: 'liga' }, // ग्र
  { name: 'dvTRA', code: 0xE005, components: [0x0924, 0x094D, 0x0930], tag: 'liga' }, // त्र
  { name: 'dvSHRA', code: 0xE006, components: [0x0936, 0x094D, 0x0930], tag: 'liga' }, // श्र
  { name: 'dvKSHA', code: 0xE007, components: [0x0915, 0x094D, 0x0937], tag: 'akhn' }, // क्ष
  { name: 'dvJNYA', code: 0xE008, components: [0x091C, 0x094D, 0x091E], tag: 'akhn' }, // ज्ञ
  { name: 'dvDRA', code: 0xE009, components: [0x0926, 0x094D, 0x0930], tag: 'liga' }, // द्र
  { name: 'dvSTRA', code: 0xE00A, components: [0x0938, 0x094D, 0x0924, 0x094D, 0x0930], tag: 'liga' }, // स्त्र
  { name: 'dvKTA', code: 0xE00B, components: [0x0915, 0x094D, 0x0924], tag: 'liga' }, // क्त
  { name: 'dvTTA_CONJ', code: 0xE00C, components: [0x0924, 0x094D, 0x0924], tag: 'liga' }, // त्त
  { name: 'dvNTA', code: 0xE00D, components: [0x0928, 0x094D, 0x0924], tag: 'liga' }, // न्त
  { name: 'dvMPA', code: 0xE00E, components: [0x092E, 0x094D, 0x092A], tag: 'liga' }, // म्प
  { name: 'dvNNDA', code: 0xE00F, components: [0x0923, 0x094D, 0x0921], tag: 'liga' }, // ण्ड
  { name: 'dvSHTA', code: 0xE010, components: [0x0937, 0x094D, 0x091F], tag: 'liga' }, // ष्ट
  { name: 'dvDYA', code: 0xE011, components: [0x0926, 0x094D, 0x092F], tag: 'liga' }, // द्य
  { name: 'dvDHYA', code: 0xE012, components: [0x0927, 0x094D, 0x092F], tag: 'liga' }, // ध्य
  { name: 'dvSVA', code: 0xE013, components: [0x0938, 0x094D, 0x0935], tag: 'liga' }, // स्व

  // Nukta Forms
  { name: 'dvNuktaQA', code: 0xE014, components: [0x0915, 0x093C], tag: 'nukt' }, // क़
  { name: 'dvNuktaKHHA', code: 0xE015, components: [0x0916, 0x093C], tag: 'nukt' }, // ख़
  { name: 'dvNuktaGHHA', code: 0xE016, components: [0x0917, 0x093C], tag: 'nukt' }, // ग़
  { name: 'dvNuktaZA', code: 0xE017, components: [0x091C, 0x093C], tag: 'nukt' }, // ज़
  { name: 'dvNuktaDDDHA', code: 0xE018, components: [0x0921, 0x093C], tag: 'nukt' }, // ड़
  { name: 'dvNuktaRHA', code: 0xE019, components: [0x0922, 0x093C], tag: 'nukt' }, // ढ़
  { name: 'dvNuktaFA', code: 0xE01A, components: [0x092B, 0x093C], tag: 'nukt' }, // फ़
];

export class DevanagariShaper {
  public static getConjunctRules(): ConjunctRule[] {
    return DEVANAGARI_CONJUNCT_RULES;
  }

  public static findRuleForComponents(codes: number[]): ConjunctRule | undefined {
    return DEVANAGARI_CONJUNCT_RULES.find((r) => {
      if (r.components.length !== codes.length) return false;
      return r.components.every((val, idx) => val === codes[idx]);
    });
  }
}
