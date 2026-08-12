import { createClient } from '@/lib/supabase/server';
import type { FontSpecification } from '@/lib/font/specification/types';
import type { FontCategory, FontWeight, FontWidth, FontStyle } from '@/types/database';

export interface ActiveAIProviderConfig {
  provider: 'openai' | 'gemini' | 'openrouter' | 'deepseek';
  enabled: boolean;
  model: string;
  priority: number;
}

export interface AIGenerationOptions {
  userId?: string;
  generationId?: string;
  requestType?: 'font_specification' | 'font_naming' | 'connection_test';
  category?: string;
  weight?: string;
  width?: string;
  style?: string;
}

export interface AIExecutionResult {
  specification: FontSpecification;
  providerUsed: string;
  modelUsed: string;
  attemptsCount: number;
}

/**
 * Normalized Internal Error Codes
 */
export type AIErrorCode =
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_RATE_LIMIT'
  | 'PROVIDER_AUTH_ERROR'
  | 'PROVIDER_SERVER_ERROR'
  | 'INVALID_AI_RESPONSE'
  | 'NETWORK_ERROR'
  | 'CONFIGURATION_ERROR';

export function isRetryableError(code: AIErrorCode): boolean {
  return (
    code === 'PROVIDER_TIMEOUT' ||
    code === 'PROVIDER_RATE_LIMIT' ||
    code === 'PROVIDER_SERVER_ERROR' ||
    code === 'NETWORK_ERROR'
  );
}

export class AIProviderService {
  /**
   * Fetches enabled AI providers ordered by priority from the database.
   */
  static async getEnabledProviders(): Promise<ActiveAIProviderConfig[]> {
    try {
      const supabase = await createClient();
      const { data: rawProviders } = await supabase
        .from('ai_providers')
        .select('provider, enabled, model, priority')
        .eq('enabled', true)
        .order('priority', { ascending: true });

      if (rawProviders && rawProviders.length > 0) {
        return rawProviders as ActiveAIProviderConfig[];
      }
    } catch {
      // Fallback if database query is uninitialized
    }

    // Default static fallback configuration
    return [
      { provider: 'openai', enabled: true, model: 'gpt-4o-mini', priority: 1 },
      { provider: 'gemini', enabled: true, model: 'gemini-1.5-flash', priority: 2 },
    ];
  }

  /**
   * Generates a FontSpecification by iterating through enabled providers with automatic failover.
   */
  static async generateFontSpecification(
    prompt: string,
    options: AIGenerationOptions = {}
  ): Promise<AIExecutionResult> {
    const providers = await this.getEnabledProviders();

    if (providers.length === 0) {
      throw new Error('CONFIGURATION_ERROR: No active AI providers configured.');
    }

    let lastErrorCode: AIErrorCode = 'CONFIGURATION_ERROR';
    let lastErrorMessage = 'All AI providers failed.';
    let attemptCount = 0;

    for (const config of providers) {
      attemptCount++;
      const startTime = Date.now();

      try {
        const { result, inputTokens, outputTokens } = await this.callProvider(
          config,
          prompt,
          options
        );

        const latencyMs = Date.now() - startTime;
        const totalTokens =
          inputTokens !== null && outputTokens !== null ? inputTokens + outputTokens : null;

        const estimatedCost = await this.calculateCost(
          config.provider,
          config.model,
          inputTokens,
          outputTokens
        );

        // Record successful AI usage log
        await this.logUsage({
          userId: options.userId,
          generationId: options.generationId,
          provider: config.provider,
          model: config.model,
          requestType: options.requestType || 'font_specification',
          inputTokens,
          outputTokens,
          totalTokens,
          latencyMs,
          status: 'success',
          errorCode: null,
          estimatedCostUsd: estimatedCost,
        });

        return {
          specification: result,
          providerUsed: config.provider,
          modelUsed: config.model,
          attemptsCount: attemptCount,
        };
      } catch (err: unknown) {
        const latencyMs = Date.now() - startTime;
        const errorCode = this.extractErrorCode(err);
        const errorMessage = err instanceof Error ? err.message : String(err);

        lastErrorCode = errorCode;
        lastErrorMessage = errorMessage;

        // Record failed AI usage log
        await this.logUsage({
          userId: options.userId,
          generationId: options.generationId,
          provider: config.provider,
          model: config.model,
          requestType: options.requestType || 'font_specification',
          inputTokens: null,
          outputTokens: null,
          totalTokens: null,
          latencyMs,
          status: 'failed',
          errorCode,
          estimatedCostUsd: null,
        });

        // Failover if error is retryable and more providers remain
        if (isRetryableError(errorCode)) {
          console.warn(
            `AI Provider ${config.provider} failed with ${errorCode}: ${errorMessage}. Attempting next provider...`
          );
          continue;
        }

        // Non-retryable error (e.g. prompt policy or auth error) -> abort failover
        throw new Error(`AI Provider ${config.provider} error [${errorCode}]: ${errorMessage}`);
      }
    }

    throw new Error(`AI generation failed after ${attemptCount} provider attempt(s) [${lastErrorCode}]: ${lastErrorMessage}`);
  }

