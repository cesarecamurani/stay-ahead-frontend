import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockRegister = vi.fn()
const mockUseAuth = vi.fn()

vi.mock('../auth/useAuth.ts', () => ({
  useAuth: () => mockUseAuth(),
}))

import { RegisterPage } from './RegisterPage.tsx'

describe('RegisterPage', () => {
  beforeEach(() => {
    mockRegister.mockReset()
    mockRegister.mockResolvedValue(undefined)
    mockUseAuth.mockReturnValue({ register: mockRegister, token: null })
  })

  afterEach(() => {
    cleanup()
  })

  it('registers with the protected savings amount selected by the user', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Username'), 'testuser')
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Password'), 'Password123!')
    await user.type(screen.getByLabelText('Confirm password'), 'Password123!')
    await user.type(screen.getByLabelText('Monthly income'), '3000')
    await user.type(screen.getByLabelText('Savings'), '1000')
    await user.type(screen.getByLabelText('Protected savings'), '0')
    await user.click(screen.getByRole('button', { name: 'Register' }))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'user@example.com',
        password: 'Password123!',
        password_confirmation: 'Password123!',
        monthly_income: 3000,
        savings: 1000,
        protected_savings: 0,
        currency: 'EUR',
      })
    })
  })
})
