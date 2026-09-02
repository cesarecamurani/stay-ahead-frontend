import { useEffect, useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../api/errors.ts'
import { getCurrentUser, updateCurrentUser } from '../api/user.ts'
import { useAuth } from '../auth/useAuth.ts'
import { Layout } from '../components/layout/Layout.tsx'
import { Button } from '../components/ui/Button.tsx'
import { FormError } from '../components/ui/FormError.tsx'
import { NumberInput } from '../components/ui/NumberInput.tsx'
import { parseFormattedNumber } from '../utils/formatNumber.ts'

export function ProfilePage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [savings, setSavings] = useState('')
  const [protectedSavings, setProtectedSavings] = useState('')
  const [monthlyIncomeError, setMonthlyIncomeError] = useState<string | null>(
    null,
  )
  const [savingsError, setSavingsError] = useState<string | null>(null)
  const [protectedSavingsError, setProtectedSavingsError] = useState<
    string | null
  >(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    getCurrentUser(token)
      .then((profile) => {
        if (!cancelled) {
          setMonthlyIncome(profile.monthly_income ?? '')
          setSavings(profile.savings ?? '')
          setProtectedSavings(profile.protected_savings ?? '')
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setFormError(
            error instanceof ApiError
              ? error.message
              : 'Something went wrong. Please try again.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [token])

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!token) {
      return
    }

    setFormError(null)
    setMonthlyIncomeError(null)
    setSavingsError(null)
    setProtectedSavingsError(null)

    const monthlyIncomeValue = parseFormattedNumber(monthlyIncome)
    const savingsValue = parseFormattedNumber(savings)
    const protectedSavingsValue = parseFormattedNumber(protectedSavings)
    let hasValidationError = false

    if (!Number.isFinite(monthlyIncomeValue)) {
      setMonthlyIncomeError('Please enter a valid amount.')
      hasValidationError = true
    }

    if (!Number.isFinite(savingsValue)) {
      setSavingsError('Please enter a valid amount.')
      hasValidationError = true
    }

    if (!Number.isFinite(protectedSavingsValue)) {
      setProtectedSavingsError('Please enter a valid amount.')
      hasValidationError = true
    }

    if (hasValidationError) {
      return
    }

    setIsSubmitting(true)

    try {
      await updateCurrentUser(token, {
        monthly_income: monthlyIncomeValue,
        savings: savingsValue,
        protected_savings: protectedSavingsValue,
      })
      navigate('/')
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="auth-card">
        <h1>Update profile</h1>
        {formError && <FormError message={formError} />}
        {isLoading ? (
          <p>Loading profile...</p>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <NumberInput
              id="monthly_income"
              label="Monthly income"
              min="0"
              step="0.01"
              value={monthlyIncome}
              onValueChange={(value) => {
                setMonthlyIncome(value)
                setMonthlyIncomeError(null)
              }}
              required
              disabled={isSubmitting}
              error={monthlyIncomeError}
            />
            <NumberInput
              id="savings"
              label="Total savings"
              min="0"
              step="0.01"
              value={savings}
              onValueChange={(value) => {
                setSavings(value)
                setSavingsError(null)
              }}
              required
              disabled={isSubmitting}
              error={savingsError}
            />
            <NumberInput
              id="protected_savings"
              label="Protected savings"
              min="0"
              step="0.01"
              value={protectedSavings}
              onValueChange={(value) => {
                setProtectedSavings(value)
                setProtectedSavingsError(null)
              }}
              required
              disabled={isSubmitting}
              error={protectedSavingsError}
            />
            <div className="commitment-form__actions">
              <Button
                type="button"
                className="btn--secondary"
                onClick={() => navigate('/')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="auth-form__submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save profile'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  )
}
