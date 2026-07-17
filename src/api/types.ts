export interface User {
  id: string
  email: string
  username: string
}

export interface AuthResponse {
  user: User
  message: string
  token: string
}

export interface RegisterUserInput {
  username: string
  email: string
  password: string
  password_confirmation: string
  monthly_income: number
  savings: number
  currency: string
}

export type CommitmentCategory =
  | 'obligation'
  | 'debt'
  | 'service'
  | 'investment'

export type CommitmentStatus =
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'

export type CommitmentRecurrence =
  | 'one_time'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'

export interface Commitment {
  id: string
  name: string
  category: CommitmentCategory
  recurrence: CommitmentRecurrence
  status: CommitmentStatus
  amount: string
  start_date?: string
  due_date?: string
  duration_months: number | null
  interest_rate: number | null
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions {
  method?: HttpMethod
  body?: Record<string, unknown>
  token?: string | null
}
