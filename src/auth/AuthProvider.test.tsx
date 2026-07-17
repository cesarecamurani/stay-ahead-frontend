import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as authApi from '../api/auth.ts'
import { AuthProvider } from './AuthProvider.tsx'
import { useAuth } from './useAuth.ts'
import { getStoredAuth } from './tokenStorage.ts'

vi.mock('../api/auth.ts', () => ({
  login: vi.fn(),
  register: vi.fn(),
}))

function AuthState() {
  const { user, token, login, register, logout } = useAuth()

  return (
    <div>
      <p>Email: {user?.email ?? 'none'}</p>
      <p>Token: {token ?? 'none'}</p>
      <button type="button" onClick={() => login('user@example.com', 'secret')}>
        Log in
      </button>
      <button
        type="button"
        onClick={() =>
          register({
            username: 'testuser',
            email: 'user@example.com',
            password: 'secret',
            password_confirmation: 'secret',
            monthly_income: 3000,
            savings: 1000,
            currency: 'EUR',
          })
        }
      >
        Register
      </button>
      <button type="button" onClick={logout}>
        Log out
      </button>
    </div>
  )
}

function renderAuthProvider() {
  return render(
    <AuthProvider>
      <AuthState />
    </AuthProvider>,
  )
}

const authResponse = {
  user: { id: 1, email: 'user@example.com', username: 'testuser' },
  message: 'ok',
  token: 'jwt-token',
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(authApi.login).mockReset()
    vi.mocked(authApi.register).mockReset()
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('starts unauthenticated when storage is empty', () => {
    renderAuthProvider()

    expect(screen.getByText('Email: none')).toBeInTheDocument()
    expect(screen.getByText('Token: none')).toBeInTheDocument()
  })

  it('hydrates auth state from localStorage', () => {
    localStorage.setItem('stay_ahead_token', 'stored-token')
    localStorage.setItem(
      'stay_ahead_user',
      JSON.stringify({ id: 1, email: 'stored@example.com', username: 'storeduser' }),
    )

    renderAuthProvider()

    expect(screen.getByText('Email: stored@example.com')).toBeInTheDocument()
    expect(screen.getByText('Token: stored-token')).toBeInTheDocument()
  })

  it('persists auth state after login', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockResolvedValue(authResponse)

    renderAuthProvider()
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => {
      expect(screen.getByText('Email: user@example.com')).toBeInTheDocument()
      expect(screen.getByText('Token: jwt-token')).toBeInTheDocument()
    })

    expect(getStoredAuth()).toEqual({
      token: 'jwt-token',
      user: { id: 1, email: 'user@example.com', username: 'testuser' },
    })
  })

  it('persists auth state after register', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.register).mockResolvedValue(authResponse)

    renderAuthProvider()
    await user.click(screen.getByRole('button', { name: 'Register' }))

    await waitFor(() => {
      expect(screen.getByText('Email: user@example.com')).toBeInTheDocument()
      expect(screen.getByText('Token: jwt-token')).toBeInTheDocument()
    })

    expect(getStoredAuth()).toEqual({
      token: 'jwt-token',
      user: { id: 1, email: 'user@example.com', username: 'testuser' },
    })
  })

  it('clears auth state on logout', async () => {
    const user = userEvent.setup()
    localStorage.setItem('stay_ahead_token', 'stored-token')
    localStorage.setItem(
      'stay_ahead_user',
      JSON.stringify({ id: 1, email: 'stored@example.com', username: 'storeduser' }),
    )

    renderAuthProvider()
    await user.click(screen.getByRole('button', { name: 'Log out' }))

    expect(screen.getByText('Email: none')).toBeInTheDocument()
    expect(screen.getByText('Token: none')).toBeInTheDocument()
    expect(getStoredAuth()).toBeNull()
  })
})
