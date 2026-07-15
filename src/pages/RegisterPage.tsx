import { useState, type SubmitEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client.ts'
import { useAuth } from '../auth/useAuth.ts'

export function RegisterPage() {
  const { register, token, isLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [savings, setSavings] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isLoading && token) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password !== passwordConfirmation) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        email,
        password,
        password_confirmation: passwordConfirmation,
        monthly_income: Number(monthlyIncome),
        savings: Number(savings),
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
    <main>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="password_confirmation">Confirm password</label>
          <input
            id="password_confirmation"
            type="password"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="monthly_income">Monthly income</label>
          <input
            id="monthly_income"
            type="number"
            min="0"
            step="0.01"
            value={monthlyIncome}
            onChange={(event) => setMonthlyIncome(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="savings">Savings</label>
          <input
            id="savings"
            type="number"
            min="0"
            step="0.01"
            value={savings}
            onChange={(event) => setSavings(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="currency">Currency</label>
          <select
            id="currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            required
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  )
}
