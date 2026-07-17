import { request } from './client.ts'
import type { Commitment } from './types.ts'

export function getCommitments(token: string): Promise<Commitment[]> {
  return request<Commitment[]>('/api/v1/commitments', { token })
}
