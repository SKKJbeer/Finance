import { describe, it, expect } from 'vitest'
import {
  computeHoldings,
  computeRealizedGains,
  computeTaxSummary,
  computePortfolioMetrics,
  enrichHoldingsWithPrices,
  buildValueSeries,
} from './portfolio'
import type { Transaction } from '@/types'

function makeTx(overrides: Partial<Transaction>): Transaction {
  return {
    id: 'test-id',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'buy',
    assetType: 'stock',
    quantity: 10,
    price: 100,
    fees: 0,
    currency: 'EUR',
    exchangeRate: 1,
    date: '2024-01-01',
    createdAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('computeHoldings', () => {
  it('creates a holding from a single buy', () => {
    const txs = [makeTx({ quantity: 10, price: 100 })]
    const holdings = computeHoldings(txs)
    expect(holdings).toHaveLength(1)
    expect(holdings[0].symbol).toBe('AAPL')
    expect(holdings[0].quantity).toBe(10)
    expect(holdings[0].averageCostBasis).toBe(100)
    expect(holdings[0].totalInvested).toBe(1000)
  })

  it('averages cost basis on second buy', () => {
    const txs = [
      makeTx({ id: '1', quantity: 10, price: 100 }),
      makeTx({ id: '2', quantity: 10, price: 200, date: '2024-02-01' }),
    ]
    const holdings = computeHoldings(txs)
    expect(holdings[0].quantity).toBe(20)
    expect(holdings[0].averageCostBasis).toBe(150)
    expect(holdings[0].totalInvested).toBe(3000)
  })

  it('includes fees in totalInvested', () => {
    const txs = [makeTx({ quantity: 10, price: 100, fees: 9.9 })]
    const holdings = computeHoldings(txs)
    expect(holdings[0].totalInvested).toBeCloseTo(1009.9)
  })

  it('reduces quantity on sell', () => {
    const txs = [
      makeTx({ id: '1', quantity: 10, price: 100 }),
      makeTx({ id: '2', type: 'sell', quantity: 4, price: 150, date: '2024-03-01' }),
    ]
    const holdings = computeHoldings(txs)
    expect(holdings[0].quantity).toBe(6)
  })

  it('removes holding when fully sold', () => {
    const txs = [
      makeTx({ id: '1', quantity: 10, price: 100 }),
      makeTx({ id: '2', type: 'sell', quantity: 10, price: 150, date: '2024-03-01' }),
    ]
    const holdings = computeHoldings(txs)
    expect(holdings).toHaveLength(0)
  })

  it('handles multiple symbols independently', () => {
    const txs = [
      makeTx({ id: '1', symbol: 'AAPL', quantity: 5, price: 100 }),
      makeTx({ id: '2', symbol: 'MSFT', name: 'Microsoft', quantity: 3, price: 200 }),
    ]
    const holdings = computeHoldings(txs)
    expect(holdings).toHaveLength(2)
    expect(holdings.find(h => h.symbol === 'AAPL')?.quantity).toBe(5)
    expect(holdings.find(h => h.symbol === 'MSFT')?.quantity).toBe(3)
  })

  it('ignores dividend transactions for holdings', () => {
    const txs = [
      makeTx({ id: '1', quantity: 10, price: 100 }),
      makeTx({ id: '2', type: 'dividend', quantity: 10, price: 0.5, date: '2024-06-01' }),
    ]
    const holdings = computeHoldings(txs)
    expect(holdings[0].quantity).toBe(10)
  })

  it('handles stock split correctly', () => {
    const txs = [
      makeTx({ id: '1', quantity: 10, price: 100 }),
      makeTx({ id: '2', type: 'split', quantity: 4, price: 0, date: '2024-06-01' }),
    ]
    const holdings = computeHoldings(txs)
    expect(holdings[0].quantity).toBe(40)
    expect(holdings[0].averageCostBasis).toBeCloseTo(25)
  })

  it('returns empty array for empty transactions', () => {
    expect(computeHoldings([])).toHaveLength(0)
  })
})

describe('computeRealizedGains', () => {
  it('returns 0 for no sell transactions', () => {
    const txs = [makeTx({ quantity: 10, price: 100 })]
    expect(computeRealizedGains(txs)).toBe(0)
  })

  it('calculates profit on FIFO sell', () => {
    const txs = [
      makeTx({ id: '1', quantity: 10, price: 100 }),
      makeTx({ id: '2', type: 'sell', quantity: 5, price: 150, date: '2024-06-01' }),
    ]
    expect(computeRealizedGains(txs)).toBeCloseTo(250)
  })

  it('calculates loss on sell below cost', () => {
    const txs = [
      makeTx({ id: '1', quantity: 10, price: 100 }),
      makeTx({ id: '2', type: 'sell', quantity: 10, price: 80, date: '2024-06-01' }),
    ]
    expect(computeRealizedGains(txs)).toBeCloseTo(-200)
  })

  it('applies FIFO correctly across multiple lots', () => {
    const txs = [
      makeTx({ id: '1', quantity: 5, price: 100, date: '2024-01-01' }),
      makeTx({ id: '2', quantity: 5, price: 200, date: '2024-02-01' }),
      makeTx({ id: '3', type: 'sell', quantity: 5, price: 300, date: '2024-03-01' }),
    ]
    // Sells 5 shares from first lot (cost 100), gains 300-100 = 200 per share → 1000
    expect(computeRealizedGains(txs)).toBeCloseTo(1000)
  })
})

describe('computeTaxSummary', () => {
  it('applies sparerpauschbetrag correctly', () => {
    const txs = [
      makeTx({ id: '1', quantity: 10, price: 100, date: '2024-01-01' }),
      makeTx({ id: '2', type: 'sell', quantity: 10, price: 150, date: '2024-06-01' }),
    ]
    const summary = computeTaxSummary(txs, 2024, 1000)
    expect(summary.realizedGains).toBe(500)
    expect(summary.taxableAmount).toBe(0)
    expect(summary.totalTax).toBe(0)
    expect(summary.remainingAllowance).toBe(500)
  })

  it('calculates Abgeltungssteuer on gains above Sparerpauschbetrag', () => {
    const txs = [
      makeTx({ id: '1', quantity: 10, price: 100, date: '2024-01-01' }),
      makeTx({ id: '2', type: 'sell', quantity: 10, price: 250, date: '2024-06-01' }),
    ]
    const summary = computeTaxSummary(txs, 2024, 1000)
    expect(summary.realizedGains).toBe(1500)
    expect(summary.taxableAmount).toBe(500)
    expect(summary.abgeltungsteuer).toBeCloseTo(125)
    expect(summary.solidaritaetszuschlag).toBeCloseTo(6.875)
    expect(summary.totalTax).toBeCloseTo(131.875)
  })

  it('returns zero tax for year without transactions', () => {
    const txs = [makeTx({ date: '2023-06-01' })]
    const summary = computeTaxSummary(txs, 2024, 1000)
    expect(summary.totalTax).toBe(0)
    expect(summary.remainingAllowance).toBe(1000)
  })

  it('includes dividend income in taxable calculation', () => {
    const txs = [
      makeTx({ id: '1', type: 'dividend', quantity: 100, price: 15, date: '2024-03-01' }),
    ]
    const summary = computeTaxSummary(txs, 2024, 1000)
    expect(summary.dividendIncome).toBe(1500)
    expect(summary.taxableAmount).toBe(500)
  })
})

describe('computePortfolioMetrics', () => {
  it('sums total value from holdings with current price', () => {
    const holdings = [
      { symbol: 'A', name: 'A', assetType: 'stock' as const, quantity: 10, averageCostBasis: 100, totalInvested: 1000, currency: 'EUR' as const, currentValue: 1500 },
      { symbol: 'B', name: 'B', assetType: 'stock' as const, quantity: 5, averageCostBasis: 200, totalInvested: 1000, currency: 'EUR' as const, currentValue: 800 },
    ]
    const metrics = computePortfolioMetrics(holdings)
    expect(metrics.totalValue).toBe(2300)
    expect(metrics.totalInvested).toBe(2000)
    expect(metrics.totalUnrealizedPnL).toBe(300)
    expect(metrics.totalUnrealizedPnLPercent).toBe(15)
  })

  it('falls back to totalInvested when no current price', () => {
    const holdings = [
      { symbol: 'A', name: 'A', assetType: 'stock' as const, quantity: 10, averageCostBasis: 100, totalInvested: 1000, currency: 'EUR' as const },
    ]
    const metrics = computePortfolioMetrics(holdings)
    expect(metrics.totalValue).toBe(1000)
    expect(metrics.totalUnrealizedPnL).toBe(0)
  })

  it('handles empty holdings', () => {
    const metrics = computePortfolioMetrics([])
    expect(metrics.totalValue).toBe(0)
    expect(metrics.totalInvested).toBe(0)
    expect(metrics.totalUnrealizedPnLPercent).toBe(0)
  })
})

describe('buildValueSeries', () => {
  it('returns empty array for no transactions', () => {
    expect(buildValueSeries([])).toHaveLength(0)
  })

  it('accumulates invested capital across buys', () => {
    const txs = [
      makeTx({ id: '1', quantity: 10, price: 100, fees: 0, date: '2024-01-01' }),
      makeTx({ id: '2', quantity: 5, price: 200, fees: 0, date: '2024-02-01' }),
    ]
    const series = buildValueSeries(txs)
    expect(series[0]).toEqual({ date: '2024-01-01', value: 1000 })
    expect(series[1]).toEqual({ date: '2024-02-01', value: 2000 })
  })

  it('reduces invested capital on sell', () => {
    const txs = [
      makeTx({ id: '1', quantity: 10, price: 100, fees: 0, date: '2024-01-01' }),
      makeTx({ id: '2', type: 'sell', quantity: 5, price: 100, fees: 0, date: '2024-02-01' }),
    ]
    const series = buildValueSeries(txs)
    expect(series[1].value).toBe(500)
  })

  it('appends current value as final point', () => {
    const txs = [makeTx({ id: '1', quantity: 10, price: 100, fees: 0, date: '2024-01-01' })]
    const series = buildValueSeries(txs, 1500)
    expect(series[series.length - 1].value).toBe(1500)
  })

  it('ignores dividends in capital series', () => {
    const txs = [
      makeTx({ id: '1', quantity: 10, price: 100, fees: 0, date: '2024-01-01' }),
      makeTx({ id: '2', type: 'dividend', quantity: 10, price: 2, date: '2024-03-01' }),
    ]
    const series = buildValueSeries(txs)
    expect(series).toHaveLength(1)
  })
})

describe('enrichHoldingsWithPrices', () => {
  it('sets current price and calculates unrealized PnL', () => {
    const holdings = [
      { symbol: 'AAPL', name: 'Apple', assetType: 'stock' as const, quantity: 10, averageCostBasis: 100, totalInvested: 1000, currency: 'EUR' as const },
    ]
    const prices = new Map([['AAPL', { price: 150, dayChange: 5, dayChangePercent: 3.45 }]])
    const enriched = enrichHoldingsWithPrices(holdings, prices)
    expect(enriched[0].currentPrice).toBe(150)
    expect(enriched[0].currentValue).toBe(1500)
    expect(enriched[0].unrealizedPnL).toBe(500)
    expect(enriched[0].unrealizedPnLPercent).toBe(50)
    expect(enriched[0].dayChangePercent).toBe(3.45)
  })

  it('returns holding unchanged when no price available', () => {
    const holdings = [
      { symbol: 'AAPL', name: 'Apple', assetType: 'stock' as const, quantity: 10, averageCostBasis: 100, totalInvested: 1000, currency: 'EUR' as const },
    ]
    const enriched = enrichHoldingsWithPrices(holdings, new Map())
    expect(enriched[0].currentPrice).toBeUndefined()
    expect(enriched[0].currentValue).toBeUndefined()
  })
})
