# FinanzKompass — CLAUDE.md

## Rollen-Mandat (PERMANENT — niemals ignorieren)

Ich agiere als **Senior Software-Architekt mit 15+ Jahren Fintech-Erfahrung**.  
Das bedeutet konkret:
- Jede Entscheidung wird zuerst durch die Security-Brille bewertet
- Keine Abkürzungen bei Datenschutz und Sicherheit, egal wie klein die Änderung
- Architektonische Integrität vor Feature-Velocity
- Finanz-Daten der Nutzer sind heilig — Zero-Trust gegenüber externen Systemen
- Tests sind keine Option, sondern Pflicht — jede neue Logik bekommt Tests
- Release-Tags sind verpflichtend bei jedem Deployment

---

## Projekt-Identität

**Name:** FinanzKompass  
**Motto:** *Dein gesamtes Finanzbild. Klar. Elegant. Intelligent.*  
**Version:** Immer aus `package.json` lesen, in App anzeigen, als Git-Tag setzen.  
**Ziel:** Premium-Finanz-App die Aktienportfolio-Management mit Haushaltsfinanzen vereint — zunächst als GitHub Pages PWA, später als App Store App.

---

## SECURITY ARCHITECTURE — PRIORITÄT 1

### Grundprinzip: Zero-Server-Trust für Finanzdaten

```
╔══════════════════════════════════════════════════════════╗
║  FINANZ-DATEN VERLASSEN NIEMALS DAS GERÄT DES NUTZERS  ║
║  Kein Backend. Kein Sync-Server. Kein Analytics.        ║
╚══════════════════════════════════════════════════════════╝
```

**Was das bedeutet:**
- Alle Transaktionen, Holdings, Haushaltsausgaben → nur IndexedDB (lokal)
- Kein User-Account erforderlich für Kernfunktionen
- Kein Telemetry, kein Error-Tracking mit Nutzer-Daten
- Externe API-Calls **nur** für anonyme Marktdaten (Kurse, kein Portfolio mitschicken)
- API-Keys werden in localStorage gespeichert, nie in der DB, nie in Logs

### Security-Checkliste (bei jeder Änderung prüfen)

- [ ] Werden Finanzdaten an einen externen Server gesendet? → **STOP, nicht erlaubt**
- [ ] Wird ein API-Key geloggt oder in der URL übergeben? → **STOP**
- [ ] Sind Input-Felder gegen XSS abgesichert? (React escaping reicht für JSX)
- [ ] Werden sensible Daten im Browser-Memory nach Nutzung bereinigt?
- [ ] Ist der Backup-Export verschlüsselt oder zumindest klar als sensitiv markiert?
- [ ] Ist das externe Skript/Package vertrauenswürdig + gepinnt?

### Content Security Policy (CSP)

Die App darf nur Verbindungen zu diesen Domains aufbauen:
```
default-src 'self';
script-src 'self';
style-src 'self' https://fonts.googleapis.com;
font-src https://fonts.gstatic.com;
connect-src 'self' https://www.alphavantage.co https://query2.finance.yahoo.com;
img-src 'self' data: https:;
```
→ Umgesetzt via `<meta http-equiv="Content-Security-Policy">` in index.html

### Lokale Datensicherheit

```
IndexedDB (Dexie.js)
├── Zugriff nur von derselben Origin (Browser-Sandbox)
├── Kein Zugriff durch andere Tabs/Domains
├── Daten bleiben bei Browser-Storage-Clear verloren → Backup-Hinweis prominent!
└── Zukunft (Phase 2): AES-256 Verschlüsselung der DB via Web Crypto API
```

### Backup-Sicherheit

- Export-Dateien enthalten alle Finanzdaten → Datei-Download mit Warnung
- Datei-Name enthält Datum, kein Username
- Zukunft: Passwort-verschlüsselter Export via Web Crypto API

### Dependency-Security

- `npm audit` läuft automatisch in CI
- Keine Packages mit bekannten High/Critical CVEs
- Externe Scripts (Google Fonts) sind einzige Ausnahme — zukünftig selbst hosten

