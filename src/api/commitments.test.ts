import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  assessCommitment,
  cancelCommitment,
  createCommitment,
  getCommitments,
  pauseCommitment,
  resumeCommitment,
} from './commitments.ts'

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

  it('creates a commitment with the auth token', async () => {
    const created = {
      id: 'abc-456',
      name: 'Car Loan',
      category: 'debt',
      recurrence: 'monthly',
      status: 'active',
      amount: '300.25',
      start_date: '2026-07-17',
      duration_months: 24,
      interest_rate: null,
    }
    const input = {
      name: 'Car Loan',
      category: 'debt' as const,
      recurrence: 'monthly' as const,
      amount: 300.25,
      start_date: '2026-07-17',
      duration_months: 24,
    }
    mockRequest.mockResolvedValue(created)

    await expect(createCommitment('jwt-token', input)).resolves.toEqual(created)
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/commitments', {
      method: 'POST',
      token: 'jwt-token',
      body: { commitment: input },
    })
  })

  it('assesses a commitment without creating it', async () => {
    const input = {
      name: 'Apple TV',
      category: 'service' as const,
      recurrence: 'monthly' as const,
      amount: 10,
      start_date: '2026-12-01',
    }
    const assessment = {
      affordable: true,
      overexposed: false,
      worst_case_date: '2026-12-01',
      projected_monthly_commitments: '2450.00',
      remaining_monthly_cash_flow: '550.00',
      remaining_spendable_savings: '3000.00',
    }
    mockRequest.mockResolvedValue({ assessment })

    await expect(assessCommitment('jwt-token', input)).resolves.toEqual(
      assessment,
    )
    expect(mockRequest).toHaveBeenCalledWith(
      '/api/v1/commitments/assessment',
      {
        method: 'POST',
        token: 'jwt-token',
        body: { commitment: input },
      },
    )
  })

  it.each([
    ['pause', pauseCommitment],
    ['resume', resumeCommitment],
    ['cancel', cancelCommitment],
  ])('posts the %s lifecycle action with the auth token', async (action, transition) => {
    const updated = {
      id: 'abc/123',
      name: 'Rent',
      category: 'obligation',
      recurrence: 'monthly',
      status:
        action === 'pause'
          ? 'paused'
          : action === 'resume'
            ? 'active'
            : 'cancelled',
      amount: '1200.00',
      start_date: '2026-01-01',
      duration_months: null,
      interest_rate: null,
    }
    mockRequest.mockResolvedValue(updated)

    await expect(transition('jwt-token', 'abc/123')).resolves.toEqual(updated)
    expect(mockRequest).toHaveBeenCalledWith(
      `/api/v1/commitments/abc%2F123/${action}`,
      {
        method: 'POST',
        token: 'jwt-token',
      },
    )
  })
})
