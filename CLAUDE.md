# FinanzKompass — CLAUDE.md

## Projekt-Identität

**Name:** FinanzKompass  
**Motto:** *Dein gesamtes Finanzbild. Klar. Elegant. Intelligent.*  
**Ziel:** Premium-Finanz-App die Aktienportfolio-Management mit Haushaltsfinanzen vereint — zunächst als GitHub Pages PWA, später als App Store App.

---

## Architektur-Übersicht

```
FinanzKompass
├── Phase 1: PWA auf GitHub Pages (aktuell)
│   ├── React 18 + TypeScript
│   ├── Vite (Build)
│   ├── TailwindCSS v3 (Styling)
│   ├── Zustand (State Management)
│   ├── Dexie.js / IndexedDB (Offline Storage)
│   ├── Recharts (Charts)
│   └── GitHub Actions → GitHub Pages (CI/CD)
│
├── Phase 2: Backend + Broker-Sync (geplant)
│   ├── Node.js / Hono Backend
│   ├── PostgreSQL (User Data)
│   ├── Redis (Cache für Kursdaten)
│   └── OAuth für Broker (Trade Republic, Comdirect, ING)
│
├── Phase 3: Native App (geplant)
│   ├── React Native + Expo
│   └── Shared Business Logic mit Phase 1
│
└── Phase 4: KI-Agenten (geplant)
    ├── Portfolio-Analyse-Agent (Claude API)
    ├── News-Sentiment-Agent
    ├── Rebalancing-Empfehlungs-Agent
    └── Haushalts-Optimierungs-Agent
```

---

## Tech Stack (Phase 1 — aktiv)

| Bereich | Technologie | Begründung |
|---------|-------------|------------|
| Framework | React 18 + TypeScript | Komponenten-basiert, Typsicherheit, große Community |
| Build | Vite 5 | Schnell, perfekt für GitHub Pages (static output) |
| Styling | TailwindCSS v3 + custom CSS vars | Utility-first, einfach zu warten, dark mode |
| State | Zustand | Minimal, kein Boilerplate, Persist-Middleware |
| Storage | Dexie.js (IndexedDB) | Offline-first, strukturierte lokale DB |
| Charts | Recharts | React-nativ, kompositionell, leicht anpassbar |
| Icons | Lucide React | Konsistent, tree-shakeable |
| Router | React Router v6 | SPA-Routing für GitHub Pages |
| Forms | React Hook Form | Performance, Validation |
| Dates | date-fns | Leichtgewichtig vs Moment.js |

---

## Markt-Analyse (Zusammenfassung)

### Konkurrenten analysiert:
- **Parqet** — Bester Deutscher Tracker, hat Abgeltungssteuer, aber kein Open Source / kein Offline
- **Sharesight** — Stark bei Dividenden/Tax, kein Deutsch
- **Portfolio Performance** — Open Source, Desktop-only, veraltet UX
- **Finanzguru** — Budget stark, Portfolio schwach
- **Robinhood/Yahoo Finance** — US-only fokus, kein German Tax

### Unser Wettbewerbsvorteil:
1. **Abgeltungssteuer** als First-Class Feature
2. **Offline-first PWA** — keine anderen Top-Apps können das
3. **Haushalts + Portfolio kombiniert** — niemand macht das gut
4. **KI-Agenten** für Analyse (Roadmap)
5. **Elegant & Modern** — besser als Portfolio Performance's Desktop-UX

### Schmerzpunkte der Nutzer (von Reviews):
- Trading 212 Redesign-Backlash: Nutzer wollen Information Density, nicht leeren Raum
- Yahoo Finance: Nur Capital Gains, keine Dividenden, kein Broker-Sync
- Morningstar Portfolio Manager: **April 2025 eingestellt** → freie Nutzer suchen Alternative
- Allgemein: Manual Entry ist mühsam, CSV-Import als Minimum

---

## Design-System

### Design-Philosophie
- **Dark Mode by default** (elegant, professionell — wie Bloomberg Terminal + Apple)
- Minimalist aber informationsdicht (kein verschwendeter Weißraum)
- Micro-Animationen für Feedback (nicht für Dekoration)
- Mobile-first aber Desktop optimiert

