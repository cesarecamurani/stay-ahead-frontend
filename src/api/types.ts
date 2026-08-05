export interface User {
  id: string
  email: string
  username: string
}

export interface UserProfile extends User {
  monthly_income: string | null
  savings: string | null
  currency: string
}

export interface UserProfileResponse {
  user: UserProfile
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

export type CommitmentLifecycleAction = 'pause' | 'resume' | 'cancel'

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

export interface CreateCommitmentInput {
  name: string
  category: CommitmentCategory
  recurrence: CommitmentRecurrence
  amount: number
  start_date?: string
  due_date?: string
  duration_months?: number | null
}

export interface FinancialSummary {
  monthly_income: string | null
  savings: string | null
  monthly_commitments_amount: string | null
  available_cash_flow: string | null
  savings_runway_months: number | null
}

export interface FinancialSummaryResponse {
  summary: FinancialSummary
}

export type Breakdown = Record<CommitmentCategory, string>

export interface BreakdownResponse {
  breakdown: Breakdown
}

export interface ForecastOccurrence {
  commitment_id: string
  name: string
  category: CommitmentCategory
  date: string
  amount: string
}

export interface ForecastsResponse {
  forecasts: ForecastOccurrence[]
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions {
  method?: HttpMethod
  body?: Record<string, unknown>
  token?: string | null
}
