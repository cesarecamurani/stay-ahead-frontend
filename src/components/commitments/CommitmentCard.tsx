import type {
  Commitment,
  CommitmentLifecycleAction,
  CommitmentStatus,
} from '../../api/types.ts'
import { formatCurrency } from '../../utils/formatCurrency.ts'
import { Button } from '../ui/Button.tsx'
import { CommitmentStatusBadge } from './CommitmentStatusBadge.tsx'

interface CommitmentCardProps {
  commitment: Commitment
  currency: string
  pendingAction: CommitmentLifecycleAction | null
  actionError: string | null
  onAction: (action: CommitmentLifecycleAction) => void
}

const ACTIONS_BY_STATUS: Record<
  CommitmentStatus,
  CommitmentLifecycleAction[]
> = {
  scheduled: ['cancel'],
  active: ['pause', 'cancel'],
  paused: ['resume', 'cancel'],
  completed: [],
  cancelled: [],
}

const ACTION_LABELS: Record<CommitmentLifecycleAction, string> = {
  pause: 'Pause',
  resume: 'Resume',
  cancel: 'Cancel',
}

const PENDING_ACTION_LABELS: Record<CommitmentLifecycleAction, string> = {
  pause: 'Pausing...',
  resume: 'Resuming...',
  cancel: 'Cancelling...',
}

function formatLabel(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)

  return new Date(year, month - 1, day).toLocaleDateString()
}

export function CommitmentCard({
  commitment,
  currency,
  pendingAction,
  actionError,
  onAction,
}: CommitmentCardProps) {
  const isOneTime = commitment.recurrence === 'one_time'
  const dateLabel = isOneTime ? 'Due date' : 'Start date'
  const dateValue = isOneTime ? commitment.due_date : commitment.start_date
  const actions = ACTIONS_BY_STATUS[commitment.status]

  return (
    <article className="commitment-card">
      <h2 className="commitment-card__name">{commitment.name}</h2>
      <dl className="commitment-card__details">
        <div className="commitment-card__field">
          <dt className="commitment-card__label">Amount</dt>
          <dd className="commitment-card__value commitment-card__value--amount">
            {formatCurrency(commitment.amount, currency)}
          </dd>
        </div>
        <div className="commitment-card__field">
          <dt className="commitment-card__label">Category</dt>
          <dd className="commitment-card__value">
            {formatLabel(commitment.category)}
          </dd>
        </div>
        <div className="commitment-card__field">
          <dt className="commitment-card__label">Recurrence</dt>
          <dd className="commitment-card__value">
            {formatLabel(commitment.recurrence)}
          </dd>
        </div>
        <div className="commitment-card__field">
          <dt className="commitment-card__label">Status</dt>
          <dd className="commitment-card__value">
            <CommitmentStatusBadge status={commitment.status} />
          </dd>
        </div>
        {dateValue && (
          <div className="commitment-card__field">
            <dt className="commitment-card__label">{dateLabel}</dt>
            <dd className="commitment-card__value">{formatDate(dateValue)}</dd>
          </div>
        )}
      </dl>
      {actions.length > 0 && (
        <div className="commitment-card__actions">
          {actions.map((action) => (
            <Button
              key={action}
              type="button"
              className={`commitment-card__action ${
                action === 'cancel' ? 'btn--danger' : 'btn--secondary'
              }`}
              onClick={() => onAction(action)}
              disabled={pendingAction !== null}
              aria-label={`${
                pendingAction === action
                  ? PENDING_ACTION_LABELS[action]
                  : ACTION_LABELS[action]
              } ${commitment.name}`}
              aria-busy={pendingAction === action}
            >
              {pendingAction === action
                ? PENDING_ACTION_LABELS[action]
                : ACTION_LABELS[action]}
            </Button>
          ))}
        </div>
      )}
      {actionError && (
        <p
          className="commitment-card__action-error"
          role="alert"
          aria-live="polite"
        >
          {actionError}
        </p>
      )}
    </article>
  )
}
