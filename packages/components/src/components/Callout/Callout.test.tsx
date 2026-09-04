import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { Callout } from './Callout'

describe('Callout', () => {
  it('is a note by default, not a live region', () => {
    // The reason this component is in haus. drift puts role="alert" on every
    // callout, so its static "audited a cached crawl" notice interrupts a
    // screen reader on every render; vault puts role="note" on every one, so a
    // validation message that appears after a failed save is never announced.
    // Both are one hardcoded answer to a question only the caller can answer.
    render(<Callout>Audited a cached crawl.</Callout>)
    expect(screen.getByRole('note')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('becomes a polite live region when it appeared in response to something', () => {
    render(<Callout live="polite">Draft saved.</Callout>)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('becomes assertive only when asked, because assertive interrupts', () => {
    render(<Callout live="assertive" tone="error">Payment declined.</Callout>)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders its children', () => {
    render(<Callout>Check the field above.</Callout>)
    expect(screen.getByText('Check the field above.')).toBeInTheDocument()
  })

  it('applies the tone class', () => {
    const { rerender } = render(<Callout data-testid="c">Body</Callout>)
    expect(screen.getByTestId('c').className).toContain('info')

    rerender(<Callout tone="warning" data-testid="c">Body</Callout>)
    expect(screen.getByTestId('c').className).toContain('warning')
  })

  it('hides its glyph from the accessibility tree', () => {
    // The tone is carried by colour and by the copy. A glyph announced as
    // "warning" on a message that already says so is heard twice.
    const { container } = render(<Callout tone="warning">Body</Callout>)
    const icon = container.querySelector('[aria-hidden="true"]')
    expect(icon).not.toBeNull()
    expect(icon!.querySelector('svg')).not.toBeNull()
  })

  it('takes an icon override', () => {
    render(<Callout icon={<span data-testid="own" />}>Body</Callout>)
    expect(screen.getByTestId('own')).toBeInTheDocument()
  })

  it('drops the glyph entirely when icon is false', () => {
    const { container } = render(<Callout icon={false}>Body</Callout>)
    expect(container.querySelector('svg')).toBeNull()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('merges className rather than replacing the component classes', () => {
    render(<Callout className="custom" data-testid="c">Body</Callout>)
    const el = screen.getByTestId('c')
    expect(el).toHaveClass('custom')
    expect(el.className).toContain('callout')
  })

  it('does not interfere with the semantics of its children', () => {
    render(
      <Callout>
        <a href="/docs">Read the docs</a>
      </Callout>,
    )
    expect(screen.getByRole('link', { name: 'Read the docs' })).toBeInTheDocument()
  })

  it('has no axe violations across the five tones', async () => {
    const { container } = render(
      <>
        <Callout tone="neutral">Neutral</Callout>
        <Callout tone="info">Info</Callout>
        <Callout tone="success">Success</Callout>
        <Callout tone="warning">Warning</Callout>
        <Callout tone="error" live="assertive">Error</Callout>
      </>,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})
