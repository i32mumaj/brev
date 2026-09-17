// Única puerta de salida HTTP del proyecto. Todas las llamadas al backend pasan por aquí:
// así la URL base vive en un solo sitio y no se dispersa por el código.
import type { CreateLinkResponse, LinkStats } from '../types/link'

// Si no se fija VITE_API_URL en build, se asume que el backend vive en el mismo
// host desde el que se sirve el frontend (puerto 8000) — así la imagen funciona
// igual accedida por localhost o por la IP de la máquina en la red local.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:8000`

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
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor.')
  }

  if (!res.ok) {
    const message = res.status === 404 ? 'Enlace no encontrado.' : 'Ha ocurrido un error inesperado.'
    throw new ApiError(res.status, message)
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

export function deleteLink(shortCode: string): Promise<void> {
  return request<void>(`/api/links/${shortCode}`, { method: 'DELETE' })
}
