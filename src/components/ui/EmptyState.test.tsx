import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState icon={<span>i</span>} title="Leer" description="Nichts hier" />)
    expect(screen.getByText('Leer')).toBeInTheDocument()
    expect(screen.getByText('Nichts hier')).toBeInTheDocument()
  })

  it('fires the action when the button is clicked', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(
      <EmptyState
        icon={<span>i</span>}
        title="Leer"
        description="Nichts hier"
        actionLabel="Los geht's"
        onAction={onAction}
      />
    )
    await user.click(screen.getByRole('button', { name: "Los geht's" }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('hides the button when no action is given', () => {
    render(<EmptyState icon={<span>i</span>} title="Leer" description="Nichts hier" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
