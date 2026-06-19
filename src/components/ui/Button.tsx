import { type ReactNode, type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  fullWidth?: boolean
}

const variantClasses = {
  primary: 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white border-transparent',
  secondary: 'bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] border-[var(--color-border)]',
  ghost: 'bg-transparent hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border-transparent',
  danger: 'bg-transparent hover:bg-[var(--color-loss-bg)] text-[var(--color-loss)] border-[var(--color-loss)]',
}

const sizeClasses = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-base px-5 py-2.5 gap-2',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  children,
  className = '',
  fullWidth,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg border
        transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
