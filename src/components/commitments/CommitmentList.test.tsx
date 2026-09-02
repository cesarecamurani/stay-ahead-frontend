import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/errors.ts'
import type { Commitment } from '../../api/types.ts'

const mockGetCommitments = vi.fn()
const mockPauseCommitment = vi.fn()
const mockResumeCommitment = vi.fn()
const mockCancelCommitment = vi.fn()
const mockGetCurrentUser = vi.fn()
const mockUseAuth = vi.fn()

vi.mock('../../api/commitments.ts', () => ({
  getCommitments: (...args: unknown[]) => mockGetCommitments(...args),
  pauseCommitment: (...args: unknown[]) => mockPauseCommitment(...args),
  resumeCommitment: (...args: unknown[]) => mockResumeCommitment(...args),
  cancelCommitment: (...args: unknown[]) => mockCancelCommitment(...args),
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
    mockPauseCommitment.mockReset()
    mockResumeCommitment.mockReset()
    mockCancelCommitment.mockReset()
    mockGetCurrentUser.mockReset()
    mockUseAuth.mockReturnValue({ token: 'jwt-token' })
    mockGetCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      username: 'testuser',
      monthly_income: '5000.00',
      savings: '10000.00',
      protected_savings: '3000.00',
      currency: 'GBP',
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
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

  it('pauses an active commitment and updates its available actions', async () => {
    const user = userEvent.setup()
    let resolvePause: (value: Commitment) => void
    mockGetCommitments.mockResolvedValue([commitment])
    mockPauseCommitment.mockReturnValue(
      new Promise((resolve) => {
        resolvePause = resolve
      }),
    )

    render(<CommitmentList />)

    await screen.findByText('Rent')
    await user.click(screen.getByRole('button', { name: 'Pause Rent' }))

    expect(mockPauseCommitment).toHaveBeenCalledWith('jwt-token', commitment.id)
    expect(
      screen.getByRole('button', { name: 'Pausing... Rent' }),
    ).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel Rent' })).toBeDisabled()

    resolvePause!({ ...commitment, status: 'paused' })

    await waitFor(() => {
      expect(screen.getByText('Paused')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Resume Rent' })).toBeEnabled()
    expect(
      screen.queryByRole('button', { name: 'Pause Rent' }),
    ).not.toBeInTheDocument()
  })

  it('resumes a paused commitment', async () => {
    const user = userEvent.setup()
    const pausedCommitment: Commitment = { ...commitment, status: 'paused' }
    mockGetCommitments.mockResolvedValue([pausedCommitment])
    mockResumeCommitment.mockResolvedValue({ ...commitment, status: 'active' })

    render(<CommitmentList />)

    await user.click(
      await screen.findByRole('button', { name: 'Resume Rent' }),
    )

    expect(mockResumeCommitment).toHaveBeenCalledWith(
      'jwt-token',
      commitment.id,
    )
    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument()
    })
  })

  it('does not cancel when the user rejects confirmation', async () => {
    const user = userEvent.setup()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    mockGetCommitments.mockResolvedValue([commitment])

    render(<CommitmentList />)

    await user.click(await screen.findByRole('button', { name: 'Cancel Rent' }))

    expect(confirm).toHaveBeenCalledWith(
      'Cancel "Rent"? This action cannot be undone.',
    )
    expect(mockCancelCommitment).not.toHaveBeenCalled()
  })

  it('cancels a commitment after confirmation', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockGetCommitments.mockResolvedValue([commitment])
    mockCancelCommitment.mockResolvedValue({
      ...commitment,
      status: 'cancelled',
    })

    render(<CommitmentList />)

    await user.click(await screen.findByRole('button', { name: 'Cancel Rent' }))

    expect(mockCancelCommitment).toHaveBeenCalledWith(
      'jwt-token',
      commitment.id,
    )
    await waitFor(() => {
      expect(screen.getByText('Cancelled')).toBeInTheDocument()
    })
    expect(
      screen.queryByRole('button', { name: 'Cancel Rent' }),
    ).not.toBeInTheDocument()
  })

  it('shows a lifecycle error and re-enables the actions', async () => {
    const user = userEvent.setup()
    mockGetCommitments.mockResolvedValue([commitment])
    mockPauseCommitment.mockRejectedValue(
      new ApiError('Status cannot transition to paused', 422),
    )

    render(<CommitmentList />)

    await user.click(await screen.findByRole('button', { name: 'Pause Rent' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Status cannot transition to paused',
    )
    expect(screen.getByRole('button', { name: 'Pause Rent' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cancel Rent' })).toBeEnabled()
  })
})
