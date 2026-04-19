import type { HourEstimate } from '../lib/solarModel'

type Day = { dayKey: string; label: string; hours: HourEstimate[] }

type Props = {
  days: Day[]
}

function weekdayShort(iso: string) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(iso)).toUpperCase()
}

export function ImpactTab({ days }: Props) {
  const daily = days.map((d) => ({
    key: d.dayKey,
    label: d.hours[0] ? weekdayShort(d.hours[0].timeIso) : d.dayKey,
    max: d.hours.length ? Math.max(...d.hours.map((h) => h.estimatedKw)) : 0,
  }))
  const maxAll = Math.max(...daily.map((d) => d.max), 0.01)

  return (
    <>
      <div className="zw-hero">
        <div className="zw-hero-badge">Live performance</div>
        <h1>
          Your footprint is <span className="zw-hero-em">light</span> today.
        </h1>
        <p className="zw-muted-small" style={{ margin: 0, lineHeight: 1.5 }}>
          Shifting flexible loads toward modeled solar peaks reduces grid draw (illustrative copy).
        </p>
      </div>

      <div className="zw-metrics">
        <div className="zw-metric-card">
          <div className="zw-metric-val" style={{ color: 'var(--zw-orange)' }}>
            {Math.round(maxAll * 24 * days.length)} kWh
          </div>
          <div className="zw-metric-label">Modeled solar ceiling</div>
        </div>
        <div className="zw-metric-card">
          <div className="zw-metric-val" style={{ color: 'var(--zw-green)' }}>
            {(maxAll * 2.1).toFixed(1)} lbs
          </div>
          <div className="zw-metric-label">CO₂e (rough)</div>
        </div>
        <div className="zw-metric-card">
          <div className="zw-metric-val" style={{ color: 'var(--zw-blue)' }}>
            {days.length}
          </div>
          <div className="zw-metric-label">Forecast days</div>
        </div>
      </div>

      <section className="zw-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <strong>Weekly impact trends</strong>
            <div className="zw-muted-small">Efficiency across loaded forecast days</div>
          </div>
        </div>
        <div className="zw-toggle-row">
          <button type="button" className="zw-toggle-on">
            Impact
          </button>
          <button type="button">Energy</button>
        </div>
        <div className="zw-week-chart">
          {daily.map((d) => (
            <div
              key={d.key}
              className="zw-week-bar"
              style={{ height: `${Math.max(10, (d.max / maxAll) * 100)}%` }}
              title={d.label}
            />
          ))}
        </div>
        <div className="zw-week-labels">
          {daily.map((d) => (
            <span key={d.key}>{d.label}</span>
          ))}
        </div>
      </section>

      <div className="zw-insight-row">
        <div className="zw-impact-icon" style={{ width: 48, height: 48 }}>
          ☀️
        </div>
        <p className="zw-muted-small" style={{ margin: 0, flex: 1 }}>
          Charging during your strongest modeled hours improves self-consumption when the sky cooperates.
        </p>
      </div>
      <button type="button" className="zw-download-btn">
        Download report
      </button>
    </>
  )
}
