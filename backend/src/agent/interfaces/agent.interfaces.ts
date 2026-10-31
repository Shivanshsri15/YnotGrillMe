import type {
  AnswerDepth,
  Audience,
  GrillAction,
  GrillMode,
  ResumeVariant,
  VisitorRole,
} from '../../shared/enums.ts';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type HighlightKind = 'claim' | 'stack' | 'outcome' | 'tradeoff';

export interface AnswerHighlight {
  text: string;
  kind: HighlightKind;
  projectId?: string;
}

export interface AgentSession {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  lastActiveAt: number;
  grillMode: GrillMode;
  audience: Audience;
  mentionedEvidenceIds: string[];
  mentionedProjectIds: string[];
  mentionedSkillIds: string[];
  actionsUsed: GrillAction[];
  highlights: AnswerHighlight[];
  lastProjectId?: string;
}

export interface RetrievalChunk {
  id: string;
  sourceType: 'profile' | 'experience' | 'project' | 'skill' | 'story' | 'evidence' | 'resume';
  title: string;
  text: string;
  score: number;
}

export interface RetrievalResult {
  chunks: RetrievalChunk[];
  projectIds: string[];
  skillIds: string[];
  storyIds: string[];
  evidenceIds: string[];
}

export interface RetrievalOptions {
  query: string;
  grillMode: GrillMode;
  audience: Audience;
  visitorRole?: VisitorRole;
  resumeVariant?: ResumeVariant;
  /** Force-pin a project (+ linked stories/evidence) for Project Drill. */
  projectId?: string;
  /** Bias retrieval/prompt for a grill follow-up action. */
  action?: GrillAction;
}

export interface SessionRecap {
  conversationId: string;
  grillMode: GrillMode;
  audience: Audience;
  turnCount: number;
  themes: string[];
  projectIds: string[];
  skillIds: string[];
  evidenceIds: string[];
  highlights: AnswerHighlight[];
  actionsUsed: GrillAction[];
  lastProjectId?: string;
  suggestedNext: RabbitHoleSuggestion[];
  disclaimer: string;
}

export type SuggestionType =
  | 'project'
  | 'evidence'
  | 'skill'
  | 'story'
  | 'question';

export type SuggestionAction =
  | { kind: 'open_project'; id: string }
  | { kind: 'open_evidence'; id: string }
  | { kind: 'open_skill'; id: string }
  | { kind: 'open_story'; id: string }
  | {
      kind: 'ask';
      message: string;
      /** Client should send this as chat `depth` on click. */
      depth?: AnswerDepth;
    };

export interface RabbitHoleSuggestion {
  type: SuggestionType;
  /** Short teaser shown as a clickable chip / card. */
  label: string;
  action: SuggestionAction;
}

export type SseFinishReason = 'stop' | 'error' | 'unavailable';

export interface PromptBundle {
  system: string;
  userMessage: string;
  history: ChatMessage[];
}
