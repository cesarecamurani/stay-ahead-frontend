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
