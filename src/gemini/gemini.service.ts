import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  GEMINI_DEFAULT_MAX_RETRIES,
  GEMINI_DEFAULT_MODEL,
  GEMINI_DEFAULT_TIMEOUT_MS,
  GEMINI_MESSAGES,
  GEMINI_RETRYABLE_ERROR_PATTERN,
  GEMINI_RETRYABLE_STATUS_CODES,
} from './constants/gemini.constants.ts';
import type { GeminiProviderError } from './interfaces/gemini.interfaces.ts';
import { GeminiKeyPool } from './gemini-key-pool.ts';

const RETRYABLE_STATUS = new Set<number>(GEMINI_RETRYABLE_STATUS_CODES);

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly modelName: string;
  private readonly maxRetries: number;
  private readonly timeoutMs: number;

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
  }

  isConfigured(): boolean {
    return this.keyPool.size > 0;
  }

  /**
   * Non-streaming text generation with multi-key failover.
   * Streaming helpers land with Phase 2 agent endpoints.
   */
  async generateText(prompt: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(GEMINI_MESSAGES.notConfigured);
    }

    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const acquired = this.keyPool.acquire();
      try {
        const client = new GoogleGenerativeAI(acquired.key);
        const model = client.getGenerativeModel({ model: this.modelName });
        const result = await this.withTimeout(
          model.generateContent(prompt),
          this.timeoutMs,
        );
        return result.response.text();
      } catch (error) {
        lastError = error;
        if (this.isRetryable(error)) {
          this.keyPool.markCooldown(acquired.index);
          this.logger.warn(
            `Gemini attempt ${attempt + 1} failed with retryable error; rotating key`,
          );
          continue;
        }
        throw error;
      }
    }

    this.logger.error('Gemini generateText exhausted retries', lastError);
    throw new ServiceUnavailableException(GEMINI_MESSAGES.retriesExhausted);
  }

  private isRetryable(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }
    const providerError = error as GeminiProviderError;
    const status =
      providerError.status ??
      providerError.statusCode ??
      providerError.httpStatusCode;
    if (typeof status === 'number' && RETRYABLE_STATUS.has(status)) {
      return true;
    }
    const message = String(providerError.message ?? error);
    return GEMINI_RETRYABLE_ERROR_PATTERN.test(message);
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timer = setTimeout(
            () => reject(new Error(`Gemini request timed out after ${ms}ms`)),
            ms,
          );
        }),
      ]);
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }
}
