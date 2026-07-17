export const UNREACHABLE_API_USER_MESSAGE =
  'Something went wrong. Please try again.'

const UNREACHABLE_API_DEV_MESSAGE =
  'Cannot reach the API server. Make sure the Rails backend is running and VITE_API_PROXY_TARGET matches its port.'

export function isGatewayError(status: number): boolean {
  return status === 502 || status === 503 || status === 504
}

export function getUnreachableApiMessage(): string {
  if (import.meta.env.DEV) {
    console.error(UNREACHABLE_API_DEV_MESSAGE)
  }

  return UNREACHABLE_API_USER_MESSAGE
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)

    this.name = 'ApiError'
    this.status = status
  }
}

export function parseErrorMessages(data: unknown): string[] {
  if (!data || typeof data !== 'object') {
    return ['Request failed']
  }

  const payload = data as Record<string, unknown>

  if (payload.errors !== undefined) {
    if (Array.isArray(payload.errors)) {
      const messages = payload.errors.map(String).filter(Boolean)

      if (messages.length > 0) {
        return messages
      }
    } else if (typeof payload.errors === 'object' && payload.errors !== null) {
      const messages = Object.entries(payload.errors as Record<string, unknown>).flatMap(
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

      if (messages.length > 0) {
        return messages
      }
    }
  }

  if (typeof payload.error === 'string' && payload.error) {
    return [payload.error]
  }

  if (typeof payload.message === 'string' && payload.message) {
    return [payload.message]
  }

  return ['Request failed']
}

function formatFieldError(field: string, message: string): string {
  const label = field.replace(/_/g, ' ')

  if (/^[a-z]/.test(message)) {
    return `${label} ${message}`
  }

  return message
}
