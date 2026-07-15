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
