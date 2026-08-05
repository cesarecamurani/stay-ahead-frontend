import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as authApi from '../api/auth.ts'
import { notifyUnauthorized } from '../api/unauthorized.ts'
import { AuthProvider } from './AuthProvider.tsx'
import { useAuth } from './useAuth.ts'
import { getStoredAuth } from './tokenStorage.ts'

vi.mock('../api/auth.ts', () => ({
  login: vi.fn(),
  register: vi.fn(),
}))

function AuthState() {
  const { user, token, sessionExpired, login, register, logout } = useAuth()

  return (
    <div>
      <p>Email: {user?.email ?? 'none'}</p>
      <p>Token: {token ?? 'none'}</p>
      <p>Session expired: {sessionExpired ? 'yes' : 'no'}</p>
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
  user: {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    email: 'user@example.com',
    username: 'testuser',
  },
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
      JSON.stringify({
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        email: 'stored@example.com',
        username: 'storeduser',
      }),
    )

    renderAuthProvider()

    expect(screen.getByText('Email: stored@example.com')).toBeInTheDocument()
    expect(screen.getByText('Token: stored-token')).toBeInTheDocument()
  })

  it('starts unauthenticated when stored user is missing username', () => {
    localStorage.setItem('stay_ahead_token', 'stored-token')
    localStorage.setItem(
      'stay_ahead_user',
      JSON.stringify({
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        email: 'stored@example.com',
      }),
    )

    renderAuthProvider()

    expect(screen.getByText('Email: none')).toBeInTheDocument()
    expect(screen.getByText('Token: none')).toBeInTheDocument()
    expect(getStoredAuth()).toBeNull()
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
      user: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        email: 'user@example.com',
        username: 'testuser',
      },
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
      user: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        email: 'user@example.com',
        username: 'testuser',
      },
    })
  })

  it('clears auth state on logout', async () => {
    const user = userEvent.setup()
    localStorage.setItem('stay_ahead_token', 'stored-token')
    localStorage.setItem(
      'stay_ahead_user',
      JSON.stringify({
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        email: 'stored@example.com',
        username: 'storeduser',
      }),
    )

    renderAuthProvider()
    await user.click(screen.getByRole('button', { name: 'Log out' }))

    expect(screen.getByText('Email: none')).toBeInTheDocument()
    expect(screen.getByText('Token: none')).toBeInTheDocument()
    expect(screen.getByText('Session expired: no')).toBeInTheDocument()
    expect(getStoredAuth()).toBeNull()
  })

  it('expires the current authenticated session', () => {
    localStorage.setItem('stay_ahead_token', 'stored-token')
    localStorage.setItem(
      'stay_ahead_user',
      JSON.stringify({
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        email: 'stored@example.com',
        username: 'storeduser',
      }),
    )

    renderAuthProvider()
    act(() => notifyUnauthorized('stored-token'))

    expect(screen.getByText('Email: none')).toBeInTheDocument()
    expect(screen.getByText('Token: none')).toBeInTheDocument()
    expect(screen.getByText('Session expired: yes')).toBeInTheDocument()
    expect(getStoredAuth()).toBeNull()
  })

  it('ignores a late unauthorized response for an older token', () => {
    localStorage.setItem('stay_ahead_token', 'current-token')
    localStorage.setItem(
      'stay_ahead_user',
      JSON.stringify({
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        email: 'stored@example.com',
        username: 'storeduser',
      }),
    )

    renderAuthProvider()
    act(() => notifyUnauthorized('older-token'))

    expect(screen.getByText('Email: stored@example.com')).toBeInTheDocument()
    expect(screen.getByText('Token: current-token')).toBeInTheDocument()
    expect(screen.getByText('Session expired: no')).toBeInTheDocument()
    expect(getStoredAuth()?.token).toBe('current-token')
  })

  it('clears the expired-session state after a new login', async () => {
    const user = userEvent.setup()
    localStorage.setItem('stay_ahead_token', 'stored-token')
    localStorage.setItem(
      'stay_ahead_user',
      JSON.stringify({
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        email: 'stored@example.com',
        username: 'storeduser',
      }),
    )
    vi.mocked(authApi.login).mockResolvedValue(authResponse)

    renderAuthProvider()
    act(() => notifyUnauthorized('stored-token'))
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => {
      expect(screen.getByText('Token: jwt-token')).toBeInTheDocument()
    })
    expect(screen.getByText('Session expired: no')).toBeInTheDocument()
  })
})
