type SummaryCardProps = {
  label: string
  value: string
}

export function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="summary-card">
      <p className="summary-card__label">{label}</p>
      <p className="summary-card__value">{value}</p>
    </div>
  )
}
