import { type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg-primary)]">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
