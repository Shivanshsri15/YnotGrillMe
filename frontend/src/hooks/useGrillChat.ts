import { useCallback, useEffect, useRef, useState } from 'react'
import { streamChat, type ChatSseHandler } from '../lib/api'
import type {
  AnswerDepth,
  Audience,
  ChatMessage,
  GrillMode,
  StreamPhase,
  VisitorRole,
} from '../lib/types'

function id() {
  return crypto.randomUUID()
}

export function useGrillChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversationId, setConversationId] = useState<string>()
  const [grillMode, setGrillMode] = useState<GrillMode>('warm_up')
  const [audience, setAudience] = useState<Audience>('recruiter')
  const [visitorRole, setVisitorRole] = useState<VisitorRole>('exploring')
  const [busy, setBusy] = useState(false)
  const [phase, setPhase] = useState<StreamPhase>('idle')
  const [bootError, setBootError] = useState<string>()
  const [modeFlash, setModeFlash] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const base =
      import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ||
      'http://localhost:3000/api/v1'
    fetch(`${base}/agent/modes`)
      .then((res) => {
        if (!res.ok) throw new Error('bad')
      })
      .catch(() => {
        setBootError('Could not reach the grill API. Is the backend running?')
      })
  }, [])

  const changeGrillMode = useCallback((mode: GrillMode) => {
    setGrillMode(mode)
    setModeFlash((n) => n + 1)
  }, [])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setBusy(false)
    setPhase('idle')
    setMessages((prev) =>
      prev.map((item) =>
        item.streaming
          ? { ...item, streaming: false, phase: 'done' as const }
          : item,
      ),
    )
  }, [])

  const send = useCallback(
    async (raw: string, depth?: AnswerDepth) => {
      const message = raw.trim()
      if (!message || busy) return

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      const userMsg: ChatMessage = { id: id(), role: 'user', content: message }
      const assistantId = id()

      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          streaming: true,
          phase: 'lighting',
        },
      ])
      setBusy(true)
      setPhase('lighting')

      const handlers: ChatSseHandler = {
        onMeta: (meta) => {
          setConversationId(meta.conversationId)
          setPhase('linking')
          setMessages((prev) =>
            prev.map((item) =>
              item.id === assistantId ? { ...item, phase: 'linking' } : item,
            ),
          )
        },
        onLinks: () => {
          setPhase('linking')
        },
        onToken: (text) => {
          setPhase('searing')
          setMessages((prev) =>
            prev.map((item) =>
              item.id === assistantId
                ? {
                    ...item,
                    content: item.content + text,
                    phase: 'searing',
                  }
                : item,
            ),
          )
        },
        onHighlight: () => {
          setPhase('plating')
        },
        onError: (errMessage) => {
          setPhase('error')
          setMessages((prev) =>
            prev.map((item) =>
              item.id === assistantId
                ? {
                    ...item,
                    error: errMessage,
                    content: item.content || errMessage,
                    streaming: false,
                    phase: 'error',
                  }
                : item,
            ),
          )
        },
        onDone: () => {
          setPhase('done')
          setMessages((prev) =>
            prev.map((item) =>
              item.id === assistantId
                ? { ...item, streaming: false, phase: 'done' }
                : item,
            ),
          )
        },
      }

      try {
        await streamChat(
          {
            message,
            conversationId,
            grillMode,
            audience,
            visitorRole: visitorRole ?? undefined,
            depth,
          },
          handlers,
          controller.signal,
        )
      } catch (error) {
        if ((error as Error).name === 'AbortError') return
        const errMessage =
          error instanceof Error ? error.message : 'Chat request failed'
        setPhase('error')
        setMessages((prev) =>
          prev.map((item) =>
            item.id === assistantId
              ? {
                  ...item,
                  error: errMessage,
                  content: item.content || errMessage,
                  streaming: false,
                  phase: 'error',
                }
              : item,
          ),
        )
      } finally {
        setBusy(false)
        setPhase((current) => (current === 'error' ? current : 'idle'))
      }
    },
    [audience, busy, conversationId, grillMode, visitorRole],
  )

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setConversationId(undefined)
    setBusy(false)
    setPhase('idle')
  }, [])

  return {
    messages,
    conversationId,
    grillMode,
    setGrillMode: changeGrillMode,
    audience,
    setAudience,
    visitorRole,
    setVisitorRole,
    busy,
    phase,
    bootError,
    modeFlash,
    send,
    stop,
    reset,
  }
}
