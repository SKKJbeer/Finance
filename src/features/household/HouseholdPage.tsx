import { useState } from 'react'
import { Plus, Home, ShoppingCart, Car, Heart, Zap, GraduationCap, Plane, Gift, Briefcase } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { KPICard } from '@/components/ui/KPICard'
import { formatCurrency } from '@/lib/formatters'

const CATEGORY_CONFIG = {
  housing: { label: 'Wohnen', icon: Home, color: '#3b82f6' },
  food: { label: 'Lebensmittel', icon: ShoppingCart, color: '#22c55e' },
  transport: { label: 'Transport', icon: Car, color: '#f59e0b' },
  health: { label: 'Gesundheit', icon: Heart, color: '#ef4444' },
  utilities: { label: 'Nebenkosten', icon: Zap, color: '#06b6d4' },
  education: { label: 'Bildung', icon: GraduationCap, color: '#8b5cf6' },
  travel: { label: 'Reisen', icon: Plane, color: '#ec4899' },
  gifts: { label: 'Geschenke', icon: Gift, color: '#84cc16' },
  salary: { label: 'Gehalt', icon: Briefcase, color: '#22c55e' },
  other: { label: 'Sonstiges', icon: Plus, color: '#94a3b8' },
} as const

const DEMO_EXPENSES = [
  { category: 'housing', amount: 1200, label: 'Miete' },
  { category: 'food', amount: 380, label: 'Supermarkt' },
  { category: 'transport', amount: 89, label: 'ÖPNV' },
  { category: 'utilities', amount: 145, label: 'Strom & Gas' },
  { category: 'health', amount: 52, label: 'Apotheke' },
  { category: 'education', amount: 29, label: 'Kindle Unlimited' },
  { category: 'travel', amount: 210, label: 'Urlaub' },
  { category: 'gifts', amount: 60, label: 'Geschenke' },
] as const

const DEMO_INCOME = 4200
const DEMO_INVESTMENT = 800

export function HouseholdPage() {
  const [activeMonth] = useState(new Date().getMonth())
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

  const totalExpenses = DEMO_EXPENSES.reduce((sum, e) => sum + e.amount, 0)
  const totalSavings = DEMO_INCOME - totalExpenses - DEMO_INVESTMENT
  const savingsRate = ((totalSavings + DEMO_INVESTMENT) / DEMO_INCOME) * 100

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-[var(--color-text-primary)]">Haushalt</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Einnahmen & Ausgaben im Überblick</p>
        </div>
        <Button variant="primary" size="sm">
          <Plus size={15} />
          Eintrag
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {months.map((m, i) => (
          <button
            key={m}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0
              ${i === activeMonth
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]'
              }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          label="Einnahmen"
          value={formatCurrency(DEMO_INCOME)}
          icon={<Briefcase size={16} />}
          accentColor="#22c55e"
        />
        <KPICard
          label="Ausgaben"
          value={formatCurrency(totalExpenses)}
          icon={<ShoppingCart size={16} />}
          accentColor="#ef4444"
        />
        <KPICard
          label="Investiert"
          value={formatCurrency(DEMO_INVESTMENT)}
          icon={<Plus size={16} />}
          accentColor="#3b82f6"
        />
        <KPICard
          label="Sparquote"
          value={`${savingsRate.toFixed(1)}%`}
          icon={<Heart size={16} />}
          accentColor="#8b5cf6"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Ausgaben nach Kategorie</h2>
          <div className="space-y-3">
            {DEMO_EXPENSES.map(({ category, amount, label }) => {
              const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]
              const Icon = config.icon
              const pct = (amount / totalExpenses) * 100
              return (
                <div key={category} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${config.color}18` }}
                  >
                    <Icon size={14} style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[var(--color-text-primary)]">{label}</span>
                      <span className="text-xs font-medium text-[var(--color-text-primary)]">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: config.color }}
                      />
                    </div>
                    <p className="text-[10px] text-[var(--color-muted)] mt-0.5">{pct.toFixed(1)}% der Ausgaben</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Finanzübersicht</h2>
          <div className="space-y-4">
            <div className="rounded-xl bg-[var(--color-bg-tertiary)] p-4">
              <div className="flex justify-between text-xs text-[var(--color-muted)] mb-2">
                <span>Ausgaben</span>
                <span>Einnahmen</span>
              </div>
              <div className="h-3 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(totalExpenses / DEMO_INCOME) * 100}%`,
                    background: 'linear-gradient(90deg, #ef4444, #f59e0b)',
                  }}
                />
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                {((totalExpenses / DEMO_INCOME) * 100).toFixed(1)}% deiner Einnahmen werden ausgegeben
              </p>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Netto verfügbar', value: DEMO_INCOME - totalExpenses, color: 'text-gain' },
                { label: 'Investitions-Sparplan', value: -DEMO_INVESTMENT, color: 'text-[var(--color-accent)]' },
                { label: 'Freie Liquidität', value: DEMO_INCOME - totalExpenses - DEMO_INVESTMENT, color: 'text-[var(--color-text-primary)]' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                  <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
                  <span className={`text-sm font-medium ${color}`}>
                    {value >= 0 ? '+' : ''}{formatCurrency(value)}
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.15)] p-3">
              <p className="text-xs font-medium text-[var(--color-accent-purple)] mb-1">KI-Tipp (bald verfügbar)</p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Du könntest durch Optimierung deiner Nebenkosten weitere ~€50/Monat sparen — das wären €600 pro Jahr zusätzlich investierbar.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
