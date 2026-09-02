import { useEffect, useState, type SubmitEvent } from 'react'
import {
  assessCommitment,
  createCommitment,
} from '../../api/commitments.ts'
import { ApiError } from '../../api/errors.ts'
import type {
  Commitment,
  CommitmentAssessment,
  CommitmentCategory,
  CommitmentRecurrence,
  CreateCommitmentInput,
} from '../../api/types.ts'
import { getCurrentUser } from '../../api/user.ts'
import { useAuth } from '../../auth/useAuth.ts'
import { DEFAULT_CURRENCY } from '../../data/currencies.ts'
import { formatCurrency } from '../../utils/formatCurrency.ts'
import { parseFormattedNumber } from '../../utils/formatNumber.ts'
import { Button } from '../ui/Button.tsx'
import { FormError } from '../ui/FormError.tsx'
import { Input } from '../ui/Input.tsx'
import { NumberInput } from '../ui/NumberInput.tsx'
import { Select } from '../ui/Select.tsx'

const CATEGORY_OPTIONS: { value: CommitmentCategory; label: string }[] = [
  { value: 'obligation', label: 'Obligation' },
  { value: 'debt', label: 'Debt' },
  { value: 'service', label: 'Service' },
  { value: 'investment', label: 'Investment' },
  { value: 'savings', label: 'Savings' },
]

