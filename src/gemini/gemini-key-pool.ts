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

  /** Round-robin among keys that are not cooling down. */
  acquire(): AcquiredKey {
    if (this.keys.length === 0) {
      throw new ServiceUnavailableException(GEMINI_MESSAGES.notConfigured);
    }

    const now = Date.now();
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

  markCooldown(index: number, cooldownMs = this.cooldownMs): void {
    const state = this.keys[index];
    if (!state) {
      return;
    }
    state.cooldownUntil = Date.now() + cooldownMs;
    this.logger.warn(
      `Gemini key #${index} cooling down for ${cooldownMs}ms after failure`,
    );
  }

  resetCooldowns(): void {
    for (const state of this.keys) {
      state.cooldownUntil = 0;
    }
  }
}
