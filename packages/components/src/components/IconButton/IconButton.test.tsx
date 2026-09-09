import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { createRef } from 'react'
import { axe } from 'vitest-axe'
import { IconButton } from './IconButton'
import type { IconButtonAsChildProps, IconButtonOwnProps } from './IconButton'

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

describe('asChild', () => {
  it('renders the child element and not a button', () => {
    // haus#70: core's workspace-settings gear is an icon-only Next Link.
    render(
      <IconButton icon={<Glyph />} label="Workspace settings" asChild>
        <a href="/settings" />
      </IconButton>,
    )
    const link = screen.getByRole('link', { name: 'Workspace settings' })
    expect(link).toHaveAttribute('href', '/settings')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('keeps the label as the accessible name', () => {
    // The child supplies the element, not the name. An anchor wrapping an SVG
    // announces as a link and nothing else without this.
    render(
      <IconButton icon={<Glyph />} label="Workspace settings" asChild>
        <a href="/settings" />
      </IconButton>,
    )
    expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Workspace settings')
  })

  it('gives the child the icon button box, and lets the child className win', () => {
    render(
      <IconButton icon={<Glyph />} label="Edit" size="sm" className="sys" asChild>
        <a href="/x" className="mine" />
      </IconButton>,
    )
    const link = screen.getByRole('link')
    expect(link.className).toContain('sys')
    expect(link.className).toContain('mine')
    // System classes first, so the caller's wins a collision.
    expect(link.className.indexOf('mine')).toBeGreaterThan(link.className.indexOf('sys'))
    expect(screen.getByTestId('glyph')).toBeInTheDocument()
  })

  it('replaces the child own children with the glyph, rather than appending', () => {
    // The question haus#70 raised and Button never had to answer. Button's
    // children are the caller's, so it appends; here `icon` is the content and
    // the contract is that it is the only content.
    render(
      <IconButton icon={<Glyph />} label="Edit" asChild>
        <a href="/x">this text is not an icon</a>
      </IconButton>,
    )
    const link = screen.getByRole('link')
    expect(link).not.toHaveTextContent('this text is not an icon')
    expect(screen.getByTestId('glyph')).toBeInTheDocument()
  })

  it('gives the node to both refs, IconButton own and the child own', () => {
    const own = createRef<HTMLAnchorElement>()
    const child = createRef<HTMLAnchorElement>()
    render(
      <IconButton icon={<Glyph />} label="Edit" asChild ref={own}>
        <a href="/x" ref={child} />
      </IconButton>,
    )
    expect(own.current).toBe(screen.getByRole('link'))
    expect(child.current).toBe(screen.getByRole('link'))
  })

  it('puts no asChild-only prop on the DOM', () => {
    render(
      <IconButton icon={<Glyph />} label="Edit" asChild>
        <a href="/x" />
      </IconButton>,
    )
    const link = screen.getByRole('link')
    expect(link).not.toHaveAttribute('asChild')
    expect(link).not.toHaveAttribute('icon')
    expect(link).not.toHaveAttribute('label')
    expect(link).not.toHaveAttribute('loading')
  })

  it('does not typecheck with loading', () => {
    // The guard is the type. A link that is permanently busy announces a wait
    // that will never end, the same reason Button forbids it.
    // @ts-expect-error asChild has no busy state to announce
    const a = <IconButton icon={<Glyph />} label="Edit" asChild loading><a href="/x" /></IconButton>
    expect(a).toBeTruthy()
  })

  it('exports both halves of the union by name', () => {
    // Decision 0023. A wrapper accepting the whole union does not compile.
    const own: IconButtonOwnProps = { icon: <Glyph />, label: 'Edit', loading: true }
    const cloned: IconButtonAsChildProps = {
      icon: <Glyph />, label: 'Edit', asChild: true, children: <a href="/x" />,
    }
    expect([own.loading, cloned.asChild]).toEqual([true, true])
  })

  it('has no axe violations as a link', async () => {
    const { container } = render(
      <IconButton icon={<Glyph />} label="Workspace settings" asChild>
        <a href="/settings" />
      </IconButton>,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})
