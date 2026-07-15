export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  token?: string | null
}

function formatFieldError(field: string, message: string): string {
  const label = field.replace(/_/g, ' ')

  if (/^[a-z]/.test(message)) {
    return `${label} ${message}`
  }

  return message
}

export function parseErrorMessages(data: unknown): string[] {
  if (!data || typeof data !== 'object') {
    return ['Request failed']
  }

  const payload = data as Record<string, unknown>

  if (payload.errors !== undefined) {
    if (Array.isArray(payload.errors)) {
      return payload.errors.map(String)
    }

    if (typeof payload.errors === 'object' && payload.errors !== null) {
      return Object.entries(payload.errors as Record<string, unknown>).flatMap(
        ([field, value]) => {
          if (Array.isArray(value)) {
            return value.map((message) => formatFieldError(field, String(message)))
          }

          if (typeof value === 'string') {
            return [formatFieldError(field, value)]
          }

          return []
        },
      )
    }
  }

  if (typeof payload.error === 'string') {
    return [payload.error]
  }

  if (typeof payload.message === 'string') {
    return [payload.message]
  }

  return ['Request failed']
}

function parseErrorMessage(data: unknown): string {
  return parseErrorMessages(data).join('\n')
}

function getBaseUrl(): string {
  if (import.meta.env.DEV) {
    return ''
  }

  return import.meta.env.VITE_API_BASE_URL ?? ''
}

export async function request<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<T> {
  const baseUrl = getBaseUrl()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

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

  return response.json() as Promise<T>
}
