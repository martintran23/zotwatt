function IconTwilight({ className }: { className?: string }) {
  return (
    <svg className={className} width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4V2M12 22v-2M4.93 4.93 3.52 3.52M20.48 20.48l-1.41-1.41M2 12H0M24 12h-2M4.93 19.07 3.52 20.48M20.48 3.52l-1.41 1.41"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M6 18h12a4 4 0 0 0 0-8H6a4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/** Bidirectional flow: arrow right (top) + arrow left (bottom), Material sync_alt style. */
function IconSync({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 9h11M16 9l-2.5-2.5M16 9l-2.5 2.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 15H8M8 15l2.5-2.5M8 15l2.5 2.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconBattery({ className }: { className?: string }) {
  return (
    <svg className={className} width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="7" y="6" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M10 4h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M9 11h6M9 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconTrendFlat({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 8l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconGrid({ className }: { className?: string }) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconFactory({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20V10l4 2V10l4 2V8l4 2V20H4z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M9 14v2M14 14v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconSolarPower({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3.5" fill="currentColor" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Outline shield with centered plus (matches “extended lifespan” tile reference). */
function IconShieldPlus({ className }: { className?: string }) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 9v6M9 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Classic lightning zigzag (6 vertices); reads unambiguously as a bolt.
 * Stroked to pair visually with IconShieldPlus; slightly heavier stroke for optical balance on diagonals.
 */
function IconThunderbolt({ className }: { className?: string }) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function WhyItMattersPage() {
  return (
    <div className="wim">
      <section className="wim-hero">
        <div className="wim-hero__row">
          <div className="wim-hero__copy">
            <h1 className="wim-hero__title">
              Energy follows<span className="wim-hero__accent"> the Sun</span>.
            </h1>
            <p className="wim-hero__lede">
              Understanding how your home aligns with the sun isn’t 
              just about saving money; it’s about using energy more efficiently and living more sustainably.
            </p>
          </div>
        </div>
      </section>

      <section className="wim-duck" aria-labelledby="wim-duck-title">
        <div className="wim-duck__grid">
          <div className="wim-duck__copy">
            <h2 id="wim-duck-title" className="wim-h2">
              The Mismatch Paradox
            </h2>
            <p className="wim-prose">
              The &quot;Duck Curve&quot; describes the gap between when the sun provides the most energy (midday) and when
              your home needs it most (evening). By shifting your usage, you &quot;flatten the duck.&quot;
            </p>
            <div className="wim-callout">
              <IconTwilight className="wim-callout__icon" />
              <div>
                <h4 className="wim-callout__title">Peak Demand: 6PM - 9PM</h4>
                <p className="wim-callout__text">
                  This is when the grid is most stressed and energy is most expensive.
                </p>
              </div>
            </div>
          </div>
          <div className="wim-duck__chart-card">
            <div className="wim-duck__chart-glow" aria-hidden />
            <div className="wim-duck__chart-inner">
              <div className="wim-duck__chart-head">
                <span className="wim-duck__chart-kicker">Load vs. solar generation</span>
                <div className="wim-duck__legend">
                  <span className="wim-duck__legend-item">
                    <span className="wim-legend-dot wim-legend-dot--solar" /> Solar
                  </span>
                  <span className="wim-duck__legend-item">
                    <span className="wim-legend-dot wim-legend-dot--usage" /> Usage
                  </span>
                </div>
              </div>
              <div className="wim-duck__bars" role="img" aria-label="Illustration: solar peaks midday, usage peaks evening">
                <div className="wim-duck__bar wim-duck__bar--neutral" style={{ height: '25%' }} />
                <div className="wim-duck__bar wim-duck__bar--neutral" style={{ height: '33%' }} />
                <div className="wim-duck__bar wim-duck__bar--solar" style={{ height: '67%' }} />
                <div className="wim-duck__bar wim-duck__bar--solar" style={{ height: '100%' }} />
                <div className="wim-duck__bar wim-duck__bar--solar" style={{ height: '83%' }} />
                <div className="wim-duck__bar wim-duck__bar--usage" style={{ height: '100%' }} />
                <div className="wim-duck__bar wim-duck__bar--usage" style={{ height: '78%' }} />
              </div>
              <div className="wim-duck__ticks">
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>12 AM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="wim-flow" aria-labelledby="wim-flow-title">
        <div className="wim-flow__intro">
          <h2 id="wim-flow-title" className="wim-flow__title">
            Your Home as a Battery
          </h2>
          <p className="wim-flow__sub">
            Energy shouldn&apos;t just pass through. Here&apos;s how directing the flow can maximize efficiency.
          </p>
        </div>
        <div className="wim-flow__diagram">
          <div className="wim-flow__line" aria-hidden />
          <div className="wim-flow__node wim-flow__node--round">
            <IconHome className="wim-flow__node-icon wim-flow__node-icon--secondary" />
            <span className="wim-flow__node-title">Your Home</span>
            <span className="wim-flow__node-tag">Consumer</span>
          </div>
          <div className="wim-flow__connector wim-flow__connector--amber">
            <IconSync />
          </div>
          <div className="wim-flow__node wim-flow__node--battery">
            <span className="wim-flow__pill">Storage</span>
            <IconBattery className="wim-flow__battery-icon" />
            <span className="wim-flow__node-title wim-flow__node-title--lg">Solar Battery</span>
            <p className="wim-flow__node-note">Buffer during peak spikes</p>
          </div>
          <div className="wim-flow__connector wim-flow__connector--cyan">
            <IconTrendFlat />
          </div>
          <div className="wim-flow__node wim-flow__node--round wim-flow__node--muted">
            <IconGrid className="wim-flow__node-icon wim-flow__node-icon--outline" />
            <span className="wim-flow__node-title">The Utility Grid</span>
            <span className="wim-flow__node-tag">Back-up</span>
          </div>
        </div>
      </section>

      <section className="wim-peaker" aria-labelledby="wim-peaker-title">
        <div className="wim-peaker__grid">
          <div className="wim-peaker__copy">
            <div className="wim-badge wim-badge--impact">Environmental impact</div>
            <h2 id="wim-peaker-title" className="wim-h2 wim-h2--tight">
              Eliminating the <span className="wim-text-danger">Peaker Plants</span>
            </h2>
            <p className="wim-prose">
              When everyone turns on their AC at 6 PM, utilities fire up &quot;Peaker Plants.&quot; These are often the
              oldest, dirtiest fossil fuel plants. Shifting your load even a couple of hours helps avoid that dirty surge.
            </p>
            <div className="wim-compare">
              <div className="wim-compare__row">
                <div className="wim-compare__icon wim-compare__icon--dark">
                  <IconFactory />
                </div>
                <span className="wim-compare__label">Standard grid: fossil-fuel heavy at peak times</span>
              </div>
              <div className="wim-compare__row wim-compare__row--renew">
                <div className="wim-compare__icon wim-compare__icon--amber">
                  <IconSolarPower />
                </div>
                <span className="wim-compare__label">Renewable grid: powered by shared sun and storage</span>
              </div>
            </div>
          </div>
          <div className="wim-peaker__visual">
            <div className="wim-peaker__img-wrap">
              <img
                className="wim-peaker__img"
                src="/peaker-plants.png"
                alt="Rooftop solar panels in sunlight"
                width={640}
                height={400}
                loading="lazy"
                decoding="async"
              />
              <div className="wim-peaker__img-overlay" aria-hidden />
            </div>
            <blockquote className="wim-quote">
              <p>
                &quot;My home reduced hundreds of kilograms of carbon emissions this year just by shifting my dishwasher
                to run when the sun is strongest.&quot;
              </p>
              <footer>Atticus Wong, SolarShift user</footer>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="wim-sweet" aria-labelledby="wim-sweet-title">
        <div className="wim-sweet__card">
          <div className="wim-sweet__blob" aria-hidden />
          <div className="wim-sweet__inner">
            <h2 id="wim-sweet-title" className="wim-h2">
              Battery Health: The &quot;Sweet Spot&quot;
            </h2>
            <p className="wim-sweet__lede">
              Batteries prefer a steady rhythm. Deep cycles every day shorten lifespan. Using high-energy appliances
              while the sun is out preserves your battery for when you truly need it.
            </p>
            <div className="wim-sweet__grid">
              <div className="wim-sweet__tile">
                <IconShieldPlus className="wim-sweet__tile-icon wim-sweet__tile-icon--amber" />
                <h4 className="wim-sweet__tile-title">Extended lifespan</h4>
                <p className="wim-sweet__tile-text">Daytime direct-use can reduce unnecessary cycle wear over time.</p>
              </div>
              <div className="wim-sweet__tile">
                <IconThunderbolt className="wim-sweet__tile-icon wim-sweet__tile-icon--cyan" />
                <h4 className="wim-sweet__tile-title">Cooler operation</h4>
                <p className="wim-sweet__tile-text">Avoiding heavy evening discharge keeps cells cooler and safer.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
