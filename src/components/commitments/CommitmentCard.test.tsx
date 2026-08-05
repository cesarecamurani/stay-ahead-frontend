import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Commitment, CommitmentStatus } from '../../api/types.ts'
import { CommitmentCard } from './CommitmentCard.tsx'

const commitment: Commitment = {
  id: 'abc-123',
  name: 'Rent',
  category: 'obligation',
  recurrence: 'monthly',
  status: 'active',
  amount: '1200.00',
  start_date: '2026-01-01',
  duration_months: null,
  interest_rate: null,
}

function renderCard(status: CommitmentStatus) {
  render(
    <CommitmentCard
      commitment={{ ...commitment, status }}
      currency="EUR"
      pendingAction={null}
      actionError={null}
      onAction={vi.fn()}
    />,
  )
}

describe('CommitmentCard', () => {
  afterEach(() => {
    cleanup()
  })

  it.each([
    ['scheduled', ['Cancel']],
    ['active', ['Pause', 'Cancel']],
    ['paused', ['Resume', 'Cancel']],
    ['completed', []],
    ['cancelled', []],
  ] as const)('shows valid actions for %s commitments', (status, labels) => {
    renderCard(status)

    expect(
      screen.queryAllByRole('button').map((button) => button.textContent),
    ).toEqual(labels)
  })
})
