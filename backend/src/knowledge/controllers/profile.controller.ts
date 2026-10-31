import { Controller, Get, NotFoundException } from '@nestjs/common';
import { KnowledgeService } from '../knowledge.service.ts';

@Controller({ path: 'profile', version: '1' })
export class ProfileController {
  constructor(private readonly knowledge: KnowledgeService) {}

  @Get()
  getProfile() {
    const profile = this.knowledge.getProfile();
    if (!profile) {
      throw new NotFoundException(
        'Profile not found. Add knowledge/profile.md to publish your profile.',
      );
    }

    return {
      ...profile,
      experience: this.knowledge.getExperience(),
    };
  }
}
