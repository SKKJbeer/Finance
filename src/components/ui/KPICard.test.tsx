import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KPICard } from './KPICard'

describe('KPICard', () => {
  it('renders label and value', () => {
    render(<KPICard label="Portfolio-Wert" value="1.234,56 €" />)
    expect(screen.getByText('Portfolio-Wert')).toBeInTheDocument()
    expect(screen.getByText('1.234,56 €')).toBeInTheDocument()
  })

  it('renders a positive delta with plus sign', () => {
    render(<KPICard label="Gewinn" value="100 €" delta={5.25} />)
    expect(screen.getByText('+5.25%')).toBeInTheDocument()
  })

  it('renders a negative delta', () => {
    render(<KPICard label="Verlust" value="100 €" delta={-3.1} />)
    expect(screen.getByText('-3.10%')).toBeInTheDocument()
  })

  it('omits the delta row when no delta is given', () => {
    render(<KPICard label="Investiert" value="500 €" />)
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
  })
})
