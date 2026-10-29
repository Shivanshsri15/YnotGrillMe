import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  GEMINI_DEFAULT_MAX_OUTPUT_TOKENS,
  GEMINI_DEFAULT_MAX_RETRIES,
  GEMINI_DEFAULT_MODEL,
  GEMINI_DEFAULT_THINKING_LEVEL,
  GEMINI_DEFAULT_TIMEOUT_MS,
  GEMINI_MESSAGES,
  GEMINI_RETRYABLE_ERROR_PATTERN,
  GEMINI_RETRYABLE_STATUS_CODES,
} from './constants/gemini.constants.ts';
import type { GeminiProviderError } from './interfaces/gemini.interfaces.ts';
import { GeminiKeyPool } from './gemini-key-pool.ts';

const RETRYABLE_STATUS = new Set<number>(GEMINI_RETRYABLE_STATUS_CODES);

type ThinkingLevel = 'minimal' | 'low' | 'medium' | 'high';

/**
 * Chat uses one non-streaming generateContent call per turn, then yields the
 * text over SSE. Reasons:
 * 1) @google/generative-ai's stream reader can throw unhandled rejections and
 *    crash Nest ("Error reading from the stream").
 * 2) streamGenerateContent often spends >8s before the first SSE event even
 *    when the eventual answer is tiny — aborting that looks like "high latency"
 *    but is really a flaky/slow stream path, not missing prompt optimization.
 */
