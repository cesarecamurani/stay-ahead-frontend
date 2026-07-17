import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getBreakdown } from './breakdown.ts'

const mockRequest = vi.hoisted(() => vi.fn())

vi.mock('./client.ts', () => ({
  request: mockRequest,
}))

describe('breakdown api', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('fetches the breakdown with the auth token', async () => {
    const breakdown = {
      obligation: '800.00',
      debt: '100.00',
      service: '22.00',
      investment: '250.00',
    }
    mockRequest.mockResolvedValue({ breakdown })

    await expect(getBreakdown('jwt-token')).resolves.toEqual(breakdown)
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/breakdown', {
      token: 'jwt-token',
    })
  })
})
