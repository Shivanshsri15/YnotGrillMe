import { Global, Module } from '@nestjs/common';
import { KnowledgeLoader } from './knowledge.loader.ts';
import { KnowledgeService } from './knowledge.service.ts';
import { ProfileController } from './controllers/profile.controller.ts';
import { ProjectsController } from './controllers/projects.controller.ts';
import { SkillsController } from './controllers/skills.controller.ts';
import { EvidenceController } from './controllers/evidence.controller.ts';
import { StoriesController } from './controllers/stories.controller.ts';
import { EntryController } from './controllers/entry.controller.ts';
import { AgentModesController } from './controllers/agent-modes.controller.ts';

@Global()
@Module({
  controllers: [
    ProfileController,
    ProjectsController,
    SkillsController,
    EvidenceController,
    StoriesController,
    EntryController,
    AgentModesController,
  ],
  providers: [KnowledgeLoader, KnowledgeService],
  exports: [KnowledgeService, KnowledgeLoader],
})
export class KnowledgeModule {}
