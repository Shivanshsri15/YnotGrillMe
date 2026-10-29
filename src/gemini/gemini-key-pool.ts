import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  GEMINI_KEY_POOL_OPTIONS,
  GEMINI_MESSAGES,
} from './constants/gemini.constants.ts';
import type {
  AcquiredKey,
  GeminiKeyPoolOptions,
  KeyState,
} from './interfaces/gemini.interfaces.ts';

@Injectable()
export class GeminiKeyPool {
  private readonly logger = new Logger(GeminiKeyPool.name);
  private readonly keys: KeyState[];
  private readonly cooldownMs: number;
  private cursor = 0;
  /** Prefer the last key that completed successfully (skip flaky round-robin peers). */
  private stickyIndex: number | null = null;

  constructor(
    @Inject(GEMINI_KEY_POOL_OPTIONS)
    options: GeminiKeyPoolOptions,
  ) {
    this.cooldownMs = options.keyCooldownMs;
    this.keys = options.apiKeys.map((key) => ({ key, cooldownUntil: 0 }));

    if (this.keys.length === 0) {
      this.logger.warn(
        'No GEMINI_API_KEYS configured — AI features will be unavailable until keys are set.',
      );
    } else {
      this.logger.log(
        `Gemini key pool initialized with ${this.keys.length} key(s)`,
      );
    }
  }

  get size(): number {
    return this.keys.length;
  }

  /**
   * Prefer the sticky healthy key when available; otherwise round-robin among
   * keys that are not cooling down.
   */
  acquire(): AcquiredKey {
    if (this.keys.length === 0) {
      throw new ServiceUnavailableException(GEMINI_MESSAGES.notConfigured);
    }

    const now = Date.now();

    if (this.stickyIndex !== null) {
      const sticky = this.keys[this.stickyIndex];
      if (sticky && sticky.cooldownUntil <= now) {
        return { key: sticky.key, index: this.stickyIndex };
      }
    }

    for (let attempt = 0; attempt < this.keys.length; attempt++) {
      const index = this.cursor % this.keys.length;
      this.cursor = (this.cursor + 1) % this.keys.length;
      const state = this.keys[index];
      if (state.cooldownUntil <= now) {
        return { key: state.key, index };
      }
    }

    throw new ServiceUnavailableException(GEMINI_MESSAGES.allKeysRateLimited);
  }

  markSuccess(index: number): void {
    if (index < 0 || index >= this.keys.length) {
      return;
    }
    this.stickyIndex = index;
  }

  markCooldown(index: number, cooldownMs = this.cooldownMs): void {
    const state = this.keys[index];
    if (!state) {
      return;
    }
    state.cooldownUntil = Date.now() + cooldownMs;
    if (this.stickyIndex === index) {
      this.stickyIndex = null;
    }
    this.logger.warn(
      `Gemini key #${index} cooling down for ${cooldownMs}ms after failure`,
    );
  }

  resetCooldowns(): void {
    for (const state of this.keys) {
      state.cooldownUntil = 0;
    }
    this.stickyIndex = null;
  }
}
