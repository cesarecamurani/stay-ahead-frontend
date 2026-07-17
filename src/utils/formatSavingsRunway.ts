export function formatSavingsRunway(months: number | null): string {
  if (months === null) {
    return '—'
  }

  if (!Number.isFinite(months)) {
    return '—'
  }

  if (months >= 12) {
    const years = roundToOneDecimal(months / 12)
    const unit = years === 1 ? 'year' : 'years'
    return `${formatRunwayValue(years)} ${unit}`
  }

  const roundedMonths = roundToOneDecimal(months)
  const unit = roundedMonths === 1 ? 'month' : 'months'
  return `${formatRunwayValue(roundedMonths)} ${unit}`
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10
}

function formatRunwayValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}
