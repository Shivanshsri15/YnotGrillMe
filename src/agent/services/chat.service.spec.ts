import { beforeAll, describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { KnowledgeLoader } from '../../knowledge/knowledge.loader.ts';
import { KnowledgeService } from '../../knowledge/knowledge.service.ts';
import { GeminiService } from '../../gemini/gemini.service.ts';
import { Audience, GrillAction, GrillMode } from '../../shared/enums.ts';
import { ChatService } from './chat.service.ts';
import { HighlightService } from './highlight.service.ts';
import { PromptBuilder } from './prompt.builder.ts';
import { RabbitHoleService } from './rabbit-hole.service.ts';
import { RetrievalService } from './retrieval.service.ts';
import { SessionStore } from './session.store.ts';

describe('ChatService', () => {
  let chat: ChatService;
  let knowledge: KnowledgeService;
  let sessions: SessionStore;

  beforeAll(() => {
    const fixtureRoot = join(process.cwd(), 'test/fixtures/knowledge');
    const config = {
      get: (key: string) =>
        key === 'knowledge.root' ? fixtureRoot : undefined,
    } as ConfigService;
    knowledge = new KnowledgeService(new KnowledgeLoader(), config);
    knowledge.reindex(fixtureRoot);
    sessions = new SessionStore();

    const gemini = {
      isConfigured: () => true,
      streamGenerateText: async function* () {
        yield 'Demo API uses NestJS. ';
        yield 'Evidence: demo-repo';
      },
    } as unknown as GeminiService;

    chat = new ChatService(
      sessions,
      new RetrievalService(knowledge),
      new PromptBuilder(),
      new RabbitHoleService(knowledge),
      gemini,
      knowledge,
      new HighlightService(knowledge),
    );
  });

  it('filters evidence IDs to known public receipts', () => {
    const retrieval = {
      chunks: [],
      projectIds: ['demo-api'],
      skillIds: ['nestjs'],
      storyIds: [],
      evidenceIds: ['demo-repo'],
    };
    const ids = chat.extractAndValidateEvidenceIds(
      'Built with NestJS.\nEvidence: demo-repo, fake-id, demo-api',
      retrieval,
    );
    expect(ids).toEqual(['demo-repo']);
  });

  it('streams chat events including suggestions and highlights', async () => {
    const events = [];
    for await (const event of chat.chat({
      message: 'Tell me about the demo API',
      grillMode: GrillMode.WarmUp,
      audience: Audience.Junior,
    })) {
      events.push(event);
    }

    expect(events[0]?.event).toBe('meta');
    expect(events.some((event) => event.event === 'token')).toBe(true);
    expect(events.some((event) => event.event === 'highlight')).toBe(true);
    expect(events.some((event) => event.event === 'evidence')).toBe(true);
    const suggestions = events.find((event) => event.event === 'suggestions');
    expect(suggestions?.event).toBe('suggestions');
    if (suggestions?.event === 'suggestions') {
      expect(suggestions.data.items.length).toBeGreaterThan(0);
    }
    expect(events.at(-1)).toEqual({
      event: 'done',
      data: { finishReason: 'stop' },
    });
  });

  it('grills a project and supports session recap', async () => {
    const events = [];
    for await (const event of chat.grill({
      projectId: 'demo-api',
      action: GrillAction.ShowReceipts,
      grillMode: GrillMode.MediumRare,
      audience: Audience.Senior,
    })) {
      events.push(event);
    }

    const meta = events.find((event) => event.event === 'meta');
    expect(meta?.event).toBe('meta');
    if (meta?.event === 'meta') {
      expect(meta.data.projectId).toBe('demo-api');
      expect(meta.data.action).toBe(GrillAction.ShowReceipts);
      const recap = chat.getRecap(meta.data.conversationId);
      expect(recap.projectIds).toContain('demo-api');
      expect(recap.actionsUsed).toContain(GrillAction.ShowReceipts);
      expect(recap.highlights.length).toBeGreaterThan(0);
      expect(recap.disclaimer).toMatch(/Grounded/i);
    }
  });
});
