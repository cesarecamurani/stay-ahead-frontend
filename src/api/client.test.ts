import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, request } from './client.ts'

function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: response.ok ?? true,
      status: response.status ?? 200,
      statusText: response.statusText ?? 'OK',
      json: response.json ?? (async () => ({})),
    }),
  )
}

describe('request', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', '')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('returns parsed JSON on success', async () => {
    mockFetch({
      json: async () => ({ message: 'ok' }),
    })

    await expect(request('/api/v1/login')).resolves.toEqual({ message: 'ok' })
  })

  it('uses a relative URL in development', async () => {
    mockFetch({
      json: async () => ({}),
    })

    await request('/api/v1/login')

    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/login',
      expect.objectContaining({
        method: 'GET',
      }),
    )
  })

  it('sends JSON body and Authorization header when provided', async () => {
    mockFetch({
      json: async () => ({}),
    })

    await request('/api/v1/login', {
      method: 'POST',
      body: { email: 'user@example.com', password: 'secret' },
      token: 'jwt-token',
    })

    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/login',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer jwt-token',
        },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'secret',
        }),
      }),
    )
  })

  it('throws ApiError with joined Rails validation errors', async () => {
    mockFetch({
      ok: false,
      status: 422,
      json: async () => ({ errors: ['Email is invalid', 'Password is too short'] }),
    })

    await expect(request('/api/v1/users')).rejects.toEqual(
      new ApiError('Email is invalid, Password is too short', 422),
    )
  })

  it('throws ApiError with a single error field', async () => {
    mockFetch({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid email or password' }),
    })

    await expect(request('/api/v1/login')).rejects.toEqual(
      new ApiError('Invalid email or password', 401),
    )
  })

  it('throws ApiError with a message field', async () => {
    mockFetch({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Bad request' }),
    })

    await expect(request('/api/v1/login')).rejects.toEqual(
      new ApiError('Bad request', 400),
    )
  })

  it('throws a helpful ApiError when the API server is unreachable', async () => {
    mockFetch({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: async () => {
        throw new Error('not json')
      },
    })

    await expect(request('/api/v1/login')).rejects.toEqual(
      new ApiError(
        'Cannot reach the API server. Make sure the Rails backend is running and VITE_API_PROXY_TARGET matches its port.',
        502,
      ),
    )
  })

  it('returns undefined for 204 responses', async () => {
    mockFetch({
      status: 204,
      json: async () => {
        throw new Error('no body')
      },
    })

    await expect(request('/api/v1/logout')).resolves.toBeUndefined()
  })
})
