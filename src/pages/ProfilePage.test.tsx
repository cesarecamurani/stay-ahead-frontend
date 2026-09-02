import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetCurrentUser = vi.fn()
const mockUpdateCurrentUser = vi.fn()
const mockUseAuth = vi.fn()

vi.mock('../api/user.ts', () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
  updateCurrentUser: (...args: unknown[]) => mockUpdateCurrentUser(...args),
}))

vi.mock('../auth/useAuth.ts', () => ({
  useAuth: () => mockUseAuth(),
}))

import { ProfilePage } from './ProfilePage.tsx'

const profile = {
  id: 'user-1',
  email: 'user@example.com',
  username: 'testuser',
  monthly_income: '5000.00',
  savings: '10000.00',
  protected_savings: '3000.00',
  currency: 'EUR',
}

describe('ProfilePage', () => {
  beforeEach(() => {
    mockGetCurrentUser.mockReset()
    mockUpdateCurrentUser.mockReset()
    mockUseAuth.mockReturnValue({ token: 'jwt-token' })
    mockGetCurrentUser.mockResolvedValue(profile)
    mockUpdateCurrentUser.mockResolvedValue(profile)
  })

  afterEach(() => {
    cleanup()
  })

  it('loads and updates the financial profile fields', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    )

    const monthlyIncome = await screen.findByLabelText('Monthly income')
    const savings = screen.getByLabelText('Total savings')
    const protectedSavings = screen.getByLabelText('Protected savings')

    expect(monthlyIncome).toHaveValue('5,000.00')
    expect(savings).toHaveValue('10,000.00')
    expect(protectedSavings).toHaveValue('3,000.00')

    await user.clear(monthlyIncome)
    await user.type(monthlyIncome, '6000')
    await user.clear(savings)
    await user.type(savings, '15000')
    await user.clear(protectedSavings)
    await user.type(protectedSavings, '0')
    await user.click(screen.getByRole('button', { name: 'Save profile' }))

    await waitFor(() => {
      expect(mockUpdateCurrentUser).toHaveBeenCalledWith('jwt-token', {
        monthly_income: 6000,
        savings: 15000,
        protected_savings: 0,
      })
    })
  })
})
