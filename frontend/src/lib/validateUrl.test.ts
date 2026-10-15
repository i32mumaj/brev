import { describe, expect, it } from 'vitest'
import { isValidUrl } from './validateUrl'

describe('isValidUrl', () => {
  it.each(['https://example.com', 'http://localhost:8000/path?q=1'])('accepts %s', (url) => {
    expect(isValidUrl(url)).toBe(true)
  })

  it.each(['', 'example.com', 'ftp://example.com', 'javascript:alert(1)'])('rejects %s', (url) => {
    expect(isValidUrl(url)).toBe(false)
  })
})
