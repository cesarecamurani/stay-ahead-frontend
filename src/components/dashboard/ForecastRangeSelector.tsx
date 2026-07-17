export type ForecastRangeMonths = 1 | 3 | 6 | 12

type ForecastRangeOption = {
  months: ForecastRangeMonths
  label: string
}

const RANGE_OPTIONS: ForecastRangeOption[] = [
  { months: 1, label: 'Next month' },
  { months: 3, label: 'Next 3 months' },
  { months: 6, label: 'Next 6 months' },
  { months: 12, label: 'Next year' },
]

type ForecastRangeSelectorProps = {
  value: ForecastRangeMonths
  onChange: (months: ForecastRangeMonths) => void
}

export function ForecastRangeSelector({
  value,
  onChange,
}: ForecastRangeSelectorProps) {
  return (
    <div className="forecast-range" role="group" aria-label="Forecast range">
      {RANGE_OPTIONS.map(({ months, label }) => (
        <button
          key={months}
          type="button"
          className={
            value === months
              ? 'forecast-range__option forecast-range__option--active'
              : 'forecast-range__option'
          }
          aria-pressed={value === months}
          onClick={() => onChange(months)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
