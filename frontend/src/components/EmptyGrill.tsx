interface EmptyGrillProps {
  bootError?: string
}

export function EmptyGrill({ bootError }: EmptyGrillProps) {
  return (
    <div className="empty">
      <h1 className="empty__title">Why Not Grill Me?</h1>
      <p className="empty__line">Ask about the work, the stack, or a trade-off.</p>
      {bootError ? <p className="empty__error">{bootError}</p> : null}
    </div>
  )
}
