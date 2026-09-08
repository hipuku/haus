import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe } from 'vitest-axe'
import { IconButton } from './IconButton'

const Glyph = () => <svg data-testid="glyph" aria-hidden="true" />

describe('IconButton', () => {
  it('takes its accessible name from label, never from the icon', () => {
    // An SVG contributes nothing to the accessible name, so without `label`
    // this control announces as "button" and nothing else. Both products got
    // this right per site and neither had anything enforcing it.
    render(<IconButton icon={<Glyph />} label="Remove member" />)
    expect(screen.getByRole('button', { name: 'Remove member' })).toBeInTheDocument()
  })

  it('hides the glyph from assistive technology', () => {
    render(<IconButton icon={<Glyph />} label="Close" />)
    const button = screen.getByRole('button', { name: 'Close' })
    // The wrapper is aria-hidden, so the name cannot be doubled by the icon.
    expect(button.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })

  it('defaults to md, which is the size both products already draw', () => {
    render(<IconButton icon={<Glyph />} label="Edit" />)
    expect(screen.getByRole('button').className).toMatch(/md/)
  })

  it('takes the sm size', () => {
    render(<IconButton icon={<Glyph />} label="Edit" size="sm" />)
    const cls = screen.getByRole('button').className
    expect(cls).toMatch(/sm/)
    expect(cls).not.toMatch(/\bmd\b/)
  })

  it('composes variant and tone without either deciding the other', () => {
    render(<IconButton icon={<Glyph />} label="Delete" variant="ghost" tone="error" />)
    const cls = screen.getByRole('button').className
    expect(cls).toMatch(/ghost/)
    expect(cls).toMatch(/error/)
  })

  it('adds no tone class for neutral, which is the untoned default', () => {
    render(<IconButton icon={<Glyph />} label="Edit" />)
    expect(screen.getByRole('button').className).not.toMatch(/neutral/)
  })

  it('is a type=button, so it cannot submit a form it sits in by accident', () => {
    render(<IconButton icon={<Glyph />} label="Edit" />)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('announces the wait while loading, and disables itself', () => {
    render(<IconButton icon={<Glyph />} label="Saving" loading />)
    const button = screen.getByRole('button', { name: 'Saving' })
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()
    // The spinner replaces the glyph rather than joining it.
    expect(screen.queryByTestId('glyph')).toBeNull()
  })

  it('does not fire while loading', async () => {
    const onClick = vi.fn()
    render(<IconButton icon={<Glyph />} label="Saving" loading onClick={onClick} />)
    await userEvent.click(screen.getByRole('button')).catch(() => {})
    expect(onClick).not.toHaveBeenCalled()
  })

  it('fires when it is not', async () => {
    const onClick = vi.fn()
    render(<IconButton icon={<Glyph />} label="Edit" onClick={onClick} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('forwards its ref', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<IconButton icon={<Glyph />} label="Edit" ref={ref} />)
    expect(ref.current?.tagName).toBe('BUTTON')
  })

  it('has no axe violations', async () => {
    const { container } = render(<IconButton icon={<Glyph />} label="Edit" />)
    expect((await axe(container)).violations).toEqual([])
  })
})
