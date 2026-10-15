import { useCallback, useEffect, useState } from 'react'
import { StatCard } from '../components/StatCard'
import { ClicksChart } from '../components/ClicksChart'
import { ErrorBanner } from '../components/ErrorBanner'
import { ApiError, getDailyClicks, getLinkStats } from '../services/api'
import { formatDate, formatNumber } from '../lib/format'
import type { DailyClicks, LinkStats } from '../types/link'

interface DetailPageProps {
  code: string
  onBack: () => void
}

const CHART_DAYS = 30

// /stats is fetched again on entry (instead of reusing the list row) to show the
// latest count: it may have changed since the list was loaded.
export function DetailPage({ code, onBack }: DetailPageProps) {
  const [stats, setStats] = useState<LinkStats | null>(null)
  const [daily, setDaily] = useState<DailyClicks[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [linkStats, dailyClicks] = await Promise.all([getLinkStats(code), getDailyClicks(code, CHART_DAYS)])
      setStats(linkStats)
      setDaily(dailyClicks)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar el enlace.')
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    load()
  }, [load])

  const lastWeek = daily.slice(-7).reduce((sum, day) => sum + day.count, 0)

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
            <StatCard label="ÚLTIMOS 7 DÍAS" value={formatNumber(lastWeek)} />
            <StatCard label="CREADO" value={formatDate(stats.created_at)} />
          </div>

          <div className="chart-card">
            <div className="chart-card__head">
              <span className="chart-card__title">Clics por día</span>
              <span className="chart-card__range mono">ÚLTIMOS {CHART_DAYS} DÍAS</span>
            </div>
            <ClicksChart data={daily} />
          </div>
        </>
      )}
    </section>
  )
}
