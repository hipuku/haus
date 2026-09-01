import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Modal } from './Modal'

describe('Modal', () => {
  it('can put focus on the action rather than the container', async () => {
    // The default is safe and says nothing: focus lands on the dialog and the
    // user tabs from the top. A confirm dialog with one obvious action should be
    // able to start there.
    function Harness() {
      const confirm = React.useRef<HTMLButtonElement>(null)
      return (
        <Modal open onClose={() => {}} title="Delete" initialFocus={confirm}>
          <button type="button">Cancel</button>
          <button type="button" ref={confirm}>Delete</button>
        </Modal>
      )
    }
    render(<Harness />)
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus()
  })

  it('falls back to the dialog when the initialFocus target never attached', () => {
    // A ref pointing at nothing would otherwise focus nothing at all, which is
    // worse than focusing the container: the keyboard user starts at <body>.
    function Harness() {
      const missing = React.useRef<HTMLButtonElement>(null)
      return (
        <Modal open onClose={() => {}} title="Delete" initialFocus={missing}>
          <button type="button">Cancel</button>
        </Modal>
      )
    }
    render(<Harness />)
    expect(screen.getByRole('dialog')).toHaveFocus()
  })

  it('can refuse to close on a backdrop click', async () => {
    // A destructive confirm, or anything holding unsaved input, should not be
    // dismissed by a misplaced click. There was no way to say so.
    const onClose = vi.fn()
    const { container } = render(
      <Modal open onClose={onClose} title="Delete" dismissOnBackdrop={false}>Body</Modal>,
    )
    const backdrop = container.ownerDocument.querySelector('[class*="backdrop"]')!
    await userEvent.click(backdrop as HTMLElement)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('focuses the dialog on open and gives focus back on close', async () => {
    // Eight tests covered the trap and none covered the release. A dialog that
    // traps focus and then drops it on <body> leaves a keyboard user at the top
    // of the document with no idea where they were.
    const { rerender } = render(
      <>
        <button type="button">open</button>
        <Modal open={false} onClose={() => {}} title="Confirm">Body</Modal>
      </>,
    )
    const opener = screen.getByRole('button', { name: 'open' })
    opener.focus()

    rerender(
      <>
        <button type="button">open</button>
        <Modal open onClose={() => {}} title="Confirm">Body</Modal>
      </>,
    )
    expect(screen.getByRole('dialog')).toHaveFocus()

    rerender(
      <>
        <button type="button">open</button>
        <Modal open={false} onClose={() => {}} title="Confirm">Body</Modal>
      </>,
    )
    expect(opener).toHaveFocus()
  })

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

  it('names itself from the visible heading rather than repeating it', () => {
    // aria-label would duplicate the h2 the sighted reader already has, and a
    // screen reader would meet the same words twice.
    render(<Modal open onClose={vi.fn()} title="Settings">Body</Modal>)
    const dialog = screen.getByRole('dialog', { name: 'Settings' })
    expect(dialog).not.toHaveAttribute('aria-label')
    expect(dialog.getAttribute('aria-labelledby')).toBe(
      screen.getByRole('heading', { name: 'Settings' }).id,
    )
  })

  it('takes an aria-label when there is no visible heading', () => {
    render(<Modal open onClose={vi.fn()} aria-label="Image viewer">Body</Modal>)
    expect(screen.getByRole('dialog', { name: 'Image viewer' })).toBeInTheDocument()
  })

  it('keeps Tab inside the dialog', async () => {
    // aria-modal="true" says the rest of the page is inert. Nothing enforces
    // that on its own, and axe cannot see the difference, so the claim is only
    // true if Tab wraps. Three stops here: close, Cancel, Confirm.
    const user = userEvent.setup()
    render(
      <Modal open onClose={vi.fn()} title="Confirm"
        footer={<><button>Cancel</button><button>Confirm</button></>}
      >
        Body
      </Modal>,
    )
    const close = screen.getByRole('button', { name: 'Close modal' })
    const confirm = screen.getByRole('button', { name: 'Confirm' })

    await user.tab()
    expect(close).toHaveFocus()
    await user.tab()
    await user.tab()
    expect(confirm).toHaveFocus()
    await user.tab()
    expect(close).toHaveFocus()
  })

  it('wraps backwards on Shift+Tab', async () => {
    const user = userEvent.setup()
    render(
      <Modal open onClose={vi.fn()} title="Confirm"
        footer={<><button>Cancel</button><button>Confirm</button></>}
      >
        Body
      </Modal>,
    )
    await user.tab({ shift: true })
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus()
  })

  it('pulls focus back when it lands outside the dialog', () => {
    // Tab is not the only way out: a click, a script, or a browser control can
    // move focus. The focusin listener is what makes the trap a trap.
    render(
      <>
        <button>Behind the modal</button>
        <Modal open onClose={vi.fn()} title="Settings">Body</Modal>
      </>,
    )
    screen.getByRole('button', { name: 'Behind the modal' }).focus()
    expect(screen.getByRole('dialog')).toHaveFocus()
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
