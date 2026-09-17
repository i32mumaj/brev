export function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state__icon mono">/</div>
      <span className="empty-state__title">Todavía no hay enlaces</span>
      <span className="empty-state__hint">
        Pega una URL larga arriba y aparecerá aquí con sus estadísticas.
      </span>
    </div>
  )
}
