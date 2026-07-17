import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/errors.ts'
import type { Commitment } from '../../api/types.ts'

const mockGetCommitments = vi.fn()
const mockGetCurrentUser = vi.fn()
const mockUseAuth = vi.fn()

vi.mock('../../api/commitments.ts', () => ({
  getCommitments: (...args: unknown[]) => mockGetCommitments(...args),
}))

vi.mock('../../api/user.ts', () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}))

vi.mock('../../auth/useAuth.ts', () => ({
  useAuth: () => mockUseAuth(),
}))

import { CommitmentList } from './CommitmentList.tsx'
import { formatCurrency } from '../../utils/formatCurrency.ts'

const commitment: Commitment = {
  id: 'abc-123',
  name: 'Rent',
  category: 'obligation',
  recurrence: 'monthly',
  status: 'active',
  amount: '1200.00',
  start_date: '2026-01-01',
  duration_months: null,
  interest_rate: null,
}

describe('CommitmentList', () => {
  beforeEach(() => {
    mockGetCommitments.mockReset()
    mockGetCurrentUser.mockReset()
    mockUseAuth.mockReturnValue({ token: 'jwt-token' })
    mockGetCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      username: 'testuser',
      monthly_income: '5000.00',
      savings: '10000.00',
      currency: 'GBP',
    })
  })

  it('shows loading initially', () => {
    mockGetCommitments.mockReturnValue(new Promise(() => {}))

    render(<CommitmentList />)

    expect(screen.getByText('Loading commitments...')).toBeInTheDocument()
  })

  it('shows error when fetch fails', async () => {
    mockGetCommitments.mockRejectedValue(new ApiError('Failed to load', 500))

    render(<CommitmentList />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeInTheDocument()
    })
  })

  it('shows empty state when no commitments', async () => {
    mockGetCommitments.mockResolvedValue([])

    render(<CommitmentList />)

    await waitFor(() => {
      expect(screen.getByText('No commitments yet.')).toBeInTheDocument()
    })
  })

  it('renders commitment cards with the user currency', async () => {
    mockGetCommitments.mockResolvedValue([commitment])

    render(<CommitmentList />)

    await waitFor(() => {
      expect(screen.getByText('Rent')).toBeInTheDocument()
    })

    expect(
      screen.getByText(formatCurrency(commitment.amount, 'GBP')),
    ).toBeInTheDocument()
    expect(mockGetCommitments).toHaveBeenCalledWith('jwt-token')
    expect(mockGetCurrentUser).toHaveBeenCalledWith('jwt-token')
  })
})
