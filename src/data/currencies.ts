export interface Currency {
  code: string
  name: string
}

export const CURRENCIES: Currency[] = [
  { code: 'EUR', name: 'Euro' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'ALL', name: 'Albanian Lek' },
  { code: 'AMD', name: 'Armenian Dram' },
  { code: 'AZN', name: 'Azerbaijani Manat' },
  { code: 'BAM', name: 'Bosnia and Herzegovina Convertible Mark' },
  { code: 'BGN', name: 'Bulgarian Lev' },
  { code: 'BYN', name: 'Belarusian Ruble' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CZK', name: 'Czech Koruna' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'GEL', name: 'Georgian Lari' },
  { code: 'GIP', name: 'Gibraltar Pound' },
  { code: 'HUF', name: 'Hungarian Forint' },
  { code: 'ISK', name: 'Icelandic Króna' },
  { code: 'MDL', name: 'Moldovan Leu' },
  { code: 'MKD', name: 'Macedonian Denar' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'PLN', name: 'Polish Zloty' },
  { code: 'RON', name: 'Romanian Leu' },
  { code: 'RSD', name: 'Serbian Dinar' },
  { code: 'RUB', name: 'Russian Ruble' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'UAH', name: 'Ukrainian Hryvnia' },
]

export const DEFAULT_CURRENCY = 'EUR'

export function formatCurrencyOption({ code, name }: Currency): string {
  return `${code} - ${name}`
}
