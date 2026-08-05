import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/errors.ts'

const mockLogin = vi.fn()
const mockUseAuth = vi.fn()

vi.mock('../auth/useAuth.ts', () => ({
  useAuth: () => mockUseAuth(),
}))

import { LoginPage } from './LoginPage.tsx'

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockReset()
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      sessionExpired: false,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('shows a message when the previous session expired', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      sessionExpired: true,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
    })

    renderLoginPage()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Your session has expired. Please log in again.',
    )
  })

  it('shows invalid credentials instead of the expired-session message after a failed login', async () => {
    const user = userEvent.setup()
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      sessionExpired: true,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
    })
    mockLogin.mockRejectedValue(new ApiError('invalid_credentials', 401))

    renderLoginPage()

    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Password'), 'WrongPassword123!')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid email or password.',
    )
    expect(
      screen.queryByText('Your session has expired. Please log in again.'),
    ).not.toBeInTheDocument()
  })
})
