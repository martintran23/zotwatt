import { HourlyChart } from '../components/HourlyChart.tsx'
import type { HourEstimate } from '../lib/solarModel'

type Day = { dayKey: string; label: string; hours: HourEstimate[] }

type Props = {
  days: Day[]
  timeZone: string
  peaks: HourEstimate[]
}

export function ForecastTab({ days, timeZone, peaks }: Props) {
  const first = days[0]

  return (
    <>
      <h1 style={{ fontSize: '1.25rem', margin: '0 0 16px' }}>Forecast</h1>
      {first && first.hours.length > 0 && (
        <section className="zw-panel">
          <div className="zw-forecast-head">
            <strong>{first.label}</strong>
            <span className="zw-muted-small">TZ: {timeZone}</span>
          </div>
          <HourlyChart hours={first.hours} timeZone={timeZone} title="Estimated AC output (kW)" />
          {peaks.length > 0 && (
            <p className="zw-muted-small">
              Strongest hours:{' '}
              {peaks.map((p, i) => (
                <span key={p.timeIso}>
                  {new Intl.DateTimeFormat(undefined, {
                    timeZone,
                    hour: 'numeric',
                    minute: '2-digit',
                  }).format(new Date(p.timeIso))}{' '}
                  (~{p.estimatedKw.toFixed(2)} kW)
                  {i < peaks.length - 1 ? ' · ' : ''}
                </span>
              ))}
            </p>
          )}
        </section>
      )}
      {days.slice(1).map((d) => (
        <section key={d.dayKey} className="zw-panel" style={{ marginTop: 12 }}>
          <HourlyChart hours={d.hours} timeZone={timeZone} title={d.label} />
        </section>
      ))}
    </>
  )
}