### Phase 2 — Falls Backend nötig wird

```
Wenn Cloud-Sync kommt:
- End-to-End Verschlüsselung: Daten werden Client-seitig verschlüsselt bevor Upload
- Server sieht nur verschlüsselte Blobs, niemals Klartextdaten
- Zero-Knowledge Architecture (wie Bitwarden/Proton)
- DSGVO-konform: Recht auf Löschung, Daten-Export, Datenschutzerklärung
- Hosting in EU (Deutschland/Frankfurt preferred)
```

---

## Architektur-Übersicht

```
FinanzKompass
├── Phase 1: PWA auf GitHub Pages (aktiv)
│   ├── React 18 + TypeScript (strict)
│   ├── Vite 5 (Build + Base-URL /Finance/)
│   ├── TailwindCSS v4 (Styling)
│   ├── Zustand (State, kein sensitiver State in localStorage)
│   ├── Dexie.js / IndexedDB (100% lokale Datenhaltung)
│   ├── Recharts (Charts)
│   ├── Vitest + Testing Library (Unit + Integration Tests)
│   └── GitHub Actions → Test → Tag → Deploy
│
├── Phase 2: Backend + Broker-Sync (geplant)
│   ├── Hono (Edge-Runtime, minimal footprint)
│   ├── Zero-Knowledge Sync (E2E verschlüsselt)
│   ├── PostgreSQL (nur verschlüsselte Blobs)
│   └── OAuth für Broker (Trade Republic, Comdirect, ING)
│
├── Phase 3: Native App (geplant)
│   ├── React Native + Expo
│   ├── Expo SecureStore statt AsyncStorage für Secrets
│   └── Biometric-Auth (Face ID / Fingerprint)
│
└── Phase 4: KI-Agenten (geplant)
    ├── Portfolio-Analyse-Agent (Claude API)
    ├── News-Sentiment-Agent (nur öffentliche Daten)
    ├── Rebalancing-Empfehlungs-Agent
    └── Haushalts-Optimierungs-Agent
    WICHTIG: KI-Agenten erhalten anonymisierte/aggregierte Daten,
    niemals rohe Transaktionsdaten mit Timestamps
```

---

## Tech Stack (Phase 1 — aktiv)

| Bereich | Technologie | Begründung |
|---------|-------------|------------|
| Framework | React 18 + TypeScript strict | Typsicherheit, verhindert viele Klassen von Bugs |
| Build | Vite 5 | Schnell, Tree-Shaking, perfekt für statisches Deployment |
| Styling | TailwindCSS v4 | Utility-first, kein CSS-Injection-Risiko |
| State | Zustand | Minimal, sensitiver State NICHT in localStorage persistieren |
| Storage | Dexie.js (IndexedDB) | Lokale DB, Browser-Sandbox schützt vor Cross-Origin |
| Charts | Recharts | React-nativ, kein externer Daten-Leak |
| Icons | Lucide React | Tree-shakeable, inline — keine externen Requests |
| Router | React Router v7 | SPA-Routing, `basename` auf `/Finance/` gesetzt |
| Forms | React Hook Form | Client-seitige Validation, kein Server-Submit |
| Dates | date-fns | Lokal, kein Timezone-Leak an Server |
| Tests | Vitest + RTL | Schnell, Vite-nativ, Coverage-Reports |

---

## Versionierung & Release-Management (PFLICHT)

### Semantic Versioning: `MAJOR.MINOR.PATCH`

```
MAJOR → Breaking Changes (Datenbankschema-Änderung, API-Bruch)
MINOR → Neue Features (neue Seite, neue Berechnung)
PATCH → Bugfixes, kleine Verbesserungen, Security-Patches
```

### Release-Prozess (automatisiert via GitHub Actions)

```
1. Code auf main pushen
2. CI: npm test (alle Tests müssen grün sein)
3. CI: npm run build
4. CI: Git-Tag setzen (v{version} aus package.json)
5. CI: GitHub Release erstellen mit Changelog
6. CI: Deploy zu GitHub Pages
7. App zeigt Version aus import.meta.env.VITE_APP_VERSION
```

