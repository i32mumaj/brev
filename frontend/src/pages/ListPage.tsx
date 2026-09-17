import { useState } from 'react'
import { ShortenForm } from '../components/ShortenForm'
import { ResultBanner } from '../components/ResultBanner'
import { ErrorBanner } from '../components/ErrorBanner'
import { LinksTable } from '../components/LinksTable'
import { ApiError } from '../services/api'
import { isValidUrl } from '../lib/validateUrl'
import { formatNumber } from '../lib/format'
import type { LinkStats } from '../types/link'

interface ListPageProps {
  links: LinkStats[]
  loading: boolean
  error: string | null
  creating: boolean
  onCreate: (url: string) => Promise<string>
  onOpen: (code: string) => void
  onRemove: (code: string) => void
  onRetry: () => void
}

export function ListPage({
  links,
  loading,
  error,
  creating,
  onCreate,
  onOpen,
  onRemove,
  onRetry,
}: ListPageProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  async function handleSubmit(rawUrl: string): Promise<boolean> {
    const url = rawUrl.trim()
    if (!isValidUrl(url)) {
      setFormError('Esa URL no es válida. Debe empezar por http:// o https://')
      setResult(null)
      return false
    }
    setFormError(null)
    try {
      const shortUrl = await onCreate(url)
      setResult(shortUrl)
      return true
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo acortar la URL.')
      setResult(null)
      return false
    }
  }

  return (
    <>
      <section className="hero">
        <h1 className="hero__title">Acorta un enlace y mide sus clics.</h1>
        <ShortenForm submitting={creating} onSubmit={handleSubmit} />
        {formError && <ErrorBanner message={formError} />}
        {result && <ResultBanner url={result} />}
      </section>

      <section className="links-section">
        <div className="links-section__head">
          <h2 className="links-section__title">Tus enlaces</h2>
          <span className="links-section__count mono">
            {links.length === 1 ? '1 enlace' : `${formatNumber(links.length)} enlaces`}
          </span>
        </div>

        {error && <ErrorBanner message={error} onRetry={onRetry} />}

        {loading ? (
          <p className="state-message">Cargando tus enlaces…</p>
        ) : (
          <LinksTable links={links} onOpen={onOpen} onRemove={onRemove} />
        )}
      </section>
    </>
  )
}
