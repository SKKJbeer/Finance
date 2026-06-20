import type { PriceCache, HistoricalPrice, Currency } from '@/types'
import { db } from '@/lib/db'

const CACHE_TTL_MINUTES = 15
const CACHE_TTL_HISTORICAL_HOURS = 24

const YAHOO_HOSTS = [
  'https://query1.finance.yahoo.com',
  'https://query2.finance.yahoo.com',
]

// --- Yahoo Finance type interfaces ---------------------------------------

interface YahooV7Quote {
  symbol?: string
  regularMarketPrice?: number
  regularMarketChange?: number
  regularMarketChangePercent?: number
  regularMarketPreviousClose?: number
  currency?: string
}

interface YahooV7Response {
  quoteResponse?: { result?: YahooV7Quote[]; error?: unknown }
}

interface YahooV8Meta {
  regularMarketPrice?: number
  chartPreviousClose?: number
  previousClose?: number
  currency?: string
}

// --- Yahoo Finance v7 batch (primary) ------------------------------------
// One request for all symbols; better CORS acceptance than v8 per-symbol.

async function fetchBatchYahooV7(symbols: string[]): Promise<Map<string, PriceCache>> {
  const results = new Map<string, PriceCache>()
  if (symbols.length === 0) return results

  const fields = 'regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketPreviousClose,currency'
  const symbolsParam = symbols.map(encodeURIComponent).join(',')

  for (const host of YAHOO_HOSTS) {
    try {
      const url = `${host}/v7/finance/quote?symbols=${symbolsParam}&fields=${fields}&formatted=false`
      const res = await fetch(url)
      if (!res.ok) continue

      const data = await res.json() as YahooV7Response
      const items = data.quoteResponse?.result
      if (!Array.isArray(items) || items.length === 0) continue

      for (const item of items) {
        const sym = item.symbol
        const price = item.regularMarketPrice
        if (!sym || typeof price !== 'number') continue

        const prev = item.regularMarketPreviousClose ?? price
        const dayChange = item.regularMarketChange ?? (price - prev)
        const dayChangePct = item.regularMarketChangePercent ?? (prev ? (dayChange / prev) * 100 : 0)

        const entry: PriceCache = {
          symbol: sym,
          price,
          dayChange,
          dayChangePercent: dayChangePct,
          currency: (item.currency as Currency) || 'USD',
          fetchedAt: new Date().toISOString(),
        }
        await db.priceCache.put(entry)
        results.set(sym, entry)
      }

      if (results.size > 0) return results
    } catch {
      // try next host
    }
  }

  return results
}

// --- Yahoo Finance v8 per-symbol (fallback) ------------------------------

async function fetchSingleYahooV8(symbol: string): Promise<PriceCache | null> {
  for (const host of YAHOO_HOSTS) {
    try {
      const url = `${host}/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d&includePrePost=false`
      const res = await fetch(url)
      if (!res.ok) continue

      const data = await res.json() as { chart?: { result?: Array<{ meta?: YahooV8Meta }> } }
      const meta = data.chart?.result?.[0]?.meta
      if (!meta || typeof meta.regularMarketPrice !== 'number') continue

      const price = meta.regularMarketPrice
      const prev = meta.chartPreviousClose ?? meta.previousClose ?? price
      const dayChange = price - prev

      const entry: PriceCache = {
        symbol,
        price,
        dayChange,
        dayChangePercent: prev ? (dayChange / prev) * 100 : 0,
        currency: (meta.currency as Currency) || 'USD',
        fetchedAt: new Date().toISOString(),
      }
      await db.priceCache.put(entry)
      return entry
    } catch {
      // try next host
    }
  }
  return null
}

/**
 * Fetches live quotes from Yahoo Finance.
 * Strategy: fresh cache → v7 batch (1 request) → v8 per-symbol for gaps → stale cache.
 */
export async function fetchQuotesYahoo(symbols: string[]): Promise<Map<string, PriceCache>> {
  const results = new Map<string, PriceCache>()
  const needsFetch: string[] = []

  for (const symbol of symbols) {
    const cached = await db.priceCache.get(symbol)
    if (cached && isCacheValid(cached.fetchedAt, CACHE_TTL_MINUTES)) {
      results.set(symbol, cached)
    } else {
      needsFetch.push(symbol)
    }
  }

  if (needsFetch.length === 0) return results

  // 1) Batch v7 – one network round-trip for everything
  const batchResults = await fetchBatchYahooV7(needsFetch)
  for (const [sym, q] of batchResults.entries()) results.set(sym, q)

  // 2) Per-symbol v8 for anything the batch didn't return
  const stillMissing = needsFetch.filter(s => !batchResults.has(s))
  await Promise.all(
    stillMissing.map(async (symbol) => {
      const q = await fetchSingleYahooV8(symbol)
      if (q) results.set(symbol, q)
    })
  )

  // 3) Fall back to stale cache so the UI can show something rather than "—"
  for (const symbol of symbols) {
    if (!results.has(symbol)) {
      const stale = await db.priceCache.get(symbol)
      if (stale) results.set(symbol, stale)
    }
  }

  return results
}

