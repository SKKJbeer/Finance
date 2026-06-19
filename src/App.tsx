import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { PortfolioPage } from '@/features/portfolio/PortfolioPage'
import { TransactionsPage } from '@/features/transactions/TransactionsPage'
import { HouseholdPage } from '@/features/household/HouseholdPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/haushalt" element={<HouseholdPage />} />
            <Route path="/einstellungen" element={<SettingsPage />} />
          </Routes>
        </AppLayout>
      </HashRouter>
    </ErrorBoundary>
  )
}
