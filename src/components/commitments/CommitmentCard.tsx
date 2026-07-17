import type { Commitment } from '../../api/types.ts'
import { formatCurrency } from '../../utils/formatCurrency.ts'
import { CommitmentStatusBadge } from './CommitmentStatusBadge.tsx'

interface CommitmentCardProps {
  commitment: Commitment
  currency: string
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

export function CommitmentCard({ commitment, currency }: CommitmentCardProps) {
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
    </article>
  )
}
