import { create } from 'zustand'
import { db } from '@/lib/db'
import { computeHoldings, enrichHoldingsWithPrices } from '@/lib/calculations/portfolio'
import { fetchMultipleQuotes } from '@/lib/api/marketData'
import { getReferencePrices } from '@/lib/api/securities'
import type { Transaction, Holding } from '@/types'
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
    const holdings = get().holdings
    const symbols = holdings.map(h => h.symbol)
    if (symbols.length === 0) {
      set({ pricesLive: false })
      return
    }

    const apiKey = get().apiKey
    const refMap = getReferencePrices(symbols)

    if (apiKey) {
      const quotes = await fetchMultipleQuotes(symbols, apiKey)
      const priceMap = new Map(refMap)
      for (const [sym, q] of quotes.entries()) {
        priceMap.set(sym, { price: q.price, dayChange: q.dayChange, dayChangePercent: q.dayChangePercent })
      }
      set({ holdings: enrichHoldingsWithPrices(get().holdings, priceMap), pricesLive: quotes.size > 0 })
    } else {
      set({ holdings: enrichHoldingsWithPrices(get().holdings, refMap), pricesLive: false })
    }
  },
}))
