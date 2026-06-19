import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AddTransactionModal } from '@/features/portfolio/AddTransactionModal'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { formatCurrency, formatDate } from '@/lib/formatters'

const TYPE_LABEL: Record<string, { label: string; badge: 'gain' | 'loss' | 'neutral' | 'accent' | 'purple' }> = {
  buy: { label: 'Kauf', badge: 'accent' },
  sell: { label: 'Verkauf', badge: 'neutral' },
  dividend: { label: 'Dividende', badge: 'gain' },
  split: { label: 'Split', badge: 'purple' },
  transfer_in: { label: 'Einlage', badge: 'accent' },
  transfer_out: { label: 'Entnahme', badge: 'loss' },
}

export function TransactionsPage() {
  const [showModal, setShowModal] = useState(false)
  const { transactions, loadTransactions, deleteTransaction } = usePortfolioStore()

  useEffect(() => { loadTransactions() }, [loadTransactions])

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-[var(--color-text-primary)]">Transaktionen</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{transactions.length} Einträge</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          <Plus size={15} />
          Neu
        </Button>
      </div>

      {transactions.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-[var(--color-text-secondary)] mb-2">Noch keine Transaktionen</p>
          <p className="text-sm text-[var(--color-muted)] mb-4">Erfasse deinen ersten Kauf, Verkauf oder eine Dividende.</p>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <Plus size={15} />
            Erste Transaktion erfassen
          </Button>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  {['Datum', 'Typ', 'Symbol', 'Name', 'Menge', 'Kurs', 'Gebühren', 'Gesamt', ''].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-[var(--color-muted)] px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {sorted.map(tx => {
                  const typeInfo = TYPE_LABEL[tx.type] ?? { label: tx.type, badge: 'neutral' as const }
                  const total = tx.quantity * tx.price + tx.fees
                  return (
                    <tr key={tx.id} className="hover:bg-[var(--color-bg-tertiary)] transition-colors group">
                      <td className="px-4 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">{formatDate(tx.date)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={typeInfo.badge}>{typeInfo.label}</Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[var(--color-text-primary)]">{tx.symbol}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)] max-w-32 truncate">{tx.name}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{tx.quantity}</td>
                      <td className="px-4 py-3 text-[var(--color-text-primary)]">{formatCurrency(tx.price, tx.currency)}</td>
                      <td className="px-4 py-3 text-[var(--color-muted)]">{tx.fees > 0 ? formatCurrency(tx.fees, tx.currency) : '—'}</td>
                      <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{formatCurrency(total, tx.currency)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[var(--color-loss-bg)] text-[var(--color-muted)] hover:text-[var(--color-loss)] transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
