import { useCallback, useEffect, useState } from 'react'
import { ApiError, createLink, deleteLink, getLinkStats } from '../services/api'
import { addStoredCode, getStoredCodes, removeStoredCode } from '../lib/storage'
import type { LinkStats } from '../types/link'

interface UseMyLinks {
  links: LinkStats[]
  loading: boolean
  error: string | null
  creating: boolean
  create: (url: string) => Promise<string>
  remove: (shortCode: string) => Promise<void>
  refresh: () => void
}

// Fuente de la lista: los códigos guardados en localStorage, uno a uno contra
// /api/links/{code}/stats. No hay listado global que pedir.
export function useMyLinks(): UseMyLinks {
  const [links, setLinks] = useState<LinkStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    const codes = getStoredCodes()
    const results = await Promise.allSettled(codes.map((code) => getLinkStats(code)))

    const fresh: LinkStats[] = []
    let hadTransientError = false
    results.forEach((result, index) => {
      const code = codes[index]
      if (result.status === 'fulfilled') {
        fresh.push(result.value)
      } else if (result.reason instanceof ApiError && result.reason.notFound) {
        // Ya no existe en el backend (p.ej. se reseteó la base de datos): se olvida.
        removeStoredCode(code)
      } else {
        // Fallo de red o del servidor: no se descarta el código, se reintentará luego.
        hadTransientError = true
      }
    })

    // getStoredCodes() ya devuelve el orden "más reciente primero"; se conserva.
    const order = new Map(codes.map((code, index) => [code, index]))
    fresh.sort((a, b) => (order.get(a.short_code) ?? 0) - (order.get(b.short_code) ?? 0))

    setLinks(fresh)
    setError(hadTransientError ? 'No se han podido cargar todos tus enlaces. Comprueba que el servidor esté levantado.' : null)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const create = useCallback(async (url: string): Promise<string> => {
    setCreating(true)
    try {
      const { short_url } = await createLink(url)
      const code = short_url.split('/').filter(Boolean).pop()
      if (!code) throw new ApiError(500, 'Respuesta inesperada del servidor.')
      addStoredCode(code)
      try {
        const stats = await getLinkStats(code)
        setLinks((current) => [stats, ...current])
      } catch {
        // El enlace se creó bien; si este refetch puntual falla, aparecerá en el próximo refresh.
      }
      return short_url
    } finally {
      setCreating(false)
    }
  }, [])

  const remove = useCallback(async (shortCode: string): Promise<void> => {
    try {
      await deleteLink(shortCode)
    } catch (err) {
      if (!(err instanceof ApiError && err.notFound)) throw err
    }
    removeStoredCode(shortCode)
    setLinks((current) => current.filter((link) => link.short_code !== shortCode))
  }, [])

  return { links, loading, error, creating, create, remove, refresh: loadAll }
}
