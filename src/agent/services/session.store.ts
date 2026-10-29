import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Audience, GrillAction, GrillMode } from '../../shared/enums.ts';
import {
  AGENT_MAX_HISTORY_MESSAGES,
  AGENT_SESSION_TTL_MS,
} from '../constants/agent.constants.ts';
import type {
  AgentSession,
  AnswerHighlight,
  ChatMessage,
} from '../interfaces/agent.interfaces.ts';

export interface AppendTurnMeta {
  evidenceIds?: string[];
  projectIds?: string[];
  skillIds?: string[];
  highlights?: AnswerHighlight[];
  action?: GrillAction;
  lastProjectId?: string;
}

@Injectable()
export class SessionStore {
  private readonly sessions = new Map<string, AgentSession>();

  getOrCreate(
    conversationId: string | undefined,
    grillMode: GrillMode,
    audience: Audience,
  ): AgentSession {
    this.cleanupExpired();

    if (conversationId) {
      const existing = this.sessions.get(conversationId);
      if (existing && !this.isExpired(existing)) {
        existing.lastActiveAt = Date.now();
        existing.grillMode = grillMode;
        existing.audience = audience;
        return existing;
      }
    }

    const session: AgentSession = {
      id:
        conversationId && !this.sessions.has(conversationId)
          ? conversationId
          : randomUUID(),
      messages: [],
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      grillMode,
      audience,
      mentionedEvidenceIds: [],
      mentionedProjectIds: [],
      mentionedSkillIds: [],
      actionsUsed: [],
      highlights: [],
    };
    this.sessions.set(session.id, session);
    return session;
  }

  get(conversationId: string): AgentSession | undefined {
    this.cleanupExpired();
    const session = this.sessions.get(conversationId);
    if (!session || this.isExpired(session)) {
      if (session) {
        this.sessions.delete(conversationId);
      }
      return undefined;
    }
    return session;
  }

  appendTurn(
    conversationId: string,
    userMessage: string,
    assistantMessage: string,
    meta?: AppendTurnMeta,
  ): void {
    const session = this.get(conversationId);
    if (!session) {
      return;
    }

    session.messages.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantMessage },
    );

    if (session.messages.length > AGENT_MAX_HISTORY_MESSAGES) {
      session.messages = session.messages.slice(-AGENT_MAX_HISTORY_MESSAGES);
    }

    if (meta?.evidenceIds?.length) {
      session.mentionedEvidenceIds = [
        ...new Set([...session.mentionedEvidenceIds, ...meta.evidenceIds]),
      ];
    }
    if (meta?.projectIds?.length) {
      session.mentionedProjectIds = [
        ...new Set([...session.mentionedProjectIds, ...meta.projectIds]),
      ];
    }
    if (meta?.skillIds?.length) {
      session.mentionedSkillIds = [
        ...new Set([...session.mentionedSkillIds, ...meta.skillIds]),
      ];
    }
    if (meta?.highlights?.length) {
      const merged = [...session.highlights, ...meta.highlights];
      const seen = new Set<string>();
      session.highlights = merged.filter((item) => {
        const key = `${item.kind}:${item.text.toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(-20);
    }
    if (meta?.action) {
      session.actionsUsed = [...new Set([...session.actionsUsed, meta.action])];
    }
    if (meta?.lastProjectId) {
      session.lastProjectId = meta.lastProjectId;
    }

    session.lastActiveAt = Date.now();
  }

  getHistory(conversationId: string): ChatMessage[] {
    return this.get(conversationId)?.messages ?? [];
  }

  /** Test helper */
  clear(): void {
    this.sessions.clear();
  }

  /** Test helper */
  size(): number {
    return this.sessions.size;
  }

  private isExpired(session: AgentSession): boolean {
    return Date.now() - session.lastActiveAt > AGENT_SESSION_TTL_MS;
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now - session.lastActiveAt > AGENT_SESSION_TTL_MS) {
        this.sessions.delete(id);
      }
    }
  }
}
