import { request } from './client.ts'
import type {
  UpdateUserProfileInput,
  UserProfile,
  UserProfileResponse,
} from './types.ts'

export async function getCurrentUser(token: string): Promise<UserProfile> {
  const response = await request<UserProfileResponse>('/api/v1/me', { token })
  return response.user
}

export async function updateCurrentUser(
  token: string,
  input: UpdateUserProfileInput,
): Promise<UserProfile> {
  const response = await request<UserProfileResponse>('/api/v1/me', {
    method: 'PATCH',
    body: { user: input },
    token,
  })

  return response.user
}
