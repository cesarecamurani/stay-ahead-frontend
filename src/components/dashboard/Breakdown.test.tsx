import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/errors.ts'
import type { Breakdown as BreakdownData, UserProfile } from '../../api/types.ts'
import { formatCurrency } from '../../utils/formatCurrency.ts'

const mockGetBreakdown = vi.fn()
const mockGetCurrentUser = vi.fn()
const mockUseAuth = vi.fn()

vi.mock('../../api/breakdown.ts', () => ({
  getBreakdown: (...args: unknown[]) => mockGetBreakdown(...args),
}))

vi.mock('../../api/user.ts', () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}))

vi.mock('../../auth/useAuth.ts', () => ({
  useAuth: () => mockUseAuth(),
}))

import { Breakdown } from './Breakdown.tsx'

const breakdown: BreakdownData = {
  obligation: '800.00',
  debt: '100.00',
  service: '22.00',
  investment: '250.00',
}

const profile: UserProfile = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  email: 'user@example.com',
  username: 'testuser',
  monthly_income: '5000.00',
  savings: '10000.00',
  currency: 'GBP',
}

describe('Breakdown', () => {
  beforeEach(() => {
    mockGetBreakdown.mockReset()
    mockGetCurrentUser.mockReset()
    mockUseAuth.mockReturnValue({ token: 'jwt-token' })
  })

  afterEach(() => {
    cleanup()
  })

  it('shows loading initially', () => {
    mockGetBreakdown.mockReturnValue(new Promise(() => {}))
    mockGetCurrentUser.mockReturnValue(new Promise(() => {}))

    render(<Breakdown />)

    expect(screen.getByText('Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Loading breakdown...')).toBeInTheDocument()
  })

  it('shows error when breakdown fetch fails', async () => {
    mockGetBreakdown.mockRejectedValue(new ApiError('Failed to load', 500))
    mockGetCurrentUser.mockResolvedValue(profile)

    render(<Breakdown />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeInTheDocument()
    })
  })

  it('renders all categories with formatted amounts', async () => {
    mockGetBreakdown.mockResolvedValue(breakdown)
    mockGetCurrentUser.mockResolvedValue(profile)

    render(<Breakdown />)

    await waitFor(() => {
      expect(screen.getByText('Obligations')).toBeInTheDocument()
    })

    expect(screen.getByText('Debt')).toBeInTheDocument()
    expect(screen.getByText('Services')).toBeInTheDocument()
    expect(screen.getByText('Investments')).toBeInTheDocument()

    expect(
      screen.getByText(formatCurrency(breakdown.obligation, profile.currency)),
    ).toBeInTheDocument()
    expect(
      screen.getByText(formatCurrency(breakdown.debt, profile.currency)),
    ).toBeInTheDocument()
    expect(
      screen.getByText(formatCurrency(breakdown.service, profile.currency)),
    ).toBeInTheDocument()
    expect(
      screen.getByText(formatCurrency(breakdown.investment, profile.currency)),
    ).toBeInTheDocument()

    expect(mockGetBreakdown).toHaveBeenCalledWith('jwt-token')
    expect(mockGetCurrentUser).toHaveBeenCalledWith('jwt-token')
  })

  it('still renders zero amounts for all categories', async () => {
    const emptyBreakdown: BreakdownData = {
      obligation: '0.00',
      debt: '0.00',
      service: '0.00',
      investment: '0.00',
    }
    mockGetBreakdown.mockResolvedValue(emptyBreakdown)
    mockGetCurrentUser.mockResolvedValue(profile)

    render(<Breakdown />)

    await waitFor(() => {
      expect(screen.getByText('Obligations')).toBeInTheDocument()
    })

    expect(screen.getByText('Debt')).toBeInTheDocument()
    expect(screen.getByText('Services')).toBeInTheDocument()
    expect(screen.getByText('Investments')).toBeInTheDocument()

    const zeroAmount = formatCurrency('0.00', profile.currency)
    expect(screen.getAllByText(zeroAmount)).toHaveLength(4)
  })

  it('keeps loading until both requests settle', async () => {
    let resolveProfile: (value: UserProfile) => void = () => {}
    mockGetBreakdown.mockResolvedValue(breakdown)
    mockGetCurrentUser.mockReturnValue(
      new Promise<UserProfile>((resolve) => {
        resolveProfile = resolve
      }),
    )

    render(<Breakdown />)

    expect(screen.getByText('Loading breakdown...')).toBeInTheDocument()
    expect(screen.queryByText('Obligations')).not.toBeInTheDocument()

    resolveProfile(profile)

    await waitFor(() => {
      expect(
        screen.getByText(formatCurrency(breakdown.obligation, profile.currency)),
      ).toBeInTheDocument()
    })
  })

  it('falls back to the default currency when the profile request fails', async () => {
    mockGetBreakdown.mockResolvedValue(breakdown)
    mockGetCurrentUser.mockRejectedValue(new ApiError('Profile unavailable', 500))

    render(<Breakdown />)

    await waitFor(() => {
      expect(
        screen.getByText(formatCurrency(breakdown.obligation, 'EUR')),
      ).toBeInTheDocument()
    })
  })
})
