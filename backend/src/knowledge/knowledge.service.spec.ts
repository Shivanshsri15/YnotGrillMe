import { join } from 'node:path';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { describe, expect, it } from 'vitest';
import { KnowledgeLoader } from './knowledge.loader.ts';
import { KnowledgeService } from './knowledge.service.ts';

describe('KnowledgeService', () => {
  const fixtureRoot = join(process.cwd(), 'test/fixtures/knowledge');

  function createService(): KnowledgeService {
    const config = {
      get: (key: string) =>
        key === 'knowledge.root' ? fixtureRoot : undefined,
    } as ConfigService;
    const service = new KnowledgeService(new KnowledgeLoader(), config);
    service.reindex(fixtureRoot);
    return service;
  }

  it('hides private projects from public list', () => {
    const service = createService();
    const projects = service.listProjects();
    expect(projects.map((project) => project.id)).toEqual(['demo-api']);
  });

  it('returns skill detail with related projects', () => {
    const service = createService();
    const skill = service.getSkill('nestjs');
    expect(skill.relatedProjects[0]?.id).toBe('demo-api');
  });

  it('throws for unknown public project', () => {
    const service = createService();
    expect(() => service.getProject('secret')).toThrow(NotFoundException);
    expect(() => service.getProject('missing')).toThrow(NotFoundException);
  });
});
