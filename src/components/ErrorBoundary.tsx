import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0a0b0e',
          color: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'monospace',
        }}>
          <div style={{ maxWidth: '600px', width: '100%' }}>
            <h1 style={{ color: '#ef4444', fontSize: '1.25rem', marginBottom: '1rem' }}>
              FinanzKompass — Fehler beim Laden
            </h1>
            <pre style={{
              background: '#13151a',
              border: '1px solid #2a2d3a',
              borderRadius: '0.5rem',
              padding: '1rem',
              fontSize: '0.75rem',
              overflow: 'auto',
              color: '#94a3b8',
              whiteSpace: 'pre-wrap',
            }}>
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
            >
              Seite neu laden
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
