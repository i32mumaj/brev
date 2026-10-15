import { describe, expect, it } from 'vitest'
import { formatDay, truncate } from './format'

describe('formatDay', () => {
  it('keeps the calendar day of a YYYY-MM-DD string', () => {
    expect(formatDay('2026-03-01')).toMatch(/^1 mar/)
  })
})

describe('truncate', () => {
  it('leaves short strings alone', () => {
    expect(truncate('brev', 10)).toBe('brev')
  })

  it('cuts long strings and adds an ellipsis', () => {
    expect(truncate('abcdefghij', 4)).toBe('abcd…')
  })
})
