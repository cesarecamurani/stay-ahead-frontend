import { useState, type SubmitEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/errors.ts'
import { useAuth } from '../auth/useAuth.ts'
import { Layout } from '../components/layout/Layout.tsx'
import { Button } from '../components/ui/Button.tsx'
import { FormError } from '../components/ui/FormError.tsx'
import { Input } from '../components/ui/Input.tsx'
import { PasswordInput } from '../components/ui/PasswordInput.tsx'
import { validateEmail, validatePassword } from '../utils/validation.ts'

export function LoginPage() {
  const { login, token } = useAuth()
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

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    setFormError(null)
    setEmailError(null)
    setPasswordError(null)

    const emailValidationError = validateEmail(email)
    const passwordValidationError = validatePassword(password)

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
        <h1>Log in</h1>
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
