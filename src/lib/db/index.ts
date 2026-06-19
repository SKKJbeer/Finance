import Dexie, { type EntityTable } from 'dexie'
import type {
  Transaction,
  PriceCache,
  HistoricalPrice,
  HouseholdTransaction,
  Budget,
  Alert,
  DividendRecord,
} from '@/types'

interface AppDatabase extends Dexie {
  transactions: EntityTable<Transaction, 'id'>
  priceCache: EntityTable<PriceCache, 'symbol'>
  historicalPrices: EntityTable<HistoricalPrice & { id: string }, 'id'>
  householdTransactions: EntityTable<HouseholdTransaction, 'id'>
  budgets: EntityTable<Budget, 'id'>
  alerts: EntityTable<Alert, 'id'>
  dividends: EntityTable<DividendRecord, 'id'>
}

export const db = new Dexie('FinanzKompass') as AppDatabase

db.version(1).stores({
  transactions: 'id, symbol, type, date, assetType',
  priceCache: 'symbol, fetchedAt',
  historicalPrices: 'id, symbol, date',
  householdTransactions: 'id, type, category, date',
  budgets: 'id, category, year, month',
  alerts: 'id, symbol, active',
  dividends: 'id, symbol, payDate',
})

export async function exportData() {
  const [transactions, householdTransactions, budgets, alerts, dividends] =
    await Promise.all([
      db.transactions.toArray(),
      db.householdTransactions.toArray(),
      db.budgets.toArray(),
      db.alerts.toArray(),
      db.dividends.toArray(),
    ])
  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    transactions,
    householdTransactions,
    budgets,
    alerts,
    dividends,
  }
}

export async function importData(data: ReturnType<typeof exportData> extends Promise<infer T> ? T : never) {
  await db.transaction('rw', [db.transactions, db.householdTransactions, db.budgets, db.alerts, db.dividends], async () => {
    await db.transactions.bulkPut(data.transactions)
    await db.householdTransactions.bulkPut(data.householdTransactions)
    await db.budgets.bulkPut(data.budgets)
    await db.alerts.bulkPut(data.alerts)
    await db.dividends.bulkPut(data.dividends)
  })
}
