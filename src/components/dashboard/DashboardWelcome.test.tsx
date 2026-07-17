import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const mockUseAuth = vi.fn()

vi.mock('../../auth/useAuth.ts', () => ({
  useAuth: () => mockUseAuth(),
}))

import { DashboardWelcome } from './DashboardWelcome.tsx'

describe('DashboardWelcome', () => {
  it('renders greeting name using username', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, email: 'user@example.com', username: 'testuser' },
      token: 'jwt-token',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    })

    render(<DashboardWelcome />)

    expect(screen.getByText('testuser')).toBeInTheDocument()
  })

  it('falls back to email when username is missing', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, email: 'user@example.com' },
      token: 'jwt-token',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    } as any)

    render(<DashboardWelcome />)

    expect(screen.getByText('user@example.com')).toBeInTheDocument()
  })
})

