import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  ArrowLeftRight,
  Home,
  Settings,
  Compass,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/portfolio', icon: TrendingUp, label: 'Portfolio' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transaktionen' },
  { to: '/haushalt', icon: Home, label: 'Haushalt' },
  { to: '/einstellungen', icon: Settings, label: 'Einstellungen' },
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0 border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[var(--color-border)]">
        <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
          <Compass size={15} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight">FinanzKompass</p>
          <p className="text-[10px] text-[var(--color-muted)]">Portfolio & Finanzen</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-100
              ${isActive
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
              }
            `}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-[var(--color-border)]">
        <p className="text-[10px] text-[var(--color-muted)] px-3">v0.1.0 · Demo Mode</p>
      </div>
    </aside>
  )
}
