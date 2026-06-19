export function formatCurrency(
  value: number,
  currency: string = 'EUR',
  locale: string = 'de-DE',
  compact: boolean = false
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 2,
    minimumFractionDigits: compact ? 0 : 2,
  }).format(value)
}

export function formatPercent(value: number, locale: string = 'de-DE', digits: number = 2): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: 'exceptZero',
  }).format(value / 100)
}

export function formatNumber(value: number, locale: string = 'de-DE', decimals: number = 2): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatDate(dateStr: string, locale: string = 'de-DE'): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function formatDateShort(dateStr: string, locale: string = 'de-DE'): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
  }).format(new Date(dateStr))
}

export function pnlColor(value: number): string {
  if (value > 0) return 'text-gain'
  if (value < 0) return 'text-loss'
  return 'text-muted'
}

export function pnlSign(value: number): string {
  return value >= 0 ? '+' : ''
}
