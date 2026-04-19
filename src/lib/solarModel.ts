export type HourEstimate = {
  timeIso: string
  radiationWm2: number
  cloudPct: number | null
  tempC: number | null
  humidityPct: number | null
  uvIndex: number | null
  estimatedKw: number
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
  timeZone: string,
): { dayKey: string; label: string; hours: HourEstimate[] }[] {
  const groups = new Map<string, HourEstimate[]>()
  const labels = new Map<string, string>()

  for (const h of estimates) {
    const d = new Date(h.timeIso)
    const dayKey = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d)
    if (!groups.has(dayKey)) {
      groups.set(dayKey, [])
      labels.set(
        dayKey,
        new Intl.DateTimeFormat(undefined, {
          timeZone,
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }).format(d),
      )
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
