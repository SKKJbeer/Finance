import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatPercent } from '@/lib/formatters'

interface AllocationItem {
  name: string
  value: number
  color: string
}

interface AllocationChartProps {
  data: AllocationItem[]
  currency?: string
  totalValue: number
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: AllocationItem }>
  totalValue: number
  currency: string
}

function CustomTooltip({ active, payload, totalValue, currency }: TooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  const pct = totalValue > 0 ? (item.value / totalValue) * 100 : 0
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-[var(--color-text-primary)] mb-0.5">{item.name}</p>
      <p className="text-xs text-[var(--color-text-secondary)]">{formatCurrency(item.value, currency)}</p>
      <p className="text-xs text-[var(--color-muted)]">{formatPercent(pct)}</p>
    </div>
  )
}

export function AllocationChart({ data, currency = 'EUR', totalValue }: AllocationChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-44 text-[var(--color-muted)] text-sm">
        Keine Daten
      </div>
    )
  }

  return (
    <div className="flex gap-4 items-center">
      <div className="shrink-0 h-44 w-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              strokeWidth={2}
              stroke="var(--color-bg-primary)"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip totalValue={totalValue} currency={currency} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 space-y-2 min-w-0">
        {data.map((item) => {
          const pct = totalValue > 0 ? (item.value / totalValue) * 100 : 0
          return (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[var(--color-text-primary)] truncate">{item.name}</span>
                  <span className="text-xs text-[var(--color-muted)] shrink-0">{pct.toFixed(1)}%</span>
                </div>
                <div className="mt-0.5 h-1 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
