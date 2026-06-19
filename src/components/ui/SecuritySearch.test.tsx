import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SecuritySearch } from './SecuritySearch'

describe('SecuritySearch', () => {
  it('shows matching results when typing a name', async () => {
    const user = userEvent.setup()
    render(<SecuritySearch onSelect={() => {}} />)

    await user.type(screen.getByPlaceholderText(/suchen/i), 'mercedes')
    expect(await screen.findByText('Mercedes-Benz Group AG')).toBeInTheDocument()
  })

  it('matches by ticker symbol', async () => {
    const user = userEvent.setup()
    render(<SecuritySearch onSelect={() => {}} />)

    await user.type(screen.getByPlaceholderText(/suchen/i), 'AAPL')
    expect(await screen.findByText('Apple Inc.')).toBeInTheDocument()
  })

  it('calls onSelect with the chosen security', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SecuritySearch onSelect={onSelect} />)

    await user.type(screen.getByPlaceholderText(/suchen/i), 'apple')
    await user.click(await screen.findByText('Apple Inc.'))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect.mock.calls[0][0]).toMatchObject({ symbol: 'AAPL', currency: 'USD' })
  })

  it('offers a manual entry option for unknown symbols', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SecuritySearch onSelect={onSelect} />)

    await user.type(screen.getByPlaceholderText(/suchen/i), 'zzzz')
    const manual = await screen.findByText(/manuell verwenden/i)
    await user.click(manual)

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect.mock.calls[0][0]).toMatchObject({ symbol: 'ZZZZ' })
  })
})
