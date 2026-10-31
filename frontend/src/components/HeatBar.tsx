import type { GrillMode, StreamPhase } from '../lib/types'
import { HeatSwitcher } from './HeatSwitcher'

interface HeatBarProps {
  grillMode: GrillMode
  phase: StreamPhase
  busy: boolean
  modeFlash: number
  onGrillMode: (mode: GrillMode) => void
  onReset: () => void
  onStop: () => void
}

export function HeatBar({
  grillMode,
  busy,
  modeFlash,
  onGrillMode,
  onReset,
  onStop,
}: HeatBarProps) {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <span className="topbar__mark" aria-hidden="true" />
        <p className="topbar__title">Why Not Grill Me?</p>
      </div>

      <div className="topbar__heat">
        <HeatSwitcher
          grillMode={grillMode}
          busy={busy}
          flashKey={modeFlash}
          compact
          onChange={onGrillMode}
        />
      </div>

      <div className="topbar__end">
        {busy ? (
          <button type="button" className="topbar__btn" onClick={onStop}>
            Stop
          </button>
        ) : (
          <button type="button" className="topbar__btn" onClick={onReset}>
            New chat
          </button>
        )}
      </div>
    </header>
  )
}
