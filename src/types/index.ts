export type AssetType = 'stock' | 'etf' | 'crypto' | 'bond' | 'real_estate' | 'cash'
export type TransactionType = 'buy' | 'sell' | 'dividend' | 'split' | 'transfer_in' | 'transfer_out'
export type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF'
export type TimeRange = '1W' | '1M' | '3M' | 'YTD' | '1Y' | '3Y' | 'ALL'

export interface Transaction {
  id: string
  symbol: string
  name: string
  type: TransactionType
  assetType: AssetType
  quantity: number
  price: number
  fees: number
  currency: Currency
  exchangeRate: number
  date: string
  notes?: string
  createdAt: string
}

export interface Holding {
  symbol: string
  name: string
  assetType: AssetType
  quantity: number
  averageCostBasis: number
  totalInvested: number
  currency: Currency
  currentPrice?: number
  currentValue?: number
  unrealizedPnL?: number
  unrealizedPnLPercent?: number
  dayChange?: number
  dayChangePercent?: number
  sector?: string
  country?: string
}

export interface PriceCache {
  symbol: string
  price: number
  dayChange: number
  dayChangePercent: number
  currency: Currency
  fetchedAt: string
}

export interface HistoricalPrice {
  symbol: string
  date: string
  close: number
}

export interface PortfolioSnapshot {
  date: string
  totalValue: number
  totalInvested: number
  totalPnL: number
  totalPnLPercent: number
}

export interface DividendRecord {
  id: string
  symbol: string
  name: string
  amount: number
  payDate: string
  exDate: string
  currency: Currency
  taxWithheld?: number
  notes?: string
}

export interface HouseholdTransaction {
  id: string
  type: 'income' | 'expense'
  category: HouseholdCategory
  amount: number
  currency: Currency
  date: string
  description: string
  recurring?: boolean
  recurringInterval?: 'monthly' | 'yearly'
}

export type HouseholdCategory =
  | 'housing'
  | 'food'
  | 'transport'
  | 'health'
  | 'entertainment'
  | 'clothing'
  | 'savings'
  | 'investment'
  | 'insurance'
  | 'utilities'
  | 'education'
  | 'travel'
  | 'gifts'
  | 'salary'
  | 'freelance'
  | 'dividends_income'
  | 'other_income'
  | 'other'

export interface Budget {
  id: string
  category: HouseholdCategory
  monthlyLimit: number
  currency: Currency
  year: number
  month: number
}

export interface TaxSummary {
  year: number
  realizedGains: number
  realizedLosses: number
  netGain: number
  dividendIncome: number
  sparerpauschbetrag: number
  taxableAmount: number
  abgeltungsteuer: number
  solidaritaetszuschlag: number
  totalTax: number
  remainingAllowance: number
}

export interface AppSettings {
  currency: Currency
  alphaVantageApiKey: string
  sparerpauschbetrag: number
  taxFiling: 'single' | 'married'
  benchmarkSymbol: string
  theme: 'dark' | 'light' | 'system'
  locale: 'de-DE' | 'en-US'
}

export interface Alert {
  id: string
  symbol: string
  name: string
  type: 'price_above' | 'price_below' | 'change_percent'
  targetValue: number
  active: boolean
  createdAt: string
  triggeredAt?: string
}
