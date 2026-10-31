import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../lib/types'
import { MarkdownBody } from './MarkdownBody'

interface MessageListProps {
  messages: ChatMessage[]
}

export function MessageList({ messages }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <div className="thread" aria-live="polite">
      {messages.map((message) => (
        <article
          key={message.id}
          className={
            message.role === 'user'
              ? 'bubble bubble--user'
              : message.streaming
                ? 'bubble bubble--assistant bubble--streaming'
                : 'bubble bubble--assistant'
          }
        >
          <header className="bubble__who">
            <span>{message.role === 'user' ? 'You' : 'Assistant'}</span>
          </header>

          {message.role === 'assistant' ? (
            <div className="bubble__body">
              <MarkdownBody
                text={message.content}
                streaming={Boolean(message.streaming)}
              />
            </div>
          ) : (
            <div className="bubble__body bubble__body--plain">
              {message.content}
            </div>
          )}
        </article>
      ))}
      <div ref={endRef} />
    </div>
  )
}
