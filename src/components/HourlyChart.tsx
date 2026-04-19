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
          const barHeight =
            h.estimatedKw <= 0.02 ? '0%' : pct < 3 ? '3px' : `${Math.min(94, Math.round(pct))}%`
          return (
            <div key={h.timeIso} className="chart-bar-wrap" title={`${h.estimatedKw.toFixed(2)} kW`}>
              <div className="chart-bar-slot">
                <div className="chart-bar" style={{ height: barHeight }} />
              </div>
              <span className="chart-tick">{fmtHour(h.timeIso)}</span>
            </div>
          )
        })}
      </div>
    </figure>
  )
}
