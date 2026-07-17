export function formatCurrency(
  amount: string | null,
  currency: string,
): string {
  if (amount === null) {
    return '—'
  }

  return Number.parseFloat(amount).toLocaleString(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