### Farb-Palette
```css
/* Primäre Palette */
--color-bg-primary:    #0a0b0e;   /* Fast-Schwarz, kein echtes Schwarz */
--color-bg-secondary:  #13151a;   /* Card-Hintergrund */
--color-bg-tertiary:   #1c1f28;   /* Hover-States, Input-Backgrounds */
--color-border:        #2a2d3a;   /* Subtile Trennlinien */

/* Akzentfarben */
--color-accent-blue:   #3b82f6;   /* Primary CTA, Links */
--color-accent-purple: #8b5cf6;   /* Secondary Highlight */
--color-accent-cyan:   #06b6d4;   /* Charts, Trends */

/* Semantik */
--color-gain:          #22c55e;   /* Grün = Gewinn */
--color-loss:          #ef4444;   /* Rot = Verlust */
--color-neutral:       #94a3b8;   /* Neutral/Secondary Text */

/* Text */
--color-text-primary:  #f1f5f9;
--color-text-secondary: #94a3b8;
--color-text-muted:    #64748b;
```

### Typografie
- **Font:** Inter (Variable, Google Fonts)
- **Zahlen:** Tabular Numbers (font-variant-numeric: tabular-nums)
- **Hierarchie:** 
  - Headlines: 600 weight
  - Body: 400
  - Labels/Muted: 400, --color-text-secondary

### Komponenten-Prinzipien
- Cards: `bg-secondary + border + rounded-xl + shadow`
- KPI-Cards: Grosse Zahl oben, Delta darunter, Trend-Pfeil
- Charts: Area-Charts für Portfolio-Wert, Donut für Allocation
- Tables: Sortierbar, kompakt, zebra-striping dezent

---

## Feature-Roadmap

### Phase 1a — Core MVP (aktuell)
- [ ] Projekt-Setup (Vite + React + TS + Tailwind)
- [ ] GitHub Actions CI/CD → GitHub Pages
- [ ] Design System / Tokens
- [ ] Layout: Sidebar-Navigation (Desktop) + Bottom-Nav (Mobile)
- [ ] Dashboard-Seite mit KPI-Cards
- [ ] Portfolio-Übersicht (Holdings-Liste)
- [ ] Position manuell erfassen (Kauf/Verkauf)
- [ ] Lokale Persistenz (Dexie.js)
- [ ] Kurs-Daten via Alpha Vantage API (mit Cache)
- [ ] Profit/Loss Berechnung (realized + unrealized)
- [ ] Portfolio-Wert Chart (1W / 1M / 3M / YTD / 1Y / All)
- [ ] Asset-Allocation Donut Chart

### Phase 1b — Portfolio-Features
- [ ] Dividenden-Tracking und -Kalender
- [ ] Abgeltungssteuer-Berechnung (25% + SolZ, Sparerpauschbetrag €1.000)
- [ ] Performance vs Benchmark (DAX, S&P 500, MSCI World)
- [ ] CSV-Import (Depot-Exports von Trade Republic, Comdirect, ING)
- [ ] Sektoren-Analyse (Übergewichtungen erkennen)
- [ ] Kursalarme (Zielkurs, % Änderung)
- [ ] News-Feed für eigene Holdings

### Phase 1c — Haushalts-Modul
- [ ] Ausgaben-Kategorien (Miete, Lebensmittel, Transport, etc.)
- [ ] Monatliches Budget + Ist-Vergleich
- [ ] Einnahmen/Ausgaben-Übersicht
- [ ] Netto-Vermögen Gesamtbild (Portfolio + Cash + Schulden)
- [ ] Sparquote-Berechnung

### Phase 2 — Backend + AI (geplant)
- [ ] User-Authentifizierung
- [ ] Cloud-Sync (Daten geräteübergreifend)
- [ ] Broker-Integration (Trade Republic API)
- [ ] KI-Portfolio-Analyst (Claude API)
- [ ] Smart Alerts (KI-basiert)
- [ ] Rebalancing-Empfehlungen

---

## Projekt-Struktur

