import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, parseErrorMessages, UNREACHABLE_API_USER_MESSAGE } from './errors.ts'
import { request } from './client.ts'
import { registerUnauthorizedHandler } from './unauthorized.ts'

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
  let unregisterUnauthorizedHandler: (() => void) | undefined

  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', '')
  })

  afterEach(() => {
    unregisterUnauthorizedHandler?.()
    unregisterUnauthorizedHandler = undefined
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

    const [, options] = vi.mocked(fetch).mock.calls[0]
    expect(options).toMatchObject({
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'secret',
      }),
    })

    const headers = options?.headers as Headers
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(headers.get('Authorization')).toBe('Bearer jwt-token')
  })

  it('throws ApiError with joined Rails validation errors', async () => {
    mockFetch({
      ok: false,
      status: 422,
      json: async () => ({ errors: ['Email is invalid', 'Password is too short'] }),
    })

    await expect(request('/api/v1/users')).rejects.toEqual(
      new ApiError('Email is invalid\nPassword is too short', 422),
    )
  })

  it('throws ApiError with Rails field validation errors', async () => {
    mockFetch({
      ok: false,
      status: 422,
      json: async () => ({
        errors: {
          email: ['has already been taken'],
          password: ['is too short'],
        },
      }),
    })

    await expect(request('/api/v1/users')).rejects.toEqual(
      new ApiError('email has already been taken\npassword is too short', 422),
    )
  })

  it('parses Rails field validation errors into messages', () => {
    expect(
      parseErrorMessages({
        errors: {
          email: ['has already been taken'],
          password: ['is too short'],
        },
      }),
    ).toEqual(['email has already been taken', 'password is too short'])
  })

  it('falls back when errors payload is empty or unparseable', () => {
    expect(parseErrorMessages({ errors: {} })).toEqual(['Request failed'])
    expect(parseErrorMessages({ errors: [] })).toEqual(['Request failed'])
    expect(parseErrorMessages({ errors: { email: 123 } })).toEqual([
      'Request failed',
    ])
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

  it('notifies the unauthorized handler when an authenticated request returns 401', async () => {
    const handleUnauthorized = vi.fn()
    unregisterUnauthorizedHandler = registerUnauthorizedHandler(
      handleUnauthorized,
    )
    mockFetch({
      ok: false,
      status: 401,
      json: async () => ({ error: 'unauthorized' }),
    })

    await expect(
      request('/api/v1/me', { token: 'expired-token' }),
    ).rejects.toEqual(new ApiError('unauthorized', 401))
    expect(handleUnauthorized).toHaveBeenCalledOnce()
    expect(handleUnauthorized).toHaveBeenCalledWith('expired-token')
  })

  it('does not notify the unauthorized handler for an unauthenticated 401', async () => {
    const handleUnauthorized = vi.fn()
    unregisterUnauthorizedHandler = registerUnauthorizedHandler(
      handleUnauthorized,
    )
    mockFetch({
      ok: false,
      status: 401,
      json: async () => ({ error: 'invalid_credentials' }),
    })

    await expect(request('/api/v1/login')).rejects.toEqual(
      new ApiError('invalid_credentials', 401),
    )
    expect(handleUnauthorized).not.toHaveBeenCalled()
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

  it('throws a user-friendly ApiError when the API server is unreachable', async () => {
    mockFetch({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: async () => {
        throw new Error('not json')
      },
    })

    await expect(request('/api/v1/login')).rejects.toEqual(
      new ApiError(UNREACHABLE_API_USER_MESSAGE, 502),
    )
  })

  it('throws a user-friendly ApiError when the network request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    )

    await expect(request('/api/v1/login')).rejects.toEqual(
      new ApiError(UNREACHABLE_API_USER_MESSAGE, 0),
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
