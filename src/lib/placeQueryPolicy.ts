/** Block postal-only searches and postal-like place rows (ambiguous vs city/state). */

const US_ZIP_ALONE = /^\d{5}(-\d{4})?$/

/** GeoNames-style codes sometimes used for postal / ZIP-only records. */
const POSTAL_FEATURE_CODES = new Set(['PST', 'PSTL', 'POST'])

/** Canadian postal code as the entire query (with or without space). */
export function isCanadianPostalWhole(query: string): boolean {
  const t = query.replace(/\s+/g, '').toUpperCase()
  return /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(t)
}

/** US ZIP or ZIP+4 only; returns the five-digit base, or null if not a US postal-only query. */
export function extractUsPostalQueryDigits(query: string): string | null {
  const q = query.trim()
  const m = q.match(/^(\d{5})(?:-\d{4})?$/)
  return m ? m[1] : null
}

export function hitPostcodesIncludeUsZip5(postcodes: string[] | undefined, zip5: string): boolean {
  if (!postcodes?.length) return false
  for (const raw of postcodes) {
    const m = raw.trim().match(/^(\d{5})(?:-\d{4})?\b/)
    if (m && m[1] === zip5) return true
  }
  return false
}

export function isPopulatedPlaceFeatureCode(featureCode?: string): boolean {
  if (!featureCode) return false
  const fc = featureCode.toUpperCase()
  if (POSTAL_FEATURE_CODES.has(fc)) return false
  return fc.startsWith('PPL')
}

export function isPostalOnlyQuery(query: string): boolean {
  const q = query.trim()
  if (!q) return false
  if (US_ZIP_ALONE.test(q)) return true
  if (isCanadianPostalWhole(q)) return true
  return false
}

export type OpenMeteoPlaceHit = {
  name: string
  feature_code?: string
}

export function openMeteoHitExcludesPostalLike(hit: OpenMeteoPlaceHit): boolean {
  const name = hit.name?.trim() ?? ''
  if (US_ZIP_ALONE.test(name)) return true
  const fc = hit.feature_code?.toUpperCase() ?? ''
  if (POSTAL_FEATURE_CODES.has(fc)) return true
  return false
}

/** AWS / combined label: first segment is only a US ZIP or CA postal. */
export function suggestionLabelStartsWithPostal(label: string): boolean {
  const first = label.split(',')[0]?.trim() ?? ''
  if (US_ZIP_ALONE.test(first)) return true
  if (isCanadianPostalWhole(first)) return true
  return false
}
