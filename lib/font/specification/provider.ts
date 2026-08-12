import type { FontSpecification } from './types';
import { AIProviderService } from '@/lib/ai/provider-service';
import type {
  FontCategory,
  FontWeight,
  FontWidth,
  FontStyle,
  CharacterSetConfig,
  AdvancedSettingsConfig,
} from '@/types/database';

export interface GenerateSpecificationParams {
  prompt: string;
  fontName?: string;
  category: FontCategory;
  weight: FontWeight;
  width: FontWidth;
  style: FontStyle;
  characterSet: CharacterSetConfig;
  advancedSettings: AdvancedSettingsConfig;
}

/**
 * Builds the structured system prompt instructing the AI to output ONLY JSON.
 */
export function buildFontGenerationPrompt(params: GenerateSpecificationParams): string {
  return `You are a master digital typographer and font engineer.
Transform the following user request into a precise, structured vector font specification JSON object.

USER PROMPT: "${params.prompt}"
DESIRED FONT NAME: "${params.fontName || 'Auto-generated'}"
CATEGORY: "${params.category}"
WEIGHT: "${params.weight}"
WIDTH: "${params.width}"
STYLE: "${params.style}"

Return ONLY a valid JSON object matching this exact structure:
{
  "fontName": string,
  "category": "${params.category}",
  "weight": "${params.weight}",
  "width": "${params.width}",
  "style": "${params.style}",
  "unitsPerEm": 1000,
  "ascender": 800,
  "descender": -200,
  "capHeight": 700,
  "xHeight": 500,
  "stemWidth": number (between 40 and 220),
  "cornerStyle": "${params.advancedSettings.cornerStyle}",
  "contrast": "${params.advancedSettings.contrast}",
  "strokeStyle": "${params.advancedSettings.strokeStyle}",
  "designDescription": string
}

DO NOT include markdown code blocks, explanatory text, or additional fields. Output raw JSON only.`;
}

/**
 * Validates and normalizes raw AI specification JSON.
 */
export function validateSpecificationOutput(
  raw: Record<string, unknown>,
  params: GenerateSpecificationParams
): FontSpecification {
  const name =
    typeof raw.fontName === 'string' && raw.fontName.trim().length > 0
      ? raw.fontName.trim().substring(0, 80)
      : params.fontName || 'AIFont';

  // Calculate default stem width based on weight specification
  let stemWidth = 80;
  if (params.weight === 'Thin' || params.weight === 'Extra Light') stemWidth = 40;
  if (params.weight === 'Light') stemWidth = 60;
  if (params.weight === 'Medium') stemWidth = 100;
  if (params.weight === 'Semi Bold') stemWidth = 130;
  if (params.weight === 'Bold') stemWidth = 160;
  if (params.weight === 'Extra Bold' || params.weight === 'Black') stemWidth = 190;

  if (typeof raw.stemWidth === 'number' && raw.stemWidth >= 30 && raw.stemWidth <= 240) {
    stemWidth = Math.round(raw.stemWidth);
  }

  const textLower = `${params.prompt} ${params.category} ${params.style}`.toLowerCase();
  const isDevanagariPrompt =
    params.characterSet.devanagari ||
    params.category === 'Devanagari' ||
    textLower.includes('devanagari') ||
    textLower.includes('hindi') ||
    textLower.includes('sanskrit') ||
    textLower.includes('हिंदी') ||
    textLower.includes('देवनागरी');

  const charSet: CharacterSetConfig = {
    ...params.characterSet,
    devanagari: isDevanagariPrompt,
  };

  return {
    fontName: name.replace(/[^a-zA-Z0-9\s_-]/g, ''),
    category: params.category,
    weight: params.weight,
    width: params.width,
    style: params.style,
    unitsPerEm: 1000,
    ascender: 800,
    descender: -200,
    capHeight: 700,
    xHeight: 500,
    stemWidth,
    cornerStyle: params.advancedSettings.cornerStyle,
    contrast: params.advancedSettings.contrast,
    strokeStyle: params.advancedSettings.strokeStyle,
    characterSet: charSet,
    advancedSettings: params.advancedSettings,
    designDescription:
      typeof raw.designDescription === 'string'
        ? raw.designDescription.substring(0, 300)
        : `Vector typeface synthesized from prompt: ${params.prompt.substring(0, 100)}`,
    prompt: params.prompt,
  };
}

/**
 * Unified AI Provider abstraction layer.
 * Delegates to AIProviderService for priority selection, failover, token logging, and cost estimation.
 */
export async function generateFontSpecification(
  params: GenerateSpecificationParams
): Promise<FontSpecification> {
  try {
    const aiResult = await AIProviderService.generateFontSpecification(params.prompt, {
      category: params.category,
      weight: params.weight,
      width: params.width,
      style: params.style,
      requestType: 'font_specification',
    });

    const spec = aiResult.specification;

    // Normalize with requested parameters
    return validateSpecificationOutput(
      {
        fontName: spec.fontName || params.fontName,
        stemWidth: spec.stemWidth,
        designDescription: `Synthesized via ${aiResult.providerUsed} (${aiResult.modelUsed})`,
      },
      params
    );
  } catch (err) {
    console.warn('AIProviderService call failed, utilizing parameter-matched specification synthesis:', err);
    return validateSpecificationOutput({}, params);
  }
}
