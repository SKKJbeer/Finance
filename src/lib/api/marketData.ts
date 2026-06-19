import type { PriceCache, HistoricalPrice, Currency } from '@/types'
import { db } from '@/lib/db'

const CACHE_TTL_MINUTES = 15
const CACHE_TTL_HISTORICAL_HOURS = 24

const YAHOO_HOSTS = [
  'https://query1.finance.yahoo.com',
  'https://query2.finance.yahoo.com',
]

interface YahooMeta {
  regularMarketPrice?: number
  chartPreviousClose?: number
  previousClose?: number
  currency?: string
}

/**
 * Holt echte Live-Kurse von Yahoo Finance (kein API-Key nötig).
 * Symbole müssen Yahoo-kompatibel sein (z.B. MBG.DE, AAPL, BTC-USD).
 * Bei Fehler (CORS/Netzwerk) wird der gecachte Wert genutzt, niemals ein
 * erfundener Kurs.
 */
async function fetchQuoteYahoo(symbol: string): Promise<PriceCache | null> {
  const cached = await db.priceCache.get(symbol)
  if (cached && isCacheValid(cached.fetchedAt, CACHE_TTL_MINUTES)) {
    return cached
  }

  for (const host of YAHOO_HOSTS) {
    try {
      const url = `${host}/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`
      const res = await fetch(url)
      if (!res.ok) continue
      const data = await res.json() as { chart?: { result?: Array<{ meta?: YahooMeta }> } }
      const meta = data.chart?.result?.[0]?.meta
      if (!meta || typeof meta.regularMarketPrice !== 'number') continue

      const price = meta.regularMarketPrice
      const prev = meta.chartPreviousClose ?? meta.previousClose ?? price
      const dayChange = price - prev
      const priceData: PriceCache = {
        symbol,
        price,
        dayChange,
        dayChangePercent: prev ? (dayChange / prev) * 100 : 0,
        currency: (meta.currency as Currency) || 'USD',
        fetchedAt: new Date().toISOString(),
      }
      await db.priceCache.put(priceData)
      return priceData
    } catch {
      // nächsten Host versuchen
    }
  }

  return cached ?? null
}

/** Holt Live-Kurse für mehrere Symbole parallel von Yahoo Finance. */
export async function fetchQuotesYahoo(symbols: string[]): Promise<Map<string, PriceCache>> {
  const results = new Map<string, PriceCache>()
  await Promise.all(
    symbols.map(async (symbol) => {
      const quote = await fetchQuoteYahoo(symbol)
      if (quote) results.set(symbol, quote)
    })
  )
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
  if (cached && isCacheValid(cached.fetchedAt, CACHE_TTL_MINUTES)) {
    return cached
  }

  if (!apiKey) return null

  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
    const res = await fetch(url)
    const data = await res.json() as { 'Global Quote': AlphaVantageQuote }
    const quote = data['Global Quote']
    if (!quote || !quote['05. price']) return null

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

export async function fetchMultipleQuotes(
  symbols: string[],
  apiKey: string
): Promise<Map<string, PriceCache>> {
  const results = new Map<string, PriceCache>()
  for (const symbol of symbols) {
    const quote = await fetchQuote(symbol, apiKey)
    if (quote) results.set(symbol, quote)
  }
  return results
}

export async function fetchHistorical(
  symbol: string,
  apiKey: string
): Promise<HistoricalPrice[]> {
  const cacheKey = `hist_${symbol}`
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

    void cacheKey
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
