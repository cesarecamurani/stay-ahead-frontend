export interface User {
  id: number
  email: string
}

export interface AuthResponse {
  user: User
  message: string
  token: string
}

export interface RegisterUserInput {
  email: string
  password: string
  password_confirmation: string
  monthly_income: number
  savings: number
  currency: string
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions {
  method?: HttpMethod
  body?: Record<string, unknown>
  token?: string | null
}
