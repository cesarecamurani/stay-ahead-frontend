import type { User } from '../api/types.ts'

const TOKEN_KEY = 'stay_ahead_token'
const USER_KEY = 'stay_ahead_user'

function isStoredUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const user = value as Record<string, unknown>

  return (
    typeof user.id === 'string' &&
    user.id.length > 0 &&
    typeof user.email === 'string' &&
    typeof user.username === 'string' &&
    user.username.length > 0
  )
}

export interface StoredAuth {
  token: string
  user: User
}

export function getStoredAuth(): StoredAuth | null {
  const token = localStorage.getItem(TOKEN_KEY)
  const userJson = localStorage.getItem(USER_KEY)

  if (!token || !userJson) {
    return null
  }

  try {
    const user = JSON.parse(userJson)

    if (!isStoredUser(user)) {
      clearStoredAuth()

      return null
    }

    return { token, user }
  } catch {
    clearStoredAuth()

    return null
  }
}

export function setStoredAuth(token: string, user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredAuth(): void {
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(TOKEN_KEY)
}
