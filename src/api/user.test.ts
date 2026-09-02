import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCurrentUser, updateCurrentUser } from './user.ts'

const mockRequest = vi.hoisted(() => vi.fn())

vi.mock('./client.ts', () => ({
  request: mockRequest,
}))

describe('user api', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('fetches the current user profile with the auth token', async () => {
    const profile = {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      email: 'user@example.com',
      username: 'testuser',
      monthly_income: '5000.00',
      savings: '10000.00',
      protected_savings: '3000.00',
      currency: 'EUR',
    }
    mockRequest.mockResolvedValue({ user: profile })

    await expect(getCurrentUser('jwt-token')).resolves.toEqual(profile)
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/me', {
      token: 'jwt-token',
    })
  })

  it('updates the current user financial profile', async () => {
    const input = {
      monthly_income: 6000,
      savings: 15000,
      protected_savings: 5000,
    }
    const profile = {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      email: 'user@example.com',
      username: 'testuser',
      monthly_income: '6000.00',
      savings: '15000.00',
      protected_savings: '5000.00',
      currency: 'EUR',
    }
    mockRequest.mockResolvedValue({ user: profile })

    await expect(updateCurrentUser('jwt-token', input)).resolves.toEqual(
      profile,
    )
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/me', {
      method: 'PATCH',
      body: { user: input },
      token: 'jwt-token',
    })
  })
})
