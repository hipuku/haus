import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
  it('is not in the document until something asks for it', () => {
    render(<Tooltip content="Copy to clipboard"><button>Copy</button></Tooltip>)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('appears on hover', async () => {
    const user = userEvent.setup()
    render(<Tooltip content="Copy to clipboard"><button>Copy</button></Tooltip>)
    await user.hover(screen.getByRole('button'))
    expect(screen.getByRole('tooltip')).toHaveTextContent('Copy to clipboard')
  })

  it('appears on focus, which is the half most hand-rolled ones miss', async () => {
    // A tooltip that only answers the mouse is not a tooltip, it is a hover
    // effect, and every keyboard user gets a control with no description.
    const user = userEvent.setup()
    render(<Tooltip content="Copy to clipboard"><button>Copy</button></Tooltip>)
    await user.tab()
    expect(screen.getByRole('button')).toHaveFocus()
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('describes the trigger rather than naming it', async () => {
    // aria-describedby, not labelledby: the button already says "Copy", and a
    // tooltip that replaced that name would lose it.
    const user = userEvent.setup()
    render(<Tooltip content="Copies the hex value"><button>Copy</button></Tooltip>)
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

  it('has no describedby pointing at a tooltip that is not rendered', () => {
    render(<Tooltip content="Copy"><button>Copy</button></Tooltip>)
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-describedby')
  })

  it('is dismissible with Escape, and focus does not move. WCAG 1.4.13', async () => {
    const user = userEvent.setup()
    render(<Tooltip content="Copy to clipboard"><button>Copy</button></Tooltip>)
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
    render(<Tooltip content="Copy to clipboard"><button>Copy</button></Tooltip>)
    await user.hover(screen.getByRole('button'))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('goes away when the pointer leaves', async () => {
    const user = userEvent.setup()
    render(<Tooltip content="Copy"><button>Copy</button></Tooltip>)
    const button = screen.getByRole('button')
    await user.hover(button)
    await user.unhover(button)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('goes away when focus leaves', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Tooltip content="Copy"><button>Copy</button></Tooltip>
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
    render(<Tooltip content="Copy" delay={5000}><button>Copy</button></Tooltip>)
    await user.tab()
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('applies the placement class', async () => {
    const user = userEvent.setup()
    render(<Tooltip content="Copy" placement="bottom"><button>Copy</button></Tooltip>)
    await user.tab()
    expect(screen.getByRole('tooltip').className).toContain('bottom')
  })

  it('has no axe violations while shown', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Tooltip content="Copies the hex value"><button>Copy</button></Tooltip>,
    )
    await user.tab()
    expect((await axe(container)).violations).toEqual([])
  })
})
