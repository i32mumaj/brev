interface ErrorBannerProps {
  message: string
  onRetry?: () => void
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="banner" role="alert">
      <span className="banner__dot" />
      <span className="banner__text">{message}</span>
      {onRetry && (
        <button type="button" className="banner__retry" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  )
}
