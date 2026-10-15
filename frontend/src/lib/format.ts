export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  })
}

// The API sends plain YYYY-MM-DD days; parsing them as local midnight keeps
// new Date() from shifting them a day back in time zones west of UTC.
export function formatDay(day: string): string {
  return new Date(`${day}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function formatNumber(value: number): string {
  return value.toLocaleString('es-ES')
}

// Short links are served from the same origin as the app.
export function shortUrl(code: string): string {
  return `${window.location.origin}/${code}`
}

export function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value
}
