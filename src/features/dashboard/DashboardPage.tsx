import { useEffect, useMemo } from 'react'
import { TrendingUp, Wallet, BarChart3, Percent } from 'lucide-react'
import { KPICard } from '@/components/ui/KPICard'
import { Card } from '@/components/ui/Card'
import { PortfolioChart } from '@/components/charts/PortfolioChart'
import { AllocationChart } from '@/components/charts/AllocationChart'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { computePortfolioMetrics } from '@/lib/calculations/portfolio'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { DEMO_PRICES } from '@/lib/api/marketData'

const ASSET_COLORS = [
  '#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e',
  '#f59e0b', '#ef4444', '#ec4899', '#84cc16',
]

const DEMO_HOLDINGS = [
  { symbol: 'AAPL', name: 'Apple Inc.', assetType: 'stock' as const, quantity: 15, averageCostBasis: 178.50, totalInvested: 2677.50, currency: 'USD' as const, currentPrice: 213.49, currentValue: 3202.35, unrealizedPnL: 524.85, unrealizedPnLPercent: 19.60, dayChange: 34.65, dayChangePercent: 1.09 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', assetType: 'stock' as const, quantity: 8, averageCostBasis: 380.00, totalInvested: 3040.00, currency: 'USD' as const, currentPrice: 427.89, currentValue: 3423.12, unrealizedPnL: 383.12, unrealizedPnLPercent: 12.60, dayChange: -9.84, dayChangePercent: -0.29 },
  { symbol: 'IWDA.AS', name: 'iShares MSCI World ETF', assetType: 'etf' as const, quantity: 45, averageCostBasis: 87.20, totalInvested: 3924.00, currency: 'EUR' as const, currentPrice: 98.76, currentValue: 4444.20, unrealizedPnL: 520.20, unrealizedPnLPercent: 13.26, dayChange: 24.30, dayChangePercent: 0.55 },
  { symbol: 'VOW3.DE', name: 'Volkswagen AG', assetType: 'stock' as const, quantity: 20, averageCostBasis: 102.40, totalInvested: 2048.00, currency: 'EUR' as const, currentPrice: 89.42, currentValue: 1788.40, unrealizedPnL: -259.60, unrealizedPnLPercent: -12.68, dayChange: 17.60, dayChangePercent: 0.99 },
  { symbol: 'BTC-USD', name: 'Bitcoin', assetType: 'crypto' as const, quantity: 0.05, averageCostBasis: 58000, totalInvested: 2900.00, currency: 'USD' as const, currentPrice: 67234, currentValue: 3361.70, unrealizedPnL: 461.70, unrealizedPnLPercent: 15.92, dayChange: -41.15, dayChangePercent: -1.21 },
]

function generateDemoChartData() {
  const points = []
  const now = new Date()
  let value = 14800
  for (let i = 180; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    value = value * (1 + (Math.random() - 0.46) * 0.015)
    points.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100,
    })
  }
  return points
}

export function DashboardPage() {
  const { holdings, loadTransactions, updatePrices } = usePortfolioStore()
  const { settings } = useSettingsStore()

  useEffect(() => {
    loadTransactions().then(() => {
      updatePrices(DEMO_PRICES)
    })
  }, [loadTransactions, updatePrices])

  const displayHoldings = holdings.length > 0 ? holdings : DEMO_HOLDINGS
  const metrics = useMemo(() => computePortfolioMetrics(displayHoldings), [displayHoldings])
  const chartData = useMemo(() => generateDemoChartData(), [])

  const allocationData = useMemo(() => {
    const bySymbol = displayHoldings
      .filter(h => h.currentValue && h.currentValue > 0)
      .sort((a, b) => (b.currentValue ?? 0) - (a.currentValue ?? 0))
      .slice(0, 6)
      .map((h, i) => ({
        name: h.symbol,
        value: h.currentValue ?? h.totalInvested,
        color: ASSET_COLORS[i % ASSET_COLORS.length],
      }))
    return bySymbol
  }, [displayHoldings])

  const isDemo = holdings.length === 0

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-[var(--color-text-primary)]">
            Übersicht
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {isDemo && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-[rgba(139,92,246,0.1)] text-[var(--color-accent-purple)] border border-[rgba(139,92,246,0.2)] font-medium">
            Demo-Modus
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Portfolio-Wert"
          value={formatCurrency(metrics.totalValue, settings.currency)}
          delta={metrics.dayChangePercent}
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
          delta={metrics.totalUnrealizedPnLPercent}
          icon={<TrendingUp size={18} />}
          accentColor={metrics.totalUnrealizedPnL >= 0 ? '#22c55e' : '#ef4444'}
        />
        <KPICard
          label="Tages-Änderung"
          value={`${metrics.dayChange >= 0 ? '+' : ''}${formatCurrency(metrics.dayChange, settings.currency)}`}
          delta={metrics.dayChangePercent}
          icon={<Percent size={18} />}
          accentColor={metrics.dayChange >= 0 ? '#22c55e' : '#ef4444'}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Portfolio-Entwicklung</h2>
          <PortfolioChart data={chartData} currency={settings.currency} />
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Asset-Allokation</h2>
          <AllocationChart
            data={allocationData}
            currency={settings.currency}
            totalValue={metrics.totalValue}
          />
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Top Positionen</h2>
          <span className="text-xs text-[var(--color-muted)]">{displayHoldings.length} Positionen</span>
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
              {displayHoldings.map(h => {
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
                    <td className={`py-3 pr-4 ${pnlClass}`}>
                      {formatPercent(pnlPct)}
                    </td>
                    <td className={`py-3 ${dayClass}`}>
                      {dayChgPct >= 0 ? '+' : ''}{dayChgPct.toFixed(2)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
