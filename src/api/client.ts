import { ApiError, parseErrorMessages } from './errors'
import type { RequestOptions } from './types'

function parseErrorMessage(data: unknown): string {
  return parseErrorMessages(data).join('\n')
}

function getBaseUrl(): string {
  if (import.meta.env.DEV) {
    return ''
  }

  return import.meta.env.VITE_API_BASE_URL ?? ''
}

function addAuthorizationHeader(
  headers: Headers,
  token?: string | null,
): void {
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
}

export async function request<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<T> {
  const baseUrl = getBaseUrl()

  const headers = new Headers({
    'Content-Type': 'application/json',
  })

  addAuthorizationHeader(headers, token)

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let message = 'Request failed'

    if (response.status === 502) {
      message =
        'Cannot reach the API server. Make sure the Rails backend is running and VITE_API_PROXY_TARGET matches its port.'
    } else {
      try {
        const data: unknown = await response.json()
        message = parseErrorMessage(data)
      } catch {
        message = response.statusText || message
      }
    }

    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const data = await response.json()

  return data as T
}
