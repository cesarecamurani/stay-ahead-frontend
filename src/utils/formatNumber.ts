export function sanitizeNumericInput(value: string): string {
  const withoutCommas = value.replace(/,/g, '')
  let cleaned = withoutCommas.replace(/[^\d.]/g, '')
  const dotIndex = cleaned.indexOf('.')

  if (dotIndex !== -1) {
    cleaned =
      cleaned.slice(0, dotIndex + 1) +
      cleaned.slice(dotIndex + 1).replace(/\./g, '')
  }

  return cleaned
}

export function formatThousands(value: string): string {
  if (!value) {
    return ''
  }

  const sanitized = sanitizeNumericInput(value)
  const [integerPart = '', decimalPart] = sanitized.split('.')
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  if (sanitized.includes('.')) {
    return `${formattedInteger}.${decimalPart ?? ''}`
  }

  return formattedInteger
}

export function parseFormattedNumber(value: string): number {
  const sanitized = sanitizeNumericInput(value)
  return sanitized === '' ? Number.NaN : Number(sanitized)
}
