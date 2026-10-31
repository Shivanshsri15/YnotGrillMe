import { Body, Controller, Get, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  CONTACT_MESSAGE_THROTTLE_LIMIT,
  CONTACT_MESSAGE_THROTTLE_TTL_MS,
} from './constants/contact.constants.ts';
import { ContactService } from './contact.service.ts';
import { ContactMessageDto } from './dto/contact-message.dto.ts';

@Controller({ path: 'contact', version: '1' })
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Get()
  getContact() {
    return this.contact.getPublicContact();
  }

  @Post('message')
  @Throttle({
    default: {
      limit: CONTACT_MESSAGE_THROTTLE_LIMIT,
      ttl: CONTACT_MESSAGE_THROTTLE_TTL_MS,
    },
  })
  submitMessage(@Body() body: ContactMessageDto) {
    return this.contact.submitMessage(body);
  }
}
