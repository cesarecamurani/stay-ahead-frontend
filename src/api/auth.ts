import { request } from './client.ts'
import type { AuthResponse, RegisterUserInput } from './types.ts'

export function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/api/v1/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function register(input: RegisterUserInput): Promise<AuthResponse> {
  return request<AuthResponse>('/api/v1/users', {
    method: 'POST',
    body: { user: input },
  })
}
