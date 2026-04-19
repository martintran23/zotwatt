import { HourlyChart } from '../components/HourlyChart.tsx'
import type { HourEstimate } from '../lib/solarModel'

type Day = { dayKey: string; label: string; hours: HourEstimate[] }

type Props = {
  days: Day[]
  timeZone: string
  peaks: HourEstimate[]
}

function parseLocalIsoParts(iso: string) {
  const match = iso.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  )
  if (!match) return null
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
  }
}

function formatHourLocal(iso: string) {
  const parts = parseLocalIsoParts(iso)
  if (!parts) return iso
  const period = parts.hour >= 12 ? 'PM' : 'AM'
  const hour12 = parts.hour % 12 || 12
  return `${hour12}:${String(parts.minute).padStart(2, '0')} ${period}`
}

function formatTimeZoneShort(iso: string, timeZone: string) {
  const parts = parseLocalIsoParts(iso)
  if (!parts) return timeZone
  const probeDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12))
  const tzParts = new Intl.DateTimeFormat(undefined, {
    timeZone,
    timeZoneName: 'short',
  }).formatToParts(probeDate)
  return tzParts.find((part) => part.type === 'timeZoneName')?.value ?? timeZone
}

function bestApplianceWindow(hours: HourEstimate[], timeZone: string) {
  if (!hours.length) return null
  const sorted = [...hours].sort((a, b) => b.estimatedKw - a.estimatedKw).slice(0, 4)
  if (!sorted.length || sorted[0].estimatedKw <= 0.02) return null
  const chron = [...sorted].sort((a, b) => a.timeIso.localeCompare(b.timeIso))
  return `${formatHourLocal(chron[0].timeIso)} - ${formatHourLocal(chron[chron.length - 1].timeIso)} ${formatTimeZoneShort(chron[0].timeIso, timeZone)}`
}

function strongestHours(hours: HourEstimate[], count = 4) {
  return [...hours]
    .filter((h) => h.estimatedKw > 0.02)
    .sort((a, b) => b.estimatedKw - a.estimatedKw)
    .slice(0, count)
}

export function ForecastTab({ days, timeZone, peaks }: Props) {
  const first = days[0]

  return (
    <>
      <h1 className="zw-notif-title" >Forecast</h1>
      <p className="zw-forecast-practical" style={{ fontSize: '1.25rem', margin: '0 0 16px' }}>
        Taller bars indicate stronger expected solar production. Use those hours for flexible loads like laundry,
        dishwashers, or EV charging to reduce grid reliance.
      </p>
      {first && first.hours.length > 0 && (
        <section className="zw-panel">
          <div className="zw-forecast-head">
            <strong>{first.label}</strong>
            <span className="zw-muted-small">TZ: {timeZone}</span>
          </div>
          {bestApplianceWindow(first.hours, timeZone) && (
            <p className="zw-forecast-practical zw-forecast-practical--peak">
              Best appliance window: <strong>{bestApplianceWindow(first.hours, timeZone)}</strong>
            </p>
          )}
          <HourlyChart hours={first.hours} timeZone={timeZone} title="Forecasted solar output (kW)" />
          {peaks.length > 0 && (
            <div className="zw-forecast-peaks">
              <div className="zw-forecast-peaks__label">Strongest hours</div>
              <div className="zw-forecast-peaks__grid">
                {peaks.map((p) => (
                  <div key={p.timeIso} className="zw-forecast-peak-card">
                    <div className="zw-forecast-peak-card__time">{formatHourLocal(p.timeIso)}</div>
                    <div className="zw-forecast-peak-card__value">~{p.estimatedKw.toFixed(2)} kW</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
      {days.slice(1).map((d) => (
        <section key={d.dayKey} className="zw-panel" style={{ marginTop: 12 }}>
          <div className="zw-forecast-head">
            <strong>{d.label}</strong>
            <span className="zw-muted-small">TZ: {timeZone}</span>
          </div>
          {bestApplianceWindow(d.hours, timeZone) && (
            <p className="zw-forecast-practical zw-forecast-practical--peak">
              Best appliance window: <strong>{bestApplianceWindow(d.hours, timeZone)}</strong>
            </p>
          )}
          <HourlyChart hours={d.hours} timeZone={timeZone} title="Forecasted solar output (kW)" />
          {strongestHours(d.hours).length > 0 && (
            <div className="zw-forecast-peaks">
              <div className="zw-forecast-peaks__label">Strongest hours</div>
              <div className="zw-forecast-peaks__grid">
                {strongestHours(d.hours).map((p) => (
                  <div key={p.timeIso} className="zw-forecast-peak-card">
                    <div className="zw-forecast-peak-card__time">{formatHourLocal(p.timeIso)}</div>
                    <div className="zw-forecast-peak-card__value">~{p.estimatedKw.toFixed(2)} kW</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      ))}
    </>
  )
}
