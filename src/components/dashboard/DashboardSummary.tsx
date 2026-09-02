import { useEffect, useState } from 'react'
import { ApiError } from '../../api/errors.ts'
import { getSummary } from '../../api/summary.ts'
import type { FinancialSummary, UserProfile } from '../../api/types.ts'
import { getCurrentUser } from '../../api/user.ts'
import { useAuth } from '../../auth/useAuth.ts'
import { formatCurrency } from '../../utils/formatCurrency.ts'
import { formatSavingsRunway } from '../../utils/formatSavingsRunway.ts'
import { SummaryCard } from './SummaryCard.tsx'

export function DashboardSummary() {
  const { token } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    Promise.all([getCurrentUser(token), getSummary(token)])
      .then(([profileData, summaryData]) => {
        if (!cancelled) {
          setProfile(profileData)
          setSummary(summaryData)
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
        <h2 className="dashboard-section__title">Summary</h2>
        <p className="dashboard-summary__message">Loading summary...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="dashboard-section">
        <h2 className="dashboard-section__title">Summary</h2>
        <p className="dashboard-summary__message dashboard-summary__message--error">
          {error}
        </p>
      </section>
    )
  }

  if (!profile || !summary) {
    return null
  }

  return (
    <section className="dashboard-section">
      <h2 className="dashboard-section__title">Summary</h2>
      <div className="summary-cards">
        <SummaryCard
          label="Monthly Income"
          value={formatCurrency(profile.monthly_income, profile.currency)}
        />
        <SummaryCard
          label="Savings"
          value={formatCurrency(profile.savings, profile.currency)}
        />
        <SummaryCard
          label="Protected Savings"
          value={formatCurrency(profile.protected_savings, profile.currency)}
        />
        <SummaryCard
          label="Monthly Commitments"
          value={formatCurrency(
            summary.monthly_commitments_amount,
            profile.currency,
          )}
        />
        <SummaryCard
          label="Available Cash Flow"
          value={formatCurrency(summary.available_cash_flow, profile.currency)}
        />
        <SummaryCard
          label="Savings Runway"
          value={formatSavingsRunway(summary.savings_runway_months)}
        />
      </div>
    </section>
  )
}
