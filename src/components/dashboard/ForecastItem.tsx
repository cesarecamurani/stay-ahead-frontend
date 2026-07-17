import type { ForecastOccurrence } from '../../api/types.ts'
import { formatCurrency } from '../../utils/formatCurrency.ts'

type ForecastItemProps = {
  occurrence: ForecastOccurrence
  currency: string
}

function formatLabel(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function ForecastItem({ occurrence, currency }: ForecastItemProps) {
  return (
    <article className="forecast-item">
      <p className="forecast-item__name">{occurrence.name}</p>
      <p className="forecast-item__category">
        {formatLabel(occurrence.category)}
      </p>
      <p className="forecast-item__amount">
        {formatCurrency(occurrence.amount, currency)}
      </p>
    </article>
  )
}
