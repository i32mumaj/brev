import { useCallback, useEffect, useState } from 'react'
import { StatCard } from '../components/StatCard'
import { ClicksMeter } from '../components/ClicksMeter'
import { ErrorBanner } from '../components/ErrorBanner'
import { ApiError, getLinkStats } from '../services/api'
import { formatDate, formatNumber } from '../lib/format'
import { CLICKS_SCALE_CAP } from '../lib/clicksScale'
import type { LinkStats } from '../types/link'
import type { Theme } from '../types/theme'

interface DetailPageProps {
  code: string
  theme: Theme
  onBack: () => void
}

// Se pide /stats de nuevo al entrar (en vez de reusar la fila del listado) para
// mostrar el contador más reciente: puede haber cambiado desde que se cargó la lista.
export function DetailPage({ code, theme, onBack }: DetailPageProps) {
  const [stats, setStats] = useState<LinkStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setStats(await getLinkStats(code))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar el enlace.')
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    load()
  }, [load])

  return (
    <section className="detail">
      <button type="button" className="detail__back" onClick={onBack}>
        ← Volver
      </button>

      {loading && <p className="state-message">Cargando…</p>}
      {!loading && error && <ErrorBanner message={error} onRetry={load} />}

      {!loading && stats && (
        <>
          <div className="detail__heading">
            <h1 className="detail__code mono">/{stats.short_code}</h1>
            <span className="detail__original">{stats.original_url}</span>
          </div>

          <div className="stat-grid">
            <StatCard label="CLICS TOTALES" value={formatNumber(stats.click_count)} />
            <StatCard label="CREADO" value={formatDate(stats.created_at)} />
          </div>

          <div className="meter-card">
            <div className="meter-card__head">
              <span className="meter-card__title">Clics</span>
              <span className="meter-card__value mono">{formatNumber(stats.click_count)}</span>
            </div>
            <div className="meter-card__track-wrap">
              <ClicksMeter clicks={stats.click_count} theme={theme} />
              <div className="meter-card__scale mono">
                <span>0</span>
                <span>{CLICKS_SCALE_CAP}+</span>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
