import { describe, expect, it } from 'vitest'
import {
  formatThousands,
  parseFormattedNumber,
  sanitizeNumericInput,
} from './formatNumber.ts'

describe('formatNumber utils', () => {
  it('sanitizes non-numeric characters and extra decimal points', () => {
    expect(sanitizeNumericInput('12a3.4.5')).toBe('123.45')
    expect(sanitizeNumericInput('1,000.50')).toBe('1000.50')
  })

  it('formats thousands with commas', () => {
    expect(formatThousands('1000')).toBe('1,000')
    expect(formatThousands('10000000')).toBe('10,000,000')
    expect(formatThousands('1000.50')).toBe('1,000.50')
    expect(formatThousands('1000.')).toBe('1,000.')
  })

  it('parses formatted numbers', () => {
    expect(parseFormattedNumber('1,000')).toBe(1000)
    expect(parseFormattedNumber('10,000,000.25')).toBe(10000000.25)
    expect(parseFormattedNumber('')).toBeNaN()
  })
})
