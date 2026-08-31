import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Toast } from './Toast'

describe('Toast', () => {
  it('announces itself politely as a status region', () => {
    // A toast appears without the user asking. role="status" with a polite
    // live region is what makes it reach a screen reader without interrupting.
    render(<Toast title="Saved" />)
    const toast = screen.getByRole('status')
    expect(toast).toHaveAttribute('aria-live', 'polite')
    expect(toast).toHaveTextContent('Saved')
  })

  it('renders an optional description', () => {
    render(<Toast title="Saved" description="Your changes are live." />)
    expect(screen.getByText('Your changes are live.')).toBeInTheDocument()
  })

  it('shows a dismiss button only when onClose is given', () => {
    const { rerender } = render(<Toast title="Saved" />)
    expect(screen.queryByRole('button', { name: 'Dismiss notification' })).not.toBeInTheDocument()

    rerender(<Toast title="Saved" onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Dismiss notification' })).toBeInTheDocument()
  })

  it('calls onClose when dismissed', async () => {
    const onClose = vi.fn()
    render(<Toast title="Saved" onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('gives the dismiss button a label, since it only contains an icon', () => {
    // Without aria-label the control announces as "button" with no purpose.
    render(<Toast title="Saved" onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Dismiss notification' })).toBeInTheDocument()
  })

  it('renders an action alongside the title', () => {
    render(<Toast title="Deleted" action={<button>Undo</button>} />)
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
  })

  it('draws its severity icon rather than naming an icon font', () => {
    // The package declares haus-tokens and the React peers and nothing else.
    // An icon-font class name here means a consumer without that font loaded
    // gets an empty element where the severity indicator belongs, and no error
    // to say why. This asserts the icon is in the DOM and is not a class.
    const { container } = render(<Toast title="Failed" variant="error" />)
    const icon = container.querySelector('svg[aria-hidden="true"]')
    expect(icon).toBeInTheDocument()
    expect(container.querySelector('i')).not.toBeInTheDocument()
    expect(container.innerHTML).not.toContain('fa-')
  })

  it('applies the variant class', () => {
    render(<Toast title="Failed" variant="error" />)
    expect(screen.getByRole('status').className).toContain('error')
  })

  it('has no axe violations across variants', async () => {
    const { container } = render(
      <>
        <Toast title="Neutral" />
        <Toast title="Success" variant="success" description="All good" />
        <Toast title="Error" variant="error" onClose={vi.fn()} />
        <Toast title="With action" action={<button>Undo</button>} />
      </>,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})
