import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, ArrowLeftRight, Home, Settings } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/portfolio', icon: TrendingUp, label: 'Portfolio' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Trades' },
  { to: '/haushalt', icon: Home, label: 'Haushalt' },
  { to: '/einstellungen', icon: Settings, label: 'Settings' },
]

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="flex items-center h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `
              flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors
              ${isActive
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text-secondary)]'
              }
            `}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
