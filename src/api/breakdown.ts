import { request } from './client.ts'
import type { Breakdown, BreakdownResponse } from './types.ts'

export async function getBreakdown(token: string): Promise<Breakdown> {
  const response = await request<BreakdownResponse>('/api/v1/breakdown', {
    token,
  })
  return response.breakdown
}
