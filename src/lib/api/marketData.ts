import type { PriceCache, HistoricalPrice, Currency } from '@/types'
import { db } from '@/lib/db'

const CACHE_TTL_MINUTES = 15
const CACHE_TTL_HISTORICAL_HOURS = 24

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isCacheValid(fetchedAt: string, ttlMinutes: number): boolean {
  return Date.now() - new Date(fetchedAt).getTime() < ttlMinutes * 60_000
}

function buildEntry(
  symbol: string,
  price: number,
  dayChange: number,
  dayChangePercent: number,
  currency: string,
): PriceCache {
  return {
    symbol,
    price,
    dayChange,
    dayChangePercent,
    currency: (currency as Currency) || 'USD',
    fetchedAt: new Date().toISOString(),
  }
}

async function getCache(symbol: string): Promise<PriceCache | null> {
  return (await db.priceCache.get(symbol)) ?? null
}

async function getFreshCache(symbol: string): Promise<PriceCache | null> {
  const c = await getCache(symbol)
  return c && isCacheValid(c.fetchedAt, CACHE_TTL_MINUTES) ? c : null
}

// ---------------------------------------------------------------------------
// 1. CoinGecko — Krypto (kein API-Key nötig, CORS-freundlich)
// ---------------------------------------------------------------------------

// Maps Yahoo Finance-style crypto symbols → CoinGecko IDs
const COINGECKO_ID: Record<string, string> = {
  'BTC-USD': 'bitcoin',
  'ETH-USD': 'ethereum',
  'SOL-USD': 'solana',
  'ADA-USD': 'cardano',
  'XRP-USD': 'ripple',
  'DOGE-USD': 'dogecoin',
  'DOT-USD': 'polkadot',
  'LINK-USD': 'chainlink',
  'LTC-USD': 'litecoin',
  'AVAX-USD': 'avalanche-2',
  'MATIC-USD': 'matic-network',
  'UNI-USD': 'uniswap',
  'ATOM-USD': 'cosmos',
  'BNB-USD': 'binancecoin',
  'TON-USD': 'the-open-network',
  'SHIB-USD': 'shiba-inu',
  'TRX-USD': 'tron',
  'NEAR-USD': 'near',
  'APT-USD': 'aptos',
  'SUI-USD': 'sui',
}

interface CoinGeckoSimplePrice {
  [id: string]: {
    usd?: number
    eur?: number
    usd_24h_change?: number
    eur_24h_change?: number
  }
}

/**
 * Holt Krypto-Kurse von CoinGecko (kostenlos, kein Key, CORS-freundlich).
 * Rate-Limit: 10–30 Calls/min ohne Key.
 */
export async function fetchCoinGeckoCrypto(
  symbols: string[],
): Promise<Map<string, PriceCache>> {
  const results = new Map<string, PriceCache>()
  if (symbols.length === 0) return results

  // Check fresh cache first
  const needsFetch: string[] = []
  for (const sym of symbols) {
    const cached = await getFreshCache(sym)
    if (cached) results.set(sym, cached)
    else needsFetch.push(sym)
  }
  if (needsFetch.length === 0) return results

  // Map to CoinGecko IDs
  const idMap = new Map<string, string>() // geckoId → symbol
  for (const sym of needsFetch) {
    const id = COINGECKO_ID[sym]
    if (id) idMap.set(id, sym)
  }
  if (idMap.size === 0) return results

  try {
    const ids = [...idMap.keys()].join(',')
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd,eur&include_24hr_change=true`
    const res = await fetch(url)
    if (!res.ok) return results

    const data = await res.json() as CoinGeckoSimplePrice
    for (const [geckoId, prices] of Object.entries(data)) {
      const sym = idMap.get(geckoId)
      if (!sym) continue

      const price = prices.usd ?? 0
      const changePct = prices.usd_24h_change ?? 0
      const dayChange = price * changePct / 100

      const entry = buildEntry(sym, price, dayChange, changePct, 'USD')
      await db.priceCache.put(entry)
      results.set(sym, entry)
    }
  } catch {
    // Fall back to stale cache
    for (const sym of needsFetch) {
      if (!results.has(sym)) {
        const stale = await getCache(sym)
        if (stale) results.set(sym, stale)
      }
    }
  }

  return results
}

// ---------------------------------------------------------------------------
// 2. Financial Modeling Prep — Aktien/ETFs (gratis Key, CORS-freundlich)
// ---------------------------------------------------------------------------

interface FMPQuote {
  symbol?: string
  price?: number
  change?: number
  changesPercentage?: number
  previousClose?: number
}

/**
 * Holt Kurse für Aktien/ETFs von FMP.
 * Gratis-Key: 250 Batch-Calls/Tag — ein Batch für alle Symbole zählt als 1 Call.
 * Key kostenlos auf financialmodelingprep.com (kein Abo, keine Kreditkarte).
 */
export async function fetchQuotesFMP(
  symbols: string[],
  apiKey: string,
): Promise<Map<string, PriceCache>> {
  const results = new Map<string, PriceCache>()
  if (symbols.length === 0 || !apiKey) return results

  // Check fresh cache first
  const needsFetch: string[] = []
  for (const sym of symbols) {
    const cached = await getFreshCache(sym)
    if (cached) results.set(sym, cached)
    else needsFetch.push(sym)
  }
  if (needsFetch.length === 0) return results

  try {
    const symbolsParam = needsFetch.map(encodeURIComponent).join(',')
    const url = `https://financialmodelingprep.com/api/v3/quote/${symbolsParam}?apikey=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) return results

    const data = await res.json() as FMPQuote[] | { 'Error Message'?: string }
    if (!Array.isArray(data)) return results

    for (const item of data) {
      const sym = item.symbol
      const price = item.price
      if (!sym || typeof price !== 'number') continue

      const prev = item.previousClose ?? price
      const dayChange = item.change ?? (price - prev)
      const dayChangePct = item.changesPercentage ?? (prev ? (dayChange / prev) * 100 : 0)
      const currency = sym.endsWith('.DE') || sym.endsWith('.AS') || sym.endsWith('.PA') ? 'EUR' : 'USD'

      const entry = buildEntry(sym, price, dayChange, dayChangePct, currency)
      await db.priceCache.put(entry)
      results.set(sym, entry)
    }
  } catch {
    // stale cache fallback
    for (const sym of needsFetch) {
      if (!results.has(sym)) {
        const stale = await getCache(sym)
        if (stale) results.set(sym, stale)
      }
    }
  }

  return results
}

