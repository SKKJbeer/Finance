import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { formatCurrency, formatDateShort } from '@/lib/formatters'
import { useState } from 'react'

interface DataPoint {
  date: string
  value: number
}

interface PortfolioChartProps {
  data: DataPoint[]
  currency?: string
}

const TIME_RANGES = ['1W', '1M', '3M', 'YTD', '1Y', 'ALL'] as const
type Range = typeof TIME_RANGES[number]

function filterByRange(data: DataPoint[], range: Range): DataPoint[] {
  if (data.length === 0) return data
  const now = new Date()
  let cutoff: Date

  switch (range) {
    case '1W': cutoff = new Date(now.getTime() - 7 * 86400000); break
    case '1M': cutoff = new Date(now.getTime() - 30 * 86400000); break
    case '3M': cutoff = new Date(now.getTime() - 90 * 86400000); break
    case 'YTD': cutoff = new Date(now.getFullYear(), 0, 1); break
    case '1Y': cutoff = new Date(now.getTime() - 365 * 86400000); break
    case 'ALL': return data
  }

  return data.filter(d => new Date(d.date) >= cutoff)
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
  currency: string
}

function CustomTooltip({ active, payload, label, currency }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 shadow-xl">
      <p className="text-xs text-[var(--color-text-secondary)] mb-1">{label}</p>
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
        {formatCurrency(payload[0].value, currency)}
      </p>
    </div>
  )
}

export function PortfolioChart({ data, currency = 'EUR' }: PortfolioChartProps) {
  const [range, setRange] = useState<Range>('1M')
  const filtered = filterByRange(data, range)

  const isPositive = filtered.length >= 2
    ? filtered[filtered.length - 1].value >= filtered[0].value
    : true

  const strokeColor = isPositive ? 'var(--color-gain)' : 'var(--color-loss)'
  const gradientId = `chart-gradient-${isPositive ? 'gain' : 'loss'}`

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {TIME_RANGES.map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`
              px-2.5 py-1 text-xs font-medium rounded-md transition-colors
              ${range === r
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
              }
            `}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filtered} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatDateShort(v)}
              tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v) => formatCurrency(v, currency, 'de-DE', true)}
              tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, fill: strokeColor, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
