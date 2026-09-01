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

  it('a disabled anchor cannot be focused or followed', async () => {
    // aria-disabled announces a state without creating one. This test is the
    // half the assertion above was missing: the link stayed in the tab order
    // and still navigated, so it was disabled to a screen reader and live to
    // everyone else.
    render(
      <>
        <Button href="/x" disabled>Nope</Button>
        <button type="button">after</button>
      </>,
    )
    const link = screen.getByRole('link', { name: 'Nope' })
    expect(link).not.toHaveAttribute('href')
    expect(link).toHaveAttribute('tabindex', '-1')

    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'after' })).toHaveFocus()
  })

  it('a disabled anchor keeps target and rel off too', () => {
    // Otherwise a disabled external link still advertises a new tab it will
    // never open.
    render(<Button href="https://example.com" target="_blank" disabled>Nope</Button>)
    const link = screen.getByRole('link', { name: /Nope/ })
    expect(link).not.toHaveAttribute('target')
    expect(link).not.toHaveAttribute('rel')
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

  it('forwards a ref to the anchor too', () => {
    // The anchor branch dropped the ref silently, and the component was typed
    // forwardRef<HTMLButtonElement> so nothing warned: a caller measuring or
    // focusing a link-shaped Button got null and no explanation.
    const ref = createRef<HTMLAnchorElement>()
    render(<Button ref={ref} href="/x">Ref</Button>)
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement)
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
