import { DONENESS, type DonenessId } from '../data/landing'

interface DonenessControlProps {
  value: DonenessId
  onChange: (id: DonenessId) => void
}

export function DonenessControl({ value, onChange }: DonenessControlProps) {
  const active = DONENESS.find((item) => item.id === value) ?? DONENESS[0]

  return (
    <div className="doneness">
      <div className="doneness__meta">
        <span className="doneness__kicker">Heat</span>
        <span className="doneness__value">{active.label}</span>
      </div>

      <div
        className="doneness__rail"
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={active.heat}
        aria-valuetext={active.label}
        aria-label="Grill doneness"
      >
        <div
          className="doneness__fill"
          style={{ width: `${active.heat}%` }}
        />
      </div>

      <div className="doneness__options" role="radiogroup" aria-label="Doneness">
        {DONENESS.map((option) => {
          const selected = option.id === value
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={
                selected
                  ? 'doneness__option doneness__option--on'
                  : 'doneness__option'
              }
              onClick={() => onChange(option.id)}
            >
              <span className="doneness__option-label">{option.label}</span>
              <span className="doneness__option-blurb">{option.blurb}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
