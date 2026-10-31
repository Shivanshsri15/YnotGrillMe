import { readSse } from './sse'
import type {
  ChatRequestBody,
  GrillRequestBody,
  ProjectListItem,
  RabbitHoleSuggestion,
  SessionRecap,
} from './types'

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:3000/api/v1'

export async function fetchStarterSuggestions(): Promise<
  RabbitHoleSuggestion[]
> {
  const response = await fetch(`${API_BASE}/agent/suggestions`)
  if (!response.ok) {
    throw new Error('Failed to load suggestions')
  }
  const json = (await response.json()) as { items: RabbitHoleSuggestion[] }
  return json.items ?? []
}

export async function fetchProjects(): Promise<ProjectListItem[]> {
  const response = await fetch(`${API_BASE}/projects`)
  if (!response.ok) {
    throw new Error('Failed to load projects')
  }
  const json = (await response.json()) as ProjectListItem[] | { items?: ProjectListItem[] }
  return Array.isArray(json) ? json : (json.items ?? [])
}

export async function fetchRecap(conversationId: string): Promise<SessionRecap> {
  const response = await fetch(
    `${API_BASE}/agent/sessions/${conversationId}/recap`,
  )
  if (!response.ok) {
    throw new Error('Failed to load recap')
  }
  return (await response.json()) as SessionRecap
}

export type ChatSseHandler = {
  onMeta?: (data: {
    conversationId: string
    grillMode: string
    audience: string
    depth: string
    projectId?: string
    action?: string
  }) => void
  onLinks?: (data: {
    projectIds?: string[]
    skillIds?: string[]
    storyIds?: string[]
  }) => void
  onToken?: (text: string) => void
  onHighlight?: (data: {
    text: string
    kind: string
    projectId?: string
  }) => void
  onEvidence?: (evidenceIds: string[]) => void
  onSuggestions?: (items: RabbitHoleSuggestion[]) => void
  onError?: (message: string) => void
  onDone?: (finishReason: string) => void
}

async function streamAgent(
  path: string,
  body: ChatRequestBody | GrillRequestBody,
  handlers: ChatSseHandler,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed (${response.status})`)
  }

  for await (const packet of readSse(response)) {
    let parsed: unknown = packet.data
    try {
      parsed = JSON.parse(packet.data)
    } catch {
      // keep raw
    }

    switch (packet.event) {
      case 'meta':
        handlers.onMeta?.(
          parsed as Parameters<NonNullable<ChatSseHandler['onMeta']>>[0],
        )
        break
      case 'links':
        handlers.onLinks?.(
          parsed as Parameters<NonNullable<ChatSseHandler['onLinks']>>[0],
        )
        break
      case 'token':
        handlers.onToken?.(
          (parsed as { text?: string }).text ?? String(parsed),
        )
        break
      case 'highlight':
        handlers.onHighlight?.(
          parsed as Parameters<NonNullable<ChatSseHandler['onHighlight']>>[0],
        )
        break
      case 'evidence':
        handlers.onEvidence?.(
          (parsed as { evidenceIds?: string[] }).evidenceIds ?? [],
        )
        break
      case 'suggestions':
        handlers.onSuggestions?.(
          (parsed as { items?: RabbitHoleSuggestion[] }).items ?? [],
        )
        break
      case 'error':
        handlers.onError?.(
          (parsed as { message?: string }).message ?? 'Chat error',
        )
        break
      case 'done':
        handlers.onDone?.(
          (parsed as { finishReason?: string }).finishReason ?? 'stop',
        )
        break
      default:
        break
    }
  }
}

export function streamChat(
  body: ChatRequestBody,
  handlers: ChatSseHandler,
  signal?: AbortSignal,
) {
  return streamAgent('/agent/chat', body, handlers, signal)
}

export function streamGrill(
  body: GrillRequestBody,
  handlers: ChatSseHandler,
  signal?: AbortSignal,
) {
  return streamAgent('/agent/grill', body, handlers, signal)
}
