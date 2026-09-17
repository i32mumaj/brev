// Validación básica en cliente: sólo filtra lo obviamente inválido antes de llamar
// a la API. El backend valida de verdad con pydantic (HttpUrl) y es quien manda.
export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