interface AlphaVantageQuote {
  '01. symbol': string
  '05. price': string
  '09. change': string
  '10. change percent': string
}

interface AlphaVantageSearchResult {
  '1. symbol': string
  '2. name': string
  '3. type': string
  '4. region': string
  '8. currency': string
}

export interface SearchResult {
  symbol: string
  name: string
  type: string
  region: string
  currency: string
}

function isCacheValid(fetchedAt: string, ttlMinutes: number): boolean {
  const diff = Date.now() - new Date(fetchedAt).getTime()
  return diff < ttlMinutes * 60 * 1000
}

export async function fetchQuote(symbol: string, apiKey: string): Promise<PriceCache | null> {
  const cached = await db.priceCache.get(symbol)
  if (cached && isCacheValid(cached.fetchedAt, CACHE_TTL_MINUTES)) return cached
  if (!apiKey) return cached ?? null

  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) return cached ?? null

    const data = await res.json() as { 'Global Quote'?: AlphaVantageQuote; Note?: string }
    if (data.Note) return cached ?? null  // rate-limited

    const quote = data['Global Quote']
    if (!quote || !quote['05. price']) return cached ?? null

    const priceData: PriceCache = {
      symbol,
      price: parseFloat(quote['05. price']),
      dayChange: parseFloat(quote['09. change']),
      dayChangePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      currency: 'USD',
      fetchedAt: new Date().toISOString(),
    }

    await db.priceCache.put(priceData)
    return priceData
  } catch {
    return cached ?? null
  }
}

/** Sequential fetch respecting Alpha Vantage free-tier limit (5 requests/min). */
export async function fetchMultipleQuotes(
  symbols: string[],
  apiKey: string,
): Promise<Map<string, PriceCache>> {
  const results = new Map<string, PriceCache>()
  for (const symbol of symbols) {
    const quote = await fetchQuote(symbol, apiKey)
    if (quote) results.set(symbol, quote)
    await new Promise(r => setTimeout(r, 300))
  }
  return results
}

export async function fetchHistorical(
  symbol: string,
  apiKey: string
): Promise<HistoricalPrice[]> {
  const cached = await db.historicalPrices.where('symbol').equals(symbol).toArray()

  if (cached.length > 0) {
    const latestFetch = cached[0]
    const anyEntry = latestFetch as unknown as { fetchedAt?: string }
    if (anyEntry.fetchedAt && isCacheValid(anyEntry.fetchedAt, CACHE_TTL_HISTORICAL_HOURS * 60)) {
      return cached.map(h => ({ symbol: h.symbol, date: h.date, close: h.close }))
    }
  }

  if (!apiKey) return []

  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${apiKey}`
    const res = await fetch(url)
    const data = await res.json() as { 'Time Series (Daily)': Record<string, Record<string, string>> }
    const series = data['Time Series (Daily)']
    if (!series) return []

    const prices: HistoricalPrice[] = Object.entries(series).map(([date, values]) => ({
      symbol,
      date,
      close: parseFloat(values['4. close']),
    }))

    const withId = prices.map(p => ({ ...p, id: `${p.symbol}_${p.date}`, fetchedAt: new Date().toISOString() }))
    await db.historicalPrices.bulkPut(withId)
    return prices
  } catch {
    return cached.map(h => ({ symbol: h.symbol, date: h.date, close: h.close }))
  }
}

export async function searchSymbols(query: string, apiKey: string): Promise<SearchResult[]> {
  if (!apiKey || query.length < 2) return []

  try {
    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${apiKey}`
    const res = await fetch(url)
    const data = await res.json() as { bestMatches: AlphaVantageSearchResult[] }
    return (data.bestMatches ?? []).slice(0, 8).map(m => ({
      symbol: m['1. symbol'],
      name: m['2. name'],
      type: m['3. type'],
      region: m['4. region'],
      currency: m['8. currency'],
    }))
  } catch {
    return []
  }
}
