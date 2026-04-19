/** Block postal-only searches and postal-like place rows (ambiguous vs city/state). */

const US_ZIP_ALONE = /^\d{5}(-\d{4})?$/

/** GeoNames-style codes sometimes used for postal / ZIP-only records. */
const POSTAL_FEATURE_CODES = new Set(['PST', 'PSTL', 'POST'])

/** Canadian postal code as the entire query (with or without space). */
function isCanadianPostalWhole(query: string): boolean {
  const t = query.replace(/\s+/g, '').toUpperCase()
  return /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(t)
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
