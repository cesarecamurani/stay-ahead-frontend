import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/errors.ts'
import type { Commitment } from '../../api/types.ts'

const mockCreateCommitment = vi.fn()
const mockUseAuth = vi.fn()

vi.mock('../../api/commitments.ts', () => ({
  createCommitment: (...args: unknown[]) => mockCreateCommitment(...args),
}))

vi.mock('../../auth/useAuth.ts', () => ({
  useAuth: () => mockUseAuth(),
}))

import { CommitmentForm } from './CommitmentForm.tsx'

const createdCommitment: Commitment = {
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

describe('CommitmentForm', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    mockCreateCommitment.mockReset()
    mockUseAuth.mockReturnValue({ token: 'jwt-token' })
  })

  it('shows due date for one-time commitments and hides recurring fields', async () => {
    const user = userEvent.setup()

    render(<CommitmentForm />)

    await user.selectOptions(screen.getByLabelText('Recurrence'), 'one_time')

    expect(screen.getByLabelText('Due date')).toBeInTheDocument()
    expect(screen.queryByLabelText('Start date')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Duration months')).not.toBeInTheDocument()
  })

  it('shows start date and duration for recurring commitments', () => {
    render(<CommitmentForm />)

    expect(screen.getByLabelText('Start date')).toBeInTheDocument()
    expect(screen.getByLabelText('Duration months')).toBeInTheDocument()
    expect(screen.queryByLabelText('Due date')).not.toBeInTheDocument()
  })

  it('submits a recurring commitment and calls onSuccess', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    mockCreateCommitment.mockResolvedValue(createdCommitment)

    render(<CommitmentForm onSuccess={onSuccess} />)

    await user.type(screen.getByLabelText('Name'), 'Car Loan')
    await user.type(screen.getByLabelText('Amount'), '300.25')
    await user.selectOptions(screen.getByLabelText('Category'), 'debt')
    fireEvent.change(screen.getByLabelText('Start date'), {
      target: { value: '2026-07-17' },
    })
    await user.type(screen.getByLabelText('Duration months'), '24')
    await user.click(screen.getByRole('button', { name: 'Add commitment' }))

    await waitFor(() => {
      expect(mockCreateCommitment).toHaveBeenCalledWith('jwt-token', {
        name: 'Car Loan',
        category: 'debt',
        recurrence: 'monthly',
        amount: 300.25,
        start_date: '2026-07-17',
        duration_months: 24,
      })
    })

    expect(onSuccess).toHaveBeenCalledWith(createdCommitment)
  })

  it('submits a one-time commitment with due date', async () => {
    const user = userEvent.setup()
    mockCreateCommitment.mockResolvedValue({
      ...createdCommitment,
      recurrence: 'one_time',
      due_date: '2026-08-01',
      start_date: undefined,
      duration_months: null,
    })

    render(<CommitmentForm />)

    await user.type(screen.getByLabelText('Name'), 'Insurance')
    await user.type(screen.getByLabelText('Amount'), '120')
    await user.selectOptions(screen.getByLabelText('Recurrence'), 'one_time')
    fireEvent.change(screen.getByLabelText('Due date'), {
      target: { value: '2026-08-01' },
    })
    await user.click(screen.getByRole('button', { name: 'Add commitment' }))

    await waitFor(() => {
      expect(mockCreateCommitment).toHaveBeenCalledWith('jwt-token', {
        name: 'Insurance',
        category: 'obligation',
        recurrence: 'one_time',
        amount: 120,
        due_date: '2026-08-01',
      })
    })
  })

  it('shows API validation errors', async () => {
    const user = userEvent.setup()
    mockCreateCommitment.mockRejectedValue(
      new ApiError("Name can't be blank\nAmount must be greater than 0", 422),
    )

    render(<CommitmentForm />)

    await user.type(screen.getByLabelText('Name'), 'Rent')
    await user.type(screen.getByLabelText('Amount'), '100')
    fireEvent.change(screen.getByLabelText('Start date'), {
      target: { value: '2026-07-17' },
    })
    await user.click(screen.getByRole('button', { name: 'Add commitment' }))

    await waitFor(() => {
      expect(screen.getByText(/Name can't be blank/)).toBeInTheDocument()
    })

    expect(screen.getByText(/Amount must be greater than 0/)).toBeInTheDocument()
  })

  it('calls onCancel when cancel is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(<CommitmentForm onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalled()
  })
})
