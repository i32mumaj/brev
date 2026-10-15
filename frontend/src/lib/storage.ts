// "Tus enlaces" is not a global backend listing (there is none): it is the list of
// codes this browser has created, kept in localStorage.
const STORAGE_KEY = 'shortened-links'
const TTL_DAYS = 30
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000

interface StoredLink {
  code: string
  addedAt: number
}

function isStoredLink(value: unknown): value is StoredLink {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as StoredLink).code === 'string' &&
    typeof (value as StoredLink).addedAt === 'number'
  )
}

function readAll(): StoredLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isStoredLink) : []
  } catch {
    return []
  }
}

function writeAll(items: StoredLink[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // localStorage may be unavailable (private mode, quota exceeded, etc.).
    // The app keeps working, it just won't remember links across reloads.
  }
}

/** Codes still within the TTL, newest first. Expired ones are purged along the way. */
export function getStoredCodes(): string[] {
  const now = Date.now()
  const items = readAll()
  const fresh = items.filter((item) => now - item.addedAt < TTL_MS)
  if (fresh.length !== items.length) writeAll(fresh)
  return fresh.map((item) => item.code)
}

export function addStoredCode(code: string): void {
  const items = readAll().filter((item) => item.code !== code)
  items.unshift({ code, addedAt: Date.now() })
  writeAll(items)
}

export function removeStoredCode(code: string): void {
  writeAll(readAll().filter((item) => item.code !== code))
}
