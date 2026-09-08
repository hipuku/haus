import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Popover } from './Popover'
import type { PopoverAlign, PopoverPlacement, PopoverRole, PopoverWidth } from './Popover'

/** The wiring a caller does, in the shape the component documents. */
interface HarnessProps {
  role?: PopoverRole
  align?: PopoverAlign
  placement?: PopoverPlacement
  width?: PopoverWidth
}

function Harness({ role = 'dialog', ...props }: HarnessProps) {
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const [open, setOpen] = React.useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button ref={triggerRef} aria-expanded={open} onClick={() => setOpen(o => !o)}>
        Options
      </button>
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        role={role}
        aria-label="Options"
        {...props}
      >
        <button>Rename</button>
        <button>Delete</button>
      </Popover>
      <button>Outside</button>
    </div>
  )
}

describe('Popover', () => {
  it('renders nothing when closed', () => {
    render(<Harness />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens from its trigger', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Options' }))
    expect(screen.getByRole('dialog', { name: 'Options' })).toBeInTheDocument()
  })

  it('closes on Escape and puts focus back on the trigger', async () => {
    // The reason this component exists. vault's version leaves focus return to
    // the caller and none of its six call sites does it, so Escape drops focus
    // onto <body> and the next Tab starts from the top of the document.
    // WCAG 2.4.3, and invisible to axe because the markup is fine.
    const user = userEvent.setup()
    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'Options' })

    await user.click(trigger)
    await user.click(screen.getByRole('button', { name: 'Rename' }))
    expect(document.activeElement).toHaveTextContent('Rename')

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('does not steal focus back when it was dismissed by a click elsewhere', async () => {
    // A pointer dismissal has already moved the user somewhere deliberately.
    // Yanking focus to the trigger would undo that.
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Options' }))
    await user.click(screen.getByRole('button', { name: 'Outside' }))

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toHaveTextContent('Outside')
  })

  it('closes on a pointer press outside itself', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Options' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(document.body)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('stays open when the press is inside it', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Options' }))
    await user.click(screen.getByRole('button', { name: 'Rename' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not treat its own trigger as outside', async () => {
    // Without this the trigger's onClick toggles a panel the outside listener
    // has already closed, so one click opens and shuts it and the component
    // looks broken rather than wrong.
    const user = userEvent.setup()
    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'Options' })

    await user.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.click(trigger)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('closes rather than trapping when focus leaves', async () => {
    // Deliberately not Modal's focus trap. A modal is modal and the page behind
    // it is inert; a popover sits over live content, and trapping focus in a
    // small menu is worse than closing.
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Options' }))
    await user.click(screen.getByRole('button', { name: 'Rename' }))

    // Tab off the end of the panel's own controls. In a trap the third Tab
    // would come back round to Rename; here it leaves and the panel goes.
    await user.tab()
    expect(document.activeElement).toHaveTextContent('Delete')
    await user.tab()

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toHaveTextContent('Outside')
  })

  it('takes the role the panel actually is', async () => {
    const user = userEvent.setup()
    render(<Harness role="listbox" />)
    await user.click(screen.getByRole('button', { name: 'Options' }))
    expect(screen.getByRole('listbox', { name: 'Options' })).toBeInTheDocument()
  })

  it('applies alignment, placement and width classes', async () => {
    const user = userEvent.setup()
    render(<Harness align="end" placement="top" width="md" />)
    await user.click(screen.getByRole('button', { name: 'Options' }))
    const panel = screen.getByRole('dialog')
    expect(panel.className).toContain('end')
    expect(panel.className).toContain('top')
    expect(panel.className).toContain('w-md')
  })

  it('has no axe violations while open', async () => {
    const user = userEvent.setup()
    const { container } = render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Options' }))
    expect((await axe(container)).violations).toEqual([])
  })
})

describe('portal (haus#68)', () => {
  function Harness({ portal }: { portal?: boolean }) {
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    return (
      // A scrolling ancestor, which is what Modal's body is and what clips.
      <div data-testid="scroller" style={{ overflowY: 'auto', height: 100, position: 'relative' }}>
        <button ref={triggerRef}>Open</button>
        <Popover open onClose={() => {}} triggerRef={triggerRef} portal={portal} aria-label="Menu">
          <div data-testid="content">Body</div>
        </Popover>
      </div>
    )
  }

  it('stays inside the scrolling ancestor by default', () => {
    // Today's behaviour, unchanged: the panel is a descendant of the wrapper,
    // which is what makes `placement` the caller's answer to collisions.
    const { getByTestId } = render(<Harness />)
    expect(getByTestId('scroller')).toContainElement(getByTestId('content'))
  })

  it('escapes the scrolling ancestor when portalled', () => {
    // The defect: Modal's body is overflow-y auto, so an absolute panel is cut
    // off at its edge and no `placement` can help, because flipping clips at
    // the other edge instead.
    const { getByTestId } = render(<Harness portal />)
    expect(getByTestId('scroller')).not.toContainElement(getByTestId('content'))
    expect(document.body).toContainElement(getByTestId('content'))
  })

  it('positions from the trigger rect rather than the ancestor', () => {
    const { getByRole } = render(<Harness portal />)
    const panel = getByRole('dialog')
    expect(panel).toHaveStyle({ position: 'fixed' })
  })

  it('keeps its role and label through the portal', () => {
    // A portalled panel is easy to render correctly and label wrongly.
    const { getByRole } = render(<Harness portal />)
    expect(getByRole('dialog', { name: 'Menu' })).toBeInTheDocument()
  })
})
