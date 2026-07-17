import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSummary } from './summary.ts'

const mockRequest = vi.hoisted(() => vi.fn())

vi.mock('./client.ts', () => ({
  request: mockRequest,
}))

describe('summary api', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('fetches the financial summary with the auth token', async () => {
    const summary = {
      monthly_income: '5000.00',
      savings: '10000.00',
      monthly_commitments_amount: '1200.00',
      available_cash_flow: '3800.00',
      savings_runway_months: 6.4,
    }
    mockRequest.mockResolvedValue({ summary })

    await expect(getSummary('jwt-token')).resolves.toEqual(summary)
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/summary', {
      token: 'jwt-token',
    })
  })
})
