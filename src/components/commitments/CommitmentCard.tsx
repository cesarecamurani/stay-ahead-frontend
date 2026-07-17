import type { Commitment } from '../../api/types.ts'
import { DEFAULT_CURRENCY } from '../../data/currencies.ts'
import { CommitmentStatusBadge } from './CommitmentStatusBadge.tsx'

interface CommitmentCardProps {
  commitment: Commitment
}

function formatLabel(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatAmount(amount: string, currency = DEFAULT_CURRENCY): string {
  return Number.parseFloat(amount).toLocaleString(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}

export function CommitmentCard({ commitment }: CommitmentCardProps) {
  const isOneTime = commitment.recurrence === 'one_time'
  const dateLabel = isOneTime ? 'Due date' : 'Start date'
  const dateValue = isOneTime ? commitment.due_date : commitment.start_date

  return (
    <article className="commitment-card">
      <h2 className="commitment-card__name">{commitment.name}</h2>
      <dl className="commitment-card__details">
        <div className="commitment-card__field">
          <dt className="commitment-card__label">Amount</dt>
          <dd className="commitment-card__value commitment-card__value--amount">
            {formatAmount(commitment.amount)}
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
    </article>
  )
}
