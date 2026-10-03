import { useEffect, useRef, useState } from 'react'

interface ResultBannerProps {
  url: string
}

export function ResultBanner({ url }: ResultBannerProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    setCopied(false)
    return () => window.clearTimeout(timeoutRef.current)
  }, [url])

  function handleCopy() {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true)
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1800)
    }).catch(() => {})
  }

  return (
    <div className="result-banner">
      <div className="result-banner__info">
        <span className="result-banner__label mono">ENLACE CREADO</span>
        <span className="result-banner__url mono">{url}</span>
      </div>
      <button type="button" className="result-banner__copy" onClick={handleCopy}>
        {copied ? 'Copiado ✓' : 'Copiar'}
      </button>
    </div>
  )
}
