import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GEMINI_DEFAULT_KEY_COOLDOWN_MS,
  GEMINI_KEY_POOL_OPTIONS,
} from './constants/gemini.constants.ts';
import type { GeminiKeyPoolOptions } from './interfaces/gemini.interfaces.ts';
import { GeminiKeyPool } from './gemini-key-pool.ts';
import { GeminiService } from './gemini.service.ts';

@Global()
@Module({
  providers: [
    {
      provide: GEMINI_KEY_POOL_OPTIONS,
      inject: [ConfigService],
      useFactory: (config: ConfigService): GeminiKeyPoolOptions => ({
        apiKeys: config.get<string[]>('gemini.apiKeys') ?? [],
        keyCooldownMs:
          config.get<number>('gemini.keyCooldownMs') ??
          GEMINI_DEFAULT_KEY_COOLDOWN_MS,
      }),
    },
    GeminiKeyPool,
    GeminiService,
  ],
  exports: [GeminiKeyPool, GeminiService],
})
export class GeminiModule {}
