export type UnauthorizedHandler = (token: string) => void

let unauthorizedHandler: UnauthorizedHandler | null = null

export function registerUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null
    }
  }
}

export function notifyUnauthorized(token: string) {
  unauthorizedHandler?.(token)
}