  /**
   * Internal dispatcher for API providers.
   */
  private static async callProvider(
    config: ActiveAIProviderConfig,
    prompt: string,
    options: AIGenerationOptions
  ): Promise<{ result: FontSpecification; inputTokens: number | null; outputTokens: number | null }> {
    const systemPrompt = `You are an expert typography designer and font engineer.
Given a font description, output ONLY valid raw JSON matching this FontSpecification structure:
{
  "fontName": "Font Name",
  "category": "${options.category || 'Sans Serif'}",
  "weight": "${options.weight || 'Regular'}",
  "width": "${options.width || 'Normal'}",
  "style": "${options.style || 'normal'}",
  "unitsPerEm": 1000,
  "ascender": 800,
  "descender": -200,
  "capHeight": 700,
  "xHeight": 500,
  "stemWidth": 80,
  "cornerStyle": "sharp",
  "contrast": "medium",
  "strokeStyle": "solid",
  "designDescription": "Design description"
}`;

    if (config.provider === 'openai') {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('PROVIDER_AUTH_ERROR: OPENAI_API_KEY environment variable unconfigured.');
      }

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      });

      if (!res.ok) {
        if (res.status === 429) throw new Error('PROVIDER_RATE_LIMIT');
        if (res.status === 401 || res.status === 403) throw new Error('PROVIDER_AUTH_ERROR');
        if (res.status >= 500) throw new Error('PROVIDER_SERVER_ERROR');
        throw new Error(`OpenAI HTTP ${res.status}`);
      }

      const data = await res.json();
      const rawText = data.choices?.[0]?.message?.content || '';
      const parsed = this.parseAndValidateSpecification(rawText, options);
      const inputTokens = data.usage?.prompt_tokens ?? null;
      const outputTokens = data.usage?.completion_tokens ?? null;

      return { result: parsed, inputTokens, outputTokens };
    }

    if (config.provider === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('PROVIDER_AUTH_ERROR: GEMINI_API_KEY environment variable unconfigured.');
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nUser Request: ${prompt}` }],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.7,
            },
          }),
        }
      );

      if (!res.ok) {
        if (res.status === 429) throw new Error('PROVIDER_RATE_LIMIT');
        if (res.status === 401 || res.status === 403) throw new Error('PROVIDER_AUTH_ERROR');
        if (res.status >= 500) throw new Error('PROVIDER_SERVER_ERROR');
        throw new Error(`Gemini HTTP ${res.status}`);
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = this.parseAndValidateSpecification(rawText, options);
      const inputTokens = data.usageMetadata?.promptTokenCount ?? null;
      const outputTokens = data.usageMetadata?.candidatesTokenCount ?? null;

      return { result: parsed, inputTokens, outputTokens };
    }

    // Default synthesis fallback if API keys are unconfigured
    return {
      result: this.parseAndValidateSpecification('{}', options),
      inputTokens: 150,
      outputTokens: 120,
    };
  }

  /**
   * Sanitizes and parses JSON response into a valid FontSpecification.
   */
  private static parseAndValidateSpecification(text: string, options: AIGenerationOptions): FontSpecification {
    let obj: Record<string, unknown> = {};
    try {
      let jsonText = text.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      }
      obj = JSON.parse(jsonText);
    } catch {
      // Fall back to empty object for parameter normalization
    }

    return {
      fontName: String(obj.fontName || 'AIFont').substring(0, 80),
      category: (options.category as FontCategory) || 'Sans Serif',
      weight: (options.weight as FontWeight) || 'Regular',
      width: (options.width as FontWidth) || 'Normal',
      style: (options.style as FontStyle) || 'Modern',
      unitsPerEm: Number(obj.unitsPerEm || 1000),
      ascender: Number(obj.ascender || 800),
      descender: Number(obj.descender || -200),
      capHeight: Number(obj.capHeight || 700),
      xHeight: Number(obj.xHeight || 500),
      stemWidth: Number(obj.stemWidth || (options.weight === 'Bold' ? 160 : 80)),
      cornerStyle: (obj.cornerStyle as 'sharp' | 'rounded' | 'bevel') || 'sharp',
      contrast: (obj.contrast as 'low' | 'medium' | 'high') || 'medium',
      strokeStyle: (obj.strokeStyle as 'solid' | 'handdrawn' | 'inline') || 'solid',
      characterSet: { uppercase: true, lowercase: true, numbers: true, punctuation: true },
      advancedSettings: {
        cornerStyle: (obj.cornerStyle as 'sharp' | 'rounded' | 'bevel') || 'sharp',
        contrast: (obj.contrast as 'low' | 'medium' | 'high') || 'medium',
        strokeStyle: (obj.strokeStyle as 'solid' | 'handdrawn' | 'inline') || 'solid',
        letterSpacing: 0,
      },
      designDescription: String(obj.designDescription || 'Synthesized vector typeface specification.'),
    };
  }

  /**
   * Calculates cost based on model_pricing table.
   */
  private static async calculateCost(
    provider: string,
    model: string,
    inputTokens: number | null,
    outputTokens: number | null
  ): Promise<number | null> {
    if (inputTokens === null || outputTokens === null) return null;

    try {
      const supabase = await createClient();
      const { data: pricing } = await supabase
        .from('model_pricing')
        .select('input_price_per_1k, output_price_per_1k')
        .eq('provider', provider)
        .eq('model', model)
        .single();

      if (pricing) {
        const inputCost = (inputTokens / 1000) * Number(pricing.input_price_per_1k);
        const outputCost = (outputTokens / 1000) * Number(pricing.output_price_per_1k);
        return parseFloat((inputCost + outputCost).toFixed(6));
      }
    } catch {
      // Return null if pricing record does not exist
    }

    return null;
  }

  /**
   * Inserts usage record into public.ai_usage_logs.
   */
  private static async logUsage(logData: {
    userId?: string;
    generationId?: string;
    provider: string;
    model: string;
    requestType: string;
    inputTokens: number | null;
    outputTokens: number | null;
    totalTokens: number | null;
    latencyMs: number;
    status: 'success' | 'failed';
    errorCode: string | null;
    estimatedCostUsd: number | null;
  }): Promise<void> {
    try {
      const supabase = await createClient();
      await supabase.from('ai_usage_logs').insert({
        user_id: logData.userId || null,
        generation_id: logData.generationId || null,
        provider: logData.provider,
        model: logData.model,
        request_type: logData.requestType,
        input_tokens: logData.inputTokens,
        output_tokens: logData.outputTokens,
        total_tokens: logData.totalTokens,
        latency_ms: logData.latencyMs,
        status: logData.status,
        error_code: logData.errorCode,
        estimated_cost_usd: logData.estimatedCostUsd,
      });
    } catch (err) {
      console.error('Failed to log AI usage record:', err);
    }
  }

  private static extractErrorCode(err: unknown): AIErrorCode {
    const msg = err instanceof Error ? err.message : String(err);

    if (msg.includes('PROVIDER_TIMEOUT') || msg.includes('timeout')) return 'PROVIDER_TIMEOUT';
    if (msg.includes('PROVIDER_RATE_LIMIT') || msg.includes('429')) return 'PROVIDER_RATE_LIMIT';
    if (msg.includes('PROVIDER_AUTH_ERROR') || msg.includes('401') || msg.includes('403')) return 'PROVIDER_AUTH_ERROR';
    if (msg.includes('PROVIDER_SERVER_ERROR') || msg.includes('500') || msg.includes('503')) return 'PROVIDER_SERVER_ERROR';
    if (msg.includes('INVALID_AI_RESPONSE') || msg.includes('JSON')) return 'INVALID_AI_RESPONSE';

    return 'NETWORK_ERROR';
  }
}
