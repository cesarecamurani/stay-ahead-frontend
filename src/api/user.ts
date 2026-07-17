import { request } from './client.ts'
import type { UserProfile, UserProfileResponse } from './types.ts'

export async function getCurrentUser(token: string): Promise<UserProfile> {
  const response = await request<UserProfileResponse>('/api/v1/me', { token })
  return response.user
}
