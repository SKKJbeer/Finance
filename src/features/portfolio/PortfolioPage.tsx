import { useEffect, useState } from 'react'
import { Plus, ArrowUpDown } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AddTransactionModal } from './AddTransactionModal'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { computePortfolioMetrics } from '@/lib/calculations/portfolio'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { DEMO_PRICES } from '@/lib/api/marketData'

const DEMO_HOLDINGS = [
  { symbol: 'AAPL', name: 'Apple Inc.', assetType: 'stock' as const, quantity: 15, averageCostBasis: 178.50, totalInvested: 2677.50, currency: 'USD' as const, currentPrice: 213.49, currentValue: 3202.35, unrealizedPnL: 524.85, unrealizedPnLPercent: 19.60, dayChange: 34.65, dayChangePercent: 1.09 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', assetType: 'stock' as const, quantity: 8, averageCostBasis: 380.00, totalInvested: 3040.00, currency: 'USD' as const, currentPrice: 427.89, currentValue: 3423.12, unrealizedPnL: 383.12, unrealizedPnLPercent: 12.60, dayChange: -9.84, dayChangePercent: -0.29 },
  { symbol: 'IWDA.AS', name: 'iShares MSCI World ETF', assetType: 'etf' as const, quantity: 45, averageCostBasis: 87.20, totalInvested: 3924.00, currency: 'EUR' as const, currentPrice: 98.76, currentValue: 4444.20, unrealizedPnL: 520.20, unrealizedPnLPercent: 13.26, dayChange: 24.30, dayChangePercent: 0.55 },
  { symbol: 'VOW3.DE', name: 'Volkswagen AG', assetType: 'stock' as const, quantity: 20, averageCostBasis: 102.40, totalInvested: 2048.00, currency: 'EUR' as const, currentPrice: 89.42, currentValue: 1788.40, unrealizedPnL: -259.60, unrealizedPnLPercent: -12.68, dayChange: 17.60, dayChangePercent: 0.99 },
  { symbol: 'BTC-USD', name: 'Bitcoin', assetType: 'crypto' as const, quantity: 0.05, averageCostBasis: 58000, totalInvested: 2900.00, currency: 'USD' as const, currentPrice: 67234, currentValue: 3361.70, unrealizedPnL: 461.70, unrealizedPnLPercent: 15.92, dayChange: -41.15, dayChangePercent: -1.21 },
]

type SortKey = 'symbol' | 'currentValue' | 'unrealizedPnL' | 'unrealizedPnLPercent' | 'dayChangePercent'

export function PortfolioPage() {
  const [showModal, setShowModal] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('currentValue')
  const [sortAsc, setSortAsc] = useState(false)
  const { holdings, loadTransactions, updatePrices } = usePortfolioStore()
  const { settings } = useSettingsStore()

  useEffect(() => {
    loadTransactions().then(() => updatePrices(DEMO_PRICES))
  }, [loadTransactions, updatePrices])

  const displayHoldings = holdings.length > 0 ? holdings : DEMO_HOLDINGS

  const sorted = [...displayHoldings].sort((a, b) => {
    const av = (a[sortKey] ?? 0) as number
    const bv = (b[sortKey] ?? 0) as number
    const res = typeof av === 'string'
      ? String(av).localeCompare(String(bv))
      : av - bv
    return sortAsc ? res : -res
  })

  const metrics = computePortfolioMetrics(displayHoldings)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(p => !p)
    else { setSortKey(key); setSortAsc(false) }
  }

  const assetTypeLabelMap: Record<string, string> = {
    stock: 'Aktie', etf: 'ETF', crypto: 'Krypto', bond: 'Anleihe', cash: 'Cash',
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-[var(--color-text-primary)]">Portfolio</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {displayHoldings.length} Positionen · {formatCurrency(metrics.totalValue, settings.currency)} Gesamtwert
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          <Plus size={15} />
          Transaktion
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Gesamtwert', value: formatCurrency(metrics.totalValue, settings.currency) },
          { label: 'Investiert', value: formatCurrency(metrics.totalInvested, settings.currency) },
          { label: 'Gesamt G/V', value: `${metrics.totalUnrealizedPnL >= 0 ? '+' : ''}${formatCurrency(metrics.totalUnrealizedPnL, settings.currency)}`, colored: true, val: metrics.totalUnrealizedPnL },
          { label: 'G/V in %', value: formatPercent(metrics.totalUnrealizedPnLPercent), colored: true, val: metrics.totalUnrealizedPnLPercent },
        ].map(({ label, value, colored, val }) => (
          <div key={label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3">
            <p className="text-xs text-[var(--color-muted)] mb-1">{label}</p>
            <p className={`font-semibold text-lg ${colored ? (val && val >= 0 ? 'text-gain' : 'text-loss') : 'text-[var(--color-text-primary)]'}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {[
                  { label: 'Symbol', key: 'symbol' as SortKey },
                  { label: 'Name', key: null },
                  { label: 'Typ', key: null },
                  { label: 'Menge', key: null },
                  { label: 'Einstand', key: null },
                  { label: 'Akt. Kurs', key: null },
                  { label: 'Wert', key: 'currentValue' as SortKey },
                  { label: 'G/V €', key: 'unrealizedPnL' as SortKey },
                  { label: 'G/V %', key: 'unrealizedPnLPercent' as SortKey },
                  { label: 'Heute %', key: 'dayChangePercent' as SortKey },
                ].map(({ label, key }) => (
                  <th
                    key={label}
                    onClick={key ? () => toggleSort(key) : undefined}
                    className={`text-left text-xs font-medium text-[var(--color-muted)] px-4 py-3 whitespace-nowrap ${key ? 'cursor-pointer hover:text-[var(--color-text-secondary)] select-none' : ''}`}
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      {key && sortKey === key && <ArrowUpDown size={11} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {sorted.map(h => {
                const pnl = h.unrealizedPnL ?? 0
                const pnlPct = h.unrealizedPnLPercent ?? 0
                const dayPct = h.dayChangePercent ?? 0
                return (
                  <tr key={h.symbol} className="hover:bg-[var(--color-bg-tertiary)] transition-colors">
                    <td className="px-4 py-3 font-semibold text-[var(--color-text-primary)]">{h.symbol}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)] max-w-36 truncate">{h.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant={h.assetType === 'etf' ? 'accent' : h.assetType === 'crypto' ? 'purple' : 'neutral'}>
                        {assetTypeLabelMap[h.assetType] ?? h.assetType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{h.quantity}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {formatCurrency(h.averageCostBasis, h.currency)}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-primary)]">
                      {h.currentPrice ? formatCurrency(h.currentPrice, h.currency) : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                      {h.currentValue ? formatCurrency(h.currentValue, settings.currency) : '—'}
                    </td>
                    <td className={`px-4 py-3 font-medium ${pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                      {pnl >= 0 ? '+' : ''}{formatCurrency(pnl, settings.currency)}
                    </td>
                    <td className={`px-4 py-3 ${pnlPct >= 0 ? 'text-gain' : 'text-loss'}`}>
                      {formatPercent(pnlPct)}
                    </td>
                    <td className={`px-4 py-3 ${dayPct >= 0 ? 'text-gain' : 'text-loss'}`}>
                      {dayPct >= 0 ? '+' : ''}{dayPct.toFixed(2)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
