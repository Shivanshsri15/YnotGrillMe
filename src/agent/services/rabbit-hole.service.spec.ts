import { beforeAll, describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { KnowledgeLoader } from '../../knowledge/knowledge.loader.ts';
import { KnowledgeService } from '../../knowledge/knowledge.service.ts';
import { RabbitHoleService } from './rabbit-hole.service.ts';

describe('RabbitHoleService', () => {
  let rabbit: RabbitHoleService;
  let knowledge: KnowledgeService;

  beforeAll(() => {
    const fixtureRoot = join(process.cwd(), 'test/fixtures/knowledge');
    const config = {
      get: (key: string) =>
        key === 'knowledge.root' ? fixtureRoot : undefined,
    } as ConfigService;
    knowledge = new KnowledgeService(new KnowledgeLoader(), config);
    knowledge.reindex(fixtureRoot);
    rabbit = new RabbitHoleService(knowledge);
  });

  it('starter suggestions invite story exploration, not generic bio prompts', () => {
    const items = rabbit.starterQuestions();
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.action.kind).toBe('ask');
      expect(item.label.toLowerCase()).not.toMatch(/^ask about/);
      expect(item.label.toLowerCase()).not.toMatch(/^who is/);
      expect(item.label.toLowerCase()).not.toMatch(/^tell me about/);
    }
  });

  it('build prefers story-shaped asks from retrieval', () => {
    const items = rabbit.build(
      {
        chunks: [],
        projectIds: ['demo-api'],
        skillIds: [],
        storyIds: ['race-bug'],
        evidenceIds: [],
      },
      [],
    );

    expect(items.length).toBeGreaterThan(0);
    expect(items[0]?.type).toBe('story');
    expect(items[0]?.action.kind).toBe('ask');
    if (items[0]?.action.kind === 'ask') {
      expect(items[0].action.message.toLowerCase()).toMatch(
        /trade-off|story|problem|deeper/,
      );
      expect(items[0].action.depth).toBe('deep');
    }
  });
});
