export type GeocodeHit = {
  id: number
  name: string
  latitude: number
  longitude: number
  country_code?: string
  admin1?: string
  /** GeoNames-style feature (e.g. PPL, PST); used to drop postal-only rows. */
  feature_code?: string
  postcodes?: string[]
  population?: number
}

export async function searchPlaces(query: string): Promise<GeocodeHit[]> {
  const q = query.trim()
  if (!q) return []
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.searchParams.set('name', q)
  url.searchParams.set('count', '10')
  url.searchParams.set('language', 'en')
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`)
  const data = (await res.json()) as { results?: GeocodeHit[] }
  return data.results ?? []
}

export type HourlyForecast = {
  time: string[]
  shortwaveRadiation: (number | null)[]
  cloudCover: (number | null)[]
  timezone: string
}

export async function fetchSolarForecast(
  latitude: number,
  longitude: number,
): Promise<HourlyForecast> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(latitude))
  url.searchParams.set('longitude', String(longitude))
  url.searchParams.set('hourly', 'shortwave_radiation,cloud_cover')
  url.searchParams.set('forecast_days', '3')
  url.searchParams.set('timezone', 'auto')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Weather request failed (${res.status})`)

  const data = (await res.json()) as {
    timezone?: string
    hourly?: {
      time: string[]
      shortwave_radiation?: (number | null)[]
      cloud_cover?: (number | null)[]
    }
  }

  const hourly = data.hourly
  if (!hourly?.time?.length) {
    throw new Error('No hourly data in response')
  }

  return {
    time: hourly.time,
    shortwaveRadiation: hourly.shortwave_radiation ?? hourly.time.map(() => null),
    cloudCover: hourly.cloud_cover ?? hourly.time.map(() => null),
    timezone: data.timezone ?? 'UTC',
  }
}
