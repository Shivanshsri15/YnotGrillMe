import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { KnowledgeService } from '../knowledge/knowledge.service.ts';
import { ContactMessageStore } from './contact-message.store.ts';
import type { ContactMessageDto } from './dto/contact-message.dto.ts';

@Injectable()
export class ContactService {
  constructor(
    private readonly knowledge: KnowledgeService,
    private readonly messages: ContactMessageStore,
  ) {}

  getPublicContact() {
    const profile = this.knowledge.getProfile();
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    if (!profile.contactEnabled) {
      throw new ForbiddenException('Contact is disabled for this profile');
    }

    return {
      name: profile.name,
      contactEnabled: true,
      links: {
        email: profile.links.email,
        linkedin: profile.links.linkedin,
        github: profile.links.github,
        website: profile.links.website,
      },
      schedulingUrl: profile.schedulingUrl ?? null,
      note: profile.schedulingUrl
        ? undefined
        : 'No public scheduling link is published.',
    };
  }

  submitMessage(dto: ContactMessageDto) {
    const profile = this.knowledge.getProfile();
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    if (!profile.contactEnabled) {
      throw new ForbiddenException('Contact is disabled for this profile');
    }

    try {
      const stored = this.messages.add({
        name: dto.name.trim(),
        email: dto.email.trim(),
        message: dto.message.trim(),
        company: dto.company?.trim() || undefined,
      });
      return {
        ok: true,
        id: stored.id,
        receivedAt: stored.receivedAt,
      };
    } catch {
      throw new ServiceUnavailableException(
        'Unable to accept contact messages right now.',
      );
    }
  }
}
