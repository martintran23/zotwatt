import { fetchSolarForecast, type HourlyForecast } from './openMeteo'

const DEFAULT_OPTIMIZE_URL =
  'https://w2pyhnrl05.execute-api.us-west-2.amazonaws.com/optimize'

/**
 * Step Functions / API Gateway optimize endpoint.
 * Set `VITE_OPTIMIZE_API_URL` to override, or `VITE_OPTIMIZE_API_URL=0` to disable and use Open‑Meteo only.
 */
export function getOptimizeApiUrl(): string | null {
  const v = import.meta.env.VITE_OPTIMIZE_API_URL
  if (v === '0' || v === 'false') return null
  const t = (typeof v === 'string' ? v : '').trim()
  return t.length > 0 ? t : DEFAULT_OPTIMIZE_URL
}

export function isOptimizeApiEnabled(): boolean {
  return getOptimizeApiUrl() !== null
}

function getOptimizeStatusApiUrl(): string | null {
  const v = import.meta.env.VITE_OPTIMIZE_STATUS_API_URL
  const t = (typeof v === 'string' ? v : '').trim()
  return t.length > 0 ? t : null
}

function getOptimizePollConfig() {
  const intervalRaw = Number(import.meta.env.VITE_OPTIMIZE_POLL_INTERVAL_MS ?? 1800)
  const timeoutRaw = Number(import.meta.env.VITE_OPTIMIZE_POLL_TIMEOUT_MS ?? 15000)
  return {
    intervalMs: Number.isFinite(intervalRaw) ? Math.max(400, intervalRaw) : 1800,
    timeoutMs: Number.isFinite(timeoutRaw) ? Math.max(2000, timeoutRaw) : 15000,
  }
}

type OptimizeRequestBody = {
  latitude: number
  longitude: number
  kWp: number
  performanceRatio: number
  placeLabel?: string
}

function unwrapApiGatewayBody(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data
  const o = data as Record<string, unknown>
  if (typeof o.body === 'string') {
    try {
      return JSON.parse(o.body) as unknown
    } catch {
      throw new Error('Optimize API returned a non‑JSON body string.')
    }
  }
  return data
}

function hasHourlyTimeSeries(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') return false
  const o = obj as Record<string, unknown>
  const hourly = (o.hourly as Record<string, unknown> | undefined) ?? o
  const time = hourly.time ?? o.time
  return Array.isArray(time) && time.length > 0 && typeof time[0] === 'string'
}

/** Step Functions StartSyncExecution style: succeeded but `output` has no hourly arrays (e.g. only recommendations). */
export class OptimizeNoHourlyPayloadError extends Error {
  override readonly name = 'OptimizeNoHourlyPayloadError'
}

class OptimizePendingExecutionError extends Error {
  override readonly name = 'OptimizePendingExecutionError'
  readonly executionArn: string

  constructor(executionArn: string) {
    super('Optimize API returned executionArn without hourly data.')
    this.executionArn = executionArn
  }
}

/** Build {@link HourlyForecast} from an object that already looks like Open‑Meteo hourly + timezone. */
export function parseHourlyForecastShape(root: unknown): HourlyForecast {
  if (!root || typeof root !== 'object') {
    throw new Error('Optimize API returned an empty response.')
  }
  const o = root as Record<string, unknown>
  const hourly = (o.hourly as Record<string, unknown> | undefined) ?? o
  const time = hourly.time ?? o.time
  if (!Array.isArray(time) || time.length === 0 || typeof time[0] !== 'string') {
    throw new Error('Optimize API response is missing hourly.time (array of ISO strings).')
  }

  const pick = (snake: string, camel: string): (number | null)[] => {
    const v1 = hourly[snake] ?? o[snake]
    const v2 = hourly[camel] ?? o[camel]
    const arr = (Array.isArray(v1) ? v1 : Array.isArray(v2) ? v2 : null) as (number | null)[] | null
    return arr ?? time.map(() => null)
  }

  const tz = typeof o.timezone === 'string' && o.timezone ? o.timezone : 'UTC'

  return {
    time: time as string[],
    shortwaveRadiation: pick('shortwave_radiation', 'shortwaveRadiation'),
    cloudCover: pick('cloud_cover', 'cloudCover'),
    temperature2m: pick('temperature_2m', 'temperature2m'),
    relativeHumidity2m: pick('relative_humidity_2m', 'relativeHumidity2m'),
    uvIndex: pick('uv_index', 'uvIndex'),
    timezone: tz,
  }
}

