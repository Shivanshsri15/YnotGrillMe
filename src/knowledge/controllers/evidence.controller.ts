import { Controller, Get, Param } from '@nestjs/common';
import { KnowledgeService } from '../knowledge.service.ts';

@Controller({ path: 'evidence', version: '1' })
export class EvidenceController {
  constructor(private readonly knowledge: KnowledgeService) {}

  @Get()
  listEvidence() {
    return {
      items: this.knowledge.listEvidence(),
    };
  }

  @Get(':id')
  getEvidence(@Param('id') id: string) {
    return this.knowledge.getEvidenceById(id);
  }
}
