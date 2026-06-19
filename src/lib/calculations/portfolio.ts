import type { Transaction, Holding, TaxSummary } from '@/types'

export function computeHoldings(transactions: Transaction[]): Holding[] {
  const holdingsMap = new Map<string, Holding>()

  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date))

  for (const tx of sorted) {
    if (tx.type === 'dividend') continue

    const existing = holdingsMap.get(tx.symbol)

    if (tx.type === 'buy' || tx.type === 'transfer_in') {
      if (!existing) {
        holdingsMap.set(tx.symbol, {
          symbol: tx.symbol,
          name: tx.name,
          assetType: tx.assetType,
          quantity: tx.quantity,
          averageCostBasis: tx.price,
          totalInvested: tx.quantity * tx.price + tx.fees,
          currency: tx.currency,
        })
      } else {
        const newTotalCost = existing.totalInvested + tx.quantity * tx.price + tx.fees
        const newQuantity = existing.quantity + tx.quantity
        existing.quantity = newQuantity
        existing.totalInvested = newTotalCost
        existing.averageCostBasis = newTotalCost / newQuantity
      }
    } else if (tx.type === 'sell' || tx.type === 'transfer_out') {
      if (existing) {
        existing.quantity -= tx.quantity
        if (existing.quantity <= 0.00001) {
          holdingsMap.delete(tx.symbol)
        } else {
          existing.totalInvested = existing.averageCostBasis * existing.quantity
        }
      }
    } else if (tx.type === 'split') {
      if (existing) {
        const ratio = tx.quantity
        existing.quantity *= ratio
        existing.averageCostBasis /= ratio
      }
    }
  }

  return Array.from(holdingsMap.values()).filter(h => h.quantity > 0.00001)
}

export function enrichHoldingsWithPrices(
  holdings: Holding[],
  prices: Map<string, { price: number; dayChange: number; dayChangePercent: number }>
): Holding[] {
  return holdings.map(h => {
    const priceData = prices.get(h.symbol)
    if (!priceData) return h

    const currentValue = h.quantity * priceData.price
    const unrealizedPnL = currentValue - h.totalInvested
    const unrealizedPnLPercent = (unrealizedPnL / h.totalInvested) * 100

    return {
      ...h,
      currentPrice: priceData.price,
      currentValue,
      unrealizedPnL,
      unrealizedPnLPercent,
      dayChange: h.quantity * priceData.dayChange,
      dayChangePercent: priceData.dayChangePercent,
    }
  })
}

export function computeRealizedGains(transactions: Transaction[]): number {
  const lots: Array<{ quantity: number; price: number; fees: number }> = []
  let totalRealizedGain = 0

  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date))

  const lotsBySymbol = new Map<string, Array<{ quantity: number; price: number; fees: number }>>()

  for (const tx of sorted) {
    if (tx.type === 'buy') {
      const symbolLots = lotsBySymbol.get(tx.symbol) ?? []
      symbolLots.push({ quantity: tx.quantity, price: tx.price, fees: tx.fees })
      lotsBySymbol.set(tx.symbol, symbolLots)
    } else if (tx.type === 'sell') {
      const symbolLots = lotsBySymbol.get(tx.symbol) ?? []
      let remainingToSell = tx.quantity

      while (remainingToSell > 0.00001 && symbolLots.length > 0) {
        const lot = symbolLots[0]
        const soldFromLot = Math.min(lot.quantity, remainingToSell)
        const costBasis = (soldFromLot / lot.quantity) * (lot.quantity * lot.price + lot.fees)
        const proceeds = soldFromLot * tx.price - (soldFromLot / tx.quantity) * tx.fees
        totalRealizedGain += proceeds - costBasis

        lot.quantity -= soldFromLot
        remainingToSell -= soldFromLot

        if (lot.quantity <= 0.00001) {
          symbolLots.shift()
        }
      }
    }
  }

  void lots
  return totalRealizedGain
}

export function computeTaxSummary(
  transactions: Transaction[],
  year: number,
  sparerpauschbetrag: number = 1000
): TaxSummary {
  const yearTx = transactions.filter(tx => tx.date.startsWith(String(year)))

  const dividendIncome = yearTx
    .filter(tx => tx.type === 'dividend')
    .reduce((sum, tx) => sum + tx.quantity * tx.price, 0)

  const realizedGains = computeRealizedGains(yearTx)
  const realizedLosses = realizedGains < 0 ? Math.abs(realizedGains) : 0
  const netGain = realizedGains > 0 ? realizedGains : 0

  const grossIncome = netGain + dividendIncome
  const taxableAmount = Math.max(0, grossIncome - sparerpauschbetrag)
  const remainingAllowance = Math.max(0, sparerpauschbetrag - grossIncome)

  const abgeltungsteuer = taxableAmount * 0.25
  const solidaritaetszuschlag = abgeltungsteuer * 0.055
  const totalTax = abgeltungsteuer + solidaritaetszuschlag

  return {
    year,
    realizedGains: netGain,
    realizedLosses,
    netGain,
    dividendIncome,
    sparerpauschbetrag,
    taxableAmount,
    abgeltungsteuer,
    solidaritaetszuschlag,
    totalTax,
    remainingAllowance,
  }
}

export function computePortfolioMetrics(holdings: Holding[]) {
  const totalValue = holdings.reduce((sum, h) => sum + (h.currentValue ?? h.totalInvested), 0)
  const totalInvested = holdings.reduce((sum, h) => sum + h.totalInvested, 0)
  const totalUnrealizedPnL = totalValue - totalInvested
  const totalUnrealizedPnLPercent = totalInvested > 0 ? (totalUnrealizedPnL / totalInvested) * 100 : 0
  const dayChange = holdings.reduce((sum, h) => sum + (h.dayChange ?? 0), 0)
  const dayChangePercent = totalValue > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0

  return {
    totalValue,
    totalInvested,
    totalUnrealizedPnL,
    totalUnrealizedPnLPercent,
    dayChange,
    dayChangePercent,
  }
}
