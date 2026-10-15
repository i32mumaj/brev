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

// The list comes from the codes stored in localStorage, each one resolved against
// /api/links/{code}/stats. There is no global listing to fetch.
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
    let loadError: string | null = null
    results.forEach((result, index) => {
      const code = codes[index]
      if (result.status === 'fulfilled') {
        fresh.push(result.value)
      } else if (result.reason instanceof ApiError && result.reason.notFound) {
        // Gone from the backend (e.g. the database was reset), so forget it.
        removeStoredCode(code)
      } else {
        // Network, server or rate limit failure: keep the code and try again later.
        loadError =
          result.reason instanceof ApiError && result.reason.status === 429
            ? result.reason.message
            : 'No se han podido cargar todos tus enlaces. Comprueba que el servidor esté levantado.'
      }
    })

    // getStoredCodes() already returns newest first; keep that order.
    const order = new Map(codes.map((code, index) => [code, index]))
    fresh.sort((a, b) => (order.get(a.short_code) ?? 0) - (order.get(b.short_code) ?? 0))

    setLinks(fresh)
    setError(loadError)
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
        // The link was created; if this refetch fails it will show up on the next refresh.
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
