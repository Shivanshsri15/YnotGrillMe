export interface GeminiKeyPoolOptions {
  apiKeys: string[];
  keyCooldownMs: number;
}

export interface AcquiredKey {
  key: string;
  index: number;
}

export interface KeyState {
  key: string;
  cooldownUntil: number;
}

export interface GeminiProviderError {
  status?: number;
  statusCode?: number;
  httpStatusCode?: number;
  message?: string;
}
