export type HourEstimate = {
  timeIso: string
  radiationWm2: number
  cloudPct: number | null
  tempC: number | null
  humidityPct: number | null
  uvIndex: number | null
  estimatedKw: number
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
    second: Number(match[6] ?? '0'),
  }
}

export function estimateHourlyPower(
  forecast: {
    time: string[]
    shortwaveRadiation: (number | null)[]
    cloudCover: (number | null)[]
    temperature2m?: (number | null)[]
    relativeHumidity2m?: (number | null)[]
    uvIndex?: (number | null)[]
  },
  kWp: number,
  performanceRatio: number,
): HourEstimate[] {
  const out: HourEstimate[] = []
  const n = forecast.time.length
  const temps = forecast.temperature2m ?? []
  const hums = forecast.relativeHumidity2m ?? []
  const uvs = forecast.uvIndex ?? []
  for (let i = 0; i < n; i++) {
    const rad = forecast.shortwaveRadiation[i]
    const ghi = typeof rad === 'number' && Number.isFinite(rad) ? Math.max(0, rad) : 0
    const estimatedKw = kWp * (ghi / 1000) * performanceRatio
    const t = temps[i]
    const tempC = typeof t === 'number' && Number.isFinite(t) ? t : null
    const rh = hums[i]
    const humidityPct = typeof rh === 'number' && Number.isFinite(rh) ? rh : null
    const uvRaw = uvs[i]
    const uvIndex = typeof uvRaw === 'number' && Number.isFinite(uvRaw) ? uvRaw : null
    out.push({
      timeIso: forecast.time[i],
      radiationWm2: ghi,
      cloudPct: forecast.cloudCover[i],
      tempC,
      humidityPct,
      uvIndex,
      estimatedKw,
    })
  }
  return out
}

export function splitByLocalDay(
  estimates: HourEstimate[],
  _timeZone: string,
): { dayKey: string; label: string; hours: HourEstimate[] }[] {
  const groups = new Map<string, HourEstimate[]>()
  const labels = new Map<string, string>()

  for (const h of estimates) {
    const parts = parseLocalIsoParts(h.timeIso)
    const dayKey = parts
      ? `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
      : h.timeIso.slice(0, 10)
    if (!groups.has(dayKey)) {
      groups.set(dayKey, [])
      if (parts) {
        const labelDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12))
        labels.set(
          dayKey,
          new Intl.DateTimeFormat(undefined, {
            timeZone: 'UTC',
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }).format(labelDate),
        )
      } else {
        labels.set(dayKey, dayKey)
      }
    }
    groups.get(dayKey)!.push(h)
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dayKey, hours]) => ({
      dayKey,
      label: labels.get(dayKey) ?? dayKey,
      hours,
    }))
}

export function rankPeaks(hours: HourEstimate[], topN: number): HourEstimate[] {
  return [...hours].sort((a, b) => b.estimatedKw - a.estimatedKw).slice(0, topN)
}
