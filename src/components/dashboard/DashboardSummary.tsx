import { useEffect, useState } from 'react'
import { getCurrentUser } from '../../api/user.ts'
import { ApiError } from '../../api/errors.ts'
import type { UserProfile } from '../../api/types.ts'
import { useAuth } from '../../auth/useAuth.ts'
import { formatCurrency } from '../../utils/formatCurrency.ts'
import { SummaryCard } from './SummaryCard.tsx'

export function DashboardSummary() {
  const { token } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    setIsLoading(true)
    setError(null)

    getCurrentUser(token)
      .then((data) => {
        if (!cancelled) {
          setProfile(data)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
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

  if (isLoading) {
    return (
      <section className="dashboard-section">
        <p className="dashboard-summary__message">Loading summary...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="dashboard-section">
        <p className="dashboard-summary__message dashboard-summary__message--error">
          {error}
        </p>
      </section>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <section className="dashboard-section">
      <div className="summary-cards">
        <SummaryCard
          label="Monthly Income"
          value={formatCurrency(profile.monthly_income, profile.currency)}
        />
        <SummaryCard
          label="Savings"
          value={formatCurrency(profile.savings, profile.currency)}
        />
      </div>
    </section>
  )
}