// ---------------------------------------------------------------------------
// 3. Yahoo Finance — Aktien/ETFs (kein Key, CORS unzuverlässig)
// ---------------------------------------------------------------------------

const YAHOO_HOSTS = [
  'https://query1.finance.yahoo.com',
  'https://query2.finance.yahoo.com',
]

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

        const entry = buildEntry(sym, price, dayChange, dayChangePct, item.currency ?? 'USD')
        await db.priceCache.put(entry)
        results.set(sym, entry)
      }

      if (results.size > 0) return results
    } catch { /* try next host */ }
  }
  return results
}

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

      const entry = buildEntry(symbol, price, dayChange, prev ? (dayChange / prev) * 100 : 0, meta.currency ?? 'USD')
      await db.priceCache.put(entry)
      return entry
    } catch { /* try next host */ }
  }
  return null
}

export async function fetchQuotesYahoo(symbols: string[]): Promise<Map<string, PriceCache>> {
  const results = new Map<string, PriceCache>()
  const needsFetch: string[] = []

  for (const symbol of symbols) {
    const cached = await getFreshCache(symbol)
    if (cached) results.set(symbol, cached)
    else needsFetch.push(symbol)
  }
  if (needsFetch.length === 0) return results

  // 1) Batch v7
  const batch = await fetchBatchYahooV7(needsFetch)
  for (const [sym, q] of batch.entries()) results.set(sym, q)

  // 2) Per-symbol v8 for gaps
  const missing = needsFetch.filter(s => !batch.has(s))
  await Promise.all(
    missing.map(async (sym) => {
      const q = await fetchSingleYahooV8(sym)
      if (q) results.set(sym, q)
    })
  )

  // 3) Stale cache as last resort
  for (const sym of symbols) {
    if (!results.has(sym)) {
      const stale = await getCache(sym)
      if (stale) results.set(sym, stale)
    }
  }

  return results
}

// ---------------------------------------------------------------------------
// 4. Alpha Vantage — Fallback (Key erforderlich, 25 Calls/Tag free tier)
// ---------------------------------------------------------------------------

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

export async function fetchQuote(symbol: string, apiKey: string): Promise<PriceCache | null> {
  const cached = await getCache(symbol)
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

    const entry = buildEntry(
      symbol,
      parseFloat(quote['05. price']),
      parseFloat(quote['09. change']),
      parseFloat(quote['10. change percent'].replace('%', '')),
      'USD',
    )
    await db.priceCache.put(entry)
    return entry
  } catch {
    return cached ?? null
  }
}

/** Sequentieller Abruf um das Rate-Limit (5 Req/min) einzuhalten. */
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

// ---------------------------------------------------------------------------
// Historical data (Alpha Vantage)
// ---------------------------------------------------------------------------

export async function fetchHistorical(symbol: string, apiKey: string): Promise<HistoricalPrice[]> {
  const cached = await db.historicalPrices.where('symbol').equals(symbol).toArray()

  if (cached.length > 0) {
    const anyEntry = cached[0] as unknown as { fetchedAt?: string }
    if (anyEntry.fetchedAt && isCacheValid(anyEntry.fetchedAt, CACHE_TTL_HISTORICAL_HOURS * 60)) {
      return cached.map(h => ({ symbol: h.symbol, date: h.date, close: h.close }))
    }
  }

  if (!apiKey) return cached.map(h => ({ symbol: h.symbol, date: h.date, close: h.close }))

  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(symbol)}&outputsize=compact&apikey=${apiKey}`
    const res = await fetch(url)
    const data = await res.json() as {
      'Time Series (Daily)'?: Record<string, Record<string, string>>
      Note?: string
    }
    const series = data['Time Series (Daily)']
    if (!series) return cached.map(h => ({ symbol: h.symbol, date: h.date, close: h.close }))

    const prices: HistoricalPrice[] = Object.entries(series).map(([date, values]) => ({
      symbol, date, close: parseFloat(values['4. close']),
    }))
    await db.historicalPrices.bulkPut(
      prices.map(p => ({ ...p, id: `${p.symbol}_${p.date}`, fetchedAt: new Date().toISOString() }))
    )
    return prices
  } catch {
    return cached.map(h => ({ symbol: h.symbol, date: h.date, close: h.close }))
  }
}

// ---------------------------------------------------------------------------
// Symbol search (Alpha Vantage)
// ---------------------------------------------------------------------------

export async function searchSymbols(query: string, apiKey: string): Promise<SearchResult[]> {
  if (!apiKey || query.length < 2) return []

  try {
    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${apiKey}`
    const res = await fetch(url)
    const data = await res.json() as { bestMatches?: AlphaVantageSearchResult[]; Note?: string }
    if (data.Note) return []
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
