import { Controller, Get, Param } from '@nestjs/common';
import { KnowledgeService } from '../knowledge.service.ts';

@Controller({ path: 'projects', version: '1' })
export class ProjectsController {
  constructor(private readonly knowledge: KnowledgeService) {}

  @Get()
  listProjects() {
    return {
      items: this.knowledge.listProjects(),
    };
  }

  @Get(':id')
  getProject(@Param('id') id: string) {
    const project = this.knowledge.getProject(id);
    return {
      ...project,
      // Keep synced README available but clearly supplemental.
      sources: {
        curated: true,
        readmeSynced: Boolean(project.readmeSynced),
      },
    };
  }

  @Get(':id/architecture')
  getArchitecture(@Param('id') id: string) {
    return this.knowledge.getProjectArchitecture(id);
  }
}
