import { describe, it, expect } from 'vitest'
import { formatCurrency, formatPercent, formatNumber, formatDate, pnlColor, pnlSign } from './index'

describe('formatCurrency', () => {
  it('formats EUR correctly', () => {
    const result = formatCurrency(1234.56, 'EUR', 'de-DE')
    expect(result).toContain('1.234,56')
    expect(result).toContain('€')
  })

  it('formats USD correctly', () => {
    const result = formatCurrency(9999.99, 'USD', 'en-US')
    expect(result).toContain('9,999.99')
    expect(result).toContain('$')
  })

  it('formats negative values', () => {
    const result = formatCurrency(-500, 'EUR', 'de-DE')
    expect(result).toContain('500')
  })

  it('formats zero', () => {
    const result = formatCurrency(0, 'EUR', 'de-DE')
    expect(result).toContain('0,00')
  })

  it('formats compact notation', () => {
    const result = formatCurrency(1500000, 'EUR', 'de-DE', true)
    expect(result).toContain('1,5')
    expect(result.length).toBeLessThan(15)
  })
})

describe('formatPercent', () => {
  it('shows plus sign for positive values', () => {
    expect(formatPercent(5.5)).toContain('+')
  })

  it('shows minus sign for negative values', () => {
    const result = formatPercent(-3.2)
    expect(result).toMatch(/[-−]/)
    expect(result).toContain('3,20')
  })

  it('formats decimal places', () => {
    const result = formatPercent(12.345, 'de-DE', 2)
    expect(result).toContain('12,35')
  })

  it('formats zero without sign', () => {
    const result = formatPercent(0)
    expect(result).not.toContain('+')
    expect(result).not.toContain('−')
  })
})

describe('formatNumber', () => {
  it('formats with correct decimal places', () => {
    const result = formatNumber(1234.5678, 'de-DE', 2)
    expect(result).toContain('1.234,57')
  })

  it('formats with zero decimals', () => {
    const result = formatNumber(42, 'de-DE', 0)
    expect(result).toBe('42')
  })
})

describe('formatDate', () => {
  it('formats ISO date to German format', () => {
    const result = formatDate('2024-01-15', 'de-DE')
    expect(result).toBe('15.01.2024')
  })
})

describe('pnlColor', () => {
  it('returns text-gain for positive value', () => {
    expect(pnlColor(100)).toBe('text-gain')
  })

  it('returns text-loss for negative value', () => {
    expect(pnlColor(-50)).toBe('text-loss')
  })

  it('returns text-muted for zero', () => {
    expect(pnlColor(0)).toBe('text-muted')
  })
})

describe('pnlSign', () => {
  it('returns + for positive value', () => {
    expect(pnlSign(100)).toBe('+')
  })

  it('returns empty string for negative value', () => {
    expect(pnlSign(-100)).toBe('')
  })

  it('returns + for zero', () => {
    expect(pnlSign(0)).toBe('+')
  })
})
