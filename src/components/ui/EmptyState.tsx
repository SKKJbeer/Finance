import { type ReactNode } from 'react'
import { Button } from './Button'

interface Props {
  icon: ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-accent)] mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1.5">{title}</h3>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mb-5">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
