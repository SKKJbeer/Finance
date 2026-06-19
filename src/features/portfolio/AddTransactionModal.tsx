import { useState } from 'react'
import { X, Check, ChevronLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SecuritySearch } from '@/components/ui/SecuritySearch'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { formatCurrency } from '@/lib/formatters'
import type { Security } from '@/lib/api/securities'
import type { TransactionType } from '@/types'

interface Props {
  onClose: () => void
}

const TYPE_OPTIONS: { value: TransactionType; label: string; activeClass: string }[] = [
  { value: 'buy', label: 'Kauf', activeClass: 'bg-[var(--color-gain)] text-white' },
  { value: 'sell', label: 'Verkauf', activeClass: 'bg-[var(--color-loss)] text-white' },
  { value: 'dividend', label: 'Dividende', activeClass: 'bg-[var(--color-accent)] text-white' },
]

const todayISO = () => new Date().toISOString().split('T')[0]

export function AddTransactionModal({ onClose }: Props) {
  const { addTransaction } = usePortfolioStore()
  const { settings } = useSettingsStore()

  const [security, setSecurity] = useState<Security | null>(null)
  const [type, setType] = useState<TransactionType>('buy')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [fees, setFees] = useState('')
  const [date, setDate] = useState(todayISO())
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function handleSelect(sec: Security) {
    setSecurity(sec)
    if (sec.price > 0) setPrice(String(sec.price))
  }

  const qNum = parseFloat(quantity) || 0
  const pNum = parseFloat(price) || 0
  const fNum = parseFloat(fees) || 0
  const gross = qNum * pNum
  const total = type === 'sell' ? gross - fNum : type === 'dividend' ? gross : gross + fNum

  const isDividend = type === 'dividend'
  const canSubmit = security !== null && qNum > 0 && pNum >= 0 && !submitting

  async function handleSubmit() {
    if (!security || !canSubmit) return
    setSubmitting(true)
    await addTransaction({
      symbol: security.symbol.toUpperCase(),
      name: security.name,
      type,
      assetType: security.type,
      quantity: qNum,
      price: pNum,
      fees: fNum,
      currency: security.currency,
      exchangeRate: 1,
      date,
      notes: notes.trim() || undefined,
    })
    onClose()
  }

  const totalLabel = type === 'sell' ? 'Erlös' : isDividend ? 'Ausschüttung' : 'Gesamtkosten'
  const submitLabel = type === 'sell' ? 'Verkauf' : isDividend ? 'Dividende' : 'Kauf'

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl md:rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <h2 className="font-semibold text-[var(--color-text-primary)]">
            {security ? 'Transaktion erfassen' : 'Wertpapier wählen'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-tertiary)] text-[var(--color-muted)] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {!security ? (
            <>
              <SecuritySearch onSelect={handleSelect} apiKey={settings.alphaVantageApiKey} autoFocus />
              <p className="text-xs text-[var(--color-muted)] px-1">
                Tippe Name oder Symbol — z.B. „Apple", „SAP" oder „MSCI World". Tastatur: ↑ ↓ und Enter.
              </p>
            </>
          ) : (
            <>
              {/* Gewähltes Wertpapier */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
                <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)]">
                  {security.symbol.replace(/[-.].*$/, '').slice(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{security.name}</p>
                  <p className="text-xs text-[var(--color-muted)]">{security.symbol} · {security.currency}</p>
                </div>
                <button
                  onClick={() => { setSecurity(null); setPrice('') }}
                  className="flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline shrink-0"
                >
                  <ChevronLeft size={13} /> Ändern
                </button>
              </div>

              {/* Typ-Umschalter */}
              <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
                {TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setType(opt.value)}
                    className={`py-2 text-sm font-medium rounded-md transition-colors ${
                      type === opt.value ? opt.activeClass : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Menge & Kurs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{isDividend ? 'Anteile' : 'Menge'}</label>
                  <input
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    placeholder="0"
                    autoFocus
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{isDividend ? 'Betrag je Anteil' : 'Kurs je Stück'}</label>
                  <div className="relative">
                    <input
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      placeholder="0,00"
                      className={`${inputClass} pr-12`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)]">{security.currency}</span>
                  </div>
                </div>
              </div>

              {/* Gebühren & Datum */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Gebühren <span className="text-[var(--color-muted)] font-normal">(optional)</span></label>
                  <input
                    value={fees}
                    onChange={(e) => setFees(e.target.value)}
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    placeholder="0,00"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Datum</label>
                  <input
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    type="date"
                    max={todayISO()}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Notiz (einklappbar) */}
              {showNotes ? (
                <div>
                  <label className={labelClass}>Notiz</label>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="z.B. Sparplan-Rate Juni"
                    className={inputClass}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowNotes(true)}
                  className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <Plus size={13} /> Notiz hinzufügen
                </button>
              )}

              {/* Live-Summe */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
                <span className="text-sm text-[var(--color-text-secondary)]">{totalLabel}</span>
                <span className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {formatCurrency(total, security.currency)}
                </span>
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={onClose} fullWidth>
                  Abbrechen
                </Button>
                <Button type="button" variant="primary" onClick={handleSubmit} disabled={!canSubmit} fullWidth>
                  <Check size={15} />
                  {submitting ? 'Speichern…' : `${submitLabel} speichern`}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const labelClass = 'text-xs font-medium text-[var(--color-text-secondary)] mb-1 block'
const inputClass = `
  w-full px-3 py-2 text-sm rounded-lg border
  bg-[var(--color-bg-tertiary)] border-[var(--color-border)]
  text-[var(--color-text-primary)] placeholder:text-[var(--color-muted)]
  focus:outline-none focus:border-[var(--color-accent)]
  transition-colors
`