### Version in der App

- Sidebar Footer: `v0.1.0`
- Einstellungen-Seite: Vollständige Build-Info
- Vite injiziert `VITE_APP_VERSION` aus `package.json` zur Build-Zeit

### Commit-Konvention (löst automatisches Versioning aus)

```
feat:     → MINOR version bump
fix:      → PATCH version bump  
security: → PATCH version bump (SOFORT releasen!)
breaking: → MAJOR version bump
chore:    → kein bump
docs:     → kein bump
test:     → kein bump
design:   → kein bump
```

---

## Test-Strategie (PFLICHT — wird stetig erweitert)

### Test-Pyramide

```
        /\
       /E2E\        (Phase 2 — Playwright)
      /------\
     /Integr. \     (React Testing Library — Komponenten)
    /------------\
   / Unit Tests   \  (Vitest — Berechnungen, Formatters, Utils)
  /________________\
```

### Was IMMER getestet wird

1. **Alle Finanz-Berechnungen** (Portfolio-Wert, FIFO, Steuer, TTWROR)
2. **Alle Formatter-Funktionen** (Währung, Prozent, Datum)
3. **Datenbank-Operationen** (CRUD, Migration)
4. **Neue Features**: Jede neue Funktion bekommt mindestens einen Happy-Path + einen Edge-Case Test

### Test-Dateien Konvention

```
src/
├── lib/calculations/portfolio.ts
├── lib/calculations/portfolio.test.ts   ← immer daneben
├── lib/formatters/index.ts
├── lib/formatters/index.test.ts
└── features/portfolio/
    ├── PortfolioPage.tsx
    └── PortfolioPage.test.tsx           ← bei komplexen Komponenten
```

### Test-Kommandos

```bash
npm test              # Tests einmalig ausführen
npm run test:watch    # Watch-Modus (Entwicklung)
npm run test:coverage # Coverage-Report generieren
```

### Coverage-Ziele

| Bereich | Ziel |
|---------|------|
| lib/calculations/ | ≥ 95% |
| lib/formatters/ | ≥ 90% |
| lib/db/ | ≥ 80% |
| features/ (UI) | ≥ 60% |

---

## Markt-Analyse (Zusammenfassung)

### Konkurrenten analysiert:
- **Parqet** — Bester Deutscher Tracker, hat Abgeltungssteuer, aber kein Open Source / kein Offline
- **Sharesight** — Stark bei Dividenden/Tax, kein Deutsch
- **Portfolio Performance** — Open Source, Desktop-only, veraltet UX
- **Finanzguru** — Budget stark, Portfolio schwach
- **Robinhood/Yahoo Finance** — US-only fokus, kein German Tax
- **Morningstar** — Portfolio Manager April 2025 eingestellt → freie Nutzer suchen Alternative

### Unser Wettbewerbsvorteil:
1. **Security & Privacy First** — Daten verlassen das Gerät nie (Alleinstellungsmerkmal!)
2. **Abgeltungssteuer** als First-Class Feature
3. **Offline-first PWA** — keine anderen Top-Apps können das
4. **Haushalts + Portfolio kombiniert** — niemand macht das gut
5. **KI-Agenten** für Analyse (Roadmap)
6. **Elegant & Modern** — besser als Portfolio Performance's Desktop-UX

---

## Design-System

### Design-Philosophie
- **Dark Mode by default** (elegant, professionell — wie Bloomberg Terminal + Apple)
- Minimalist aber informationsdicht (kein verschwendeter Weißraum)
- Micro-Animationen für Feedback (nicht für Dekoration)
- Mobile-first aber Desktop optimiert

### Farb-Palette
```css
--color-bg-primary:    #0a0b0e;
--color-bg-secondary:  #13151a;
--color-bg-tertiary:   #1c1f28;
--color-border:        #2a2d3a;
--color-accent:        #3b82f6;
--color-accent-purple: #8b5cf6;
--color-accent-cyan:   #06b6d4;
--color-gain:          #22c55e;
--color-loss:          #ef4444;
--color-text-primary:  #f1f5f9;
--color-text-secondary: #94a3b8;
--color-muted:         #64748b;
```

