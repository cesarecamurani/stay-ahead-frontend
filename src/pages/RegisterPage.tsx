import { useState, type SubmitEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client.ts'
import { useAuth } from '../auth/useAuth.ts'
import { Layout } from '../components/layout/Layout.tsx'
import { Button } from '../components/ui/Button.tsx'
import { FormError } from '../components/ui/FormError.tsx'
import { Input } from '../components/ui/Input.tsx'
import { NumberInput } from '../components/ui/NumberInput.tsx'
import { PasswordInput } from '../components/ui/PasswordInput.tsx'
import { Select } from '../components/ui/Select.tsx'
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  formatCurrencyOption,
} from '../data/currencies.ts'
import { parseFormattedNumber } from '../utils/formatNumber.ts'

export function RegisterPage() {
  const { register, token, isLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [savings, setSavings] = useState('')
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY)
  const [error, setError] = useState<string | null>(null)
  const [passwordConfirmationError, setPasswordConfirmationError] = useState<
    string | null
  >(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isLoading && token) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPasswordConfirmationError(null)

    if (password !== passwordConfirmation) {
      const mismatchMessage = 'Passwords do not match.'
      setError(mismatchMessage)
      setPasswordConfirmationError(mismatchMessage)
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        email,
        password,
        password_confirmation: passwordConfirmation,
        monthly_income: parseFormattedNumber(monthlyIncome),
        savings: parseFormattedNumber(savings),
        currency,
      })
      navigate('/')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="auth-card">
        <h1>Register</h1>
        {error && <FormError message={error} />}
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            autoFocus
            disabled={isSubmitting}
          />
          <PasswordInput
            id="password"
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="new-password"
            disabled={isSubmitting}
          />
          <PasswordInput
            id="password_confirmation"
            label="Confirm password"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            required
            autoComplete="new-password"
            error={passwordConfirmationError}
            disabled={isSubmitting}
          />
          <NumberInput
            id="monthly_income"
            label="Monthly income"
            min="0"
            step="0.01"
            value={monthlyIncome}
            onChange={(event) => setMonthlyIncome(event.target.value)}
            required
            disabled={isSubmitting}
          />
          <NumberInput
            id="savings"
            label="Savings"
            min="0"
            step="0.01"
            value={savings}
            onChange={(event) => setSavings(event.target.value)}
            required
            disabled={isSubmitting}
          />
          <Select
            id="currency"
            label="Currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            options={CURRENCIES.map((item) => ({
              value: item.code,
              label: formatCurrencyOption(item),
            }))}
            required
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            className="auth-form__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Register'}
          </Button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </Layout>
  )
}
