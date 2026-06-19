import { type ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'gain' | 'loss' | 'neutral' | 'accent' | 'purple'
  size?: 'sm' | 'md'
}

const variantClasses = {
  gain: 'bg-[var(--color-gain-bg)] text-[var(--color-gain)] border-[rgba(34,197,94,0.2)]',
  loss: 'bg-[var(--color-loss-bg)] text-[var(--color-loss)] border-[rgba(239,68,68,0.2)]',
  neutral: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
  accent: 'bg-[rgba(59,130,246,0.1)] text-[var(--color-accent)] border-[rgba(59,130,246,0.2)]',
  purple: 'bg-[rgba(139,92,246,0.1)] text-[var(--color-accent-purple)] border-[rgba(139,92,246,0.2)]',
}

export function Badge({ children, variant = 'neutral', size = 'sm' }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center font-medium rounded-md border
      ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'}
      ${variantClasses[variant]}
    `}>
      {children}
    </span>
  )
}
