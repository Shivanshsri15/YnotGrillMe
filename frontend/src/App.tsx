import { useState } from 'react'
import './App.css'
import { DonenessControl } from './components/DonenessControl'
import { GrillPreview } from './components/GrillPreview'
import {
  LEAVE_WITH,
  PROJECTS,
  type DonenessId,
} from './data/landing'

export default function App() {
  const [doneness, setDoneness] = useState<DonenessId>('warm_up')

  return (
    <div className="stage">
      <div className="stage__ambient" aria-hidden="true">
        <div className="stage__heat" />
        <div className="stage__grate">
          <div className="stage__grate-bed" />
        </div>
        <div className="stage__grain" />
      </div>

      {/* First viewport: brand + product preview fill the width */}
      <header className="hero">
        <div className="hero__copy">
          <p className="hero__eyebrow">Interactive engineering portfolio</p>
          <h1 className="hero__brand">
            Why Not
            <br />
            <em>Grill Me?</em>
          </h1>
          <p className="hero__line">
            Put the engineer on the grate. Turn up the heat. Leave with
            receipts.
          </p>
          <div className="hero__cta">
            <button type="button" className="btn-sear">
              Throw me on the grill
            </button>
            <a className="link-quiet" href="#heat">
              Set doneness
            </a>
          </div>
        </div>

        <div className="hero__stage">
          <GrillPreview />
        </div>
      </header>

      <section className="band band--tight band--coal" id="heat">
        <div className="band__split">
          <div className="band__head band__head--compact">
            <p className="band__kicker">The grill</p>
            <h2 className="band__title">Doneness is the depth control</h2>
            <p className="band__line">
              Warm-up for the map. Medium rare for design choices. Well done
              for failure modes and honest limits.
            </p>
          </div>
          <DonenessControl value={doneness} onChange={setDoneness} />
        </div>
      </section>

      <section className="band band--tight band--coal" id="projects">
        <div className="band__head band__head--row">
          <div>
            <p className="band__kicker">Work on the grill</p>
            <h2 className="band__title">Pick a cut. Drill in.</h2>
          </div>
          <p className="band__line">
            AI → backend → platform. Follow the narrative, or jump to the
            trade-off.
          </p>
        </div>
        <div className="projects">
          {PROJECTS.map((project) => (
            <a
              key={project.id}
              className="project"
              href={`#grill-${project.id}`}
            >
              <span className="project__tag">{project.tag}</span>
              <div className="project__body">
                <h3 className="project__title">{project.title}</h3>
                <p className="project__line">{project.line}</p>
              </div>
              <span className="project__go">Grill →</span>
            </a>
          ))}
        </div>
      </section>

      <section className="band band--tight" id="leave">
        <div className="band__head band__head--row">
          <div>
            <p className="band__kicker">After the sear</p>
            <h2 className="band__title">Leave with more than a vibe</h2>
          </div>
        </div>
        <div className="leave">
          {LEAVE_WITH.map((item) => (
            <article key={item.title} className="leave__item">
              <h3 className="leave__title">{item.title}</h3>
              <p className="leave__line">{item.line}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="finale">
        <div className="finale__inner">
          <h2 className="finale__brand">
            Still hungry?
            <br />
            Why not grill me?
          </h2>
          <div className="finale__actions">
            <p className="finale__line">
              Start a session. Challenge a claim. Ask for the receipts.
            </p>
            <button type="button" className="btn-sear">
              Start grilling
            </button>
            <p className="finale__note">Shivansh · Backend / AI systems</p>
          </div>
        </div>
      </section>
    </div>
  )
}
