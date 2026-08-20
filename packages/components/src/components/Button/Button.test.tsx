import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe } from 'vitest-axe'
import { Button } from './Button'

describe('Button', () => {
  it('renders as a button by default and as an anchor when given href', () => {
    // Button swaps its element based on href. Getting this wrong ships a
    // <button> that cannot be opened in a new tab, or an <a> that submits.
    const { rerender } = render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()

    rerender(<Button href="/pricing">Pricing</Button>)
    expect(screen.getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '/pricing')
  })

  it('adds rel="noopener noreferrer" to links opening in a new tab', () => {
    // target="_blank" without this gives the opened page access to window.opener.
    render(<Button href="https://example.com" target="_blank">External</Button>)
    expect(screen.getByRole('link', { name: 'External' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    )
  })

  it('does not set rel when the link stays in the same tab', () => {
    render(<Button href="/about">About</Button>)
    expect(screen.getByRole('link', { name: 'About' })).not.toHaveAttribute('rel')
  })

  it('does not fire onClick while disabled', async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Disabled</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Disabled' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('disables and marks itself busy while loading', () => {
    // loading must imply disabled: a spinner that still accepts clicks lets a
    // user fire the same request twice.
    render(<Button loading>Saving</Button>)
    const button = screen.getByRole('button', { name: 'Saving' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })

  it('marks an anchor aria-disabled, since href cannot be disabled', () => {
    // An <a> ignores the disabled attribute entirely, so the only signal
    // assistive technology gets is aria-disabled.
    render(<Button href="/x" disabled>Nope</Button>)
    expect(screen.getByRole('link', { name: 'Nope' })).toHaveAttribute('aria-disabled', 'true')
  })

  it('applies variant and size classes', () => {
    render(<Button variant="danger" size="lg">Delete</Button>)
    const cls = screen.getByRole('button', { name: 'Delete' }).className
    expect(cls).toContain('danger')
    expect(cls).toContain('lg')
  })

  it('merges className rather than replacing the component classes', () => {
    render(<Button className="custom">Merged</Button>)
    const button = screen.getByRole('button', { name: 'Merged' })
    expect(button).toHaveClass('custom')
    expect(button.className).toContain('button')
  })

  it('forwards a ref to the underlying button', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Ref</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('hides the decorative external icon from assistive technology', () => {
    render(<Button variant="external" href="https://example.com">Docs</Button>)
    // The arrow is presentational; announcing "↗" after the label is noise.
    expect(screen.getByRole('link', { name: 'Docs' })).toBeInTheDocument()
  })

  it('has no axe violations across variants', async () => {
    const { container } = render(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="text">Text</Button>
        <Button variant="external" href="https://example.com">External</Button>
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
      </>,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})
