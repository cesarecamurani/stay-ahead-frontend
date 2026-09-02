import { beforeEach, describe, expect, it, vi } from 'vitest'
import { login, register } from './auth.ts'

const mockRequest = vi.hoisted(() => vi.fn())

vi.mock('./client.ts', () => ({
  request: mockRequest,
}))

describe('auth api', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('posts login credentials to the login endpoint', async () => {
    const response = {
      user: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        email: 'user@example.com',
        username: 'testuser',
      },
      message: 'Logged in',
      token: 'jwt-token',
    }
    mockRequest.mockResolvedValue(response)

    await expect(login('user@example.com', 'secret')).resolves.toEqual(response)
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/login', {
      method: 'POST',
      body: { email: 'user@example.com', password: 'secret' },
    })
  })

  it('posts nested user params to the users endpoint', async () => {
    const input = {
      username: 'testuser',
      email: 'user@example.com',
      password: 'secret',
      password_confirmation: 'secret',
      monthly_income: 3000,
      savings: 1000,
      protected_savings: 500,
      currency: 'EUR',
    }
    const response = {
      user: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        email: 'user@example.com',
        username: 'testuser',
      },
      message: 'Registered',
      token: 'jwt-token',
    }
    mockRequest.mockResolvedValue(response)

    await expect(register(input)).resolves.toEqual(response)
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/users', {
      method: 'POST',
      body: { user: input },
    })
  })
})
