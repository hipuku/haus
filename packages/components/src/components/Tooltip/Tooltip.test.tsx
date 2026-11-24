import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
  it('is not shown until something asks for it', () => {
    render(
      <Tooltip content="Copy to clipboard">
        <button>Copy</button>
      </Tooltip>,
    )
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('appears on hover', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Copy to clipboard">
        <button>Copy</button>
      </Tooltip>,
    )
    await user.hover(screen.getByRole('button'))
    expect(screen.getByRole('tooltip')).toHaveTextContent('Copy to clipboard')
  })

  it('appears on focus, which is the half most hand-rolled ones miss', async () => {
    // A tooltip that only answers the mouse is not a tooltip, it is a hover
    // effect, and every keyboard user gets a control with no description.
    const user = userEvent.setup()
    render(
      <Tooltip content="Copy to clipboard">
        <button>Copy</button>
      </Tooltip>,
    )
    await user.tab()
    expect(screen.getByRole('button')).toHaveFocus()
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('describes the trigger rather than naming it', async () => {
    // aria-describedby, not labelledby: the button already says "Copy", and a
    // tooltip that replaced that name would lose it.
    const user = userEvent.setup()
    render(
      <Tooltip content="Copies the hex value">
        <button>Copy</button>
      </Tooltip>,
    )
    await user.tab()

    const button = screen.getByRole('button', { name: 'Copy' })
    expect(button).toHaveAttribute('aria-describedby', screen.getByRole('tooltip').id)
  })

  it('keeps a describedby the trigger already had', async () => {
    const user = userEvent.setup()
    render(
      <>
        <span id="hint">Hex only</span>
        <Tooltip content="Copies the hex value">
          <button aria-describedby="hint">Copy</button>
        </Tooltip>
      </>,
    )
    await user.tab()
    const ids = screen.getByRole('button').getAttribute('aria-describedby')!.split(' ')
    expect(ids).toContain('hint')
    expect(ids).toHaveLength(2)
  })

  it('describes the trigger before it opens, so focus announces it', () => {
    // The description used to be attached only once the tooltip opened, which
    // happens in a render after the focus event. A screen reader reads the
    // focused element on focus, so it could announce "Copy, button" before the
    // description existed. The bubble is now always rendered, hidden while
    // closed: a hidden element still supplies an aria-describedby text, and
    // the IDREF always resolves.
    render(
      <Tooltip content="Copy to clipboard">
        <button>Copy</button>
      </Tooltip>,
    )
    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(screen.getByRole('button')).toHaveAccessibleDescription('Copy to clipboard')
  })

  it('is dismissible with Escape, and focus does not move. WCAG 1.4.13', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Copy to clipboard">
        <button>Copy</button>
      </Tooltip>,
    )
    await user.tab()
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(screen.getByRole('button')).toHaveFocus()
  })

  it('is dismissible with Escape when it was opened by the pointer', async () => {
    // The scenario 1.4.13 was actually written for: a bubble obscuring the
    // content underneath, with no focused element to receive the key.
    const user = userEvent.setup()
    render(
      <Tooltip content="Copy to clipboard">
        <button>Copy</button>
      </Tooltip>,
    )
    await user.hover(screen.getByRole('button'))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('goes away when the pointer leaves', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Copy">
        <button>Copy</button>
      </Tooltip>,
    )
    const button = screen.getByRole('button')
    await user.hover(button)
    await user.unhover(button)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('goes away when focus leaves', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Tooltip content="Copy">
          <button>Copy</button>
        </Tooltip>
        <button>Next</button>
      </>,
    )
    await user.tab()
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    await user.tab()
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('does not delay on focus even when a hover delay is set', async () => {
    // A keyboard user has already committed to the element. A delay there is a
    // description that arrives late.
    const user = userEvent.setup()
    render(
      <Tooltip content="Copy" delay={5000}>
        <button>Copy</button>
      </Tooltip>,
    )
    await user.tab()
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('applies the placement class', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Copy" placement="bottom">
        <button>Copy</button>
      </Tooltip>,
    )
    await user.tab()
    expect(screen.getByRole('tooltip').className).toContain('bottom')
  })

  /* WCAG 1.4.13's "hoverable": the pointer can travel from the trigger into the
     bubble and the bubble stays. Two things made it false, and the component's
     own comments asserted the opposite of each.

     These assert the mechanism rather than the behaviour, deliberately. jsdom
     has no layout and no hit testing, so it cannot answer whether a pointer
     moving across a gap lands on a box, which is the actual question.

     The bubble taking pointer events is the other half, and it is not here:
     jsdom does not compute CSS modules, so an assertion about
     `pointer-events` in this file would pass whatever the stylesheet said. It
     is in `stylesheet.test.ts`, which reads the built CSS, beside the
     portalled-Popover z-index claim that is there for the same reason. */
  it('spans the gap between the trigger and the bubble', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Copy">
        <button>Copy</button>
      </Tooltip>,
    )
    await user.tab()
    const bubble = screen.getByRole('tooltip')
    /* The offset is a real strip of page where the pointer is over neither box.
       The bridge is a child of the bubble, so it is part of the same hit area:
       a sibling would not keep `pointerleave` on the root from firing. */
    const bridge = bubble.firstElementChild
    expect(bridge).not.toBeNull()
    expect(bridge).toHaveAttribute('aria-hidden')
    expect(bubble.contains(bridge!)).toBe(true)
  })

  it('keeps the bubble out of the accessible name of nothing but itself', async () => {
    /* The bridge is geometry. If it ever gained text it would be read as part
       of the tooltip, so the assertion is that the bubble's text is the whole
       of what a reader gets. */
    const user = userEvent.setup()
    render(
      <Tooltip content="Copies the hex value">
        <button>Copy</button>
      </Tooltip>,
    )
    await user.tab()
    expect(screen.getByRole('tooltip')).toHaveTextContent('Copies the hex value')
  })

  it('has no axe violations while shown', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Tooltip content="Copies the hex value">
        <button>Copy</button>
      </Tooltip>,
    )
    await user.tab()
    expect((await axe(container)).violations).toEqual([])
  })
})
