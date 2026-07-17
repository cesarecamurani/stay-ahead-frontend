import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth,
} from './tokenStorage.ts'

const user = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  email: 'user@example.com',
  username: 'testuser',
}

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('returns null when storage is empty', () => {
    expect(getStoredAuth()).toBeNull()
  })

  it('round-trips token and user through storage', () => {
    setStoredAuth('jwt-token', user)

    expect(getStoredAuth()).toEqual({
      token: 'jwt-token',
      user,
    })
  })

  it('accepts UUID user ids from the API', () => {
    const apiUser = {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      email: 'user@example.com',
      username: 'testuser',
    }

    setStoredAuth('jwt-token', apiUser)

    expect(getStoredAuth()).toEqual({
      token: 'jwt-token',
      user: apiUser,
    })
  })

  it('clears stored auth', () => {
    setStoredAuth('jwt-token', user)
    clearStoredAuth()

    expect(getStoredAuth()).toBeNull()
  })

  it('returns null and clears storage when user JSON is corrupt', () => {
    localStorage.setItem('stay_ahead_token', 'jwt-token')
    localStorage.setItem('stay_ahead_user', 'not-json')

    expect(getStoredAuth()).toBeNull()
    expect(localStorage.getItem('stay_ahead_token')).toBeNull()
    expect(localStorage.getItem('stay_ahead_user')).toBeNull()
  })

  it('returns null and clears storage when stored user is missing username', () => {
    localStorage.setItem('stay_ahead_token', 'jwt-token')
    localStorage.setItem(
      'stay_ahead_user',
      JSON.stringify({
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        email: 'stored@example.com',
      }),
    )

    expect(getStoredAuth()).toBeNull()
    expect(localStorage.getItem('stay_ahead_token')).toBeNull()
    expect(localStorage.getItem('stay_ahead_user')).toBeNull()
  })
})
