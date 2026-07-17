import { useEffect, useState } from 'react'
import { getCommitments } from '../../api/commitments.ts'
import { ApiError } from '../../api/errors.ts'
import type { Commitment } from '../../api/types.ts'
import { getCurrentUser } from '../../api/user.ts'
import { useAuth } from '../../auth/useAuth.ts'
import { DEFAULT_CURRENCY } from '../../data/currencies.ts'
import { CommitmentCard } from './CommitmentCard.tsx'

export function CommitmentList() {
  const { token } = useAuth()
  const [commitments, setCommitments] = useState<Commitment[]>([])
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

    getCommitments(token)
      .then((data) => {
        if (!cancelled) {
          setCommitments(data)
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
    return <p className="commitment-list__message">Loading commitments...</p>
  }

  if (error) {
    return <p className="commitment-list__message commitment-list__message--error">{error}</p>
  }

  if (commitments.length === 0) {
    return <p className="commitment-list__message">No commitments yet.</p>
  }

  return (
    <div className="commitment-list">
      {commitments.map((commitment) => (
        <CommitmentCard
          key={commitment.id}
          commitment={commitment}
          currency={currency}
        />
      ))}
    </div>
  )
}
