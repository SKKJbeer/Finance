import { useEffect, useState } from 'react'
import { Plus, ArrowUpDown, PieChart } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { AddTransactionModal } from './AddTransactionModal'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { computePortfolioMetrics } from '@/lib/calculations/portfolio'
import { formatCurrency, formatPercent } from '@/lib/formatters'

type SortKey = 'symbol' | 'currentValue' | 'unrealizedPnL' | 'unrealizedPnLPercent' | 'dayChangePercent'

export function PortfolioPage() {
  const [showModal, setShowModal] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('currentValue')
  const [sortAsc, setSortAsc] = useState(false)
  const { holdings, loadTransactions, setApiKey } = usePortfolioStore()
  const { settings } = useSettingsStore()

  useEffect(() => {
    setApiKey(settings.alphaVantageApiKey)
    loadTransactions()
  }, [loadTransactions, setApiKey, settings.alphaVantageApiKey])

  const sorted = [...holdings].sort((a, b) => {
    const av = (a[sortKey] ?? 0) as number | string
    const bv = (b[sortKey] ?? 0) as number | string
    const res = typeof av === 'string'
      ? String(av).localeCompare(String(bv))
      : (av as number) - (bv as number)
    return sortAsc ? res : -res
  })

  const metrics = computePortfolioMetrics(holdings)
  const isEmpty = holdings.length === 0

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(p => !p)
    else { setSortKey(key); setSortAsc(false) }
  }

  const assetTypeLabelMap: Record<string, string> = {
    stock: 'Aktie', etf: 'ETF', crypto: 'Krypto', bond: 'Anleihe', real_estate: 'Immobilie', cash: 'Cash',
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-[var(--color-text-primary)]">Portfolio</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {isEmpty
              ? 'Noch keine Positionen'
              : `${holdings.length} Positionen · ${formatCurrency(metrics.totalValue, settings.currency)} Gesamtwert`}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          <Plus size={15} />
          Transaktion
        </Button>
      </div>

      {isEmpty ? (
        <Card>
          <EmptyState
            icon={<PieChart size={24} />}
            title="Dein Portfolio startet hier"
            description="Erfasse deine erste Position über die Wertpapier-Suche. Wähle Aktie, ETF oder Krypto, gib Menge und Kurs ein — fertig."
            actionLabel="Erste Transaktion erfassen"
            onAction={() => setShowModal(true)}
          />
        </Card>
      ) : (
        <>
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
        </>
      )}

      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
