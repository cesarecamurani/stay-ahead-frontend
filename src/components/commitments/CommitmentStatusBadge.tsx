import type { CommitmentStatus } from '../../api/types.ts'

interface CommitmentStatusBadgeProps {
  status: CommitmentStatus
}

function formatStatus(status: CommitmentStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function CommitmentStatusBadge({ status }: CommitmentStatusBadgeProps) {
  return (
    <span className={`commitment-status-badge commitment-status-badge--${status}`}>
      {formatStatus(status)}
    </span>
  )
}
