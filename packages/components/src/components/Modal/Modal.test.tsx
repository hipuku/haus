import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Modal } from './Modal'

describe('Modal', () => {
  it('renders nothing while closed', () => {
    render(<Modal open={false} onClose={vi.fn()} title="Settings">Body</Modal>)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders a labelled modal dialog when open', () => {
    render(<Modal open onClose={vi.fn()} title="Settings">Body</Modal>)
    const dialog = screen.getByRole('dialog', { name: 'Settings' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('closes on Escape', async () => {
    // The keydown listener is on document, so this also covers the case where
    // focus has moved outside the dialog.
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} title="Settings">Body</Modal>)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not listen for Escape once closed', async () => {
    // A listener left attached after unmount closes the next modal too.
    const onClose = vi.fn()
    const { rerender } = render(<Modal open onClose={onClose} title="Settings">Body</Modal>)
    rerender(<Modal open={false} onClose={onClose} title="Settings">Body</Modal>)
    await userEvent.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes when the backdrop itself is clicked', async () => {
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} title="Settings">Body</Modal>)
    const backdrop = screen.getByRole('dialog').parentElement!
    await userEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('stays open when a click lands inside the dialog', async () => {
    // The handler compares target to currentTarget; without that check, any
    // click inside the panel closes the modal.
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} title="Settings">Body content</Modal>)
    await userEvent.click(screen.getByText('Body content'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('moves focus to the dialog on open', () => {
    render(<Modal open onClose={vi.fn()} title="Settings">Body</Modal>)
    expect(screen.getByRole('dialog')).toHaveFocus()
  })

  it('locks body scroll while open and restores it on close', () => {
    const { rerender } = render(<Modal open onClose={vi.fn()} title="Settings">Body</Modal>)
    expect(document.body.style.overflow).toBe('hidden')
    rerender(<Modal open={false} onClose={vi.fn()} title="Settings">Body</Modal>)
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('renders a footer when given one', () => {
    render(
      <Modal open onClose={vi.fn()} title="Confirm" footer={<button>Confirm</button>}>
        Body
      </Modal>,
    )
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
  })

  it('applies the size class', () => {
    render(<Modal open onClose={vi.fn()} title="Wide" size="lg">Body</Modal>)
    expect(screen.getByRole('dialog').className).toContain('lg')
  })

  it('has no axe violations', async () => {
    const { baseElement } = render(
      <Modal open onClose={vi.fn()} title="Settings" footer={<button>Save</button>}>
        Body
      </Modal>,
    )
    // The modal portals out of the container, so assert on baseElement.
    expect((await axe(baseElement)).violations).toEqual([])
  })
})
