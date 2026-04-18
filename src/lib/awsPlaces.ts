/** Amazon Location Service Places v2 (Autocomplete, GetPlace, Geocode). */

export function getAwsPlacesEnv(): { enabled: boolean; apiKey: string; region: string } {
  const apiKey = import.meta.env.VITE_AWS_LOCATION_API_KEY?.trim() ?? ''
  const region = import.meta.env.VITE_AWS_LOCATION_REGION?.trim() || 'us-west-2'
  return { enabled: apiKey.length > 0, apiKey, region }
}

function placesV2Base(region: string): string {
  return `https://places.geo.${region}.amazonaws.com/v2`
}

type AutocompleteApiItem = {
  PlaceId?: string
  Title?: string
  Address?: { Label?: string }
}

export async function awsAutocomplete(
  apiKey: string,
  region: string,
  queryText: string,
): Promise<{ placeId: string; label: string }[]> {
  const url = `${placesV2Base(region)}/autocomplete?key=${encodeURIComponent(apiKey)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      QueryText: queryText,
      MaxResults: 10,
      AdditionalFeatures: ['Core'],
    }),
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Autocomplete failed (${res.status}): ${detail.slice(0, 240)}`)
  }
  const data = (await res.json()) as { ResultItems?: AutocompleteApiItem[] }
  const items = data.ResultItems ?? []
  return items
    .filter((x): x is AutocompleteApiItem & { PlaceId: string } => Boolean(x.PlaceId))
    .map((x) => ({
      placeId: x.PlaceId,
      label:
        (typeof x.Address?.Label === 'string' && x.Address.Label) ||
        (typeof x.Title === 'string' && x.Title) ||
        'Address',
    }))
}

export async function awsGetPlacePosition(
  apiKey: string,
  region: string,
  placeId: string,
): Promise<{ latitude: number; longitude: number; label?: string }> {
  const url = `${placesV2Base(region)}/place/${encodeURIComponent(placeId)}?key=${encodeURIComponent(apiKey)}`
  const res = await fetch(url, { method: 'GET' })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`GetPlace failed (${res.status}): ${detail.slice(0, 240)}`)
  }
  const data = (await res.json()) as {
    Position?: [number, number]
    Address?: { Label?: string }
  }
  const pos = data.Position
  if (!pos || pos.length < 2 || !Number.isFinite(pos[0]) || !Number.isFinite(pos[1])) {
    throw new Error('GetPlace returned no coordinates.')
  }
  const [longitude, latitude] = pos
  const label = typeof data.Address?.Label === 'string' ? data.Address.Label : undefined
  return { latitude, longitude, label }
}

export async function awsGeocodeFirst(
  apiKey: string,
  region: string,
  queryText: string,
): Promise<{ latitude: number; longitude: number }> {
  const url = `${placesV2Base(region)}/geocode?key=${encodeURIComponent(apiKey)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      QueryText: queryText.slice(0, 200),
      MaxResults: 1,
    }),
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Geocode failed (${res.status}): ${detail.slice(0, 240)}`)
  }
  const data = (await res.json()) as { ResultItems?: { Position?: [number, number] }[] }
  const pos = data.ResultItems?.[0]?.Position
  if (!pos || pos.length < 2) {
    throw new Error('Geocode returned no coordinates.')
  }
  const [longitude, latitude] = pos
  return { latitude, longitude }
}
