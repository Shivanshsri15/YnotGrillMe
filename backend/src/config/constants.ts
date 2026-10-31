export const APP_DEFAULTS = {
  port: 3000,
  corsOrigin: '*',
  throttleTtlMs: 60_000,
  throttleLimit: 100,
  knowledgeRoot: 'knowledge',
} as const;

export const GEMINI_CONFIG_DEFAULTS = {
  /** Flash-Lite defaults to minimal thinking — better TTFT for portfolio chat. */
  model: 'gemini-3.5-flash-lite',
  /**
   * Per-attempt deadline for one generateContent call. Failover rotates keys;
   * do not treat raising this as the latency fix.
   */
  timeoutMs: 15_000,
  /** Extra attempts after the first — used to skip flaky keys in the pool. */
  maxRetries: 2,
  /** Short cooldown: enough to skip a bad key for the next few turns. */
  keyCooldownMs: 15_000,
  /** Use minimal on Flash-Lite; low/medium/high on fuller Flash models. */
  thinkingLevel: 'minimal',
  /** Cap reply length so streams finish quickly. */
  maxOutputTokens: 768,
} as const;