@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly modelName: string;
  private readonly maxRetries: number;
  private readonly timeoutMs: number;
  private readonly thinkingLevel: ThinkingLevel;
  private readonly maxOutputTokens: number;

  constructor(
    private readonly config: ConfigService,
    private readonly keyPool: GeminiKeyPool,
  ) {
    this.modelName =
      this.config.get<string>('gemini.model') ?? GEMINI_DEFAULT_MODEL;
    this.maxRetries =
      this.config.get<number>('gemini.maxRetries') ??
      GEMINI_DEFAULT_MAX_RETRIES;
    this.timeoutMs =
      this.config.get<number>('gemini.timeoutMs') ?? GEMINI_DEFAULT_TIMEOUT_MS;
    this.thinkingLevel = this.resolveThinkingLevel(
      this.config.get<string>('gemini.thinkingLevel'),
    );
    this.maxOutputTokens =
      this.config.get<number>('gemini.maxOutputTokens') ??
      GEMINI_DEFAULT_MAX_OUTPUT_TOKENS;

    this.logger.log(
      `Gemini model=${this.modelName} thinking=${this.thinkingLevel} maxOutputTokens=${this.maxOutputTokens} perAttemptTimeoutMs=${this.timeoutMs} maxRetries=${this.maxRetries}`,
    );
  }

  isConfigured(): boolean {
    return this.keyPool.size > 0;
  }

  async generateText(prompt: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(GEMINI_MESSAGES.notConfigured);
    }

    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const acquired = this.keyPool.acquire();
      const startedAt = Date.now();
      try {
        const text = await this.generateWithKey(acquired.key, {
          system: undefined,
          history: [],
          userMessage: prompt,
        });
        this.keyPool.markSuccess(acquired.index);
        this.logger.debug(
          `Gemini generateText key#${acquired.index} ok in ${Date.now() - startedAt}ms`,
        );
        return text;
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Gemini generateText key#${acquired.index} failed in ${Date.now() - startedAt}ms: ${this.errorSummary(error)}`,
        );
        if (this.isRetryable(error) && attempt < this.maxRetries) {
          this.keyPool.markCooldown(acquired.index);
          continue;
        }
        if (this.isRetryable(error)) {
          this.keyPool.markCooldown(acquired.index);
          break;
        }
        throw error;
      }
    }

    this.logger.error('Gemini generateText exhausted retries', lastError);
    throw new ServiceUnavailableException(GEMINI_MESSAGES.retriesExhausted);
  }

  async *streamGenerateText(input: {
    system: string;
    history: Array<{ role: 'user' | 'assistant'; content: string }>;
    userMessage: string;
    maxOutputTokens?: number;
  }): AsyncGenerator<string, void, unknown> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(GEMINI_MESSAGES.notConfigured);
    }

    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const acquired = this.keyPool.acquire();
      const startedAt = Date.now();
      try {
        const text = await this.generateWithKey(acquired.key, input);
        this.keyPool.markSuccess(acquired.index);
        this.logger.debug(
          `Gemini chat key#${acquired.index} ok in ${Date.now() - startedAt}ms (${text.length} chars)`,
        );

        // Emit in small slices so the existing SSE token UI still updates.
        for (const slice of this.sliceForSse(text)) {
          yield slice;
        }
        return;
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Gemini chat key#${acquired.index} failed in ${Date.now() - startedAt}ms: ${this.errorSummary(error)}`,
        );
        if (this.isRetryable(error) && attempt < this.maxRetries) {
          this.keyPool.markCooldown(acquired.index);
          continue;
        }
        if (this.isRetryable(error)) {
          this.keyPool.markCooldown(acquired.index);
          break;
        }
        throw error;
      }
    }

    this.logger.error('Gemini streamGenerateText exhausted retries', lastError);
    throw new ServiceUnavailableException(GEMINI_MESSAGES.retriesExhausted);
  }

  private async generateWithKey(
    apiKey: string,
    input: {
      system?: string;
      history: Array<{ role: 'user' | 'assistant'; content: string }>;
      userMessage: string;
      maxOutputTokens?: number;
    },
  ): Promise<string> {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({
      model: this.modelName,
      ...(input.system ? { systemInstruction: input.system } : {}),
      generationConfig: this.buildGenerationConfig(
        input.maxOutputTokens,
      ) as never,
    });

    const contents = [
      ...input.history.map((message) => ({
        role: message.role === 'assistant' ? ('model' as const) : ('user' as const),
        parts: [{ text: message.content }],
      })),
      {
        role: 'user' as const,
        parts: [{ text: input.userMessage }],
      },
    ];

    // Must pass { contents } — a bare Content[] is misread as Part[].
    const result = await model.generateContent(
      { contents },
      { timeout: this.timeoutMs },
    );

    const text = this.extractVisibleText(result.response);
    if (!text.trim()) {
      throw new Error('Gemini returned no visible text');
    }
    return text;
  }

  private extractVisibleText(response: {
    text: () => string;
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string; thought?: boolean }> };
    }>;
  }): string {
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts?.length) {
      const joined = parts
        .filter((part) => part.text && !part.thought)
        .map((part) => part.text ?? '')
        .join('');
      if (joined.trim()) {
        return joined;
      }
    }
    try {
      return response.text();
    } catch {
      return '';
    }
  }

  private sliceForSse(text: string, size = 48): string[] {
    if (text.length <= size) {
      return [text];
    }
    const slices: string[] = [];
    for (let i = 0; i < text.length; i += size) {
      slices.push(text.slice(i, i + size));
    }
    return slices;
  }

  private buildGenerationConfig(
    maxOutputTokens = this.maxOutputTokens,
  ): Record<string, unknown> {
    return {
      maxOutputTokens,
      temperature: 0.4,
      thinkingConfig: {
        thinkingLevel: this.thinkingLevel,
      },
    };
  }

  private resolveThinkingLevel(value: string | undefined): ThinkingLevel {
    if (
      value === 'minimal' ||
      value === 'low' ||
      value === 'medium' ||
      value === 'high'
    ) {
      return value;
    }
    return GEMINI_DEFAULT_THINKING_LEVEL as ThinkingLevel;
  }

  private isRetryable(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }
    const providerError = error as GeminiProviderError & { name?: string };
    const status =
      providerError.status ??
      providerError.statusCode ??
      providerError.httpStatusCode;
    if (typeof status === 'number' && RETRYABLE_STATUS.has(status)) {
      return true;
    }
    const message = String(providerError.message ?? error);
    const name = String(providerError.name ?? '');
    if (name === 'AbortError' || name.includes('Abort')) {
      return true;
    }
    return GEMINI_RETRYABLE_ERROR_PATTERN.test(message);
  }

  private errorSummary(error: unknown): string {
    if (!error || typeof error !== 'object') {
      return String(error);
    }
    const providerError = error as GeminiProviderError;
    return String(providerError.message ?? error).slice(0, 180);
  }
}
