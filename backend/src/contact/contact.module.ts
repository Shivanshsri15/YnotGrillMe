import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller.ts';
import { ContactMessageStore } from './contact-message.store.ts';
import { ContactService } from './contact.service.ts';

@Module({
  controllers: [ContactController],
  providers: [ContactMessageStore, ContactService],
  exports: [ContactService],
})
export class ContactModule {}