const RECURRENCE_OPTIONS: { value: CommitmentRecurrence; label: string }[] = [
  { value: 'one_time', label: 'One time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]

type CommitmentFormProps = {
  onSuccess?: (commitment: Commitment) => void
  onCancel?: () => void
}

type AssessmentState = {
  result: CommitmentAssessment
  input: CreateCommitmentInput
}

function formatAssessmentDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function absoluteCurrency(amount: string, currency: string): string {
  return formatCurrency(String(Math.abs(Number.parseFloat(amount))), currency)
}

function assessmentMessage(
  assessment: AssessmentState,
  currency: string,
): string {
  const { result, input } = assessment

  if (input.recurrence === 'one_time') {
    if (input.category === 'savings') {
      return `Your savings available above the protected amount would become ${formatCurrency(result.remaining_spendable_savings, currency)}.`
    }

    if (result.affordable) {
      return `You can cover this without touching protected savings. ${formatCurrency(result.remaining_spendable_savings, currency)} would remain available above it.`
    }

    return `This is ${absoluteCurrency(result.remaining_spendable_savings, currency)} above the savings available without going below your protected amount.`
  }

  const remainingCashFlow = result.remaining_monthly_cash_flow ?? '0'
  const worstCaseDate = formatAssessmentDate(result.worst_case_date)

  if (result.affordable) {
    return `Your lowest monthly cash flow would be ${formatCurrency(remainingCashFlow, currency)} from ${worstCaseDate}.`
  }

  return `This would put your monthly commitments ${absoluteCurrency(remainingCashFlow, currency)} above your income from ${worstCaseDate}.`
}

export function CommitmentForm({ onSuccess, onCancel }: CommitmentFormProps) {
  const { token } = useAuth()
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [amountError, setAmountError] = useState<string | null>(null)
  const [category, setCategory] = useState<CommitmentCategory>('obligation')
  const [recurrence, setRecurrence] = useState<CommitmentRecurrence>('monthly')
  const [dueDate, setDueDate] = useState('')
  const [dueDateError, setDueDateError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [startDateError, setStartDateError] = useState<string | null>(null)
  const [durationMonths, setDurationMonths] = useState('')
  const [durationMonthsError, setDurationMonthsError] = useState<string | null>(
    null,
  )
  const [formError, setFormError] = useState<string | null>(null)
  const [assessment, setAssessment] = useState<AssessmentState | null>(null)
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY)
  const [isAssessing, setIsAssessing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isOneTime = recurrence === 'one_time'
  const isBusy = isAssessing || isSubmitting

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    getCurrentUser(token)
      .then((profile) => {
        if (!cancelled) {
          setCurrency(profile.currency)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCurrency(DEFAULT_CURRENCY)
        }
      })

    return () => {
      cancelled = true
    }
  }, [token])

  function clearFieldErrors() {
    setNameError(null)
    setAmountError(null)
    setDueDateError(null)
    setStartDateError(null)
    setDurationMonthsError(null)
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    setFormError(null)
    clearFieldErrors()

    if (!token) {
      setFormError('You must be logged in to create a commitment.')
      return
    }

    const trimmedName = name.trim()
    let hasValidationError = false

    if (!trimmedName) {
      setNameError('Name is required.')
      hasValidationError = true
    }

    const amountValue = parseFormattedNumber(amount)

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setAmountError('Please enter a valid amount.')
      hasValidationError = true
    }

    if (isOneTime) {
      if (!dueDate) {
        setDueDateError('Due date is required.')
        hasValidationError = true
      }
    } else if (!startDate) {
      setStartDateError('Start date is required.')
      hasValidationError = true
    }

    let durationMonthsValue: number | undefined

    if (!isOneTime && durationMonths.trim() !== '') {
      const parsedDuration = Number.parseInt(durationMonths, 10)

      if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) {
        setDurationMonthsError('Please enter a valid number of months.')
        hasValidationError = true
      } else {
        durationMonthsValue = parsedDuration
      }
    }

    if (hasValidationError) {
      return
    }

    const input: CreateCommitmentInput = {
      name: trimmedName,
      category,
      recurrence,
      amount: amountValue,
    }

    if (isOneTime) {
      input.due_date = dueDate
    } else {
      input.start_date = startDate

      if (durationMonthsValue !== undefined) {
        input.duration_months = durationMonthsValue
      }
    }

    setIsAssessing(true)

    try {
      const result = await assessCommitment(token, input)
      setAssessment({ result, input })
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message)
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setIsAssessing(false)
    }
  }

  async function handleCreate() {
    if (!token || !assessment) {
      return
    }

    setFormError(null)
    setIsSubmitting(true)

    try {
      const commitment = await createCommitment(token, assessment.input)
      onSuccess?.(commitment)
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message)
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-card commitment-form-card">
      <h1>Add commitment</h1>
      {formError && <FormError message={formError} />}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Input
          id="commitment-name"
          label="Name"
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setAssessment(null)

            if (nameError) {
              setNameError(null)
            }
          }}
          required
          autoFocus
          disabled={isBusy}
          error={nameError}
        />
        <NumberInput
          id="commitment-amount"
          label="Amount"
          min="0"
          step="0.01"
          value={amount}
          onValueChange={(value) => {
            setAmount(value)
            setAssessment(null)

            if (amountError) {
              setAmountError(null)
            }
          }}
          required
          disabled={isBusy}
          error={amountError}
        />
        <Select
          id="commitment-category"
          label="Category"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value as CommitmentCategory)
            setAssessment(null)
          }}
          options={CATEGORY_OPTIONS}
          required
          disabled={isBusy}
        />
        <Select
          id="commitment-recurrence"
          label="Recurrence"
          value={recurrence}
          onChange={(event) => {
            setRecurrence(event.target.value as CommitmentRecurrence)
            setAssessment(null)
            setDueDateError(null)
            setStartDateError(null)
            setDurationMonthsError(null)
          }}
          options={RECURRENCE_OPTIONS}
          required
          disabled={isBusy}
        />
        {isOneTime ? (
          <Input
            id="commitment-due-date"
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(event) => {
              setDueDate(event.target.value)
              setAssessment(null)

              if (dueDateError) {
                setDueDateError(null)
              }
            }}
            required
            disabled={isBusy}
            error={dueDateError}
          />
        ) : (
          <>
            <Input
              id="commitment-start-date"
              label="Start date"
              type="date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value)
                setAssessment(null)

                if (startDateError) {
                  setStartDateError(null)
                }
              }}
              required
              disabled={isBusy}
              error={startDateError}
            />
            <NumberInput
              id="commitment-duration-months"
              label="Duration months"
              min="1"
              step="1"
              value={durationMonths}
              onValueChange={(value) => {
                setDurationMonths(value)
                setAssessment(null)

                if (durationMonthsError) {
                  setDurationMonthsError(null)
                }
              }}
              disabled={isBusy}
              error={durationMonthsError}
            />
          </>
        )}
        {assessment && (
          <div
            className={`commitment-assessment commitment-assessment--${assessment.result.affordable ? 'affordable' : 'overexposed'}`}
            role="status"
            aria-live="polite"
          >
            <h2>
              {assessment.input.recurrence === 'one_time' &&
              assessment.input.category === 'savings'
                ? 'Adds to your savings'
                : assessment.result.affordable
                  ? 'Fits your budget'
                  : 'Over budget'}
            </h2>
            <p>{assessmentMessage(assessment, currency)}</p>
          </div>
        )}
        <div className="commitment-form__actions">
          {onCancel && (
            <Button
              type="button"
              className="btn--secondary"
              onClick={onCancel}
              disabled={isBusy}
            >
              Cancel
            </Button>
          )}
          {assessment ? (
            <Button
              type="button"
              className="auth-form__submit"
              disabled={isBusy}
              onClick={handleCreate}
            >
              {isSubmitting
                ? 'Adding...'
                : assessment.result.overexposed
                  ? 'Add anyway'
                  : 'Add commitment'}
            </Button>
          ) : (
            <Button
              type="submit"
              className="auth-form__submit"
              disabled={isBusy}
            >
              {isAssessing ? 'Checking...' : 'Check affordability'}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
