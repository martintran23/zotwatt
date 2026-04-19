/** Minimal check for the welcome / forecast gate (not full RFC validation). */
export function isWelcomeEmailValid(email: string): boolean {
  const t = email.trim()
  if (t.length < 5) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)
}
