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

export async function fetchAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
  const q = query.trim()
  if (!q) return []
  if (isPostalOnlyQuery(q)) return []

  const { enabled, apiKey, region } = getAwsPlacesEnv()
  if (enabled) {
    const rows = await awsAutocomplete(apiKey, region, q)
    return rows
      .filter((r) => !suggestionLabelStartsWithPostal(r.label))
      .map((r) => ({ source: 'aws', placeId: r.placeId, label: r.label }))
  }

  const hits = await searchPlaces(q)
  return hits
    .filter((h) => !openMeteoHitExcludesPostalLike(h))
    .map(openMeteoHitToSuggestion)
    .filter((s) => !suggestionLabelStartsWithPostal(s.label))
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