```
src/
├── assets/              # Bilder, Fonts, Icons
├── components/          # Wiederverwendbare UI-Komponenten
│   ├── ui/              # Basis-Elemente (Button, Card, Badge, Input...)
│   ├── charts/          # Chart-Komponenten (LineChart, DonutChart, AreaChart)
│   ├── portfolio/       # Portfolio-spezifische Komponenten
│   ├── household/       # Haushalts-Komponenten
│   └── layout/          # Navigation, Header, Sidebar
├── features/            # Feature-Module (kolociert: Logik + UI)
│   ├── dashboard/       # Dashboard-Feature
│   ├── portfolio/       # Portfolio-Management
│   ├── transactions/    # Transaktions-Verwaltung
│   ├── dividends/       # Dividenden-Tracking
│   ├── household/       # Haushalts-Verwaltung
│   └── settings/        # App-Einstellungen
├── hooks/               # Custom React Hooks
├── lib/                 # Utilities, Helpers
│   ├── api/             # API-Clients (Alpha Vantage, Yahoo Finance)
│   ├── db/              # Dexie.js Datenbank-Schema
│   ├── calculations/    # Finanz-Berechnungen (P&L, TTWROR, Tax)
│   └── formatters/      # Zahlen, Währungen, Datum formatieren
├── stores/              # Zustand Stores
│   ├── portfolioStore.ts
│   ├── marketDataStore.ts
│   └── settingsStore.ts
├── types/               # TypeScript Typ-Definitionen
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

## Finanz-Berechnungs-Logik

### Kernberechnungen (implementieren in `lib/calculations/`)

**Unrealisierter Gewinn/Verlust:**
```
unrealizedPnL = (currentPrice - averageCostBasis) × quantity
unrealizedPnLPercent = (currentPrice / averageCostBasis - 1) × 100
```

**Realisierter Gewinn (FIFO):**
- Käufe in Queue, bei Verkauf älteste Lots zuerst verbrauchen
- Realisierter Gewinn = Verkaufspreis - FIFO-Einstandspreis

**Time-Weighted Rate of Return (TTWROR / TTWROR):**
```
TTWROR = (∏ (1 + Rperiod)) - 1
wobei Rperiod = (EndValue - StartValue - Cashflow) / (StartValue + Cashflow)
```

**Abgeltungssteuer (Deutschland):**
```
taxableGain = realizedGain - sparerpauschbetrag (max €1.000/Person)
abgeltungsteuer = taxableGain × 0.25
solidaritaetszuschlag = abgeltungsteuer × 0.055
kirchensteuer = 0 (opt-in, 8-9%)
gesamtsteuer = abgeltungsteuer + solidaritaetszuschlag
```

**Durchschnittlicher Einstandspreis:**
```
averageCostBasis = totalCost / totalShares
(bei Zukauf: (oldCost + newPurchaseCost) / (oldShares + newShares))
```

---

## API-Strategie

### Kurs-Daten (Phase 1)
- **Primary:** Alpha Vantage (Gratis: 25 Requests/Tag, 5/Minute)
- **Fallback:** Yahoo Finance inoffiziell via `/v8/finance/chart/{symbol}`
- **Cache:** IndexedDB, TTL 15 Minuten für Kurse, 24h für historische Daten

### Wichtig: API-Keys
- API-Keys NIEMALS ins Repository commiten
- Nutzer trägt eigenen Alpha Vantage Key in den App-Settings ein
- Key wird in localStorage gespeichert (nicht in DB)

### Kurs-Endpunkte die wir nutzen:
```
Alpha Vantage:
  GET GLOBAL_QUOTE          → Aktueller Kurs
  GET TIME_SERIES_DAILY     → Historische Kurse (portfolio chart)
  GET SYMBOL_SEARCH         → Aktien-Suche beim Erfassen

Yahoo Finance (inoffiziell, als Fallback):
  /v8/finance/chart/{symbol}?interval=1d&range=1y
