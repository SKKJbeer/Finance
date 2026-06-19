import { type ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card } from './Card'

interface KPICardProps {
  label: string
  value: string
  delta?: number
  deltaLabel?: string
  icon?: ReactNode
  accentColor?: string
  compact?: boolean
}

export function KPICard({ label, value, delta, deltaLabel, icon, accentColor, compact }: KPICardProps) {
  const isPositive = delta !== undefined && delta > 0
  const isNegative = delta !== undefined && delta < 0
  const isNeutral = delta === undefined || delta === 0

  return (
    <Card className={compact ? 'p-3' : 'p-4'}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-1 ${compact ? 'text-[10px]' : ''}`}>
            {label}
          </p>
          <p className={`font-semibold text-[var(--color-text-primary)] leading-tight truncate ${compact ? 'text-lg' : 'text-2xl'}`}>
            {value}
          </p>
          {delta !== undefined && (
            <div className={`flex items-center gap-1 mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>
              {isPositive && <TrendingUp size={compact ? 11 : 13} className="text-gain shrink-0" />}
              {isNegative && <TrendingDown size={compact ? 11 : 13} className="text-loss shrink-0" />}
              {isNeutral && <Minus size={compact ? 11 : 13} className="text-muted shrink-0" />}
              <span className={isPositive ? 'text-gain' : isNegative ? 'text-loss' : 'text-muted'}>
                {isPositive ? '+' : ''}{delta.toFixed(2)}%
              </span>
              {deltaLabel && (
                <span className="text-[var(--color-muted)]">{deltaLabel}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div
            className={`shrink-0 rounded-lg p-2 flex items-center justify-center ${compact ? 'p-1.5' : 'p-2'}`}
            style={{ backgroundColor: accentColor ? `${accentColor}18` : 'var(--color-bg-tertiary)' }}
          >
            <span style={{ color: accentColor ?? 'var(--color-text-secondary)' }}>
              {icon}
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}
