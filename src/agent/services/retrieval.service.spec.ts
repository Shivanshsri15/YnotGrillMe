import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { beforeAll, describe, expect, it } from 'vitest';
import { KnowledgeLoader } from '../../knowledge/knowledge.loader.ts';
import { KnowledgeService } from '../../knowledge/knowledge.service.ts';
import { Audience, GrillMode, VisitorRole } from '../../shared/enums.ts';
import { RetrievalService } from './retrieval.service.ts';

describe('RetrievalService', () => {
  let retrieval: RetrievalService;
  let knowledge: KnowledgeService;

  beforeAll(() => {
    const fixtureRoot = join(process.cwd(), 'test/fixtures/knowledge');
    const config = {
      get: (key: string) =>
        key === 'knowledge.root' ? fixtureRoot : undefined,
    } as ConfigService;
    knowledge = new KnowledgeService(new KnowledgeLoader(), config);
    knowledge.reindex(fixtureRoot);
    retrieval = new RetrievalService(knowledge);
  });

  it('prefers matching project for nestjs-related queries', () => {
    const result = retrieval.retrieve({
      query: 'Tell me about NestJS demo API architecture',
      grillMode: GrillMode.MediumRare,
      audience: Audience.Senior,
      visitorRole: VisitorRole.Engineer,
    });

    expect(result.projectIds).toContain('demo-api');
    expect(result.chunks.some((chunk) => chunk.id === 'demo-api')).toBe(true);
  });

  it('does not surface private projects', () => {
    const result = retrieval.retrieve({
      query: 'secret project details',
      grillMode: GrillMode.WellDone,
      audience: Audience.Senior,
    });

    expect(result.projectIds).not.toContain('secret');
    expect(
      result.chunks.some(
        (chunk) => chunk.sourceType === 'project' && chunk.id === 'secret',
      ),
    ).toBe(false);
  });

  it('includes profile context for hiring visitors', () => {
    const result = retrieval.retrieve({
      query: 'background experience',
      grillMode: GrillMode.WarmUp,
      audience: Audience.Recruiter,
      visitorRole: VisitorRole.Hiring,
    });

    expect(
      result.chunks.some((chunk) => chunk.sourceType === 'profile'),
    ).toBe(true);
  });

  it('pins a project for grill retrieval', () => {
    const result = retrieval.retrieve({
      query: 'walk me through this',
      grillMode: GrillMode.WellDone,
      audience: Audience.Senior,
      projectId: 'demo-api',
    });

    expect(result.projectIds[0]).toBe('demo-api');
    expect(
      result.chunks.some(
        (chunk) => chunk.sourceType === 'project' && chunk.id === 'demo-api',
      ),
    ).toBe(true);
  });
});