```

---

## GitHub Pages Deployment

```yaml
# .github/workflows/deploy.yml
# Automatisch bei Push auf main
# Build: npm run build
# Deploy: peaceiris/actions-gh-pages@v4
# Base URL: /Finance/ (Repository-Name)
```

**Wichtig für React Router + GitHub Pages:**
- `vite.config.ts`: `base: '/Finance/'`
- `404.html` Redirect-Trick für Client-Side-Routing
- Router `basename="/Finance"`

---

## Entwicklungs-Konventionen

### Code-Stil
- TypeScript strict mode: an
- Functional Components only (keine Class Components)
- Custom Hooks für Logik (aus JSX heraushalten)
- Named Exports (keine default exports für Komponenten)
- Datei-Name = Komponenten-Name (PascalCase)

### Commit-Nachrichten
```
feat: Neue Funktion
fix: Bug-Fix
design: UI/UX Änderung
refactor: Code-Umstrukturierung
docs: Dokumentation
```

### Finanz-Daten-Typen (wichtig!)
- Alle Geldbeträge in der DB als `number` (Euro, Cent-Genauigkeit mit toFixed(2))
- Datum immer als ISO-String: `"2025-01-15"`
- Symbol immer als UPPERCASE: `"AAPL"`, `"VOW3.DE"`
- Menge (quantity) als `number` (Dezimalanteile von ETFs möglich!)

---

## Datenbank-Schema (Dexie.js / IndexedDB)

```typescript
// Tabellen:
holdings         // Aktuelle Positionen (aggregiert)
transactions     // Alle Käufe/Verkäufe/Dividenden (audit trail)
priceCache       // Gecachte Kursdaten
households       // Haushalts-Ausgaben und -Einnahmen
budgets          // Monatliche Budget-Pläne
alerts           // Kursalarme
settings         // App-Einstellungen
```

---

## Geplante KI-Agenten (Phase 2-3)

### Portfolio-Analyse-Agent
- Input: Alle Holdings + Transaktionen + Marktdaten
- Output: Bewertung der Diversifikation, Klumpenrisiken, Performance-Attributierung
- Tool: Claude API (`claude-sonnet-4-6` oder `claude-opus-4-8`)

### Rebalancing-Agent
- Input: Aktuelle Allocation + Ziel-Allocation + Marktpreise
- Output: Konkrete Kauf/Verkauf-Empfehlungen mit Steueroptimierung

### Haushalts-Optimierungs-Agent
- Input: Haushaltsausgaben der letzten 3-6 Monate
- Output: Sparpotenziale, Ausgaben-Muster, Investierbare Beträge

### News-Sentiment-Agent
- Input: News zu Holdings aus dem Portfolio
- Output: Zusammenfassung + Sentiment-Score + Handlungsempfehlung

---

## Wichtige Entscheidungen (Architecture Decision Records)

### ADR-001: PWA statt Native App zuerst
**Entscheidung:** GitHub Pages PWA als erstes Deployment  
**Begründung:** Zero-Cost Hosting, kein App Store Review, sofort deploybar, offline via Service Worker  
**Trade-off:** Kein Push-Notification-Support auf iOS, kleinerer App Store Exposure  

### ADR-002: Lokale Datenhaltung (kein Backend Phase 1)
**Entscheidung:** Alle Daten in IndexedDB (Dexie.js), kein Backend-Server  
**Begründung:** Kein Server-Kosten, Datenschutz-konform, funktioniert offline  
**Trade-off:** Kein Multi-Gerät Sync in Phase 1, Daten bei Browser-Reset verloren  
**Mitigation:** Export/Import Funktion (JSON), CSV-Backup  

### ADR-003: Alpha Vantage als Primary API (User-Key)
**Entscheidung:** Nutzer bringt eigenen API-Key mit  
**Begründung:** Kein API-Kosten für uns, kostenlos für Nutzer (25/Tag reicht für Portfolio-Tracker)  
**Trade-off:** Setup-Aufwand für Nutzer, Onboarding-Hürde  
**Mitigation:** Demo-Modus mit Mock-Daten, einfache API-Key Eingabe im Onboarding  

### ADR-004: Zustand über Context API / Redux
**Entscheidung:** Zustand für globalen State  
**Begründung:** Minimal, kein Boilerplate, Persist-Middleware für localStorage  
**Trade-off:** Kein eingebautes DevTools wie Redux (aber Zustand hat Browser Extension)  

### ADR-005: Recharts über Chart.js / D3
**Entscheidung:** Recharts für alle Charts  
**Begründung:** React-nativ, deklarativ, einfach zu customizen, TypeScript-Support  
**Trade-off:** Weniger Flexibilität als D3 für komplexe Custom-Charts  

---

## Status-Tracker

| Feature | Status | Notes |
|---------|--------|-------|
| Projekt-Setup | 🟡 In Progress | Vite + React + TS + Tailwind |
| GitHub Actions CI/CD | ⬜ Geplant | |
| Design System | ⬜ Geplant | |
| Navigation/Layout | ⬜ Geplant | |
| Dashboard | ⬜ Geplant | |
| Portfolio-Holdings | ⬜ Geplant | |
| Transaktionen | ⬜ Geplant | |
| Kurs-API Integration | ⬜ Geplant | |
| Charts | ⬜ Geplant | |
| Abgeltungssteuer | ⬜ Geplant | |
| Dividenden | ⬜ Geplant | |
| Haushalts-Modul | ⬜ Geplant | |
| CSV-Import | ⬜ Geplant | |
| KI-Agenten | ⬜ Phase 2 | |

---

*Letzte Aktualisierung: 2026-06-19*
