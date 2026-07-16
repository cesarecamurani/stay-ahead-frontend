import type { User } from '../api/types.ts'

const TOKEN_KEY = 'stay_ahead_token'
const USER_KEY = 'stay_ahead_user'

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
    const user = JSON.parse(userJson) as User

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
