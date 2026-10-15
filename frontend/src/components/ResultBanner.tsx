import { CopyButton } from './CopyButton'

interface ResultBannerProps {
  url: string
}

export function ResultBanner({ url }: ResultBannerProps) {
  return (
    <div className="result-banner">
      <div className="result-banner__info">
        <span className="result-banner__label mono">ENLACE CREADO</span>
        <span className="result-banner__url mono">{url}</span>
      </div>
      <CopyButton text={url} size="lg" />
    </div>
  )
}
