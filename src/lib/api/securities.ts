import type { AssetType, Currency } from '@/types'

export interface Security {
  symbol: string
  name: string
  type: AssetType
  currency: Currency
  exchange: string
  /** Indikativer Referenzkurs (Stand Mitte 2026) — nur für Demo ohne API-Key */
  price: number
}

/**
 * Kuratierte Liste populärer Wertpapiere für die Sofort-Suche ohne API-Key.
 * Reihenfolge ~ Beliebtheit. Kurse sind indikativ und werden durch Live-Daten
 * (Alpha Vantage) ersetzt, sobald ein API-Key hinterlegt ist.
 */
export const SECURITIES: Security[] = [
  // Deutsche Aktien (DAX)
  { symbol: 'SAP.DE', name: 'SAP SE', type: 'stock', currency: 'EUR', exchange: 'XETRA', price: 248.30 },
  { symbol: 'SIE.DE', name: 'Siemens AG', type: 'stock', currency: 'EUR', exchange: 'XETRA', price: 218.45 },
  { symbol: 'ALV.DE', name: 'Allianz SE', type: 'stock', currency: 'EUR', exchange: 'XETRA', price: 352.10 },
  { symbol: 'DTE.DE', name: 'Deutsche Telekom AG', type: 'stock', currency: 'EUR', exchange: 'XETRA', price: 33.86 },
  { symbol: 'VOW3.DE', name: 'Volkswagen AG (Vz)', type: 'stock', currency: 'EUR', exchange: 'XETRA', price: 89.42 },
  { symbol: 'BMW.DE', name: 'Bayerische Motoren Werke AG', type: 'stock', currency: 'EUR', exchange: 'XETRA', price: 78.64 },
  { symbol: 'MBG.DE', name: 'Mercedes-Benz Group AG', type: 'stock', currency: 'EUR', exchange: 'XETRA', price: 58.20 },
  { symbol: 'BAS.DE', name: 'BASF SE', type: 'stock', currency: 'EUR', exchange: 'XETRA', price: 47.91 },
  { symbol: 'BAYN.DE', name: 'Bayer AG', type: 'stock', currency: 'EUR', exchange: 'XETRA', price: 27.34 },
  { symbol: 'ADS.DE', name: 'Adidas AG', type: 'stock', currency: 'EUR', exchange: 'XETRA', price: 224.70 },
  { symbol: 'RHM.DE', name: 'Rheinmetall AG', type: 'stock', currency: 'EUR', exchange: 'XETRA', price: 612.40 },
  { symbol: 'IFX.DE', name: 'Infineon Technologies AG', type: 'stock', currency: 'EUR', exchange: 'XETRA', price: 33.18 },
  { symbol: 'MUV2.DE', name: 'Münchener Rück AG', type: 'stock', currency: 'EUR', exchange: 'XETRA', price: 478.90 },
  { symbol: 'DHL.DE', name: 'DHL Group', type: 'stock', currency: 'EUR', exchange: 'XETRA', price: 39.55 },
  { symbol: 'AIR.DE', name: 'Airbus SE', type: 'stock', currency: 'EUR', exchange: 'XETRA', price: 168.22 },

  // Beliebte ETFs
  { symbol: 'IWDA.AS', name: 'iShares Core MSCI World UCITS ETF', type: 'etf', currency: 'EUR', exchange: 'Euronext', price: 98.76 },
  { symbol: 'EUNL.DE', name: 'iShares Core MSCI World UCITS ETF', type: 'etf', currency: 'EUR', exchange: 'XETRA', price: 98.54 },
  { symbol: 'VWCE.DE', name: 'Vanguard FTSE All-World UCITS ETF', type: 'etf', currency: 'EUR', exchange: 'XETRA', price: 128.90 },
  { symbol: 'SXR8.DE', name: 'iShares Core S&P 500 UCITS ETF', type: 'etf', currency: 'EUR', exchange: 'XETRA', price: 580.40 },
  { symbol: 'VUSA.DE', name: 'Vanguard S&P 500 UCITS ETF', type: 'etf', currency: 'EUR', exchange: 'XETRA', price: 105.30 },
  { symbol: 'EQQQ.DE', name: 'Invesco EQQQ Nasdaq-100 UCITS ETF', type: 'etf', currency: 'EUR', exchange: 'XETRA', price: 425.80 },
  { symbol: 'IS3N.DE', name: 'iShares Core MSCI EM IMI UCITS ETF', type: 'etf', currency: 'EUR', exchange: 'XETRA', price: 34.12 },

  // US-Aktien
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', currency: 'USD', exchange: 'NASDAQ', price: 213.49 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', currency: 'USD', exchange: 'NASDAQ', price: 427.89 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', currency: 'USD', exchange: 'NASDAQ', price: 138.62 },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)', type: 'stock', currency: 'USD', exchange: 'NASDAQ', price: 182.30 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', currency: 'USD', exchange: 'NASDAQ', price: 211.15 },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock', currency: 'USD', exchange: 'NASDAQ', price: 612.50 },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', currency: 'USD', exchange: 'NASDAQ', price: 248.90 },
  { symbol: 'NFLX', name: 'Netflix Inc.', type: 'stock', currency: 'USD', exchange: 'NASDAQ', price: 905.20 },
  { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', type: 'stock', currency: 'USD', exchange: 'NASDAQ', price: 142.70 },
  { symbol: 'KO', name: 'The Coca-Cola Company', type: 'stock', currency: 'USD', exchange: 'NYSE', price: 71.40 },
  { symbol: 'V', name: 'Visa Inc.', type: 'stock', currency: 'USD', exchange: 'NYSE', price: 312.80 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'stock', currency: 'USD', exchange: 'NYSE', price: 248.60 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'stock', currency: 'USD', exchange: 'NYSE', price: 152.10 },
  { symbol: 'WMT', name: 'Walmart Inc.', type: 'stock', currency: 'USD', exchange: 'NYSE', price: 92.30 },
  { symbol: 'DIS', name: 'The Walt Disney Company', type: 'stock', currency: 'USD', exchange: 'NYSE', price: 112.45 },

  // Krypto
  { symbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto', currency: 'USD', exchange: 'Crypto', price: 67234.00 },
  { symbol: 'ETH-USD', name: 'Ethereum', type: 'crypto', currency: 'USD', exchange: 'Crypto', price: 3512.40 },
  { symbol: 'SOL-USD', name: 'Solana', type: 'crypto', currency: 'USD', exchange: 'Crypto', price: 168.30 },
  { symbol: 'ADA-USD', name: 'Cardano', type: 'crypto', currency: 'USD', exchange: 'Crypto', price: 0.62 },
  { symbol: 'XRP-USD', name: 'XRP', type: 'crypto', currency: 'USD', exchange: 'Crypto', price: 2.18 },
]

const SECURITIES_BY_SYMBOL = new Map(SECURITIES.map(s => [s.symbol, s]))

export function getSecurity(symbol: string): Security | undefined {
  return SECURITIES_BY_SYMBOL.get(symbol.toUpperCase())
}

/** Sofort-Suche über die kuratierte Liste (Symbol oder Name). */
export function searchSecurities(query: string, limit = 7): Security[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const scored = SECURITIES.map(s => {
    const symbol = s.symbol.toLowerCase()
    const name = s.name.toLowerCase()
    let score = -1
    if (symbol === q) score = 100
    else if (symbol.startsWith(q)) score = 80
    else if (name.startsWith(q)) score = 70
    else if (symbol.includes(q)) score = 50
    else if (name.includes(q)) score = 40
    return { s, score }
  }).filter(x => x.score >= 0)

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map(x => x.s)
}

/** Referenzkurse für gehaltene Symbole (Demo-Modus ohne API-Key). */
export function getReferencePrices(symbols: string[]) {
  const map = new Map<string, { price: number; dayChange: number; dayChangePercent: number }>()
  for (const sym of symbols) {
    const sec = getSecurity(sym)
    if (sec) {
      map.set(sym, { price: sec.price, dayChange: 0, dayChangePercent: 0 })
    }
  }
  return map
}
