import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Visibility } from '../shared/enums.ts';
import { KnowledgeLoader } from './knowledge.loader.ts';

describe('KnowledgeLoader', () => {
  const loader = new KnowledgeLoader();
  const fixtureRoot = join(process.cwd(), 'test/fixtures/knowledge');

  it('loads curated markdown fixtures into an index', () => {
    const index = loader.load(fixtureRoot);

    expect(index.profile?.name).toBe('Test Engineer');
    expect(index.projects.map((project) => project.id).sort()).toEqual([
      'demo-api',
      'secret',
    ]);
    expect(index.skills).toHaveLength(2);
    expect(index.evidence[0]?.id).toBe('demo-repo');
    expect(index.stories[0]?.tags).toContain('debugging');
    expect(index.experience[0]?.company).toBe('Acme');
    expect(index.projects.find((p) => p.id === 'demo-api')?.architecture?.nodes)
      .toHaveLength(2);
  });

  it('preserves visibility from frontmatter', () => {
    const index = loader.load(fixtureRoot);
    const secret = index.projects.find((project) => project.id === 'secret');
    expect(secret?.visibility).toBe(Visibility.Private);
  });

  it('returns empty collections when root is missing', () => {
    const index = loader.load(join(process.cwd(), 'test/fixtures/missing-kb'));
    expect(index.profile).toBeNull();
    expect(index.projects).toEqual([]);
    expect(index.skills).toEqual([]);
  });
});
