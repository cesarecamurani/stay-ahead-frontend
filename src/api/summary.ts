import { request } from './client.ts'
import type { FinancialSummary, FinancialSummaryResponse } from './types.ts'

export async function getSummary(token: string): Promise<FinancialSummary> {
  const response = await request<FinancialSummaryResponse>('/api/v1/summary', {
    token,
  })
  return response.summary
}
