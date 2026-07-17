import { describe, expect, it } from 'vitest'
import { formatSavingsRunway } from './formatSavingsRunway.ts'

describe('formatSavingsRunway', () => {
  it('returns an em dash for null', () => {
    expect(formatSavingsRunway(null)).toBe('-')
  })

  it('returns an em dash for non-finite values', () => {
    expect(formatSavingsRunway(Number.NaN)).toBe('-')
    expect(formatSavingsRunway(Number.POSITIVE_INFINITY)).toBe('-')
  })

  it('uses the singular form for exactly one month', () => {
    expect(formatSavingsRunway(1)).toBe('1 month')
  })

  it('uses the plural form for other month values', () => {
    expect(formatSavingsRunway(0)).toBe('0 months')
    expect(formatSavingsRunway(6.4)).toBe('6.4 months')
    expect(formatSavingsRunway(2)).toBe('2 months')
  })

  it('rounds months to one decimal place', () => {
    expect(formatSavingsRunway(6.44)).toBe('6.4 months')
    expect(formatSavingsRunway(6.45)).toBe('6.5 months')
  })

  it('uses years when months are 12 or more', () => {
    expect(formatSavingsRunway(12)).toBe('1 year')
    expect(formatSavingsRunway(24)).toBe('2 years')
    expect(formatSavingsRunway(18)).toBe('1.5 years')
  })

  it('rounds years to one decimal place', () => {
    expect(formatSavingsRunway(13)).toBe('1.1 years')
    expect(formatSavingsRunway(30)).toBe('2.5 years')
  })
})
