import { createHmac } from 'node:crypto';
import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { beforeAll, describe, expect, it } from 'vitest';
import { KnowledgeLoader } from '../knowledge/knowledge.loader.ts';
import { KnowledgeService } from '../knowledge/knowledge.service.ts';
import { GithubSyncService } from './github-sync.service.ts';

describe('GithubSyncService', () => {
  let service: GithubSyncService;

  beforeAll(() => {
    const fixtureRoot = join(process.cwd(), 'test/fixtures/knowledge');
    const config = {
      get: (key: string) => {
        if (key === 'knowledge.root') return fixtureRoot;
        if (key === 'github.webhookSecret') return 'test-secret';
        if (key === 'github.token') return '';
        return undefined;
      },
    } as ConfigService;
    const knowledge = new KnowledgeService(new KnowledgeLoader(), config);
    knowledge.reindex(fixtureRoot);
    service = new GithubSyncService(knowledge, config);
  });

  it('lists syncable projects', () => {
    const items = service.listSyncable();
    expect(items.some((item) => item.projectId === 'demo-api')).toBe(true);
  });

  it('verifies webhook signatures', () => {
    const body = Buffer.from('{"ok":true}', 'utf8');
    const digest = createHmac('sha256', 'test-secret').update(body).digest('hex');
    expect(() =>
      service.verifyWebhookSignature(body, `sha256=${digest}`),
    ).not.toThrow();
    expect(() =>
      service.verifyWebhookSignature(body, 'sha256=deadbeef'),
    ).toThrow(UnauthorizedException);
  });
});
