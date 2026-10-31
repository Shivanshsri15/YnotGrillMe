import { AnimatePresence, motion } from 'motion/react'
import { HEAT_MODES } from '../lib/modes'
import type { GrillMode } from '../lib/types'

interface HeatSwitcherProps {
  grillMode: GrillMode
  busy?: boolean
  flashKey?: number
  compact?: boolean
  onChange: (mode: GrillMode) => void
}

export function HeatSwitcher({
  grillMode,
  busy,
  flashKey = 0,
  compact,
  onChange,
}: HeatSwitcherProps) {
  const active = HEAT_MODES.find((m) => m.id === grillMode) ?? HEAT_MODES[0]

  return (
    <div className={compact ? 'heat heat--compact' : 'heat'}>
      {!compact ? (
        <div className="heat__label">
          <span className="heat__eyebrow">Heat</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={`${grillMode}-${flashKey}`}
              className="heat__active"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {active.label}
              <em> · {active.hint}</em>
            </motion.span>
          </AnimatePresence>
        </div>
      ) : null}

      <div className="heat__track" role="group" aria-label="Heat level">
        {HEAT_MODES.map((mode) => {
          const on = grillMode === mode.id
          return (
            <button
              key={mode.id}
              type="button"
              className={on ? 'heat__btn heat__btn--on' : 'heat__btn'}
              disabled={busy}
              aria-pressed={on}
              title={mode.hint}
              onClick={() => onChange(mode.id)}
            >
              <span className="heat__dots" aria-hidden="true">
                {Array.from({ length: 3 }, (_, i) => (
                  <i
                    key={i}
                    className={
                      i < mode.heat ? 'heat__dot heat__dot--lit' : 'heat__dot'
                    }
                  />
                ))}
              </span>
              <span className="heat__name">{mode.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
