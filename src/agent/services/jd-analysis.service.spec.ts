import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { beforeAll, describe, expect, it } from 'vitest';
import { KnowledgeLoader } from '../../knowledge/knowledge.loader.ts';
import { KnowledgeService } from '../../knowledge/knowledge.service.ts';
import { JdAnalysisService } from './jd-analysis.service.ts';
import { RetrievalService } from './retrieval.service.ts';

describe('JdAnalysisService', () => {
  let jd: JdAnalysisService;

  beforeAll(() => {
    const fixtureRoot = join(process.cwd(), 'test/fixtures/knowledge');
    const config = {
      get: (key: string) =>
        key === 'knowledge.root' ? fixtureRoot : undefined,
    } as ConfigService;
    const knowledge = new KnowledgeService(new KnowledgeLoader(), config);
    knowledge.reindex(fixtureRoot);
    jd = new JdAnalysisService(knowledge, new RetrievalService(knowledge));
  });

  it('matches NestJS requirements to documented skills/projects', () => {
    const result = jd.analyze(
      [
        'We need a Backend Engineer with NestJS and TypeScript experience.',
        'Required: building reliable APIs and modular services.',
        'Nice to have: Kubernetes operators and Rust systems programming.',
      ].join('\n'),
    );

    expect(result.matchedSkills.some((skill) => skill.id === 'nestjs')).toBe(
      true,
    );
    expect(result.matchedProjects.some((project) => project.id === 'demo-api')).toBe(
      true,
    );
    expect(result.evidenceIds).toContain('demo-repo');
    expect(result.doNotClaim.length).toBeGreaterThan(0);
    expect(result.disclaimer).toMatch(/grounded/i);
  });
});
