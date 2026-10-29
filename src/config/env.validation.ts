import Joi from 'joi';
import { APP_DEFAULTS, GEMINI_CONFIG_DEFAULTS } from './constants.ts';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(APP_DEFAULTS.port),
  CORS_ORIGIN: Joi.string().default(APP_DEFAULTS.corsOrigin),
  GEMINI_API_KEYS: Joi.string().allow('').default(''),
  GEMINI_MODEL: Joi.string().default(GEMINI_CONFIG_DEFAULTS.model),
  GEMINI_TIMEOUT_MS: Joi.number()
    .integer()
    .min(1000)
    .default(GEMINI_CONFIG_DEFAULTS.timeoutMs),
  GEMINI_MAX_RETRIES: Joi.number()
    .integer()
    .min(0)
    .max(5)
    .default(GEMINI_CONFIG_DEFAULTS.maxRetries),
  GEMINI_KEY_COOLDOWN_MS: Joi.number()
    .integer()
    .min(1000)
    .default(GEMINI_CONFIG_DEFAULTS.keyCooldownMs),
  GEMINI_THINKING_LEVEL: Joi.string()
    .valid('minimal', 'low', 'medium', 'high')
    .default(GEMINI_CONFIG_DEFAULTS.thinkingLevel),
  GEMINI_MAX_OUTPUT_TOKENS: Joi.number()
    .integer()
    .min(256)
    .max(8192)
    .default(GEMINI_CONFIG_DEFAULTS.maxOutputTokens),
  THROTTLE_TTL_MS: Joi.number()
    .integer()
    .min(1000)
    .default(APP_DEFAULTS.throttleTtlMs),
  THROTTLE_LIMIT: Joi.number()
    .integer()
    .min(1)
    .default(APP_DEFAULTS.throttleLimit),
  KNOWLEDGE_ROOT: Joi.string().optional(),
  CONTACT_MESSAGE_DIR: Joi.string().allow('').optional(),
  GITHUB_WEBHOOK_SECRET: Joi.string().allow('').default(''),
  GITHUB_TOKEN: Joi.string().allow('').default(''),
});
