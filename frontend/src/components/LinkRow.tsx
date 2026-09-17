import type { KeyboardEvent, MouseEvent } from 'react'
import type { LinkStats } from '../types/link'
import { formatDate, formatNumber, truncate } from '../lib/format'

interface LinkRowProps {
  link: LinkStats
  onOpen: (code: string) => void
  onRemove: (code: string) => void
}

export function LinkRow({ link, onOpen, onRemove }: LinkRowProps) {
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen(link.short_code)
    }
  }

  function handleRemove(event: MouseEvent) {
    event.stopPropagation()
    onRemove(link.short_code)
  }

  return (
    <div
      className="link-row"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(link.short_code)}
      onKeyDown={handleKeyDown}
    >
      <span className="link-row__code mono">{link.short_code}</span>
      <span className="link-row__url">{truncate(link.original_url, 68)}</span>
      <span className="link-row__date mono">{formatDate(link.created_at)}</span>
      <span className="link-row__clicks mono">{formatNumber(link.click_count)}</span>
      <button type="button" className="link-row__delete" title="Borrar" onClick={handleRemove}>
        ×
      </button>
    </div>
  )
}
