import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/errors.ts'
import type { FinancialSummary, UserProfile } from '../../api/types.ts'
import { formatCurrency } from '../../utils/formatCurrency.ts'
import { formatSavingsRunway } from '../../utils/formatSavingsRunway.ts'

const mockGetCurrentUser = vi.fn()
const mockGetSummary = vi.fn()
const mockUseAuth = vi.fn()

vi.mock('../../api/user.ts', () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}))

vi.mock('../../api/summary.ts', () => ({
  getSummary: (...args: unknown[]) => mockGetSummary(...args),
}))

vi.mock('../../auth/useAuth.ts', () => ({
  useAuth: () => mockUseAuth(),
}))

import { DashboardSummary } from './DashboardSummary.tsx'

const profile: UserProfile = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  email: 'user@example.com',
  username: 'testuser',
  monthly_income: '5000.00',
  savings: '10000.00',
  protected_savings: '3000.00',
  currency: 'GBP',
}

const summary: FinancialSummary = {
  monthly_income: '9999.00',
  savings: '8888.00',
  monthly_commitments_amount: '1200.00',
  available_cash_flow: '3800.00',
  savings_runway_months: 6.4,
}

describe('DashboardSummary', () => {
  beforeEach(() => {
    mockGetCurrentUser.mockReset()
    mockGetSummary.mockReset()
    mockUseAuth.mockReturnValue({ token: 'jwt-token' })
  })

  it('shows loading initially', () => {
    mockGetCurrentUser.mockReturnValue(new Promise(() => {}))
    mockGetSummary.mockReturnValue(new Promise(() => {}))

    render(<DashboardSummary />)

    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(screen.getByText('Loading summary...')).toBeInTheDocument()
  })

  it('shows error when profile fetch fails', async () => {
    mockGetCurrentUser.mockRejectedValue(new ApiError('Failed to load', 500))
    mockGetSummary.mockResolvedValue(summary)

    render(<DashboardSummary />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeInTheDocument()
    })
  })

  it('shows error when summary fetch fails', async () => {
    mockGetCurrentUser.mockResolvedValue(profile)
    mockGetSummary.mockRejectedValue(new ApiError('Summary unavailable', 500))

    render(<DashboardSummary />)

    await waitFor(() => {
      expect(screen.getByText('Summary unavailable')).toBeInTheDocument()
    })
  })

  it('renders profile income/savings and summary metrics', async () => {
    mockGetCurrentUser.mockResolvedValue(profile)
    mockGetSummary.mockResolvedValue(summary)

    render(<DashboardSummary />)

    await waitFor(() => {
      expect(screen.getByText('Monthly Income')).toBeInTheDocument()
    })

    expect(screen.getByText('Savings')).toBeInTheDocument()
    expect(screen.getByText('Protected Savings')).toBeInTheDocument()
    expect(screen.getByText('Monthly Commitments')).toBeInTheDocument()
    expect(screen.getByText('Available Cash Flow')).toBeInTheDocument()
    expect(screen.getByText('Savings Runway')).toBeInTheDocument()

    expect(
      screen.getByText(formatCurrency(profile.monthly_income, profile.currency)),
    ).toBeInTheDocument()
    expect(
      screen.getByText(formatCurrency(profile.savings, profile.currency)),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        formatCurrency(profile.protected_savings, profile.currency),
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        formatCurrency(summary.monthly_commitments_amount, profile.currency),
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        formatCurrency(summary.available_cash_flow, profile.currency),
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(formatSavingsRunway(summary.savings_runway_months)),
    ).toBeInTheDocument()

    expect(
      screen.queryByText(
        formatCurrency(summary.monthly_income, profile.currency),
      ),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(formatCurrency(summary.savings, profile.currency)),
    ).not.toBeInTheDocument()

    expect(mockGetCurrentUser).toHaveBeenCalledWith('jwt-token')
    expect(mockGetSummary).toHaveBeenCalledWith('jwt-token')
  })

  it('shows a dash when summary metrics are null', async () => {
    mockGetCurrentUser.mockResolvedValue(profile)
    mockGetSummary.mockResolvedValue({
      ...summary,
      monthly_commitments_amount: null,
      available_cash_flow: null,
      savings_runway_months: null,
    })

    render(<DashboardSummary />)

    await waitFor(() => {
      expect(screen.getByText('Monthly Commitments')).toBeInTheDocument()
    })

    expect(screen.getAllByText('-')).toHaveLength(3)
  })
})
