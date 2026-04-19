import {
  awsAutocomplete,
  awsGeocodeFirst,
  awsGetPlacePosition,
  getAwsPlacesEnv,
} from './awsPlaces'
import { searchPlaces, type GeocodeHit } from './openMeteo'
import {
  isPostalOnlyQuery,
  openMeteoHitExcludesPostalLike,
  suggestionLabelStartsWithPostal,
} from './placeQueryPolicy'

export type AddressSuggestion =
  | {
      source: 'openmeteo'
      id: number
      label: string
      latitude: number
      longitude: number
    }
  | { source: 'aws'; placeId: string; label: string }

function openMeteoHitToSuggestion(h: GeocodeHit): Extract<AddressSuggestion, { source: 'openmeteo' }> {
  return {
    source: 'openmeteo',
    id: h.id,
    label: [h.name, h.admin1, h.country_code].filter(Boolean).join(', '),
    latitude: h.latitude,
    longitude: h.longitude,
  }
}

/** Prefer places whose Open‑Meteo `postcodes` list includes the typed US ZIP or CA postal code. */
function rankHitsForPostalQuery(hits: GeocodeHit[], query: string): GeocodeHit[] {
  const trimmed = query.trim()
  const usZip = trimmed.match(/^(\d{5})(?:-\d{4})?$/)?.[1]
  if (usZip) {
    const matched = hits.filter(
      (h) =>
        h.country_code === 'US' &&
        (h.postcodes ?? []).some((pc) => {
          const digits = pc.replace(/\D/g, '')
          return digits.startsWith(usZip) || pc.trim().startsWith(usZip)
        }),
    )
    if (matched.length) {
      return [...matched].sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
    }
  }
  const caNorm = trimmed.replace(/\s+/g, '').toUpperCase()
  if (/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(caNorm)) {
    const matched = hits.filter((h) =>
      (h.postcodes ?? []).some((pc) => pc.replace(/\s+/g, '').toUpperCase().startsWith(caNorm)),
    )
    if (matched.length) {
      return [...matched].sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
    }
  }
  return hits
}

async function suggestionsFromOpenMeteo(query: string, postalOnly: boolean): Promise<AddressSuggestion[]> {
  const omCount = postalOnly ? 25 : 10
  let hits = await searchPlaces(query, omCount)
  hits = hits.filter((h) => !openMeteoHitExcludesPostalLike(h))
  if (postalOnly) {
    hits = rankHitsForPostalQuery(hits, query)
  }
  return hits
    .map(openMeteoHitToSuggestion)
    .filter((s) => !suggestionLabelStartsWithPostal(s.label))
}

export async function fetchAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
  const q = query.trim()
  if (!q) return []

  const postalOnly = isPostalOnlyQuery(q)
  const { enabled, apiKey, region } = getAwsPlacesEnv()

  // Full US ZIP / CA postal: use Open‑Meteo only. Amazon Places often returns rows whose primary label is the code
  // itself (we drop those), and it does not expose postcode→locality the same way, so Westminster, CA for 92683
  // comes from Open‑Meteo's `postcodes` index, not from filtering AWS alone.
  if (postalOnly) {
    return suggestionsFromOpenMeteo(q, true)
  }

  if (enabled) {
    const rows = await awsAutocomplete(apiKey, region, q)
    return rows
      .filter((r) => !suggestionLabelStartsWithPostal(r.label))
      .map((r) => ({ source: 'aws', placeId: r.placeId, label: r.label }))
  }

  return suggestionsFromOpenMeteo(q, false)
}

export async function resolveAddressSuggestion(
  sel: AddressSuggestion,
): Promise<{ latitude: number; longitude: number; label: string }> {
  if (sel.source === 'openmeteo') {
    return {
      latitude: sel.latitude,
      longitude: sel.longitude,
      label: sel.label,
    }
  }

  const { apiKey, region } = getAwsPlacesEnv()
  if (!apiKey) {
    throw new Error('AWS Location API key is not configured.')
  }

  try {
    const p = await awsGetPlacePosition(apiKey, region, sel.placeId)
    return {
      latitude: p.latitude,
      longitude: p.longitude,
      label: p.label ?? sel.label,
    }
  } catch {
    const p = await awsGeocodeFirst(apiKey, region, sel.label)
    return { latitude: p.latitude, longitude: p.longitude, label: sel.label }
  }
}

export function isAwsAutocompleteEnabled(): boolean {
  return getAwsPlacesEnv().enabled
}
