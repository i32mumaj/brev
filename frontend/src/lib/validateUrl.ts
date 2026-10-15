// Basic client-side check that only filters out obviously invalid input before
// calling the API. The backend does the real validation with pydantic (HttpUrl).
export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
