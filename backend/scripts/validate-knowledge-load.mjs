import { join } from 'node:path';
import { KnowledgeLoader } from '../dist/knowledge/knowledge.loader.js';

const loader = new KnowledgeLoader();
const index = loader.load(join(process.cwd(), 'knowledge'));

console.log(
  JSON.stringify(
    {
      profile: index.profile
        ? { name: index.profile.name, headline: index.profile.headline }
        : null,
      counts: {
        experience: index.experience.length,
        projects: index.projects.length,
        skills: index.skills.length,
        evidence: index.evidence.length,
        stories: index.stories.length,
      },
      projectIds: index.projects.map((p) => p.id).sort(),
      skillIds: index.skills.map((s) => s.id),
      experienceIds: index.experience.map((e) => e.id),
    },
    null,
    2,
  ),
);

if (!index.profile) {
  console.error('FAIL: profile missing');
  process.exit(1);
}
if (index.projects.length < 10) {
  console.error('FAIL: expected many projects');
  process.exit(1);
}
if (index.skills.length < 10) {
  console.error('FAIL: expected many skills');
  process.exit(1);
}
console.log('OK');
