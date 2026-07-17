import { describe, expect, it } from 'vitest'
import { validateUsername } from './validation.ts'

describe('validateUsername', () => {
  it('accepts valid usernames (letters, numbers, underscore)', () => {
    expect(validateUsername('john_doe')).toBeNull()
    expect(validateUsername('user123')).toBeNull()
  })

  it('trims whitespace', () => {
    expect(validateUsername('  jane_doe  ')).toBeNull()
  })

  it('rejects too short usernames', () => {
    expect(validateUsername('ab')).not.toBeNull()
  })

  it('rejects invalid characters', () => {
    expect(validateUsername('user@name')).not.toBeNull()
    expect(validateUsername('user name')).not.toBeNull()
  })
})

