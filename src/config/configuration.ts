import { APP_DEFAULTS, GEMINI_CONFIG_DEFAULTS } from './constants.ts';

export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? String(APP_DEFAULTS.port), 10),
  corsOrigin: process.env.CORS_ORIGIN ?? APP_DEFAULTS.corsOrigin,
  gemini: {
    apiKeys: (process.env.GEMINI_API_KEYS ?? '')
      .split(',')
      .map((key) => key.trim())
      .filter(Boolean),
    model: process.env.GEMINI_MODEL ?? GEMINI_CONFIG_DEFAULTS.model,
    timeoutMs: parseInt(
      process.env.GEMINI_TIMEOUT_MS ?? String(GEMINI_CONFIG_DEFAULTS.timeoutMs),
      10,
    ),
    maxRetries: parseInt(
      process.env.GEMINI_MAX_RETRIES ??
        String(GEMINI_CONFIG_DEFAULTS.maxRetries),
      10,
    ),
    keyCooldownMs: parseInt(
      process.env.GEMINI_KEY_COOLDOWN_MS ??
        String(GEMINI_CONFIG_DEFAULTS.keyCooldownMs),
      10,
    ),
  },
  throttle: {
    ttlMs: parseInt(
      process.env.THROTTLE_TTL_MS ?? String(APP_DEFAULTS.throttleTtlMs),
      10,
    ),
    limit: parseInt(
      process.env.THROTTLE_LIMIT ?? String(APP_DEFAULTS.throttleLimit),
      10,
    ),
  },
});
