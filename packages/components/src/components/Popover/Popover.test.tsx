import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
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

  it('applies the xl width class', async () => {
    const user = userEvent.setup()
    render(<Harness width="xl" />)
    await user.click(screen.getByRole('button', { name: 'Options' }))
    expect(screen.getByRole('dialog').className).toContain('w-xl')
  })

  it('has no axe violations while open', async () => {
    const user = userEvent.setup()
    const { container } = render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Options' }))
    expect((await axe(container)).violations).toEqual([])
  })
})

describe('portal (haus#68)', () => {
  function Harness({ portal, width, align }: { portal?: boolean; width?: PopoverWidth; align?: PopoverAlign }) {
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    return (
      // A scrolling ancestor, which is what Modal's body is and what clips.
      <div data-testid="scroller" style={{ overflowY: 'auto', height: 100, position: 'relative' }}>
        <button ref={triggerRef}>Open</button>
        <Popover
          open
          onClose={() => {}}
          triggerRef={triggerRef}
          portal={portal}
          width={width}
          align={align}
          aria-label="Menu"
        >
          <div data-testid="content">Body</div>
        </Popover>
      </div>
    )
  }

  /**
   * jsdom measures nothing, so the trigger's rect is supplied and the panel is
   * made to read it again.
   *
   * The component measures once in an effect and then on scroll and resize, so
   * a spy installed after the first render is not seen by a re-render with the
   * same props: the effect does not run again. Dispatching `resize` is the
   * component's own recompute path and the honest way to do this.
   */
  const measureTrigger = (px: number) => {
    const trigger = screen.getByRole('button', { name: 'Open' })
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: px,
      bottom: 20,
      width: px,
      height: 20,
      toJSON: () => ({}),
    } as DOMRect)
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    return trigger
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

  /* A portalled panel is `position: fixed`, so every percentage in the
     stylesheet resolves against the viewport rather than against anything the
     caller owns. `width="trigger"` carries `min-inline-size: 100%`, so the
     minimum has to come from the measured rect instead. */
  it('takes its minimum width from the trigger, not a percentage', () => {
    const { getByRole } = render(<Harness portal width="trigger" />)
    measureTrigger(120)
    expect(getByRole('dialog')).toHaveStyle({ minInlineSize: '120px' })
  })

  it('takes it from the trigger with stretch as well', () => {
    /* The defect: `align="stretch"` used to set `inline-size` alone, so
       `w-trigger`'s `min-inline-size: 100%` survived on a fixed panel and
       resolved against the viewport. The panel came out at least as wide as
       the window from two props that each asked for the trigger's width. */
    const { getByRole } = render(<Harness portal width="trigger" align="stretch" />)
    measureTrigger(120)
    const panel = getByRole('dialog')
    expect(panel).toHaveStyle({ minInlineSize: '120px' })
    /* And the width mode keeps its growth rather than being pinned: `.panel`
       has no `overflow`, so a panel too narrow for its content would draw
       outside its own surface. */
    expect(panel.style.inlineSize).toBe('')
  })

  it('sets the width outright for stretch where the mode has no opinion', () => {
    /* `width="auto"` makes no width claim, so stretch is the only thing
       speaking and still sets one. Unchanged by the fix above. */
    const { getByRole } = render(<Harness portal align="stretch" />)
    measureTrigger(120)
    const panel = getByRole('dialog')
    expect(panel).toHaveStyle({ inlineSize: '120px' })
    expect(panel.style.minInlineSize).toBe('')
  })

  it('takes the modal layer when portalled, not the dropdown layer', () => {
    // haus#73. Portalling is reached for when something clips, and the thing
    // that clips is usually a Modal at z-modal. A portalled panel is a sibling
    // of that backdrop rather than a descendant, so the dropdown layer at 100
    // put it behind the dialog it was opened from: the first fix for the
    // clipping traded it for a stacking bug.
    const { getByRole } = render(<Harness portal />)
    const panel = getByRole('dialog')
    expect(panel.className).toMatch(/portalled/)
  })

  describe('aligns to the right edge when the trigger is right to left', () => {
    // Fixed panels are placed in viewport coordinates, and the first version put
    // `start` on the trigger's left edge whatever the direction. In a
    // right-to-left layout the trigger's start is its right edge.
    function RtlHarness({ align }: { align: 'start' | 'end' }) {
      const triggerRef = React.useRef<HTMLButtonElement>(null)
      return (
        <>
          <button ref={triggerRef} style={{ direction: 'rtl' }}>
            Open
          </button>
          <Popover open onClose={() => {}} triggerRef={triggerRef} portal align={align} aria-label="Menu">
            Body
          </Popover>
        </>
      )
    }
    const rect = { left: 100, right: 300, top: 40, bottom: 76, width: 200, height: 36, x: 100, y: 40 }
    beforeEach(() => {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        ...rect,
        toJSON: () => rect,
      } as DOMRect)
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1000)
    })
    afterEach(() => vi.restoreAllMocks())

    it('start lines up with the trigger right edge', () => {
      const { getByRole } = render(<RtlHarness align="start" />)
      const panel = getByRole('dialog')
      expect(panel.style.right).toBe('700px')
      expect(panel.style.left).toBe('')
    })

    it('end lines up with the trigger left edge', () => {
      const { getByRole } = render(<RtlHarness align="end" />)
      const panel = getByRole('dialog')
      expect(panel.style.left).toBe('100px')
      expect(panel.style.right).toBe('')
    })
  })

  it('keeps its role and label through the portal', () => {
    // A portalled panel is easy to render correctly and label wrongly.
    const { getByRole } = render(<Harness portal />)
    expect(getByRole('dialog', { name: 'Menu' })).toBeInTheDocument()
  })
})

describe('exit (4.5, plan 4.1)', () => {
  /** A panel whose style says it animates, which is what the CSS gives it in a
   *  browser. The test environment has no stylesheet, so it says so inline. */
  function Exiting({ open }: { open: boolean }) {
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    return (
      <div>
        <button ref={triggerRef}>Options</button>
        <Popover
          open={open}
          onClose={() => {}}
          triggerRef={triggerRef}
          aria-label="Options"
          style={{ animationName: 'out', animationDuration: '1s' }}
        >
          <button>Rename</button>
        </Popover>
      </div>
    )
  }

  it('stays mounted and inert until its exit animation ends', () => {
    const { rerender } = render(<Exiting open />)
    rerender(<Exiting open={false} />)
    const panel = screen.getByRole('dialog', { hidden: true })
    expect(panel).toHaveAttribute('data-state', 'closed')
    expect(panel).toHaveAttribute('inert')
    // jsdom has no AnimationEvent, so React listens for the prefixed name there;
    // a browser fires the unprefixed one. Both are sent.
    fireEvent.animationEnd(panel)
    fireEvent(panel, new Event('webkitAnimationEnd', { bubbles: true }))
    expect(screen.queryByRole('dialog', { hidden: true })).toBeNull()
  })

  it('unmounts at once when nothing animates', () => {
    function Plain({ open }: { open: boolean }) {
      const triggerRef = React.useRef<HTMLButtonElement>(null)
      return (
        <Popover open={open} onClose={() => {}} triggerRef={triggerRef} aria-label="Options">
          <button>Rename</button>
        </Popover>
      )
    }
    const { rerender } = render(<Plain open />)
    rerender(<Plain open={false} />)
    expect(screen.queryByRole('dialog', { hidden: true })).toBeNull()
  })
})
