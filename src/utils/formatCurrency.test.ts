import { describe, expect, it } from 'vitest'
import { formatCurrency } from './formatCurrency.ts'

describe('formatCurrency', () => {
  it('formats an amount with the given currency', () => {
    const formatted = formatCurrency('5000.00', 'EUR')

    expect(formatted).toMatch(/5,000\.00|5\.000,00/)
    expect(formatted).toMatch(/€|EUR/)
  })

  it('returns an em dash when amount is null', () => {
    expect(formatCurrency(null, 'EUR')).toBe('—')
  })

  it('returns an em dash for non-numeric amounts', () => {
    expect(formatCurrency('not-a-number', 'EUR')).toBe('—')
    expect(formatCurrency('', 'EUR')).toBe('—')
  })

  it('falls back to the default currency for invalid currency codes', () => {
    const formatted = formatCurrency('100.00', 'NOT_A_CURRENCY')

    expect(formatted).toMatch(/100[.,]00/)
    expect(formatted).toMatch(/€|EUR/)
  })
})
