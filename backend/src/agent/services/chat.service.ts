import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { GeminiService } from '../../gemini/gemini.service.ts';
import { KnowledgeService } from '../../knowledge/knowledge.service.ts';
import {
  AnswerDepth,
  Audience,
  GrillAction,
  GrillMode,
  ResumeVariant,
  VisitorRole,
} from '../../shared/enums.ts';
import type {
  AnswerHighlight,
  RabbitHoleSuggestion,
  RetrievalResult,
  SessionRecap,
  SseFinishReason,
} from '../interfaces/agent.interfaces.ts';
import { HighlightService } from './highlight.service.ts';
import { PromptBuilder } from './prompt.builder.ts';
import { RabbitHoleService } from './rabbit-hole.service.ts';
import { RetrievalService } from './retrieval.service.ts';
import { SessionStore } from './session.store.ts';

export interface ChatTurnInput {
  /** Required for chat; optional for grill (defaults to a project walkthrough). */
  message?: string;
  conversationId?: string;
  grillMode?: GrillMode;
  depth?: AnswerDepth;
  audience?: Audience;
  visitorRole?: VisitorRole;
  resumeVariant?: ResumeVariant;
  action?: GrillAction;
  projectId?: string;
}

export type ChatSseEvent =
  | {
      event: 'meta';
      data: {
        conversationId: string;
        grillMode: GrillMode;
        audience: Audience;
        depth: AnswerDepth;
        projectId?: string;
        action?: GrillAction;
      };
    }
  | { event: 'token'; data: { text: string } }
  | { event: 'highlight'; data: AnswerHighlight }
  | { event: 'evidence'; data: { evidenceIds: string[] } }
  | {
      event: 'links';
      data: {
        projectIds?: string[];
        skillIds?: string[];
        storyIds?: string[];
      };
    }
  | { event: 'suggestions'; data: { items: RabbitHoleSuggestion[] } }
  | { event: 'done'; data: { finishReason: SseFinishReason } }
  | { event: 'error'; data: { message: string } };

