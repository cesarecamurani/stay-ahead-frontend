import { useEffect, useState } from 'react'
import {
  cancelCommitment,
  getCommitments,
  pauseCommitment,
  resumeCommitment,
} from '../../api/commitments.ts'
import { ApiError } from '../../api/errors.ts'
import type {
  Commitment,
  CommitmentLifecycleAction,
} from '../../api/types.ts'
import { getCurrentUser } from '../../api/user.ts'
import { useAuth } from '../../auth/useAuth.ts'
import { DEFAULT_CURRENCY } from '../../data/currencies.ts'
import { CommitmentCard } from './CommitmentCard.tsx'

type CommitmentActionState = {
  pendingAction: CommitmentLifecycleAction | null
  error: string | null
}

const ACTION_REQUESTS: Record<
  CommitmentLifecycleAction,
  (token: string, id: string) => Promise<Commitment>
> = {
  pause: pauseCommitment,
  resume: resumeCommitment,
  cancel: cancelCommitment,
}

const DEFAULT_ACTION_STATE: CommitmentActionState = {
  pendingAction: null,
  error: null,
}

export function CommitmentList() {
  const { token } = useAuth()
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionStates, setActionStates] = useState<
    Record<string, CommitmentActionState>
  >({})

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

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

  async function handleAction(
    commitment: Commitment,
    action: CommitmentLifecycleAction,
  ) {
    if (!token) {
      return
    }

    if (
      action === 'cancel' &&
      !window.confirm(
        `Cancel "${commitment.name}"? This action cannot be undone.`,
      )
    ) {
      return
    }

    setActionStates((current) => ({
      ...current,
      [commitment.id]: { pendingAction: action, error: null },
    }))

    try {
      const updatedCommitment = await ACTION_REQUESTS[action](
        token,
        commitment.id,
      )

      setCommitments((current) =>
        current.map((item) =>
          item.id === updatedCommitment.id ? updatedCommitment : item,
        ),
      )
      setActionStates((current) => ({
        ...current,
        [commitment.id]: DEFAULT_ACTION_STATE,
      }))
    } catch (err) {
      setActionStates((current) => ({
        ...current,
        [commitment.id]: {
          pendingAction: null,
          error:
            err instanceof ApiError
              ? err.message
              : 'Something went wrong. Please try again.',
        },
      }))
    }
  }

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
          pendingAction={
            actionStates[commitment.id]?.pendingAction ??
            DEFAULT_ACTION_STATE.pendingAction
          }
          actionError={
            actionStates[commitment.id]?.error ?? DEFAULT_ACTION_STATE.error
          }
          onAction={(action) => handleAction(commitment, action)}
        />
      ))}
    </div>
  )
}
