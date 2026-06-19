import { create } from 'zustand'
import { db } from '@/lib/db'
import { computeHoldings, enrichHoldingsWithPrices } from '@/lib/calculations/portfolio'
import type { Transaction, Holding, PriceCache } from '@/types'
import { nanoid } from '@/lib/nanoid'

interface PortfolioStore {
  transactions: Transaction[]
  holdings: Holding[]
  isLoading: boolean
  loadTransactions: () => Promise<void>
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  updatePrices: (prices: Map<string, PriceCache>) => void
}

export const usePortfolioStore = create<PortfolioStore>()((set, get) => ({
  transactions: [],
  holdings: [],
  isLoading: false,

  loadTransactions: async () => {
    set({ isLoading: true })
    const transactions = await db.transactions.orderBy('date').toArray()
    const holdings = computeHoldings(transactions)
    set({ transactions, holdings, isLoading: false })
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

  updatePrices: (prices) => {
    const priceMap = new Map(
      Array.from(prices.entries()).map(([sym, p]) => [
        sym,
        { price: p.price, dayChange: p.dayChange, dayChangePercent: p.dayChangePercent },
      ])
    )
    const enriched = enrichHoldingsWithPrices(get().holdings, priceMap)
    set({ holdings: enriched })
  },
}))
