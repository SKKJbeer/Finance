import { useEffect, useMemo, useState } from 'react'
import { TrendingUp, Wallet, BarChart3, Percent, Sparkles, Info } from 'lucide-react'
import { KPICard } from '@/components/ui/KPICard'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PortfolioChart } from '@/components/charts/PortfolioChart'
import { AllocationChart } from '@/components/charts/AllocationChart'
import { AddTransactionModal } from '@/features/portfolio/AddTransactionModal'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { computePortfolioMetrics, buildValueSeries } from '@/lib/calculations/portfolio'
import { formatCurrency, formatPercent } from '@/lib/formatters'

const ASSET_COLORS = [
  '#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e',
  '#f59e0b', '#ef4444', '#ec4899', '#84cc16',
]

export function DashboardPage() {
  const { holdings, transactions, pricesLive, loadTransactions, setApiKey } = usePortfolioStore()
  const { settings } = useSettingsStore()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setApiKey(settings.alphaVantageApiKey)
    loadTransactions()
  }, [loadTransactions, setApiKey, settings.alphaVantageApiKey])

  const metrics = useMemo(() => computePortfolioMetrics(holdings), [holdings])
  const chartData = useMemo(
    () => buildValueSeries(transactions, metrics.totalValue),
    [transactions, metrics.totalValue]
  )

  const allocationData = useMemo(() => {
    return holdings
      .filter(h => h.currentValue && h.currentValue > 0)
      .sort((a, b) => (b.currentValue ?? 0) - (a.currentValue ?? 0))
      .slice(0, 6)
      .map((h, i) => ({
        name: h.symbol,
        value: h.currentValue ?? h.totalInvested,
        color: ASSET_COLORS[i % ASSET_COLORS.length],
      }))
  }, [holdings])

  const isEmpty = holdings.length === 0

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-[var(--color-text-primary)]">Übersicht</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {!isEmpty && !pricesLive && (
          <span className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
            <Info size={12} /> Indikative Kurse
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Portfolio-Wert"
          value={formatCurrency(metrics.totalValue, settings.currency)}
          delta={isEmpty ? undefined : metrics.dayChangePercent}
          deltaLabel="heute"
          icon={<Wallet size={18} />}
          accentColor="#3b82f6"
        />
        <KPICard
          label="Investiert"
          value={formatCurrency(metrics.totalInvested, settings.currency)}
          icon={<BarChart3 size={18} />}
          accentColor="#06b6d4"
        />
        <KPICard
          label="Gesamt-Gewinn"
          value={`${metrics.totalUnrealizedPnL >= 0 ? '+' : ''}${formatCurrency(metrics.totalUnrealizedPnL, settings.currency)}`}
          delta={isEmpty ? undefined : metrics.totalUnrealizedPnLPercent}
          icon={<TrendingUp size={18} />}
          accentColor={metrics.totalUnrealizedPnL >= 0 ? '#22c55e' : '#ef4444'}
        />
        <KPICard
          label="Tages-Änderung"
          value={`${metrics.dayChange >= 0 ? '+' : ''}${formatCurrency(metrics.dayChange, settings.currency)}`}
          delta={isEmpty ? undefined : metrics.dayChangePercent}
          icon={<Percent size={18} />}
          accentColor={metrics.dayChange >= 0 ? '#22c55e' : '#ef4444'}
        />
      </div>

      {isEmpty ? (
        <Card>
          <EmptyState
            icon={<Sparkles size={24} />}
            title="Willkommen bei FinanzKompass"
            description="Dein Portfolio ist noch leer. Erfasse deine erste Transaktion — Aktie, ETF oder Krypto — und behalte ab sofort dein gesamtes Finanzbild im Blick."
            actionLabel="Erste Transaktion erfassen"
            onAction={() => setShowModal(true)}
          />
        </Card>
      ) : (
        <>
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Vermögensverlauf</h2>
                <span className="text-[10px] text-[var(--color-muted)]">basiert auf Transaktionen</span>
              </div>
              <PortfolioChart data={chartData} currency={settings.currency} />
            </Card>

            <Card>
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Asset-Allokation</h2>
              <AllocationChart data={allocationData} currency={settings.currency} totalValue={metrics.totalValue} />
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Top Positionen</h2>
              <span className="text-xs text-[var(--color-muted)]">{holdings.length} Positionen</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    {['Symbol', 'Name', 'Menge', 'Akt. Kurs', 'Wert', 'G/V', 'G/V %', 'Heute'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-[var(--color-muted)] pb-2 pr-4 last:pr-0 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {holdings.map(h => {
                    const pnl = h.unrealizedPnL ?? 0
                    const pnlPct = h.unrealizedPnLPercent ?? 0
                    const dayChgPct = h.dayChangePercent ?? 0
                    const pnlClass = pnl >= 0 ? 'text-gain' : 'text-loss'
                    const dayClass = dayChgPct >= 0 ? 'text-gain' : 'text-loss'
                    return (
                      <tr key={h.symbol} className="hover:bg-[var(--color-bg-tertiary)] transition-colors">
                        <td className="py-3 pr-4 font-semibold text-[var(--color-text-primary)]">{h.symbol}</td>
                        <td className="py-3 pr-4 text-[var(--color-text-secondary)] max-w-32 truncate">{h.name}</td>
                        <td className="py-3 pr-4 text-[var(--color-text-secondary)]">{h.quantity}</td>
                        <td className="py-3 pr-4 text-[var(--color-text-primary)]">
                          {h.currentPrice ? formatCurrency(h.currentPrice, h.currency) : '—'}
                        </td>
                        <td className="py-3 pr-4 font-medium text-[var(--color-text-primary)]">
                          {h.currentValue ? formatCurrency(h.currentValue, settings.currency) : '—'}
                        </td>
                        <td className={`py-3 pr-4 font-medium ${pnlClass}`}>
                          {pnl >= 0 ? '+' : ''}{formatCurrency(pnl, settings.currency)}
                        </td>
                        <td className={`py-3 pr-4 ${pnlClass}`}>{formatPercent(pnlPct)}</td>
                        <td className={`py-3 ${dayClass}`}>{dayChgPct >= 0 ? '+' : ''}{dayChgPct.toFixed(2)}%</td>
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
