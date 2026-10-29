import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Audience, GrillMode } from '../../shared/enums.ts';
import { AGENT_SESSION_TTL_MS } from '../constants/agent.constants.ts';
import { SessionStore } from './session.store.ts';

describe('SessionStore', () => {
  let store: SessionStore;

  beforeEach(() => {
    store = new SessionStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    store.clear();
  });

  it('creates a session and appends history', () => {
    const session = store.getOrCreate(
      undefined,
      GrillMode.WarmUp,
      Audience.Recruiter,
    );
    store.appendTurn(session.id, 'Who are you?', 'I am Shivansh.');
    expect(store.getHistory(session.id)).toHaveLength(2);
    expect(store.getHistory(session.id)[0]?.role).toBe('user');
  });

  it('reuses an existing conversationId', () => {
    const first = store.getOrCreate(
      'fixed-id',
      GrillMode.WarmUp,
      Audience.Junior,
    );
    const second = store.getOrCreate(
      'fixed-id',
      GrillMode.MediumRare,
      Audience.Senior,
    );
    expect(second.id).toBe(first.id);
    expect(second.grillMode).toBe(GrillMode.MediumRare);
  });

  it('expires sessions after TTL', () => {
    vi.useFakeTimers();
    const session = store.getOrCreate(
      undefined,
      GrillMode.WarmUp,
      Audience.Recruiter,
    );
    vi.advanceTimersByTime(AGENT_SESSION_TTL_MS + 1000);
    expect(store.get(session.id)).toBeUndefined();
    expect(store.size()).toBe(0);
  });
});
