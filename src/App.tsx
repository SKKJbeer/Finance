import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { PortfolioPage } from '@/features/portfolio/PortfolioPage'
import { TransactionsPage } from '@/features/transactions/TransactionsPage'
import { HouseholdPage } from '@/features/household/HouseholdPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

const BASE = (import.meta as { env: { BASE_URL: string } }).env.BASE_URL

export function App() {
  return (
    <BrowserRouter basename={BASE}>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/haushalt" element={<HouseholdPage />} />
          <Route path="/einstellungen" element={<SettingsPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}
