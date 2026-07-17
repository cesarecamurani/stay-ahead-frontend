import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/errors.ts'
import type { UserProfile } from '../../api/types.ts'

const mockGetCurrentUser = vi.fn()
const mockUseAuth = vi.fn()

vi.mock('../../api/user.ts', () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
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
  currency: 'GBP',
}

describe('DashboardSummary', () => {
  beforeEach(() => {
    mockGetCurrentUser.mockReset()
    mockUseAuth.mockReturnValue({ token: 'jwt-token' })
  })

  it('shows loading initially', () => {
    mockGetCurrentUser.mockReturnValue(new Promise(() => {}))

    render(<DashboardSummary />)

    expect(screen.getByText('Loading summary...')).toBeInTheDocument()
  })

  it('shows error when fetch fails', async () => {
    mockGetCurrentUser.mockRejectedValue(new ApiError('Failed to load', 500))

    render(<DashboardSummary />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeInTheDocument()
    })
  })

  it('renders formatted income and savings when profile is returned', async () => {
    mockGetCurrentUser.mockResolvedValue(profile)

    render(<DashboardSummary />)

    await waitFor(() => {
      expect(screen.getByText('Monthly Income')).toBeInTheDocument()
    })

    expect(screen.getByText('Savings')).toBeInTheDocument()
    expect(screen.getByText('£5,000.00')).toBeInTheDocument()
    expect(screen.getByText('£10,000.00')).toBeInTheDocument()
    expect(mockGetCurrentUser).toHaveBeenCalledWith('jwt-token')
  })
})
