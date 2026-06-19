import { create } from 'zustand'
import { db } from '@/lib/db'
import { computeHoldings, enrichHoldingsWithPrices } from '@/lib/calculations/portfolio'
import { fetchQuotesYahoo, fetchMultipleQuotes } from '@/lib/api/marketData'
import type { Transaction, Holding, PriceCache } from '@/types'
import { nanoid } from '@/lib/nanoid'

interface PortfolioStore {
  transactions: Transaction[]
  holdings: Holding[]
  isLoading: boolean
  pricesLive: boolean
  apiKey: string
  setApiKey: (key: string) => void
  loadTransactions: () => Promise<void>
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  refreshPrices: () => Promise<void>
}

export const usePortfolioStore = create<PortfolioStore>()((set, get) => ({
  transactions: [],
  holdings: [],
  isLoading: false,
  pricesLive: false,
  apiKey: '',

  setApiKey: (key) => set({ apiKey: key }),

  loadTransactions: async () => {
    set({ isLoading: true })
    const transactions = await db.transactions.orderBy('date').toArray()
    const holdings = computeHoldings(transactions)
    set({ transactions, holdings, isLoading: false })
    await get().refreshPrices()
  },

  addTransaction: async (txData) => {
    const tx: Transaction = {
      ...txData,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    }
    await db.transactions.add(tx)
    await get().loadTransactions()
  },

  deleteTransaction: async (id) => {
    await db.transactions.delete(id)
    await get().loadTransactions()
  },

  refreshPrices: async () => {
    const symbols = get().holdings.map(h => h.symbol)
    if (symbols.length === 0) {
      set({ pricesLive: false })
      return
    }

    // Primär: echte Live-Kurse von Yahoo (kein Key nötig)
    const quotes: Map<string, PriceCache> = await fetchQuotesYahoo(symbols)

    // Fallback für noch fehlende Symbole: Alpha Vantage (falls Key hinterlegt)
    const apiKey = get().apiKey
    if (apiKey) {
      const missing = symbols.filter(s => !quotes.has(s))
      if (missing.length > 0) {
        const av = await fetchMultipleQuotes(missing, apiKey)
        for (const [sym, q] of av.entries()) quotes.set(sym, q)
      }
    }

    const priceMap = new Map(
      Array.from(quotes.entries()).map(([sym, q]) => [
        sym,
        { price: q.price, dayChange: q.dayChange, dayChangePercent: q.dayChangePercent },
      ])
    )
    set({
      holdings: enrichHoldingsWithPrices(get().holdings, priceMap),
      pricesLive: quotes.size > 0,
    })
  },
}))