/** Normalize API Gateway / Lambda / Step Functions output into {@link HourlyForecast}. */
export function parseOptimizeResponseToHourlyForecast(data: unknown): HourlyForecast {
  const root = unwrapApiGatewayBody(data)
  if (!root || typeof root !== 'object') {
    throw new Error('Optimize API returned an empty response.')
  }

  const o = root as Record<string, unknown>

  // StartSyncExecution (sync): hourly series may live inside stringified `output`.
  if (o.status === 'SUCCEEDED' && typeof o.output === 'string') {
    let inner: unknown
    try {
      inner = JSON.parse(o.output)
    } catch {
      throw new Error('Optimize API output is not valid JSON.')
    }
    if (hasHourlyTimeSeries(inner)) {
      return parseHourlyForecastShape(inner)
    }
    const hasRecs =
      inner &&
      typeof inner === 'object' &&
      Array.isArray((inner as { recommendations?: unknown }).recommendations)
    throw new OptimizeNoHourlyPayloadError(
      hasRecs
        ? 'Optimize returned appliance recommendations only; charts use Open‑Meteo until hourly weather is included in output.'
        : 'Optimize succeeded but output had no hourly weather series.',
    )
  }

  if (typeof o.executionArn === 'string' && !hasHourlyTimeSeries(root)) {
    throw new OptimizePendingExecutionError(o.executionArn)
  }

  return parseHourlyForecastShape(root)
}

export async function fetchOptimizeForecast(url: string, body: OptimizeRequestBody): Promise<HourlyForecast> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  const key = (import.meta.env.VITE_OPTIMIZE_API_KEY as string | undefined)?.trim()
  if (key) headers['x-api-key'] = key

  const res = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers,
    body: JSON.stringify(body),
  })

  const text = await res.text()
  let json: unknown
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    throw new Error(`Optimize API returned non‑JSON (${res.status}).`)
  }

  if (!res.ok) {
    const msg =
      json && typeof json === 'object' && 'message' in json
        ? String((json as { message: unknown }).message)
        : text.slice(0, 200)
    throw new Error(`Optimize API failed (${res.status}): ${msg}`)
  }

  try {
    return parseOptimizeResponseToHourlyForecast(json)
  } catch (e) {
    if (!(e instanceof OptimizePendingExecutionError)) throw e
    const statusUrl = getOptimizeStatusApiUrl()
    if (!statusUrl) {
      throw new Error(
        'Optimize API returned executionArn without hourly data. Set VITE_OPTIMIZE_STATUS_API_URL to poll status, or return hourly data synchronously.',
      )
    }
    return pollOptimizeUntilReady(statusUrl, e.executionArn, headers)
  }
}

async function fetchOptimizeStatus(
  statusUrl: string,
  executionArn: string,
  headers: Record<string, string>,
): Promise<unknown> {
  const url = new URL(statusUrl)
  url.searchParams.set('executionArn', executionArn)
  const statusHeaders: Record<string, string> = { Accept: headers.Accept }
  if (headers['x-api-key']) statusHeaders['x-api-key'] = headers['x-api-key']

  const res = await fetch(url.toString(), {
    method: 'GET',
    mode: 'cors',
    headers: statusHeaders,
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Optimize status API failed (${res.status}): ${text.slice(0, 200)}`)
  }
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new Error('Optimize status API returned non‑JSON.')
  }
}

async function pollOptimizeUntilReady(
  statusUrl: string,
  executionArn: string,
  headers: Record<string, string>,
): Promise<HourlyForecast> {
  const { intervalMs, timeoutMs } = getOptimizePollConfig()
  const started = Date.now()
  while (Date.now() - started <= timeoutMs) {
    const json = await fetchOptimizeStatus(statusUrl, executionArn, headers)
    try {
      return parseOptimizeResponseToHourlyForecast(json)
    } catch (e) {
      if (e instanceof OptimizePendingExecutionError) {
        // still running
      } else if (e instanceof OptimizeNoHourlyPayloadError) {
        throw e
      }
    }
    await new Promise((resolve) => window.setTimeout(resolve, intervalMs))
  }
  throw new Error('Optimize polling timed out before hourly data became available.')
}

/**
 * Tries the configured optimize (Step Functions) API first, then Open‑Meteo if the call fails or is disabled.
 */
export async function fetchForecastWithOptimizeFirst(
  latitude: number,
  longitude: number,
  kWp: number,
  performanceRatio: number,
  placeLabel?: string,
): Promise<HourlyForecast> {
  const url = getOptimizeApiUrl()
  if (!url) {
    return fetchSolarForecast(latitude, longitude)
  }
  try {
    return await fetchOptimizeForecast(url, {
      latitude,
      longitude,
      kWp,
      performanceRatio,
      placeLabel: placeLabel?.trim() || undefined,
    })
  } catch (e) {
    if (e instanceof OptimizeNoHourlyPayloadError) {
      console.info('[ZotWatt]', e.message)
    } else {
      console.warn('[ZotWatt] Optimize API failed, falling back to Open‑Meteo.', e)
    }
    return fetchSolarForecast(latitude, longitude)
  }
}
