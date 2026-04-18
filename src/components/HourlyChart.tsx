import type { HourEstimate } from '../lib/solarModel'

type Props = {
  hours: HourEstimate[]
  timeZone: string
  title: string
}

export function HourlyChart({ hours, timeZone, title }: Props) {
  if (!hours.length) return null

  const maxKw = Math.max(...hours.map((h) => h.estimatedKw), 0.01)
  const fmtHour = (iso: string) =>
    new Intl.DateTimeFormat(undefined, {
      timeZone,
      hour: 'numeric',
    }).format(new Date(iso))

  return (
    <figure className="chart">
      <figcaption>{title}</figcaption>
      <div className="chart-bars" role="img" aria-label="Estimated solar power by hour">
        {hours.map((h) => {
          const pct = (h.estimatedKw / maxKw) * 100
          return (
            <div key={h.timeIso} className="chart-bar-wrap" title={`${h.estimatedKw.toFixed(2)} kW`}>
              <div className="chart-bar" style={{ height: `${pct}%` }} />
              <span className="chart-tick">{fmtHour(h.timeIso)}</span>
            </div>
          )
        })}
      </div>
    </figure>
  )
}
