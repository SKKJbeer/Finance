import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usePortfolioStore } from '@/stores/portfolioStore'
import type { AssetType, TransactionType, Currency } from '@/types'

interface FormValues {
  symbol: string
  name: string
  assetType: AssetType
  type: TransactionType
  quantity: number
  price: number
  fees: number
  currency: Currency
  date: string
  notes: string
}

interface Props {
  onClose: () => void
}

export function AddTransactionModal({ onClose }: Props) {
  const { addTransaction } = usePortfolioStore()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      type: 'buy',
      assetType: 'stock',
      currency: 'EUR',
      fees: 0,
      date: new Date().toISOString().split('T')[0],
    },
  })

  const txType = watch('type')

  const onSubmit = async (values: FormValues) => {
    await addTransaction({
      symbol: values.symbol.toUpperCase(),
      name: values.name,
      type: values.type,
      assetType: values.assetType,
      quantity: Number(values.quantity),
      price: Number(values.price),
      fees: Number(values.fees),
      currency: values.currency,
      exchangeRate: 1,
      date: values.date,
      notes: values.notes || undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-md rounded-t-2xl md:rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h2 className="font-semibold text-[var(--color-text-primary)]">Transaktion erfassen</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-tertiary)] text-[var(--color-muted)] transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Typ</label>
              <select {...register('type')} className={inputClass}>
                <option value="buy">Kauf</option>
                <option value="sell">Verkauf</option>
                <option value="dividend">Dividende</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Asset-Typ</label>
              <select {...register('assetType')} className={inputClass}>
                <option value="stock">Aktie</option>
                <option value="etf">ETF</option>
                <option value="crypto">Krypto</option>
                <option value="bond">Anleihe</option>
                <option value="cash">Cash</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Symbol *</label>
              <input
                {...register('symbol', { required: 'Pflichtfeld' })}
                placeholder="z.B. AAPL"
                className={`${inputClass} uppercase`}
              />
              {errors.symbol && <p className="text-xs text-[var(--color-loss)] mt-1">{errors.symbol.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Name *</label>
              <input
                {...register('name', { required: 'Pflichtfeld' })}
                placeholder="z.B. Apple Inc."
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">
                {txType === 'dividend' ? 'Betrag' : 'Menge'} *
              </label>
              <input
                {...register('quantity', { required: true, min: 0.000001 })}
                type="number"
                step="any"
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">
                {txType === 'dividend' ? 'je Aktie' : 'Kurs'} *
              </label>
              <input
                {...register('price', { required: true, min: 0 })}
                type="number"
                step="any"
                placeholder="0.00"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Gebühren</label>
              <input
                {...register('fees', { min: 0 })}
                type="number"
                step="any"
                placeholder="0.00"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Währung</label>
              <select {...register('currency')} className={inputClass}>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="CHF">CHF</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Datum *</label>
              <input
                {...register('date', { required: true })}
                type="date"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Notiz</label>
            <input
              {...register('notes')}
              placeholder="Optional..."
              className={inputClass}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} fullWidth>
              Abbrechen
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting} fullWidth>
              {isSubmitting ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputClass = `
  w-full px-3 py-2 text-sm rounded-lg border
  bg-[var(--color-bg-tertiary)] border-[var(--color-border)]
  text-[var(--color-text-primary)] placeholder:text-[var(--color-muted)]
  focus:outline-none focus:border-[var(--color-accent)]
  transition-colors
`
