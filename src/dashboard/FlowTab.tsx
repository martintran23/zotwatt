import type { HourEstimate } from '../lib/solarModel'

type Props = {
  hours: HourEstimate[]
  timeZone: string
  peakLabel: string
}

function formatHour(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    hour: 'numeric',
  }).format(new Date(iso))
}

function KwReading({ kw }: { kw: number }) {
  return (
    <div className="zw-kw-line">
      <span className="zw-kw-num">{kw.toFixed(1)}</span>
      <span className="zw-kw-unit">kW</span>
    </div>
  )
}

function IconSolarSmall() {
  return (
    <svg className="zw-flow-glyph zw-flow-glyph--solar" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="7" r="3.25" fill="#5c4033" />
      <path d="M5 19h14v1.5H5V19zm0-2h14v1H5v-1z" fill="#5c4033" />
      <path d="M7 15h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" fill="#5c4033" opacity="0.85" />
    </svg>
  )
}

function IconHomeSmall() {
  return (
    <svg className="zw-flow-glyph zw-flow-glyph--home" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" fill="#2f5f9e" />
    </svg>
  )
}

function IconBatterySmall() {
  return (
    <svg className="zw-flow-glyph zw-flow-glyph--battery" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="7" width="13" height="10" rx="2" stroke="#2d8a54" strokeWidth="1.75" fill="#e8f5ef" />
      <path d="M18 10v4" stroke="#2d8a54" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M9.5 12.5 11 11l2.5 3.5"
        stroke="#2d8a54"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconPlugCircle() {
  return (
    <svg className="zw-grid-bar-plug-svg" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#ddd9d4" stroke="#cfcac4" strokeWidth="1" />
      <path
        d="M9 10v4M15 10v4M9 12h6M11 14v3a1 1 0 0 0 1 1h0a1 1 0 0 0 1-1v-3"
        stroke="#6b6560"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function FlowTab({ hours, timeZone, peakLabel }: Props) {
  const maxKw = hours.length ? Math.max(...hours.map((h) => h.estimatedKw), 0.01) : 0
  const homeKw = Math.min(Math.max(0.6, maxKw * 0.22), 3)
  const batteryKw = Math.max(0, maxKw - homeKw - 0.08)
  const net = maxKw - homeKw - batteryKw
  const demoSocPct = Math.min(97, Math.max(52, Math.round(68 + batteryKw * 5.5 - homeKw * 2)))

  const avgCloud =
    hours.length > 0
      ? Math.round(
          hours.reduce((s, h) => s + (typeof h.cloudPct === 'number' ? h.cloudPct : 50), 0) / hours.length,
        )
      : 0

  const tempNow = hours.find((h) => typeof h.tempC === 'number')?.tempC ?? null
  const sky = avgCloud < 35 ? 'Sunny' : avgCloud < 65 ? 'Partly cloudy' : 'Cloudy'

  const daylight = hours.filter((h) => h.estimatedKw > 0.02)
  const sample: HourEstimate[] = []
  const src = daylight.length ? daylight : hours
  const step = Math.max(1, Math.floor(src.length / 7))
  for (let i = 0; i < src.length && sample.length < 7; i += step) sample.push(src[i])
  const peakIdx = sample.reduce((bi, h, i, arr) => (h.estimatedKw > arr[bi].estimatedKw ? i : bi), 0)

  const co2Saved = Math.max(1, Math.round(maxKw * 12))
  /** Rough equivalency for display (~23 kg CO₂ per tree). */
  const treesPlanted = co2Saved / 23.33

  return (
    <>
      <div className="zw-section-title zw-flow-head">
        <span className="zw-flow-head-title">Flow</span>
        <span className="zw-pill zw-pill--live">● Live</span>
      </div>

      <div className="zw-flow-stack">
        <div className="zw-flow-row">
          <article className="zw-card-solar zw-card-solar--tile">
            <div className="zw-card-solar-row">
              <IconSolarSmall />
              <span className="zw-card-solar-title">Solar panels</span>
            </div>
            <div className="zw-card-solar-kw zw-card-solar-kw--split">
              <KwReading kw={maxKw} />
            </div>
            <p className="zw-card-solar-peak">Modeled peak today ({peakLabel})</p>
          </article>

          <article className="zw-card-mini zw-card-mini--tile">
            <div className="zw-card-mini-row">
              <IconHomeSmall />
            </div>
            <div className="zw-card-mini-title">Home usage</div>
            <div className="zw-card-mini-value-block">
              <KwReading kw={homeKw} />
            </div>
          </article>

          <article className="zw-card-mini zw-card-mini--tile zw-card-mini--pw">
            <div className="zw-card-mini-row zw-card-mini-row--split">
              <IconBatterySmall />
              <span className="zw-card-mini-soc">{demoSocPct}%</span>
            </div>
            <div className="zw-card-mini-title">Powerwall</div>
            <div className="zw-card-mini-value-block">
              <KwReading kw={batteryKw} />
            </div>
          </article>
        </div>

        <div className="zw-grid-bar">
          <div className="zw-grid-bar-plug" aria-hidden>
            <IconPlugCircle />
          </div>
          <div className="zw-grid-bar-copy">
            <span className="zw-grid-bar-kicker">Grid interaction</span>
            <span className="zw-grid-bar-lead">Selling surplus to grid</span>
          </div>
          <div className="zw-grid-bar-right">
            <strong className="zw-grid-bar-kw">
              {net >= -0.05 && net <= 0.05
                ? '+0.0 kW'
                : `${net >= 0 ? '+' : ''}${net.toFixed(1)} kW`}
            </strong>
            {net >= -0.05 && net <= 0.05 && (
              <span className="zw-grid-bar-sub">Net zero state</span>
            )}
          </div>
        </div>
      </div>

      <div className="zw-forecast-head">
        <div className="zw-section-title" style={{ margin: 0 }}>
          Forecast
        </div>
        <div className="zw-forecast-badges">
          <span className="zw-badge-soft">{sky}</span>
          {tempNow !== null && (
            <span className="zw-badge-soft">{Math.round((tempNow * 9) / 5 + 32)}°F</span>
          )}
        </div>
      </div>

      <div className="zw-forecast-chart">
        <div className="zw-bar-row" role="img" aria-label="Solar by hour">
          {sample.map((h, i) => {
            const pct = maxKw > 0 ? (h.estimatedKw / maxKw) * 100 : 0
            return (
              <div key={h.timeIso} className="zw-bar-col">
                <div
                  className={`zw-bar${i === peakIdx ? ' zw-bar--peak' : ''}`}
                  style={{ height: `${Math.max(pct, 6)}%` }}
                  title={`${h.estimatedKw.toFixed(2)} kW`}
                />
                <span className="zw-bar-label">
                  {formatHour(h.timeIso, timeZone)}
                  {i === peakIdx ? (
                    <>
                      <br />
                      (PEAK)
                    </>
                  ) : null}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="zw-section-title">Smart Loads</div>
      <div className="zw-smart-grid">
        <div className="zw-smart-card">
          <div className="zw-smart-top">
            <div>
              <div className="zw-smart-title">EV charger</div>
              <div className="zw-smart-status">Optimal</div>
            </div>
          </div>
          <div className="zw-smart-meta">Schedule around today’s modeled peak.</div>
          <div className="zw-smart-window">Best runtime: {peakLabel}</div>
          <button type="button" className="zw-btn-primary">
            Schedule it
          </button>
        </div>
        <div className="zw-smart-card">
          <div className="zw-smart-top">
            <div>
              <div className="zw-smart-title">Pool pump</div>
              <div className="zw-smart-status" style={{ color: 'var(--zw-blue)' }}>
                Scheduled
              </div>
            </div>
          </div>
          <div className="zw-smart-meta">Filtration cycle (demo)</div>
          <div className="zw-smart-window">Next cycle: afternoon</div>
          <button type="button" className="zw-btn-secondary">
            Edit schedule
          </button>
        </div>
      </div>

      <div className="zw-quick-row">
        <div className="zw-quick-card">
          <strong>Washer</strong>~12:50 PM
        </div>
        <div className="zw-quick-card">
          <strong>Dryer</strong>Off
        </div>
        <div className="zw-quick-card">
          <strong>Dishwasher</strong>Evening
        </div>
      </div>

      <div className="zw-impact-banner">
        <div className="zw-impact-icon" aria-hidden>
          <svg className="zw-impact-leaf-svg" viewBox="0 0 32 32" fill="none">
            <g transform="translate(16 17) rotate(40)">
              <path
                fill="#004832"
                d="M0 11.2C-7.2 4.2-6.8-8.2 0-10.5 6.8-8.2 7.2 4.2 0 11.2z"
              />
              <path
                d="M-3 7.5 Q0 .5 3.2-8.2"
                stroke="#005c44"
                strokeWidth="1.1"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </svg>
        </div>
        <div className="zw-impact-copy">
          <h3 className="zw-impact-heading">Your Impact</h3>
          <p className="zw-impact-detail">You&apos;ve saved {co2Saved} kg of CO₂ this week.</p>
          <p className="zw-impact-trees">
            Equivalent to <strong>{treesPlanted.toFixed(1)} trees</strong> planted.
          </p>
        </div>
        <button type="button" className="zw-impact-report-link">
          View detailed report <span className="zw-impact-report-arrow" aria-hidden>→</span>
        </button>
      </div>
    </>
  )
}
