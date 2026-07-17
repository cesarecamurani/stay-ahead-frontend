import { request } from './client.ts'
import type { Commitment, CreateCommitmentInput } from './types.ts'

export function getCommitments(token: string): Promise<Commitment[]> {
  return request<Commitment[]>('/api/v1/commitments', { token })
}

export function createCommitment(
  token: string,
  input: CreateCommitmentInput,
): Promise<Commitment> {
  return request<Commitment>('/api/v1/commitments', {
    method: 'POST',
    token,
    body: { commitment: input },
  })
}
