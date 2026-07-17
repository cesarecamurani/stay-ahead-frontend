type BreakdownItemProps = {
  label: string
  value: string
}

export function BreakdownItem({ label, value }: BreakdownItemProps) {
  return (
    <div className="breakdown-item">
      <p className="breakdown-item__label">{label}</p>
      <p className="breakdown-item__value">{value}</p>
    </div>
  )
}
