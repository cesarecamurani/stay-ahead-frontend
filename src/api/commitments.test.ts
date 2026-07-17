import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCommitments } from './commitments.ts'

const mockRequest = vi.hoisted(() => vi.fn())

vi.mock('./client.ts', () => ({
  request: mockRequest,
}))

describe('commitments api', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('fetches commitments with the auth token', async () => {
    const commitments = [
      {
        id: 'abc-123',
        name: 'Rent',
        category: 'obligation',
        recurrence: 'monthly',
        status: 'active',
        amount: '1200.00',
        start_date: '2026-01-01',
        duration_months: null,
        interest_rate: null,
      },
    ]
    mockRequest.mockResolvedValue(commitments)

    await expect(getCommitments('jwt-token')).resolves.toEqual(commitments)
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/commitments', {
      token: 'jwt-token',
    })
  })
})
