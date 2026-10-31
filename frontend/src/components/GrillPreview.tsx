import { SAMPLE_TURNS } from '../data/landing'

export function GrillPreview() {
  return (
    <div className="preview">
      <div className="preview__bar">
        <span className="preview__dot" />
        <span className="preview__mode">warm_up · recruiter</span>
        <span className="preview__live">live</span>
      </div>

      <div className="preview__stream">
        {SAMPLE_TURNS.map((turn) => (
          <div
            key={turn.text}
            className={
              turn.role === 'you'
                ? 'preview__turn preview__turn--you'
                : 'preview__turn preview__turn--eng'
            }
          >
            <span className="preview__who">
              {turn.role === 'you' ? 'You' : 'Engineer'}
            </span>
            <p className="preview__text">{turn.text}</p>
          </div>
        ))}

        <div className="preview__highlights" aria-label="Highlights">
          <span className="chip">stack · NestJS / MongoDB</span>
          <span className="chip">tradeoff · deterministic vs LLM</span>
          <span className="chip chip--receipt">evidence · ready</span>
        </div>

        <div className="preview__suggestions">
          <button type="button" className="suggest">
            When should an LLM not own the numbers?
          </button>
          <button type="button" className="suggest">
            Why five servers needed one status engine?
          </button>
        </div>
      </div>
    </div>
  )
}
