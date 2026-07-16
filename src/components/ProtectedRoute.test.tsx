import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { AuthContext } from '../auth/AuthContext.tsx'
import type { AuthContextValue } from '../auth/AuthContext.tsx'
import { ProtectedRoute } from './ProtectedRoute.tsx'

function renderProtectedRoute(auth: Partial<AuthContextValue> = {}) {
  const value: AuthContextValue = {
    user: null,
    token: null,
    login: async () => {},
    register: async () => {},
    logout: () => {},
    ...auth,
  }

  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthContext.Provider value={value}>
        <Routes>
          <Route path="/login" element={<p>Login page</p>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <p>Protected content</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  afterEach(() => {
    cleanup()
  })

  it('redirects unauthenticated users to login', () => {
    renderProtectedRoute({ token: null })

    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('renders children when the user is authenticated', () => {
    renderProtectedRoute({
      token: 'jwt-token',
      user: { id: 1, email: 'user@example.com' },
    })

    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })
})
