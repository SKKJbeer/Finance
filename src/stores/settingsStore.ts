import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings } from '@/types'

interface SettingsStore {
  settings: AppSettings
  updateSettings: (partial: Partial<AppSettings>) => void
}

const defaults: AppSettings = {
  currency: 'EUR',
  fmpApiKey: '',
  alphaVantageApiKey: '',
  sparerpauschbetrag: 1000,
  taxFiling: 'single',
  benchmarkSymbol: 'IWDA.AS',
  theme: 'dark',
  locale: 'de-DE',
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaults,
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
    }),
    { name: 'finanzkompass-settings' }
  )
)
