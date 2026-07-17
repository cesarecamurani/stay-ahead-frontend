import { useState, type SubmitEvent } from 'react'
import { createCommitment } from '../../api/commitments.ts'
import { ApiError } from '../../api/errors.ts'
import type {
  Commitment,
  CommitmentCategory,
  CommitmentRecurrence,
  CreateCommitmentInput,
} from '../../api/types.ts'
import { useAuth } from '../../auth/useAuth.ts'
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isOneTime = recurrence === 'one_time'

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

    setIsSubmitting(true)

    try {
      const commitment = await createCommitment(token, input)
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

            if (nameError) {
              setNameError(null)
            }
          }}
          required
          autoFocus
          disabled={isSubmitting}
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

            if (amountError) {
              setAmountError(null)
            }
          }}
          required
          disabled={isSubmitting}
          error={amountError}
        />
        <Select
          id="commitment-category"
          label="Category"
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as CommitmentCategory)
          }
          options={CATEGORY_OPTIONS}
          required
          disabled={isSubmitting}
        />
        <Select
          id="commitment-recurrence"
          label="Recurrence"
          value={recurrence}
          onChange={(event) => {
            setRecurrence(event.target.value as CommitmentRecurrence)
            setDueDateError(null)
            setStartDateError(null)
            setDurationMonthsError(null)
          }}
          options={RECURRENCE_OPTIONS}
          required
          disabled={isSubmitting}
        />
        {isOneTime ? (
          <Input
            id="commitment-due-date"
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(event) => {
              setDueDate(event.target.value)

              if (dueDateError) {
                setDueDateError(null)
              }
            }}
            required
            disabled={isSubmitting}
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

                if (startDateError) {
                  setStartDateError(null)
                }
              }}
              required
              disabled={isSubmitting}
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

                if (durationMonthsError) {
                  setDurationMonthsError(null)
                }
              }}
              disabled={isSubmitting}
              error={durationMonthsError}
            />
          </>
        )}
        <div className="commitment-form__actions">
          {onCancel && (
            <Button
              type="button"
              className="btn--secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            className="auth-form__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create commitment'}
          </Button>
        </div>
      </form>
    </div>
  )
}