---

## Feature-Roadmap

### Phase 1a — Core MVP ✅ Deployed
- [x] Projekt-Setup (Vite + React + TS + Tailwind)
- [x] GitHub Actions CI/CD → GitHub Pages
- [x] Design System / Tokens
- [x] Layout: Sidebar-Navigation (Desktop) + Bottom-Nav (Mobile)
- [x] Dashboard-Seite mit KPI-Cards + Charts
- [x] Portfolio-Übersicht (Holdings-Liste, sortierbar)
- [x] Position manuell erfassen (Kauf/Verkauf/Dividende)
- [x] Lokale Persistenz (Dexie.js / IndexedDB)
- [x] Haushalt-Modul (Ausgaben-Kategorien, Sparquote)
- [x] Einstellungen (API-Key, Abgeltungssteuer, Backup)
- [x] Security Architecture dokumentiert
- [x] Test-Setup (Vitest)
- [x] Release-Tagging (Git Tags + GitHub Releases)
- [x] Version sichtbar in App

### Phase 1b — Portfolio-Features
- [ ] Live-Kurse via Alpha Vantage (mit User API-Key)
- [ ] Dividenden-Tracking und -Kalender
- [ ] Abgeltungssteuer-Dashboard
- [ ] Performance vs Benchmark (DAX, S&P 500, MSCI World)
- [ ] CSV-Import (Trade Republic, Comdirect, ING)
- [ ] Sektoren-Analyse (Übergewichtungen)
- [ ] Kursalarme

### Phase 1c — Haushalts-Modul
- [ ] Echte CRUD für Ausgaben
- [ ] Monatliches Budget + Ist-Vergleich
- [ ] Netto-Vermögen Gesamtbild
- [ ] Wiederkehrende Ausgaben

### Phase 2 — Zero-Knowledge Backend
- [ ] E2E-verschlüsselter Cloud-Sync
- [ ] Broker-Integration (Trade Republic API)
- [ ] Biometric-Auth

### Phase 3 — KI-Agenten
- [ ] Portfolio-Analyse-Agent (Claude API)
- [ ] Anonymisierte Datenweitergabe an KI
- [ ] Rebalancing-Empfehlungen
- [ ] Haushalts-Optimierung

---

## Projekt-Struktur

```
src/
├── components/
│   ├── ui/              # Basis-Elemente
│   ├── charts/          # Chart-Komponenten
│   └── layout/          # Navigation, Sidebar
├── features/            # Feature-Module (Logik + UI kolociert)
│   ├── dashboard/
│   ├── portfolio/
│   ├── transactions/
│   ├── household/
│   └── settings/
├── lib/
│   ├── api/             # Nur anonyme Markt-API-Calls
│   ├── calculations/    # Finanz-Berechnungen + Tests
│   ├── db/              # Dexie.js Schema
│   ├── formatters/      # Formatter + Tests
│   └── security/        # Crypto-Utils (Phase 2)
├── stores/              # Zustand Stores
├── types/               # TypeScript Typen
└── test/                # Test-Setup, Mocks
```

---

## Finanz-Berechnungs-Logik

### Kernberechnungen

**Unrealisierter Gewinn/Verlust:**
```
unrealizedPnL = (currentPrice - averageCostBasis) × quantity
unrealizedPnLPercent = (currentPrice / averageCostBasis - 1) × 100
```

**Realisierter Gewinn (FIFO):**
- Käufe in Queue, bei Verkauf älteste Lots zuerst
- Realisierter Gewinn = Verkaufspreis − FIFO-Einstandspreis − anteilige Gebühren

**Abgeltungssteuer (Deutschland):**
```
taxableGain = max(0, realizedGain + dividendIncome - sparerpauschbetrag)
abgeltungsteuer = taxableGain × 0.25
solidaritaetszuschlag = abgeltungsteuer × 0.055
gesamtsteuer = abgeltungsteuer + solidaritaetszuschlag
```

