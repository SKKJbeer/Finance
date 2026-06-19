import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export function Card({ children, className = '', onClick, hoverable }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl border p-4
        bg-[var(--color-bg-secondary)]
        border-[var(--color-border)]
        ${hoverable ? 'cursor-pointer hover:border-[var(--color-border-light)] hover:bg-[var(--color-bg-tertiary)] transition-colors duration-150' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
