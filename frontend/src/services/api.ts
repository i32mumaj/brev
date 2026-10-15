// The only HTTP client in the project: every backend call goes through here.
// Paths are relative because the API is served from the same origin as the frontend
// (in development, through the Vite proxy).
import type { CreateLinkResponse, DailyClicks, LinkStats } from '../types/link'

const ERROR_MESSAGES: Record<number, string> = {
  404: 'Enlace no encontrado.',
  429: 'Demasiadas peticiones. Espera un momento y vuelve a intentarlo.',
}

export class ApiError extends Error {
  status: number
  notFound: boolean

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.notFound = status === 404
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor.')
  }

  if (!res.ok) {
    throw new ApiError(res.status, ERROR_MESSAGES[res.status] ?? 'Ha ocurrido un error inesperado.')
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export function createLink(url: string): Promise<CreateLinkResponse> {
  return request<CreateLinkResponse>('/api/links', {
    method: 'POST',
    body: JSON.stringify({ url }),
  })
}

export function getLinkStats(shortCode: string): Promise<LinkStats> {
  return request<LinkStats>(`/api/links/${shortCode}/stats`)
}

export function getDailyClicks(shortCode: string, days: number): Promise<DailyClicks[]> {
  return request<DailyClicks[]>(`/api/links/${shortCode}/clicks?days=${days}`)
}

export function deleteLink(shortCode: string): Promise<void> {
  return request<void>(`/api/links/${shortCode}`, { method: 'DELETE' })
}
