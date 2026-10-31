import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { beforeAll, describe, expect, it } from 'vitest';
import { KnowledgeLoader } from '../knowledge/knowledge.loader.ts';
import { KnowledgeService } from '../knowledge/knowledge.service.ts';
import { ResumeVariant } from '../shared/enums.ts';
import { ResumeService } from './resume.service.ts';

describe('ResumeService', () => {
  let resumes: ResumeService;

  beforeAll(() => {
    const fixtureRoot = join(process.cwd(), 'test/fixtures/knowledge');
    const config = {
      get: (key: string) =>
        key === 'knowledge.root' ? fixtureRoot : undefined,
    } as ConfigService;
    const knowledge = new KnowledgeService(new KnowledgeLoader(), config);
    knowledge.reindex(fixtureRoot);
    resumes = new ResumeService(knowledge);
  });

  it('lists available resume variants from disk', () => {
    const items = resumes.list();
    expect(items.some((item) => item.variant === ResumeVariant.Generic)).toBe(
      true,
    );
    expect(items.some((item) => item.variant === ResumeVariant.Backend)).toBe(
      true,
    );
  });

  it('serves markdown resume bytes without generating a PDF', () => {
    const file = resumes.getFile(ResumeVariant.Generic);
    expect(file.contentType).toContain('text/markdown');
    expect(file.buffer.toString('utf8')).toContain('Test Engineer');
  });
});
