export const APP_DEFAULTS = {
  port: 3000,
  corsOrigin: '*',
  throttleTtlMs: 60_000,
  throttleLimit: 100,
} as const;

export const GEMINI_CONFIG_DEFAULTS = {
  model: 'gemini-2.0-flash',
  timeoutMs: 30_000,
  maxRetries: 2,
  keyCooldownMs: 60_000,
} as const;
