// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addStoredCode, getStoredCodes, removeStoredCode } from './storage'

const DAY_MS = 24 * 60 * 60 * 1000

describe('stored link codes', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the newest code first without duplicates', () => {
    addStoredCode('aaaaaaa')
    addStoredCode('bbbbbbb')
    addStoredCode('aaaaaaa')

    expect(getStoredCodes()).toEqual(['aaaaaaa', 'bbbbbbb'])
  })

  it('removes a code', () => {
    addStoredCode('aaaaaaa')
    addStoredCode('bbbbbbb')
    removeStoredCode('aaaaaaa')

    expect(getStoredCodes()).toEqual(['bbbbbbb'])
  })

  it('drops codes older than 30 days', () => {
    addStoredCode('old0000')
    vi.advanceTimersByTime(31 * DAY_MS)
    addStoredCode('new0000')

    expect(getStoredCodes()).toEqual(['new0000'])
  })

  it('ignores corrupted storage', () => {
    localStorage.setItem('shortened-links', '{not json')

    expect(getStoredCodes()).toEqual([])
  })
})
