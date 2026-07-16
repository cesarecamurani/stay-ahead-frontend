import { useState, type ReactNode } from 'react'
import * as authApi from '../api/auth.ts'
import type { RegisterUserInput, User } from '../api/types.ts'
import { AuthContext } from './AuthContext.tsx'
import {
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth,
} from './tokenStorage.ts'

interface AuthProviderProps {
  children: ReactNode
}

function getInitialAuth() {
  const stored = getStoredAuth()

  return {
    user: stored?.user ?? null,
    token: stored?.token ?? null,
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [{ user, token }, setAuth] = useState(getInitialAuth)

  function updateAuth(token: string, user: User) {
    setStoredAuth(token, user)
    setAuth({ user, token })
  }

  async function login(email: string, password: string) {
    const response = await authApi.login(email, password)

    updateAuth(response.token, response.user)
  }

  async function register(input: RegisterUserInput) {
    const response = await authApi.register(input)

    updateAuth(response.token, response.user)
  }

  function logout() {
    clearStoredAuth()
    setAuth({ user: null, token: null })
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
