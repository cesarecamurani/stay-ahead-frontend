import { useEffect, useState } from 'react'
import { getForecasts } from '../../api/forecasts.ts'
import { ApiError } from '../../api/errors.ts'
import type { ForecastOccurrence } from '../../api/types.ts'
import { getCurrentUser } from '../../api/user.ts'
import { useAuth } from '../../auth/useAuth.ts'
import { DEFAULT_CURRENCY } from '../../data/currencies.ts'
import { ForecastItem } from './ForecastItem.tsx'
import {
  ForecastRangeSelector,
  type ForecastRangeMonths,
} from './ForecastRangeSelector.tsx'

function formatIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addMonths(date: Date, months: number): Date {
  const year = date.getFullYear()
  const month = date.getMonth() + months
  const day = date.getDate()
  const lastDayOfTargetMonth = new Date(year, month + 1, 0).getDate()

  return new Date(year, month, Math.min(day, lastDayOfTargetMonth))
}

function getRangeDates(months: ForecastRangeMonths): { from: string; to: string } {
  const today = new Date()
  return {
    from: formatIsoDate(today),
    to: formatIsoDate(addMonths(today, months)),
  }
}

function formatForecastDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)

  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function groupByDate(
  occurrences: ForecastOccurrence[],
): { date: string; occurrences: ForecastOccurrence[] }[] {
  const groups = new Map<string, ForecastOccurrence[]>()

  for (const occurrence of occurrences) {
    const existing = groups.get(occurrence.date)
    if (existing) {
      existing.push(occurrence)
    } else {
      groups.set(occurrence.date, [occurrence])
    }
  }

  return Array.from(groups.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, items]) => ({
      date,
      occurrences: items,
    }))
}

export function Forecast() {
  const { token } = useAuth()
  const [range, setRange] = useState<ForecastRangeMonths>(3)
  const [forecasts, setForecasts] = useState<ForecastOccurrence[] | null>(null)
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

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

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false
    const { from, to } = getRangeDates(range)

    getForecasts(token, from, to)
      .then((forecastData) => {
        if (!cancelled) {
          setForecasts(forecastData)
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

    return () => {
      cancelled = true
    }
  }, [token, range])

  function handleRangeChange(nextRange: ForecastRangeMonths) {
    setIsLoading(true)
    setError(null)
    setRange(nextRange)
  }

  return (
    <section className="dashboard-section">
      <ForecastRangeSelector value={range} onChange={handleRangeChange} />

      {isLoading && <p className="forecast__message">Loading forecast...</p>}

      {!isLoading && error && (
        <p className="forecast__message forecast__message--error">{error}</p>
      )}

      {!isLoading && !error && forecasts !== null && forecasts.length === 0 && (
        <p className="forecast__message">
          No upcoming commitments in this period.
        </p>
      )}

      {!isLoading && !error && forecasts !== null && forecasts.length > 0 && (
        <div className="forecast-groups">
          {groupByDate(forecasts).map(({ date, occurrences }) => (
            <section key={date} className="forecast-group">
              <h3 className="forecast-group__date">{formatForecastDate(date)}</h3>
              <div className="forecast-items">
                {occurrences.map((occurrence) => (
                  <ForecastItem
                    key={`${occurrence.commitment_id}-${occurrence.date}`}
                    occurrence={occurrence}
                    currency={currency}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  )
}
