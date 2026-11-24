import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Modal } from './Modal'
import { Popover } from '../Popover'

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
          <button type="button" ref={confirm}>
            Delete
          </button>
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
      <Modal open onClose={onClose} title="Delete" dismissOnBackdrop={false}>
        Body
      </Modal>,
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
        <Modal open={false} onClose={() => {}} title="Confirm">
          Body
        </Modal>
      </>,
    )
    const opener = screen.getByRole('button', { name: 'open' })
    opener.focus()

    rerender(
      <>
        <button type="button">open</button>
        <Modal open onClose={() => {}} title="Confirm">
          Body
        </Modal>
      </>,
    )
    expect(screen.getByRole('dialog')).toHaveFocus()

    rerender(
      <>
        <button type="button">open</button>
        <Modal open={false} onClose={() => {}} title="Confirm">
          Body
        </Modal>
      </>,
    )
    expect(opener).toHaveFocus()
  })

  it('renders nothing while closed', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Settings">
        Body
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders a labelled modal dialog when open', () => {
    render(
      <Modal open onClose={vi.fn()} title="Settings">
        Body
      </Modal>,
    )
    const dialog = screen.getByRole('dialog', { name: 'Settings' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('closes on Escape', async () => {
    // The keydown listener is on document, so this also covers the case where
    // focus has moved outside the dialog.
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} title="Settings">
        Body
      </Modal>,
    )
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not listen for Escape once closed', async () => {
    // A listener left attached after unmount closes the next modal too.
    const onClose = vi.fn()
    const { rerender } = render(
      <Modal open onClose={onClose} title="Settings">
        Body
      </Modal>,
    )
    rerender(
      <Modal open={false} onClose={onClose} title="Settings">
        Body
      </Modal>,
    )
    await userEvent.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes when the backdrop itself is clicked', async () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} title="Settings">
        Body
      </Modal>,
    )
    const backdrop = screen.getByRole('dialog').parentElement!
    await userEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('stays open when a click lands inside the dialog', async () => {
    // The handler compares target to currentTarget; without that check, any
    // click inside the panel closes the modal.
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} title="Settings">
        Body content
      </Modal>,
    )
    await userEvent.click(screen.getByText('Body content'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('names itself from the visible heading rather than repeating it', () => {
    // aria-label would duplicate the h2 the sighted reader already has, and a
    // screen reader would meet the same words twice.
    render(
      <Modal open onClose={vi.fn()} title="Settings">
        Body
      </Modal>,
    )
    const dialog = screen.getByRole('dialog', { name: 'Settings' })
    expect(dialog).not.toHaveAttribute('aria-label')
    expect(dialog.getAttribute('aria-labelledby')).toBe(screen.getByRole('heading', { name: 'Settings' }).id)
  })

  it('takes an aria-label when there is no visible heading', () => {
    render(
      <Modal open onClose={vi.fn()} aria-label="Image viewer">
        Body
      </Modal>,
    )
    expect(screen.getByRole('dialog', { name: 'Image viewer' })).toBeInTheDocument()
  })

  it('keeps Tab inside the dialog', async () => {
    // aria-modal="true" says the rest of the page is inert. Nothing enforces
    // that on its own, and axe cannot see the difference, so the claim is only
    // true if Tab wraps. Three stops here: close, Cancel, Confirm.
    const user = userEvent.setup()
    render(
      <Modal
        open
        onClose={vi.fn()}
        title="Confirm"
        footer={
          <>
            <button>Cancel</button>
            <button>Confirm</button>
          </>
        }
      >
        Body
      </Modal>,
    )
    const close = screen.getByRole('button', { name: 'Close' })
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
      <Modal
        open
        onClose={vi.fn()}
        title="Confirm"
        footer={
          <>
            <button>Cancel</button>
            <button>Confirm</button>
          </>
        }
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
        <Modal open onClose={vi.fn()} title="Settings">
          Body
        </Modal>
      </>,
    )
    screen.getByRole('button', { name: 'Behind the modal' }).focus()
    expect(screen.getByRole('dialog')).toHaveFocus()
  })

  it('moves focus to the dialog on open', () => {
    render(
      <Modal open onClose={vi.fn()} title="Settings">
        Body
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toHaveFocus()
  })

  it('locks body scroll while open and restores it on close', () => {
    const { rerender } = render(
      <Modal open onClose={vi.fn()} title="Settings">
        Body
      </Modal>,
    )
    expect(document.body.style.overflow).toBe('hidden')
    rerender(
      <Modal open={false} onClose={vi.fn()} title="Settings">
        Body
      </Modal>,
    )
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
    render(
      <Modal open onClose={vi.fn()} title="Wide" size="lg">
        Body
      </Modal>,
    )
    expect(screen.getByRole('dialog').className).toContain('lg')
  })

  it('applies the xl size class', () => {
    render(
      <Modal open onClose={vi.fn()} title="Wider" size="xl">
        Body
      </Modal>,
    )
    expect(screen.getByRole('dialog').className).toContain('xl')
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

describe('the backdrop dismiss guard (haus#56)', () => {
  /**
   * `fireEvent.click` synthesises neither the pointerdown nor the ordering, so
   * these dispatch the halves separately. That is also why the original defect
   * survived a suite that already covered backdrop dismissal.
   *
   * **The release is dispatched too, and it did not used to be.** A press is
   * three events, and a helper that sent two of them could not express "pressed
   * the backdrop, released inside the dialog" at all. That is the shape the
   * guard was missing, so the test that would have caught it was unwritable
   * with this helper. The click's target is the nearest common ancestor of the
   * two endpoints, which is what a browser dispatches and the whole reason
   * neither endpoint can be read off the click.
   */
  const commonAncestor = (a: Element, b: Element): Element => {
    let node: Element | null = a
    while (node && !node.contains(b)) node = node.parentElement
    return node ?? a
  }
  const press = (down: Element, up: Element) => {
    fireEvent.pointerDown(down)
    fireEvent.pointerUp(up)
    fireEvent.click(commonAncestor(down, up))
  }

  it('closes when the press starts and ends on the backdrop', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal open onClose={onClose} title="Confirm">
        Body
      </Modal>,
    )
    const backdrop = container.ownerDocument.querySelector('[class*="backdrop"]')!
    press(backdrop, backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when the press starts inside the dialog and ends on the backdrop', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal open onClose={onClose} title="Confirm">
        Body
      </Modal>,
    )
    const backdrop = container.ownerDocument.querySelector('[class*="backdrop"]')!
    const dialog = screen.getByRole('dialog')
    // Selecting text to the edge of the dialog and releasing outside. The click
    // target is the backdrop, which is exactly what the old guard accepted.
    press(dialog, backdrop)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not close when the press starts on the backdrop and ends inside the dialog', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal open onClose={onClose} title="Confirm">
        Body
      </Modal>,
    )
    const backdrop = container.ownerDocument.querySelector('[class*="backdrop"]')!
    const dialog = screen.getByRole('dialog')
    /* The mirror of haus#56, and open until 2026-11-25. Press the backdrop and
       release just inside the dialog: the click's target is the backdrop,
       because that is the common ancestor, so the click agreed with the latch
       and the dialog closed on a release that happened inside it. Reading the
       release itself is the only thing that separates this from a genuine
       backdrop dismiss. */
    press(backdrop, dialog)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not leave a stale release behind for the next press', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal open onClose={onClose} title="Confirm">
        Body
      </Modal>,
    )
    const backdrop = container.ownerDocument.querySelector('[class*="backdrop"]')!
    const dialog = screen.getByRole('dialog')
    /* A release on the backdrop that belongs to a press which started inside
       the dialog, so it closes nothing; then a press that starts on the
       backdrop and never completes. If the first release were still recorded,
       the second press would inherit it. */
    press(dialog, backdrop)
    fireEvent.pointerDown(backdrop)
    fireEvent.click(backdrop)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not close when a touch slides into the dialog before lifting', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal open onClose={onClose} title="Confirm">
        Body
      </Modal>,
    )
    const backdrop = container.ownerDocument.querySelector('[class*="backdrop"]')!
    const dialog = screen.getByRole('dialog')
    /* Touch gets implicit pointer capture on whatever took the press, so a
       finger that presses the backdrop, slides into the dialog and lifts
       reports the backdrop as the release target too. Reading `target` cannot
       see this one at all, which is why the release is read as a point.

       jsdom has no layout, so the rect is stubbed: the component falls back to
       the target when it sees a zero-area rect, and that fallback is what the
       other tests in this block exercise. */
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({
      x: 100,
      y: 100,
      left: 100,
      top: 100,
      right: 300,
      bottom: 300,
      width: 200,
      height: 200,
      toJSON: () => ({}),
    } as DOMRect)

    fireEvent.pointerDown(backdrop, { clientX: 10, clientY: 10 })
    // Target says backdrop, because of the capture. The point says dialog.
    fireEvent.pointerUp(backdrop, { clientX: 200, clientY: 200 })
    fireEvent.click(backdrop, { clientX: 200, clientY: 200 })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('still closes when the release point is outside the dialog', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal open onClose={onClose} title="Confirm">
        Body
      </Modal>,
    )
    const backdrop = container.ownerDocument.querySelector('[class*="backdrop"]')!
    const dialog = screen.getByRole('dialog')
    /* The other side of the test above, so the point check cannot pass by
       refusing everything. */
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({
      x: 100,
      y: 100,
      left: 100,
      top: 100,
      right: 300,
      bottom: 300,
      width: 200,
      height: 200,
      toJSON: () => ({}),
    } as DOMRect)

    fireEvent.pointerDown(backdrop, { clientX: 10, clientY: 10 })
    fireEvent.pointerUp(backdrop, { clientX: 10, clientY: 10 })
    fireEvent.click(backdrop, { clientX: 10, clientY: 10 })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not leave a stale latch behind for the next click', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal open onClose={onClose} title="Confirm">
        Body
      </Modal>,
    )
    const backdrop = container.ownerDocument.querySelector('[class*="backdrop"]')!
    const dialog = screen.getByRole('dialog')
    // A qualifying press, consumed.
    press(backdrop, backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
    // Then one that must not qualify. Without the reset the first press's true
    // would still be sitting there.
    press(dialog, backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('stays shut off when dismissOnBackdrop is false', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal open onClose={onClose} title="Confirm" dismissOnBackdrop={false}>
        Body
      </Modal>,
    )
    const backdrop = container.ownerDocument.querySelector('[class*="backdrop"]')!
    press(backdrop, backdrop)
    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('Modal exit (4.5, plan 4.1)', () => {
  it('stays mounted and inert until the backdrop finishes leaving', () => {
    // The backdrop's animation ends last in every mode, so it is the one the
    // component waits for. The test environment has no stylesheet, so the
    // computed style is the one a browser would report.
    const spy = vi
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ animationName: 'out', animationDuration: '0.2s' } as CSSStyleDeclaration)
    const { rerender } = render(
      <Modal open onClose={() => {}} title="Delete">
        Body
      </Modal>,
    )
    rerender(
      <Modal open={false} onClose={() => {}} title="Delete">
        Body
      </Modal>,
    )
    const backdrop = document.querySelector('[data-state="closed"]') as HTMLElement
    expect(backdrop).not.toBeNull()
    expect(backdrop).toHaveAttribute('inert')
    spy.mockRestore()
    // jsdom has no AnimationEvent, so React listens for the prefixed name there;
    // a browser fires the unprefixed one. Both are sent.
    fireEvent.animationEnd(backdrop)
    fireEvent(backdrop, new Event('webkitAnimationEnd', { bubbles: true }))
    expect(document.querySelector('[data-state]')).toBeNull()
  })
})

describe('portalled content inside the dialog', () => {
  /**
   * A portalled Popover in a Modal could not be typed into at all.
   *
   * Modal keeps `aria-modal="true"` honest with a `focusin` listener that pulls
   * focus back whenever it lands outside the dialog. A Popover with `portal`
   * rendered into `document.body`, which is outside, so every control in the
   * panel lost focus the instant it was given. The panel was visible, correctly
   * placed, and unusable.
   *
   * The dialog is now the portal host for its descendants, so the panel is
   * inside the subtree the trap measures. That is also what puts it in Tab's
   * order and under the dialog's `inert`, none of which needed a special case.
   */
  it('lets a portalled input hold focus', async () => {
    const user = userEvent.setup()
    function Harness() {
      const trigger = React.useRef<HTMLButtonElement>(null)
      const [open, setOpen] = React.useState(false)
      return (
        <Modal open onClose={() => {}} title="Edit">
          <button type="button" ref={trigger} onClick={() => setOpen(true)}>
            Pick
          </button>
          <Popover open={open} onClose={() => setOpen(false)} triggerRef={trigger} portal aria-label="Colour">
            <input aria-label="Hex" />
          </Popover>
        </Modal>
      )
    }
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Pick' }))
    const field = screen.getByLabelText('Hex')
    field.focus()
    expect(field).toHaveFocus()
    await user.type(field, 'abc')
    expect(field).toHaveValue('abc')
  })

  it('puts the portalled panel inside the dialog rather than the body', async () => {
    const user = userEvent.setup()
    function Harness() {
      const trigger = React.useRef<HTMLButtonElement>(null)
      const [open, setOpen] = React.useState(false)
      return (
        <Modal open onClose={() => {}} title="Edit">
          <button type="button" ref={trigger} onClick={() => setOpen(true)}>
            Pick
          </button>
          <Popover open={open} onClose={() => setOpen(false)} triggerRef={trigger} portal aria-label="Colour">
            <input aria-label="Hex" />
          </Popover>
        </Modal>
      )
    }
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Pick' }))
    /* The mechanism behind the test above. Asserted separately because the
       focus assertion would also pass if the trap were loosened instead, and
       loosening it is the wrong fix: it would leave the panel out of Tab's
       order and outside the dialog's `inert`. */
    /* By name, because Popover's default role is `dialog` too, so there are two
       on the page the moment the panel opens. */
    expect(screen.getByRole('dialog', { name: 'Edit' }).contains(screen.getByLabelText('Hex'))).toBe(true)
  })

  it('still portals to the body with no dialog above it', async () => {
    const user = userEvent.setup()
    function Harness() {
      const trigger = React.useRef<HTMLButtonElement>(null)
      const [open, setOpen] = React.useState(false)
      return (
        <div>
          <button type="button" ref={trigger} onClick={() => setOpen(true)}>
            Pick
          </button>
          <Popover open={open} onClose={() => setOpen(false)} triggerRef={trigger} portal aria-label="Colour">
            <input aria-label="Hex" />
          </Popover>
        </div>
      )
    }
    const { container } = render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Pick' }))
    const field = screen.getByLabelText('Hex')
    /* The host is a nearest-ancestor lookup, not a change of default: with
       nothing above it the panel escapes to the body exactly as before. */
    expect(container.contains(field)).toBe(false)
    expect(document.body.contains(field)).toBe(true)
  })
})

describe('portalled content in the footer', () => {
  /**
   * A footer is where a confirm dialog's actions live, so a popover opened from
   * one is ordinary. The provider wrapped `children` alone at first, which left
   * a footer popover going to `document.body` with every defect the change was
   * made to fix.
   */
  it('lets a portalled input in the footer hold focus', async () => {
    const user = userEvent.setup()
    function Harness() {
      const trigger = React.useRef<HTMLButtonElement>(null)
      const [open, setOpen] = React.useState(false)
      return (
        <Modal
          open
          onClose={() => {}}
          title="Edit"
          footer={
            <>
              <button type="button" ref={trigger} onClick={() => setOpen(true)}>
                Pick
              </button>
              <Popover open={open} onClose={() => setOpen(false)} triggerRef={trigger} portal aria-label="Colour">
                <input aria-label="Hex" />
              </Popover>
            </>
          }
        >
          Body
        </Modal>
      )
    }
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Pick' }))
    const field = screen.getByLabelText('Hex')
    field.focus()
    expect(field).toHaveFocus()
    expect(screen.getByRole('dialog', { name: 'Edit' }).contains(field)).toBe(true)
  })
})
