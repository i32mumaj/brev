import type { LinkStats } from '../types/link'
import { EmptyState } from './EmptyState'
import { LinkRow } from './LinkRow'

interface LinksTableProps {
  links: LinkStats[]
  onOpen: (code: string) => void
  onRemove: (code: string) => void
}

export function LinksTable({ links, onOpen, onRemove }: LinksTableProps) {
  if (links.length === 0) return <EmptyState />

  return (
    <div className="links-table">
      <div className="links-table__head mono">
        <span>CÓDIGO</span>
        <span>URL ORIGINAL</span>
        <span>CREADO</span>
        <span>CLICS</span>
        <span />
      </div>
      {links.map((link) => (
        <LinkRow key={link.short_code} link={link} onOpen={onOpen} onRemove={onRemove} />
      ))}
    </div>
  )
}
