export type GrillMode = 'warm_up' | 'medium_rare' | 'well_done'
export type AnswerDepth = 'hook' | 'deep'
export type Audience = 'recruiter' | 'junior' | 'senior'
export type VisitorRole = 'hiring' | 'engineer' | 'exploring'
export type GrillAction =
  | 'go_deeper'
  | 'explain_simply'
  | 'what_could_go_wrong'
  | 'challenge_this'
  | 'show_receipts'

export type StreamPhase =
  | 'idle'
  | 'lighting'
  | 'linking'
  | 'searing'
  | 'plating'
  | 'done'
  | 'error'

export type SuggestionAction =
  | { kind: 'ask'; message: string; depth?: AnswerDepth }
  | { kind: 'open_project'; id: string }
  | { kind: 'open_evidence'; id: string }
  | { kind: 'open_skill'; id: string }
  | { kind: 'open_story'; id: string }

export interface RabbitHoleSuggestion {
  type: string
  label: string
  action: SuggestionAction
}

export interface AnswerHighlight {
  text: string
  kind: 'claim' | 'stack' | 'outcome' | 'tradeoff'
  projectId?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  highlights?: AnswerHighlight[]
  suggestions?: RabbitHoleSuggestion[]
  evidenceIds?: string[]
  projectIds?: string[]
  skillIds?: string[]
  streaming?: boolean
  phase?: StreamPhase
  error?: string
}

export interface ChatRequestBody {
  message: string
  conversationId?: string
  grillMode?: GrillMode
  depth?: AnswerDepth
  audience?: Audience
  visitorRole?: VisitorRole
  action?: GrillAction
}

export interface GrillRequestBody extends ChatRequestBody {
  projectId: string
}

export interface ProjectListItem {
  id: string
  title: string
  summary: string
  stack: string[]
  pillar?: string
}

export interface SessionRecap {
  conversationId: string
  grillMode: GrillMode
  audience: Audience
  turnCount: number
  themes: string[]
  projectIds: string[]
  skillIds: string[]
  evidenceIds: string[]
  highlights: AnswerHighlight[]
  actionsUsed: GrillAction[]
  lastProjectId?: string
  suggestedNext: RabbitHoleSuggestion[]
  disclaimer: string
}

export const GRILL_ACTIONS: Array<{ id: GrillAction; label: string }> = [
  { id: 'go_deeper', label: 'Go deeper' },
  { id: 'explain_simply', label: 'Explain simply' },
  { id: 'what_could_go_wrong', label: 'What could go wrong' },
  { id: 'challenge_this', label: 'Challenge this' },
  { id: 'show_receipts', label: 'Show receipts' },
]

export const PHASE_LABEL: Record<StreamPhase, string> = {
  idle: 'Idle',
  lighting: 'Lighting the grill…',
  linking: 'Pulling context…',
  searing: 'Searing answer…',
  plating: 'Plating highlights…',
  done: 'Ready',
  error: 'Flame out',
}