const RECAP_DISCLAIMER =
  'Grounded summary of this conversation only — no invented metrics or undocumented claims.';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly sessions: SessionStore,
    private readonly retrieval: RetrievalService,
    private readonly prompts: PromptBuilder,
    private readonly rabbitHole: RabbitHoleService,
    private readonly gemini: GeminiService,
    private readonly knowledge: KnowledgeService,
    private readonly highlights: HighlightService,
  ) {}

  async *chat(input: ChatTurnInput): AsyncGenerator<ChatSseEvent> {
    const message = input.message?.trim();
    if (!message) {
      yield {
        event: 'error',
        data: { message: 'message is required.' },
      };
      yield { event: 'done', data: { finishReason: 'error' } };
      return;
    }
    yield* this.runTurn({ ...input, message });
  }

  async *grill(input: ChatTurnInput): AsyncGenerator<ChatSseEvent> {
    if (!input.projectId) {
      yield {
        event: 'error',
        data: { message: 'projectId is required for Project Drill.' },
      };
      yield { event: 'done', data: { finishReason: 'error' } };
      return;
    }

    const project = this.knowledge
      .getPublicProjects()
      .find((item) => item.id === input.projectId);
    if (!project) {
      yield {
        event: 'error',
        data: { message: `Project "${input.projectId}" was not found.` },
      };
      yield { event: 'done', data: { finishReason: 'error' } };
      return;
    }

    const message =
      input.message?.trim() ||
      `Walk me through ${project.title}: problem, what I built, and the main trade-off.`;

    yield* this.runTurn({
      ...input,
      message,
      depth: input.depth ?? AnswerDepth.Deep,
      projectId: project.id,
    });
  }

  getRecap(conversationId: string): SessionRecap {
    const session = this.sessions.get(conversationId);
    if (!session) {
      throw new NotFoundException(`Session "${conversationId}" not found`);
    }

    const themes = session.messages
      .filter((message) => message.role === 'user')
      .map((message) => this.themeFrom(message.content))
      .filter(Boolean);

    const retrievalStub: RetrievalResult = {
      chunks: [],
      projectIds: session.mentionedProjectIds,
      skillIds: session.mentionedSkillIds,
      storyIds: [],
      evidenceIds: session.mentionedEvidenceIds,
    };

    return {
      conversationId: session.id,
      grillMode: session.grillMode,
      audience: session.audience,
      turnCount: Math.floor(session.messages.length / 2),
      themes,
      projectIds: session.mentionedProjectIds,
      skillIds: session.mentionedSkillIds,
      evidenceIds: session.mentionedEvidenceIds,
      highlights: session.highlights,
      actionsUsed: session.actionsUsed,
      lastProjectId: session.lastProjectId,
      suggestedNext: this.rabbitHole.build(
        retrievalStub,
        session.mentionedEvidenceIds,
        { depth: AnswerDepth.Deep },
      ),
      disclaimer: RECAP_DISCLAIMER,
    };
  }

  getStarterSuggestions(): RabbitHoleSuggestion[] {
    return this.rabbitHole.starterQuestions();
  }

  extractAndValidateEvidenceIds(
    text: string,
    retrieval: RetrievalResult,
  ): string[] {
    const allowed = new Set([
      ...this.knowledge.getPublicEvidenceIds(),
      ...retrieval.evidenceIds,
    ]);

    const fromTrailer = this.parseEvidenceTrailer(text);
    const fromBody = [...text.matchAll(/\b([a-z0-9]+(?:-[a-z0-9]+)+)\b/gi)]
      .map((match) => match[1])
      .filter((id) => allowed.has(id));

    const candidates = [...fromTrailer, ...fromBody];
    return [...new Set(candidates.filter((id) => allowed.has(id)))];
  }

  private async *runTurn(
    input: ChatTurnInput & { message: string },
  ): AsyncGenerator<ChatSseEvent> {
    const grillMode = input.grillMode ?? GrillMode.WarmUp;
    const audience = input.audience ?? Audience.Recruiter;
    const depth = this.resolveDepth(input.depth, grillMode);
    const session = this.sessions.getOrCreate(
      input.conversationId,
      grillMode,
      audience,
    );

    yield {
      event: 'meta',
      data: {
        conversationId: session.id,
        grillMode,
        audience,
        depth,
        projectId: input.projectId,
        action: input.action,
      },
    };

    if (!this.gemini.isConfigured()) {
      yield {
        event: 'error',
        data: {
          message:
            'AI chat is temporarily unavailable. Gemini API keys are not configured.',
        },
      };
      yield { event: 'done', data: { finishReason: 'unavailable' } };
      return;
    }

    const retrieval = this.retrieval.retrieve({
      query: input.message,
      grillMode,
      audience,
      visitorRole: input.visitorRole,
      resumeVariant: input.resumeVariant,
      projectId: input.projectId,
      action: input.action,
    });

    yield {
      event: 'links',
      data: {
        projectIds: retrieval.projectIds,
        skillIds: retrieval.skillIds,
        storyIds: retrieval.storyIds,
      },
    };

    const profile = this.knowledge.getProfile();
    const prompt = this.prompts.build({
      message: input.message,
      history: session.messages,
      retrieval,
      grillMode,
      audience,
      depth,
      profileName: profile?.name,
      action: input.action,
      projectId: input.projectId,
    });

    let assistantText = '';

    try {
      for await (const delta of this.gemini.streamGenerateText({
        system: prompt.system,
        history: prompt.history,
        userMessage: prompt.userMessage,
        maxOutputTokens: this.prompts.maxOutputTokensFor(
          depth,
          input.message,
          grillMode,
        ),
      })) {
        assistantText += delta;
        yield { event: 'token', data: { text: delta } };
      }
    } catch (error) {
      this.logger.error('Chat stream failed', error);
      yield {
        event: 'error',
        data: {
          message:
            'The AI service failed while generating a response. Please try again shortly.',
        },
      };
      yield { event: 'done', data: { finishReason: 'error' } };
      return;
    }

    const evidenceIds = this.extractAndValidateEvidenceIds(
      assistantText,
      retrieval,
    );
    const answer = this.stripEvidenceTrailer(assistantText);

    const highlightItems = this.highlights.extract(retrieval);
    for (const highlight of highlightItems) {
      yield { event: 'highlight', data: highlight };
    }

    yield { event: 'evidence', data: { evidenceIds } };

    const suggestions = this.rabbitHole.build(retrieval, evidenceIds, {
      depth,
    });
    yield { event: 'suggestions', data: { items: suggestions } };

    this.sessions.appendTurn(session.id, input.message, answer, {
      evidenceIds,
      projectIds: retrieval.projectIds,
      skillIds: retrieval.skillIds,
      highlights: highlightItems,
      action: input.action,
      lastProjectId: input.projectId,
    });

    yield { event: 'done', data: { finishReason: 'stop' } };
  }

  /** Explicit depth wins; otherwise warm_up stays on the hook chain. */
  private resolveDepth(
    explicit: AnswerDepth | undefined,
    grillMode: GrillMode,
  ): AnswerDepth {
    if (explicit) {
      return explicit;
    }
    return grillMode === GrillMode.WarmUp
      ? AnswerDepth.Hook
      : AnswerDepth.Deep;
  }

  private themeFrom(content: string): string {
    const compact = content.replace(/\s+/g, ' ').trim();
    if (!compact) return '';
    return compact.length > 80 ? `${compact.slice(0, 79)}…` : compact;
  }

  private parseEvidenceTrailer(text: string): string[] {
    const match = text.match(/Evidence:\s*([^\n]+)\s*$/i);
    if (!match) {
      return [];
    }
    return match[1]
      .split(/[, ]+/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  private stripEvidenceTrailer(text: string): string {
    return text.replace(/\n?Evidence:\s*[^\n]+\s*$/i, '').trim();
  }
}
