import { useEffect, useState } from 'react'
import { getBreakdown } from '../../api/breakdown.ts'
import { ApiError } from '../../api/errors.ts'
import type { Breakdown as BreakdownData, CommitmentCategory } from '../../api/types.ts'
import { getCurrentUser } from '../../api/user.ts'
import { useAuth } from '../../auth/useAuth.ts'
import { DEFAULT_CURRENCY } from '../../data/currencies.ts'
import { formatCurrency } from '../../utils/formatCurrency.ts'
import { BreakdownItem } from './BreakdownItem.tsx'

const BREAKDOWN_CATEGORIES: {
  key: CommitmentCategory
  label: string
}[] = [
  { key: 'obligation', label: 'Obligations' },
  { key: 'debt', label: 'Debt' },
  { key: 'service', label: 'Services' },
  { key: 'investment', label: 'Investments' },
]

export function Breakdown() {
  const { token } = useAuth()
  const [breakdown, setBreakdown] = useState<BreakdownData | null>(null)
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    setIsLoading(true)
    setError(null)
    setCurrency(DEFAULT_CURRENCY)

    getBreakdown(token)
      .then((data) => {
        if (!cancelled) {
          setBreakdown(data)
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

  if (isLoading) {
    return (
      <section className="dashboard-section">
        <h2 className="dashboard-section__title">Breakdown</h2>
        <p className="breakdown__message">Loading breakdown...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="dashboard-section">
        <h2 className="dashboard-section__title">Breakdown</h2>
        <p className="breakdown__message breakdown__message--error">{error}</p>
      </section>
    )
  }

  if (!breakdown) {
    return null
  }

  return (
    <section className="dashboard-section">
      <h2 className="dashboard-section__title">Breakdown</h2>
      <div className="breakdown-items">
        {BREAKDOWN_CATEGORIES.map(({ key, label }) => (
          <BreakdownItem
            key={key}
            label={label}
            value={formatCurrency(breakdown[key] ?? '0.00', currency)}
          />
        ))}
      </div>
    </section>
  )
}
