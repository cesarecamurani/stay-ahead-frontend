import { createContext } from 'react'
import type { RegisterUserInput, User } from '../api/types.ts'

export interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: RegisterUserInput) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
