import { useState, type ReactNode } from 'react'
import * as authApi from '../api/auth.ts'
import type { RegisterUserInput } from '../api/types.ts'
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

  async function login(email: string, password: string) {
    const response = await authApi.login(email, password)
    setStoredAuth(response.token, response.user)
    setAuth({ user: response.user, token: response.token })
  }

  async function register(input: RegisterUserInput) {
    const response = await authApi.register(input)
    setStoredAuth(response.token, response.user)
    setAuth({ user: response.user, token: response.token })
  }

  function logout() {
    clearStoredAuth()
    setAuth({ user: null, token: null })
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading: false, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
