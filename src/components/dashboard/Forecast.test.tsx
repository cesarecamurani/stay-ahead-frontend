import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/errors.ts'
import type { ForecastOccurrence, UserProfile } from '../../api/types.ts'
import { formatCurrency } from '../../utils/formatCurrency.ts'

const mockGetForecasts = vi.fn()
const mockGetCurrentUser = vi.fn()
const mockUseAuth = vi.fn()

vi.mock('../../api/forecasts.ts', () => ({
  getForecasts: (...args: unknown[]) => mockGetForecasts(...args),
}))

vi.mock('../../api/user.ts', () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}))

vi.mock('../../auth/useAuth.ts', () => ({
  useAuth: () => mockUseAuth(),
}))

import { Forecast } from './Forecast.tsx'

const forecasts: ForecastOccurrence[] = [
  {
    commitment_id: 'c1',
    name: 'Rent',
    category: 'obligation',
    date: '2026-08-01',
    amount: '900.00',
  },
  {
    commitment_id: 'c2',
    name: 'Netflix',
    category: 'service',
    date: '2026-08-05',
    amount: '18.00',
  },
]

const profile: UserProfile = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  email: 'user@example.com',
  username: 'testuser',
  monthly_income: '5000.00',
  savings: '10000.00',
  currency: 'EUR',
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

function expectedRange(months: number): { from: string; to: string } {
  const today = new Date()
  return {
    from: formatIsoDate(today),
    to: formatIsoDate(addMonths(today, months)),
  }
}

describe('Forecast', () => {
  beforeEach(() => {
    mockGetForecasts.mockReset()
    mockGetCurrentUser.mockReset()
    mockUseAuth.mockReturnValue({ token: 'jwt-token' })
  })

  afterEach(() => {
    cleanup()
  })

  it('shows loading initially', () => {
    mockGetForecasts.mockReturnValue(new Promise(() => {}))
    mockGetCurrentUser.mockReturnValue(new Promise(() => {}))

    render(<Forecast />)

    expect(screen.getByText('Loading forecast...')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Next 3 months' }),
    ).toBeInTheDocument()
  })

  it('shows error when forecast fetch fails', async () => {
    mockGetForecasts.mockRejectedValue(new ApiError('Failed to load', 500))
    mockGetCurrentUser.mockResolvedValue(profile)

    render(<Forecast />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeInTheDocument()
    })
  })

  it('shows empty state when there are no occurrences', async () => {
    mockGetForecasts.mockResolvedValue([])
    mockGetCurrentUser.mockResolvedValue(profile)

    render(<Forecast />)

    await waitFor(() => {
      expect(
        screen.getByText('No upcoming commitments in this period.'),
      ).toBeInTheDocument()
    })
  })

  it('renders occurrences grouped by date with category and amount', async () => {
    mockGetForecasts.mockResolvedValue(forecasts)
    mockGetCurrentUser.mockResolvedValue(profile)

    render(<Forecast />)

    await waitFor(() => {
      expect(screen.getByText('Rent')).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: '01 Aug 2026' })).toBeInTheDocument()
    expect(screen.getByText('Obligation')).toBeInTheDocument()
    expect(
      screen.getByText(formatCurrency('900.00', profile.currency)),
    ).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: '05 Aug 2026' })).toBeInTheDocument()
    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('Service')).toBeInTheDocument()
    expect(
      screen.getByText(formatCurrency('18.00', profile.currency)),
    ).toBeInTheDocument()

    const { from, to } = expectedRange(3)
    expect(mockGetForecasts).toHaveBeenCalledWith('jwt-token', from, to)
    expect(mockGetCurrentUser).toHaveBeenCalledWith('jwt-token')
  })

  it('groups multiple occurrences on the same date under one heading', async () => {
    mockGetForecasts.mockResolvedValue([
      {
        commitment_id: 'c1',
        name: 'Rent',
        category: 'obligation',
        date: '2026-08-01',
        amount: '900.00',
      },
      {
        commitment_id: 'c2',
        name: 'Gym',
        category: 'service',
        date: '2026-08-01',
        amount: '40.00',
      },
    ])
    mockGetCurrentUser.mockResolvedValue(profile)

    render(<Forecast />)

    await waitFor(() => {
      expect(screen.getByText('Rent')).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: '01 Aug 2026' })).toBeInTheDocument()
    expect(screen.getByText('Gym')).toBeInTheDocument()
    expect(screen.queryAllByRole('heading', { name: '01 Aug 2026' })).toHaveLength(1)
  })

  it('refetches with a new range when the selector changes', async () => {
    const user = userEvent.setup()
    mockGetForecasts.mockResolvedValue(forecasts)
    mockGetCurrentUser.mockResolvedValue(profile)

    render(<Forecast />)

    await waitFor(() => {
      expect(screen.getByText('Rent')).toBeInTheDocument()
    })

    const { from: defaultFrom, to: defaultTo } = expectedRange(3)
    expect(mockGetForecasts).toHaveBeenCalledWith(
      'jwt-token',
      defaultFrom,
      defaultTo,
    )

    mockGetForecasts.mockResolvedValue([])
    await user.click(screen.getByRole('button', { name: 'Next month' }))

    await waitFor(() => {
      expect(
        screen.getByText('No upcoming commitments in this period.'),
      ).toBeInTheDocument()
    })

    const { from, to } = expectedRange(1)
    expect(mockGetForecasts).toHaveBeenLastCalledWith('jwt-token', from, to)
  })

  it('falls back to the default currency when the profile request fails', async () => {
    mockGetForecasts.mockResolvedValue(forecasts)
    mockGetCurrentUser.mockRejectedValue(new ApiError('Profile unavailable', 500))

    render(<Forecast />)

    await waitFor(() => {
      expect(
        screen.getByText(formatCurrency('900.00', 'EUR')),
      ).toBeInTheDocument()
    })
  })
})
