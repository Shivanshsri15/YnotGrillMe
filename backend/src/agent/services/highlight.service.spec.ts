import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { beforeAll, describe, expect, it } from 'vitest';
import { KnowledgeLoader } from '../../knowledge/knowledge.loader.ts';
import { KnowledgeService } from '../../knowledge/knowledge.service.ts';
import { Audience, GrillMode } from '../../shared/enums.ts';
import { HighlightService } from './highlight.service.ts';
import { RetrievalService } from './retrieval.service.ts';

describe('HighlightService', () => {
  let highlights: HighlightService;
  let retrieval: RetrievalService;

  beforeAll(() => {
    const fixtureRoot = join(process.cwd(), 'test/fixtures/knowledge');
    const config = {
      get: (key: string) =>
        key === 'knowledge.root' ? fixtureRoot : undefined,
    } as ConfigService;
    const knowledge = new KnowledgeService(new KnowledgeLoader(), config);
    knowledge.reindex(fixtureRoot);
    highlights = new HighlightService(knowledge);
    retrieval = new RetrievalService(knowledge);
  });

  it('emits short grounded highlights for a pinned project', () => {
    const result = retrieval.retrieve({
      query: 'architecture trade-offs',
      grillMode: GrillMode.MediumRare,
      audience: Audience.Senior,
      projectId: 'demo-api',
    });
    const items = highlights.extract(result);
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.text.length <= 140)).toBe(true);
    expect(items.some((item) => item.kind === 'stack')).toBe(true);
  });
});
