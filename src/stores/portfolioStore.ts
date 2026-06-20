import { create } from 'zustand'
import { db } from '@/lib/db'
import { computeHoldings, enrichHoldingsWithPrices } from '@/lib/calculations/portfolio'
import {
  fetchCoinGeckoCrypto,
  fetchQuotesFMP,
  fetchQuotesYahoo,
  fetchMultipleQuotes,
} from '@/lib/api/marketData'
import type { Transaction, Holding, PriceCache } from '@/types'
import { nanoid } from '@/lib/nanoid'

interface PortfolioStore {
  transactions: Transaction[]
  holdings: Holding[]
  isLoading: boolean
  pricesLive: boolean
  pricesRefreshing: boolean
  pricesUpdatedAt: string | null
  apiKey: string         // Alpha Vantage (legacy fallback)
  fmpApiKey: string      // Financial Modeling Prep (primary for stocks/ETFs)
  setApiKey: (key: string) => void
  setFmpApiKey: (key: string) => void
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
  pricesRefreshing: false,
  pricesUpdatedAt: null,
  apiKey: '',
  fmpApiKey: '',

  setApiKey: (key) => set({ apiKey: key }),
  setFmpApiKey: (key) => set({ fmpApiKey: key }),

  loadTransactions: async () => {
    set({ isLoading: true })
    const transactions = await db.transactions.orderBy('date').toArray()
    const holdings = computeHoldings(transactions)
    set({ transactions, holdings, isLoading: false })
    await get().refreshPrices()
  },

  addTransaction: async (txData) => {
    const tx: Transaction = { ...txData, id: nanoid(), createdAt: new Date().toISOString() }
    await db.transactions.add(tx)
    await get().loadTransactions()
  },

  deleteTransaction: async (id) => {
    await db.transactions.delete(id)
    await get().loadTransactions()
  },

  refreshPrices: async () => {
    const holdings = get().holdings
    if (holdings.length === 0) {
      set({ pricesLive: false, pricesRefreshing: false })
      return
    }

    set({ pricesRefreshing: true })
    const quotes = new Map<string, PriceCache>()

    // Split holdings by asset type
    const cryptoSymbols = holdings.filter(h => h.assetType === 'crypto').map(h => h.symbol)
    const stockSymbols = holdings.filter(h => h.assetType !== 'crypto').map(h => h.symbol)

    // ── 1. CoinGecko für Krypto (immer, kein Key nötig) ──────────────────
    if (cryptoSymbols.length > 0) {
      const cryptoQuotes = await fetchCoinGeckoCrypto(cryptoSymbols)
      for (const [sym, q] of cryptoQuotes.entries()) quotes.set(sym, q)
    }

    // ── 2. FMP für Aktien/ETFs (wenn Key hinterlegt) ──────────────────────
    const fmpKey = get().fmpApiKey
    if (fmpKey && stockSymbols.length > 0) {
      const fmpQuotes = await fetchQuotesFMP(stockSymbols, fmpKey)
      for (const [sym, q] of fmpQuotes.entries()) quotes.set(sym, q)
    }

    // ── 3. Yahoo Finance für Symbole die FMP nicht geliefert hat ──────────
    const afterFmp = stockSymbols.filter(s => !quotes.has(s))
    if (afterFmp.length > 0) {
      const yahooQuotes = await fetchQuotesYahoo(afterFmp)
      for (const [sym, q] of yahooQuotes.entries()) quotes.set(sym, q)
    }

    // ── 4. Alpha Vantage als letzter Fallback ─────────────────────────────
    const avKey = get().apiKey
    if (avKey) {
      const stillMissing = holdings.map(h => h.symbol).filter(s => !quotes.has(s))
      if (stillMissing.length > 0) {
        const avQuotes = await fetchMultipleQuotes(stillMissing, avKey)
        for (const [sym, q] of avQuotes.entries()) quotes.set(sym, q)
      }
    }

    const priceMap = new Map(
      Array.from(quotes.entries()).map(([sym, q]) => [
        sym,
        { price: q.price, dayChange: q.dayChange, dayChangePercent: q.dayChangePercent },
      ])
    )
    const gotPrices = quotes.size > 0

    set({
      holdings: enrichHoldingsWithPrices(get().holdings, priceMap),
      pricesLive: gotPrices,
      pricesRefreshing: false,
      pricesUpdatedAt: gotPrices ? new Date().toISOString() : get().pricesUpdatedAt,
    })
  },
}))
