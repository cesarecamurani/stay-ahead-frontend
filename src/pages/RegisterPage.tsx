import { useState, type SubmitEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/errors.ts'
import { useAuth } from '../auth/useAuth.ts'
import { Layout } from '../components/layout/Layout.tsx'
import { Button } from '../components/ui/Button.tsx'
import { FormError } from '../components/ui/FormError.tsx'
import { Input } from '../components/ui/Input.tsx'
import { NumberInput } from '../components/ui/NumberInput.tsx'
import { PasswordInput } from '../components/ui/PasswordInput.tsx'
import { Select } from '../components/ui/Select.tsx'
import { PasswordRequirements } from '../components/ui/PasswordRequirements.tsx'
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  formatCurrencyOption,
} from '../data/currencies.ts'
import { parseFormattedNumber } from '../utils/formatNumber.ts'
import { validateEmail, validatePassword } from '../utils/validation.ts'

export function RegisterPage() {
  const { register, token } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [passwordConfirmationError, setPasswordConfirmationError] = useState<string | null>(null)
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [savings, setSavings] = useState('')
  const [monthlyIncomeError, setMonthlyIncomeError] = useState<string | null>(null)
  const [savingsError, setSavingsError] = useState<string | null>(null)
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (token) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    setFormError(null)
    setEmailError(null)
    setPasswordError(null)
    setPasswordConfirmationError(null)
    setMonthlyIncomeError(null)
    setSavingsError(null)

    const emailValidationError = validateEmail(email)
    const passwordValidationError = validatePassword(password)

    if (emailValidationError || passwordValidationError) {
      setEmailError(emailValidationError)
      setPasswordError(passwordValidationError)

      return
    }

    if (password !== passwordConfirmation) {
      setPasswordConfirmationError('Passwords do not match.')

      return
    }

    const monthlyIncomeValue = parseFormattedNumber(monthlyIncome)
    const savingsValue = parseFormattedNumber(savings)

    if (!Number.isFinite(monthlyIncomeValue)) {
      setMonthlyIncomeError('Please enter a valid amount.')
      return
    }

    if (!Number.isFinite(savingsValue)) {
      setSavingsError('Please enter a valid amount.')
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        email,
        password,
        password_confirmation: passwordConfirmation,
        monthly_income: monthlyIncomeValue,
        savings: savingsValue,
        currency,
      })
      navigate('/')
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
    <Layout>
      <div className="auth-card">
        <h1>Register</h1>
        {formError && <FormError message={formError} />}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)

              if (emailError) {
                setEmailError(null)
              }
            }}
            required
            autoComplete="email"
            autoFocus
            disabled={isSubmitting}
            error={emailError}
          />
          <PasswordInput
            id="password"
            label="Password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)

              if (passwordError) {
                setPasswordError(null)
              }
            }}
            required
            autoComplete="new-password"
            disabled={isSubmitting}
            error={passwordError}
          />
          <PasswordRequirements />
          <PasswordInput
            id="password_confirmation"
            label="Confirm password"
            value={passwordConfirmation}
            onChange={(event) => {
              setPasswordConfirmation(event.target.value)
              setPasswordConfirmationError(null)
            }}
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
            onValueChange={(value) => {
              setMonthlyIncome(value)

              if (monthlyIncomeError) {
                setMonthlyIncomeError(null)
              }
            }}
            required
            disabled={isSubmitting}
          />
          <NumberInput
            id="savings"
            label="Savings"
            min="0"
            step="0.01"
            value={savings}
            onValueChange={(value) => {
              setSavings(value)

              if (savingsError) {
                setSavingsError(null)
              }
            }}
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
