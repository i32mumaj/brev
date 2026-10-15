import { useEffect, useRef, useState } from 'react'

interface CopyButtonProps {
  text: string
  label?: string
  size?: 'md' | 'lg'
}

const FEEDBACK_MS = 1800

export function CopyButton({ text, label = 'Copiar', size = 'md' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    setCopied(false)
    return () => window.clearTimeout(timeoutRef.current)
  }, [text])

  function handleCopy() {
    // Only confirm once the write succeeds: the clipboard can be blocked or unavailable.
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(true)
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = window.setTimeout(() => setCopied(false), FEEDBACK_MS)
      })
      .catch(() => {})
  }

  return (
    <button
      type="button"
      className={`copy-button copy-button--${size}${copied ? ' copy-button--copied' : ''}`}
      onClick={handleCopy}
      title={text}
    >
      <svg className="copy-button__icon" viewBox="0 0 16 16" aria-hidden="true">
        {copied ? (
          <path d="M3 8.5l3 3 7-7" />
        ) : (
          <>
            <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
            <path d="M10.5 3.5v-.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h.5" />
          </>
        )}
      </svg>
      <span aria-live="polite">{copied ? 'Copiado' : label}</span>
    </button>
  )
}
