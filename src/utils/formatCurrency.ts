import { DEFAULT_CURRENCY } from '../data/currencies.ts'

export function formatCurrency(
  amount: string | null,
  currency: string,
): string {
  if (amount === null) {
    return '—'
  }

  const value = Number.parseFloat(amount)

  if (!Number.isFinite(value)) {
    return '—'
  }

  try {
    return value.toLocaleString(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  } catch {
    return value.toLocaleString(undefined, {
      style: 'currency',
      currency: DEFAULT_CURRENCY,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
}
