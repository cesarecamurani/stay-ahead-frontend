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
})
