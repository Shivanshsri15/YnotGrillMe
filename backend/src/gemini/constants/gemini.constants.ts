import { GEMINI_CONFIG_DEFAULTS } from '../../config/constants.ts';

export const GEMINI_KEY_POOL_OPTIONS = 'GEMINI_KEY_POOL_OPTIONS';

export const GEMINI_DEFAULT_MODEL = GEMINI_CONFIG_DEFAULTS.model;
export const GEMINI_DEFAULT_TIMEOUT_MS = GEMINI_CONFIG_DEFAULTS.timeoutMs;
export const GEMINI_DEFAULT_MAX_RETRIES = GEMINI_CONFIG_DEFAULTS.maxRetries;
export const GEMINI_DEFAULT_KEY_COOLDOWN_MS =
  GEMINI_CONFIG_DEFAULTS.keyCooldownMs;
export const GEMINI_DEFAULT_THINKING_LEVEL =
  GEMINI_CONFIG_DEFAULTS.thinkingLevel;
export const GEMINI_DEFAULT_MAX_OUTPUT_TOKENS =
  GEMINI_CONFIG_DEFAULTS.maxOutputTokens;

export const GEMINI_RETRYABLE_STATUS_CODES = [
  429, 500, 502, 503, 504,
] as const;

/** Include hangs/timeouts so a flaky key is cooled down and rotated. */
export const GEMINI_RETRYABLE_ERROR_PATTERN =
  /429|RESOURCE_EXHAUSTED|rate.?limit|quota|503|500|504|timed out|timeout|aborted|AbortError|fetch failed|ECONNRESET|ETIMEDOUT|Error reading from the stream|no visible text/i;

export const GEMINI_MESSAGES = {
  notConfigured:
    'Gemini is not configured. Set GEMINI_API_KEYS to enable AI features.',
  allKeysRateLimited:
    'All Gemini API keys are temporarily rate-limited. Please try again shortly.',
  retriesExhausted:
    'Gemini request failed after retries. Please try again shortly.',
} as const;
