import { useForm } from 'react-hook-form'
import { Save, Download, Upload, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useSettingsStore } from '@/stores/settingsStore'
import { exportData } from '@/lib/db'
import type { AppSettings } from '@/types'

export function SettingsPage() {
  const { settings, updateSettings } = useSettingsStore()
  const { register, handleSubmit, formState: { isDirty } } = useForm<AppSettings>({
    defaultValues: settings,
  })

  const onSave = (values: AppSettings) => {
    updateSettings(values)
  }

  const handleExport = async () => {
    const data = await exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finanzkompass-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-[var(--color-text-primary)]">Einstellungen</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">App-Konfiguration und Datenverwaltung</p>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        <Card>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Allgemein</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Währung</label>
                <select {...register('currency')} className={inputClass}>
                  <option value="EUR">EUR — Euro</option>
                  <option value="USD">USD — US-Dollar</option>
                  <option value="GBP">GBP — Britisches Pfund</option>
                  <option value="CHF">CHF — Schweizer Franken</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Sprache</label>
                <select {...register('locale')} className={inputClass}>
                  <option value="de-DE">Deutsch</option>
                  <option value="en-US">English</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Kursdaten (optional)</h2>
          <p className="text-xs text-[var(--color-muted)] mb-4">
            Live-Kurse werden automatisch von Yahoo Finance geladen — kein Key nötig.
            Ein kostenloser Alpha-Vantage-Key dient nur als Fallback und für die erweiterte Wertpapier-Suche.
          </p>
          <div>
            <label className={labelClass}>API-Key</label>
            <input
              {...register('alphaVantageApiKey')}
              type="password"
              placeholder="Dein Alpha Vantage API-Key"
              className={inputClass}
              autoComplete="off"
            />
          </div>
          <a
            href="https://www.alphavantage.co/support/#api-key"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-[var(--color-accent)] hover:underline"
          >
            Kostenlosen API-Key holen
            <ExternalLink size={11} />
          </a>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Steuer (Deutschland)</h2>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Sparerpauschbetrag</label>
              <div className="relative">
                <input
                  {...register('sparerpauschbetrag', { valueAsNumber: true })}
                  type="number"
                  className={`${inputClass} pr-10`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-muted)]">€</span>
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                €1.000 für Singles, €2.000 für Ehepaare (2024)
              </p>
            </div>
            <div>
              <label className={labelClass}>Steuerlicher Status</label>
              <select {...register('taxFiling')} className={inputClass}>
                <option value="single">Einzelveranlagung (€1.000)</option>
                <option value="married">Zusammenveranlagung (€2.000)</option>
              </select>
            </div>
          </div>
        </Card>

        <Button type="submit" variant="primary" fullWidth disabled={!isDirty}>
          <Save size={15} />
          Einstellungen speichern
        </Button>
      </form>

      <Card>
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Datensicherung</h2>
        <p className="text-xs text-[var(--color-muted)] mb-4">
          Alle Daten werden lokal in deinem Browser gespeichert. Exportiere regelmäßig ein Backup.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download size={14} />
            Backup exportieren
          </Button>
          <Button variant="secondary" size="sm">
            <Upload size={14} />
            Backup importieren
          </Button>
        </div>
      </Card>
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
