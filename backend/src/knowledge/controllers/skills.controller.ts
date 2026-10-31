import { Controller, Get, Param } from '@nestjs/common';
import { KnowledgeService } from '../knowledge.service.ts';

@Controller({ path: 'skills', version: '1' })
export class SkillsController {
  constructor(private readonly knowledge: KnowledgeService) {}

  @Get()
  listSkills() {
    return {
      items: this.knowledge.getSkills(),
    };
  }

  @Get(':id')
  getSkill(@Param('id') id: string) {
    return this.knowledge.getSkill(id);
  }
}
