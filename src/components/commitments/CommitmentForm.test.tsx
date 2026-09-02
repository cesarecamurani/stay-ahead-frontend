import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/errors.ts'
import type { Commitment } from '../../api/types.ts'
import { formatCurrency } from '../../utils/formatCurrency.ts'

const mockAssessCommitment = vi.fn()
const mockCreateCommitment = vi.fn()
const mockGetCurrentUser = vi.fn()
const mockUseAuth = vi.fn()

vi.mock('../../api/commitments.ts', () => ({
  assessCommitment: (...args: unknown[]) => mockAssessCommitment(...args),
  createCommitment: (...args: unknown[]) => mockCreateCommitment(...args),
}))

vi.mock('../../api/user.ts', () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
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

const affordableAssessment = {
  affordable: true,
  overexposed: false,
  worst_case_date: '2026-07-17',
  projected_monthly_commitments: '3500.00',
  remaining_monthly_cash_flow: '500.00',
  remaining_spendable_savings: '7000.00',
}

describe('CommitmentForm', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    mockAssessCommitment.mockReset()
    mockCreateCommitment.mockReset()
    mockGetCurrentUser.mockReset()
    mockUseAuth.mockReturnValue({ token: 'jwt-token' })
    mockAssessCommitment.mockResolvedValue(affordableAssessment)
    mockGetCurrentUser.mockResolvedValue({ currency: 'GBP' })
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

    expect(screen.getByRole('option', { name: 'Savings' })).toBeInTheDocument()
    expect(screen.getByLabelText('Start date')).toBeInTheDocument()
    expect(screen.getByLabelText('Duration months')).toBeInTheDocument()
    expect(screen.queryByLabelText('Due date')).not.toBeInTheDocument()
  })

  it('assesses and then creates a recurring commitment', async () => {
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
    await user.click(
      screen.getByRole('button', { name: 'Check affordability' }),
    )

    await waitFor(() => {
      expect(mockAssessCommitment).toHaveBeenCalledWith('jwt-token', {
        name: 'Car Loan',
        category: 'debt',
        recurrence: 'monthly',
        amount: 300.25,
        start_date: '2026-07-17',
        duration_months: 24,
      })
    })

    expect(mockCreateCommitment).not.toHaveBeenCalled()
    expect(screen.getByText('Fits your budget')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      formatCurrency('500.00', 'GBP'),
    )

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
    mockAssessCommitment.mockResolvedValue({
      affordable: true,
      overexposed: false,
      worst_case_date: '2026-08-01',
      projected_monthly_commitments: null,
      remaining_monthly_cash_flow: null,
      remaining_spendable_savings: '6880.00',
    })

    render(<CommitmentForm />)

    await user.type(screen.getByLabelText('Name'), 'Insurance')
    await user.type(screen.getByLabelText('Amount'), '120')
    await user.selectOptions(screen.getByLabelText('Recurrence'), 'one_time')
    fireEvent.change(screen.getByLabelText('Due date'), {
      target: { value: '2026-08-01' },
    })
    await user.click(
      screen.getByRole('button', { name: 'Check affordability' }),
    )

    await waitFor(() => {
      expect(mockAssessCommitment).toHaveBeenCalledWith('jwt-token', {
        name: 'Insurance',
        category: 'obligation',
        recurrence: 'one_time',
        amount: 120,
        due_date: '2026-08-01',
      })
    })

    expect(screen.getByRole('status')).toHaveTextContent(
      'without touching protected savings',
    )

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

  it('shows assessment validation errors', async () => {
    const user = userEvent.setup()
    mockAssessCommitment.mockRejectedValue(
      new ApiError("Name can't be blank\nAmount must be greater than 0", 422),
    )

    render(<CommitmentForm />)

    await user.type(screen.getByLabelText('Name'), 'Rent')
    await user.type(screen.getByLabelText('Amount'), '100')
    fireEvent.change(screen.getByLabelText('Start date'), {
      target: { value: '2026-07-17' },
    })
    await user.click(
      screen.getByRole('button', { name: 'Check affordability' }),
    )

    await waitFor(() => {
      expect(screen.getByText(/Name can't be blank/)).toBeInTheDocument()
    })

    expect(screen.getByText(/Amount must be greater than 0/)).toBeInTheDocument()
  })

  it('warns when the commitment is over budget and allows proceeding', async () => {
    const user = userEvent.setup()
    mockAssessCommitment.mockResolvedValue({
      ...affordableAssessment,
      affordable: false,
      overexposed: true,
      remaining_monthly_cash_flow: '-500.00',
    })

    render(<CommitmentForm />)

    await user.type(screen.getByLabelText('Name'), 'Car Loan')
    await user.type(screen.getByLabelText('Amount'), '2500')
    fireEvent.change(screen.getByLabelText('Start date'), {
      target: { value: '2026-07-17' },
    })
    await user.click(
      screen.getByRole('button', { name: 'Check affordability' }),
    )

    expect(await screen.findByText('Over budget')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      formatCurrency('500.00', 'GBP'),
    )
    expect(
      screen.getByRole('button', { name: 'Add anyway' }),
    ).toBeInTheDocument()
  })

  it('describes a one-time savings commitment as an addition', async () => {
    const user = userEvent.setup()
    mockAssessCommitment.mockResolvedValue({
      affordable: true,
      overexposed: false,
      worst_case_date: '2026-08-01',
      projected_monthly_commitments: null,
      remaining_monthly_cash_flow: null,
      remaining_spendable_savings: '7250.00',
    })

    render(<CommitmentForm />)

    await user.type(screen.getByLabelText('Name'), 'Savings deposit')
    await user.type(screen.getByLabelText('Amount'), '250')
    await user.selectOptions(screen.getByLabelText('Category'), 'savings')
    await user.selectOptions(screen.getByLabelText('Recurrence'), 'one_time')
    fireEvent.change(screen.getByLabelText('Due date'), {
      target: { value: '2026-08-01' },
    })
    await user.click(
      screen.getByRole('button', { name: 'Check affordability' }),
    )

    expect(await screen.findByText('Adds to your savings')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'available above the protected amount',
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      formatCurrency('7250.00', 'GBP'),
    )
  })

  it('calls onCancel when cancel is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(<CommitmentForm onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalled()
  })
})
