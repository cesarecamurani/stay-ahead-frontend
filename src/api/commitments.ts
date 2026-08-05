import { request } from './client.ts'
import type {
  Commitment,
  CommitmentLifecycleAction,
  CreateCommitmentInput,
} from './types.ts'

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

function transitionCommitment(
  token: string,
  id: string,
  action: CommitmentLifecycleAction,
): Promise<Commitment> {
  return request<Commitment>(
    `/api/v1/commitments/${encodeURIComponent(id)}/${action}`,
    {
      method: 'POST',
      token,
    },
  )
}

export function pauseCommitment(
  token: string,
  id: string,
): Promise<Commitment> {
  return transitionCommitment(token, id, 'pause')
}

export function resumeCommitment(
  token: string,
  id: string,
): Promise<Commitment> {
  return transitionCommitment(token, id, 'resume')
}

export function cancelCommitment(
  token: string,
  id: string,
): Promise<Commitment> {
  return transitionCommitment(token, id, 'cancel')
}
