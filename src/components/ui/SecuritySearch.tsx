import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { searchSecurities, type Security } from '@/lib/api/securities'
import { searchSymbols } from '@/lib/api/marketData'
import type { AssetType, Currency } from '@/types'

interface Props {
  onSelect: (security: Security) => void
  apiKey?: string
  autoFocus?: boolean
}

const TYPE_LABEL: Record<AssetType, string> = {
  stock: 'Aktie', etf: 'ETF', crypto: 'Krypto', bond: 'Anleihe', real_estate: 'Immobilie', cash: 'Cash',
}

export function SecuritySearch({ onSelect, apiKey, autoFocus }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Security[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const runSearch = useCallback(async (q: string) => {
    const local = searchSecurities(q, 7)
    setResults(local)
    setActiveIndex(0)

    // Live-Augmentierung via Alpha Vantage, wenn API-Key vorhanden und wenig lokale Treffer
    if (apiKey && q.length >= 2 && local.length < 5) {
      const remote = await searchSymbols(q, apiKey)
      const known = new Set(local.map(s => s.symbol))
      const merged = [...local]
      for (const r of remote) {
        if (!known.has(r.symbol)) {
          merged.push({
            symbol: r.symbol,
            name: r.name,
            type: (r.type?.toLowerCase().includes('etf') ? 'etf' : 'stock') as AssetType,
            currency: (r.currency as Currency) || 'USD',
            exchange: r.region || '—',
            price: 0,
          })
        }
      }
      setResults(merged.slice(0, 8))
    }
  }, [apiKey])

  function handleChange(value: string) {
    setQuery(value)
    setOpen(true)
    void runSearch(value)
  }

  function pick(sec: Security) {
    onSelect(sec)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  function pickManual() {
    const sym = query.trim().toUpperCase()
    if (!sym) return
    pick({ symbol: sym, name: sym, type: 'stock', currency: 'EUR', exchange: '—', price: 0 })
  }

  const showManual = query.trim().length >= 1 &&
    !results.some(r => r.symbol.toLowerCase() === query.trim().toLowerCase())
  const totalOptions = results.length + (showManual ? 1 : 0)

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, totalOptions - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex < results.length) pick(results[activeIndex])
      else if (showManual) pickManual()
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Aktie, ETF oder Krypto suchen…"
          autoComplete="off"
          className="w-full pl-9 pr-9 py-2.5 text-sm rounded-lg border bg-[var(--color-bg-tertiary)] border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); setOpen(false); inputRef.current?.focus() }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-[var(--color-muted)] hover:text-[var(--color-text-primary)]"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {open && totalOptions > 0 && (
        <div className="absolute z-20 mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
          {results.map((sec, i) => (
            <button
              key={sec.symbol}
              type="button"
              onClick={() => pick(sec)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                i === activeIndex ? 'bg-[var(--color-bg-tertiary)]' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)]">
                {sec.symbol.replace(/[-.].*$/, '').slice(0, 3)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{sec.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                  <span className="font-medium text-[var(--color-text-secondary)]">{sec.symbol}</span>
                  <span>·</span>
                  <span>{TYPE_LABEL[sec.type]}</span>
                  <span>·</span>
                  <span>{sec.exchange}</span>
                </div>
              </div>
            </button>
          ))}

          {showManual && (
            <button
              type="button"
              onClick={pickManual}
              onMouseEnter={() => setActiveIndex(results.length)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left border-t border-[var(--color-border)] transition-colors ${
                activeIndex === results.length ? 'bg-[var(--color-bg-tertiary)]' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center bg-[var(--color-bg-primary)] border border-dashed border-[var(--color-border)]">
                <span className="text-[var(--color-accent)] text-lg leading-none">+</span>
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                „<span className="font-semibold text-[var(--color-text-primary)]">{query.trim().toUpperCase()}</span>" manuell verwenden
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
