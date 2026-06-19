import type { AssetType, Currency } from '@/types'

export interface Security {
  symbol: string
  name: string
  type: AssetType
  currency: Currency
  exchange: string
}

/**
 * Kuratierte Liste populärer Wertpapiere für die Sofort-Suche.
 * Symbole sind Yahoo-Finance-kompatibel (z.B. .DE für XETRA, -USD für Krypto),
 * damit Live-Kurse direkt abgefragt werden können.
 * WICHTIG: Hier werden bewusst KEINE Kurse gespeichert — Kurse kommen
 * ausschließlich live aus der Markt-API, niemals aus statischen Werten.
 */
export const SECURITIES: Security[] = [
  // Deutsche Aktien (DAX)
  { symbol: 'SAP.DE', name: 'SAP SE', type: 'stock', currency: 'EUR', exchange: 'XETRA' },
  { symbol: 'SIE.DE', name: 'Siemens AG', type: 'stock', currency: 'EUR', exchange: 'XETRA' },
  { symbol: 'ALV.DE', name: 'Allianz SE', type: 'stock', currency: 'EUR', exchange: 'XETRA' },
  { symbol: 'DTE.DE', name: 'Deutsche Telekom AG', type: 'stock', currency: 'EUR', exchange: 'XETRA' },
  { symbol: 'VOW3.DE', name: 'Volkswagen AG (Vz)', type: 'stock', currency: 'EUR', exchange: 'XETRA' },
  { symbol: 'BMW.DE', name: 'Bayerische Motoren Werke AG', type: 'stock', currency: 'EUR', exchange: 'XETRA' },
  { symbol: 'MBG.DE', name: 'Mercedes-Benz Group AG', type: 'stock', currency: 'EUR', exchange: 'XETRA' },
  { symbol: 'BAS.DE', name: 'BASF SE', type: 'stock', currency: 'EUR', exchange: 'XETRA' },
  { symbol: 'BAYN.DE', name: 'Bayer AG', type: 'stock', currency: 'EUR', exchange: 'XETRA' },
  { symbol: 'ADS.DE', name: 'Adidas AG', type: 'stock', currency: 'EUR', exchange: 'XETRA' },
  { symbol: 'RHM.DE', name: 'Rheinmetall AG', type: 'stock', currency: 'EUR', exchange: 'XETRA' },
  { symbol: 'IFX.DE', name: 'Infineon Technologies AG', type: 'stock', currency: 'EUR', exchange: 'XETRA' },
  { symbol: 'MUV2.DE', name: 'Münchener Rück AG', type: 'stock', currency: 'EUR', exchange: 'XETRA' },
  { symbol: 'DHL.DE', name: 'DHL Group', type: 'stock', currency: 'EUR', exchange: 'XETRA' },
  { symbol: 'AIR.DE', name: 'Airbus SE', type: 'stock', currency: 'EUR', exchange: 'XETRA' },

  // Beliebte ETFs
  { symbol: 'IWDA.AS', name: 'iShares Core MSCI World UCITS ETF', type: 'etf', currency: 'EUR', exchange: 'Euronext' },
  { symbol: 'EUNL.DE', name: 'iShares Core MSCI World UCITS ETF', type: 'etf', currency: 'EUR', exchange: 'XETRA' },
  { symbol: 'VWCE.DE', name: 'Vanguard FTSE All-World UCITS ETF', type: 'etf', currency: 'EUR', exchange: 'XETRA' },
  { symbol: 'SXR8.DE', name: 'iShares Core S&P 500 UCITS ETF', type: 'etf', currency: 'EUR', exchange: 'XETRA' },
  { symbol: 'VUSA.DE', name: 'Vanguard S&P 500 UCITS ETF', type: 'etf', currency: 'EUR', exchange: 'XETRA' },
  { symbol: 'EQQQ.DE', name: 'Invesco EQQQ Nasdaq-100 UCITS ETF', type: 'etf', currency: 'EUR', exchange: 'XETRA' },
  { symbol: 'IS3N.DE', name: 'iShares Core MSCI EM IMI UCITS ETF', type: 'etf', currency: 'EUR', exchange: 'XETRA' },

  // US-Aktien
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)', type: 'stock', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'NFLX', name: 'Netflix Inc.', type: 'stock', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', type: 'stock', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'KO', name: 'The Coca-Cola Company', type: 'stock', currency: 'USD', exchange: 'NYSE' },
  { symbol: 'V', name: 'Visa Inc.', type: 'stock', currency: 'USD', exchange: 'NYSE' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'stock', currency: 'USD', exchange: 'NYSE' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'stock', currency: 'USD', exchange: 'NYSE' },
  { symbol: 'WMT', name: 'Walmart Inc.', type: 'stock', currency: 'USD', exchange: 'NYSE' },
  { symbol: 'DIS', name: 'The Walt Disney Company', type: 'stock', currency: 'USD', exchange: 'NYSE' },

  // Krypto
  { symbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto', currency: 'USD', exchange: 'Crypto' },
  { symbol: 'ETH-USD', name: 'Ethereum', type: 'crypto', currency: 'USD', exchange: 'Crypto' },
  { symbol: 'SOL-USD', name: 'Solana', type: 'crypto', currency: 'USD', exchange: 'Crypto' },
  { symbol: 'ADA-USD', name: 'Cardano', type: 'crypto', currency: 'USD', exchange: 'Crypto' },
  { symbol: 'XRP-USD', name: 'XRP', type: 'crypto', currency: 'USD', exchange: 'Crypto' },
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
