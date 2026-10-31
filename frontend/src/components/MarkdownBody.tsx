import Markdown from 'react-markdown'

interface MarkdownBodyProps {
  text: string
  streaming?: boolean
}

export function MarkdownBody({ text, streaming }: MarkdownBodyProps) {
  return (
    <div className={streaming ? 'md md--streaming' : 'md'}>
      <Markdown
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {text || ' '}
      </Markdown>
      {streaming ? <span className="caret" aria-hidden="true" /> : null}
    </div>
  )
}
