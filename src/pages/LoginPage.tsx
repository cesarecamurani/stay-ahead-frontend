import { useState, type SubmitEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/errors.ts'
import { useAuth } from '../auth/useAuth.ts'
import { Layout } from '../components/layout/Layout.tsx'
import { Button } from '../components/ui/Button.tsx'
import { FormError } from '../components/ui/FormError.tsx'
import { Input } from '../components/ui/Input.tsx'
import { PasswordInput } from '../components/ui/PasswordInput.tsx'
import { validateEmail } from '../utils/validation.ts'

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password.'
const SESSION_EXPIRED_MESSAGE =
  'Your session has expired. Please log in again.'

export function LoginPage() {
  const { login, sessionExpired, token } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (token) {
    return <Navigate to="/" replace />
  }

  const displayedFormError =
    formError ?? (sessionExpired ? SESSION_EXPIRED_MESSAGE : null)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    setFormError(null)
    setEmailError(null)
    setPasswordError(null)

    const emailValidationError = validateEmail(email)
    const passwordValidationError = !password ? 'Password is required.' : null

    if (emailValidationError || passwordValidationError) {
      setEmailError(emailValidationError)
      setPasswordError(passwordValidationError)

      return
    }

    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(
          err.status === 401 ? INVALID_CREDENTIALS_MESSAGE : err.message,
        )
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
        <h1>Log in</h1>
        {displayedFormError && <FormError message={displayedFormError} />}
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
            autoComplete="current-password"
            disabled={isSubmitting}
            error={passwordError}
          />
          <Button
            type="submit"
            className="auth-form__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Log in'}
          </Button>
        </form>
        <p className="auth-link">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </Layout>
  )
}
