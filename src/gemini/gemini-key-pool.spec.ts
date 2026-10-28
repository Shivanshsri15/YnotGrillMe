import { ServiceUnavailableException } from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GeminiKeyPool } from './gemini-key-pool.ts';

function createPool(keys: string[], cooldownMs = 60_000): GeminiKeyPool {
  return new GeminiKeyPool({
    apiKeys: keys,
    keyCooldownMs: cooldownMs,
  });
}

describe('GeminiKeyPool', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('round-robins across available keys', () => {
    const pool = createPool(['key-a', 'key-b', 'key-c']);

    expect(pool.acquire()).toEqual({ key: 'key-a', index: 0 });
    expect(pool.acquire()).toEqual({ key: 'key-b', index: 1 });
    expect(pool.acquire()).toEqual({ key: 'key-c', index: 2 });
    expect(pool.acquire()).toEqual({ key: 'key-a', index: 0 });
  });

  it('skips keys that are cooling down and fails over', () => {
    const pool = createPool(['key-a', 'key-b'], 60_000);

    const first = pool.acquire();
    expect(first.index).toBe(0);
    pool.markCooldown(first.index);

    const second = pool.acquire();
    expect(second).toEqual({ key: 'key-b', index: 1 });
  });

  it('throws when all keys are cooling down', () => {
    const pool = createPool(['key-a', 'key-b'], 60_000);
    pool.markCooldown(0);
    pool.markCooldown(1);

    expect(() => pool.acquire()).toThrow(ServiceUnavailableException);
  });

  it('throws when no keys are configured', () => {
    const pool = createPool([]);
    expect(() => pool.acquire()).toThrow(ServiceUnavailableException);
  });

  it('reuses a key after cooldown expires', () => {
    vi.useFakeTimers();
    const pool = createPool(['key-a'], 5_000);

    pool.markCooldown(0);
    expect(() => pool.acquire()).toThrow(ServiceUnavailableException);

    vi.advanceTimersByTime(5_001);
    expect(pool.acquire()).toEqual({ key: 'key-a', index: 0 });
  });
});
