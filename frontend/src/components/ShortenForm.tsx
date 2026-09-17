import { useState, type FormEvent } from 'react'

interface ShortenFormProps {
  submitting: boolean
  onSubmit: (url: string) => Promise<boolean>
}

export function ShortenForm({ submitting, onSubmit }: ShortenFormProps) {
  const [draft, setDraft] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const ok = await onSubmit(draft)
    if (ok) setDraft('')
  }

  return (
    <form className="shorten-form" onSubmit={handleSubmit}>
      <input
        className="shorten-form__input"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="https://ejemplo.com/una/url/muy/larga"
        disabled={submitting}
        aria-label="URL a acortar"
      />
      <button type="submit" className="shorten-form__submit" disabled={submitting}>
        {submitting ? 'Acortando…' : 'Acortar'}
      </button>
    </form>
  )
}
