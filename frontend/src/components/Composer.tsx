import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'

interface ComposerProps {
  busy: boolean
  autoFocus?: boolean
  onSend: (message: string) => void
  onStop: () => void
}

export function Composer({ busy, autoFocus, onSend, onStop }: ComposerProps) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    if (!busy) inputRef.current?.focus()
  }, [busy])

  const submit = () => {
    const next = value.trim()
    if (!next || busy) return
    onSend(next)
    setValue('')
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (busy) {
      onStop()
      return
    }
    submit()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (busy) onStop()
      else submit()
    }
  }

  return (
    <form
      className={focused ? 'composer composer--focus' : 'composer'}
      onSubmit={onSubmit}
    >
      <textarea
        ref={inputRef}
        className="composer__input"
        rows={1}
        value={value}
        placeholder="Message…"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {busy ? (
        <button type="submit" className="composer__send composer__send--stop">
          Stop
        </button>
      ) : (
        <button
          type="submit"
          className="composer__send"
          disabled={!value.trim()}
        >
          Send
        </button>
      )}
    </form>
  )
}