**Durchschnittlicher Einstandspreis:**
```
averageCostBasis = totalInvestedCost / totalShares
```

---

## API-Strategie (Security-konform)

### Erlaubte externe Verbindungen:
- **Alpha Vantage** — anonyme Kursdaten (kein Portfolio, kein User-ID)
- **Google Fonts** — Schriftarten (kein JS, nur CSS+Font-Files)

### Nicht erlaubt:
- ❌ Portfolio-Daten an externe APIs
- ❌ Analytics (Google Analytics, Mixpanel, etc.)
- ❌ Error-Tracking mit User-Kontext (Sentry mit PII)
- ❌ Externe CDN-Scripts

### API-Keys:
- Nutzer bringt eigenen Alpha Vantage Key (25/Tag kostenlos)
- Key in `localStorage['finanzkompass-settings']` (Zustand persist)
- Key NIEMALS in URL-Parametern, Console-Logs, oder Error-Messages

---

## Architecture Decision Records

### ADR-001: Zero-Server für Finanzdaten
**Entscheidung:** Alle Finanzdaten bleiben lokal (IndexedDB)  
**Begründung:** Maximaler Datenschutz, kein DSGVO-Aufwand, kein Hack-Risiko auf Server  
**Trade-off:** Kein Multi-Gerät Sync in Phase 1  
**Mitigation:** Backup-Export/Import (JSON), CSV

### ADR-002: PWA statt Native App zuerst
**Entscheidung:** GitHub Pages PWA  
**Begründung:** Zero-Cost, kein App Store Review, sofort deploybar  
**Trade-off:** Kein Push-Notification auf iOS

### ADR-003: User-eigener API-Key (Alpha Vantage)
**Entscheidung:** Kein zentraler API-Key auf einem Server  
**Begründung:** Kein Backend = kein Key-Leak-Risiko, keine Kosten  
**Trade-off:** Setup-Hürde für neue Nutzer  
**Mitigation:** Demo-Modus mit Mock-Daten

### ADR-004: Semantic Versioning + Git-Tags (PFLICHT)
**Entscheidung:** Jedes Deployment bekommt einen Git-Tag und GitHub Release  
**Begründung:** Nachvollziehbarkeit, Rollback möglich, Version in App sichtbar  

### ADR-005: Zero-Knowledge für Phase 2
**Entscheidung:** Wenn Cloud-Sync kommt, nur E2E-verschlüsselt  
**Begründung:** Server soll niemals Klartextdaten sehen können  

---

## Status-Tracker

| Feature | Status | Version |
|---------|--------|---------|
| Projekt-Setup | ✅ Done | v0.1.0 |
| GitHub Actions CI/CD | ✅ Done | v0.1.0 |
| Design System | ✅ Done | v0.1.0 |
| Dashboard | ✅ Done | v0.1.0 |
| Portfolio-Holdings | ✅ Done | v0.1.0 |
| Transaktionen | ✅ Done | v0.1.0 |
| Haushalt-Modul | ✅ Done | v0.1.0 |
| Einstellungen | ✅ Done | v0.1.0 |
| Security Architecture | ✅ Done | v0.1.0 |
| Test-Setup (Vitest) | ✅ Done | v0.1.0 |
| Release-Tagging | ✅ Done | v0.1.0 |
| Version in App | ✅ Done | v0.1.0 |
| Live Kursdaten (Alpha Vantage) | 🟡 Next | v0.2.0 |
| Abgeltungssteuer-Dashboard | 🟡 Next | v0.2.0 |
| CSV-Import | 🟡 Next | v0.2.0 |
| KI-Agenten | ⬜ Geplant | v1.0.0 |
| Zero-Knowledge Sync | ⬜ Geplant | v1.0.0 |

---

*Senior Architekt: Claude — Security-First, Privacy-First, Test-First*  
*Letzte Aktualisierung: 2026-06-19 — v0.1.0*
