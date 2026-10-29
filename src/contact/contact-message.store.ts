import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { CONTACT_MAX_STORED_MESSAGES } from './constants/contact.constants.ts';

export interface StoredContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  company?: string;
  receivedAt: string;
}

@Injectable()
export class ContactMessageStore {
  private readonly logger = new Logger(ContactMessageStore.name);
  private readonly messages: StoredContactMessage[] = [];

  constructor(private readonly config: ConfigService) {}

  add(
    input: Omit<StoredContactMessage, 'id' | 'receivedAt'>,
  ): StoredContactMessage {
    const entry: StoredContactMessage = {
      ...input,
      id: randomUUID(),
      receivedAt: new Date().toISOString(),
    };
    this.messages.push(entry);
    if (this.messages.length > CONTACT_MAX_STORED_MESSAGES) {
      this.messages.splice(0, this.messages.length - CONTACT_MAX_STORED_MESSAGES);
    }
    this.persist(entry);
    return entry;
  }

  /** Test helper */
  clear(): void {
    this.messages.length = 0;
  }

  /** Test helper */
  list(): StoredContactMessage[] {
    return [...this.messages];
  }

  private persist(entry: StoredContactMessage): void {
    const dir = this.config.get<string>('contact.messageDir');
    if (!dir) return;
    try {
      const filePath = join(dir, 'messages.jsonl');
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      appendFileSync(filePath, `${JSON.stringify(entry)}\n`, 'utf8');
    } catch (error) {
      this.logger.warn(`Failed to persist contact message: ${String(error)}`);
    }
  }
}
