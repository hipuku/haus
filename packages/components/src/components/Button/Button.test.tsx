import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { createRef } from 'react'
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
    //
    // The aria-busy half of this test's name was missing until haus#55, and the
    // name had claimed it since the test was written. Without it a loading
    // button is announced exactly as a permanently disabled one: "Saving,
    // dimmed", with nothing to say the wait is temporary. The spinner could not
    // fill the gap because it is aria-hidden, correctly, so the button was the
    // only thing that could speak and did not.
    render(<Button loading>Saving</Button>)
    const button = screen.getByRole('button', { name: 'Saving' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('is not busy when it is merely disabled', () => {
    // The negative case, without which the assertion above passes on any button
    // that sets aria-busy unconditionally.
    render(<Button disabled>Nope</Button>)
    expect(screen.getByRole('button', { name: 'Nope' })).not.toHaveAttribute('aria-busy')
  })

  it('draws its spinner with the shared component, not its own', () => {
    // Button was the fourth independent spinner in the portfolio and the one
    // inside the design system. It is silent, which is right, because the
    // button's own aria-busy is what announces; announcedBy records that in the
    // markup rather than leaving a bare aria-hidden nobody can account for.
    render(<Button loading>Saving</Button>)
    expect(document.querySelector('[data-announced-by]')).toHaveAttribute(
      'data-announced-by',
      "the button's aria-busy state",
    )
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

  it('applies variant, tone and size classes', () => {
    render(<Button variant="secondary" tone="error" size="lg">Delete</Button>)
    const cls = screen.getByRole('button', { name: 'Delete' }).className
    expect(cls).toContain('secondary')
    expect(cls).toContain('error')
    expect(cls).toContain('lg')
  })

  it('carries no tone class when neutral', () => {
    // The default is a weight with no meaning attached, so it should not fight
    // the variant's own colours with an empty tone class.
    render(<Button variant="primary">Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' }).className).not.toContain('error')
  })

  it.each(['info', 'success', 'warning', 'error'] as const)(
    'carries the %s tone class',
    (tone) => {
      // Button narrowed the shared union to neutral | error on the premise that
      // the other three had no design. semantics.css and Badge both said
      // otherwise, so the union is whole again and each tone must arrive.
      render(<Button tone={tone}>Act</Button>)
      expect(screen.getByRole('button', { name: 'Act' }).className).toContain(tone)
    },
  )

  it('external is behaviour, so it stacks on any weight', () => {
    // It used to be a variant that silently forced the text weight. A primary
    // button that opens elsewhere is now expressible.
    render(<Button variant="primary" external href="https://example.com">Docs</Button>)
    const cls = screen.getByRole('link', { name: 'Docs' }).className
    expect(cls).toContain('primary')
    expect(cls).toContain('external')
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
    render(<Button external href="https://example.com">Docs</Button>)
    // The arrow is presentational; announcing "↗" after the label is noise.
    expect(screen.getByRole('link', { name: 'Docs' })).toBeInTheDocument()
  })

  it('has no axe violations across variants', async () => {
    const { container } = render(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button tone="info">Info</Button>
        <Button tone="success">Success</Button>
        <Button tone="warning">Warning</Button>
        <Button tone="error">Error</Button>
        <Button variant="ghost" tone="error">Ghost error</Button>
        <Button variant="text">Text</Button>
        <Button external href="https://example.com">External</Button>
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
      </>,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})

describe('asChild', () => {
  it('renders the child element instead of a button, and merges the class', () => {
    render(
      <Button asChild variant="secondary">
        <a href="/somewhere" className="mine">Go</a>
      </Button>,
    )
    // The child is what rendered: no button in the tree at all.
    expect(screen.queryByRole('button')).toBeNull()
    const link = screen.getByRole('link', { name: 'Go' })
    expect(link).toHaveAttribute('href', '/somewhere')
    // Both classes survive. This is the whole point: haus supplies the look and
    // the caller's own class is still there to override it.
    expect(link.className).toMatch(/mine/)
    expect(link.className.split(' ').length).toBeGreaterThan(1)
  })

  it('keeps the child as the ref target', () => {
    const ref = createRef<HTMLAnchorElement>()
    render(
      <Button asChild>
        <a href="/x" ref={ref}>Go</a>
      </Button>,
    )
    expect(ref.current?.tagName).toBe('A')
  })

  it('attaches no ref at all when neither side has one', () => {
    /* A ref is illegal in a Server Component, and asChild is the one path that
       could attach one unasked. The first version always did, via a merge
       callback that closed over nothing, and core's two server pages threw
       "Refs cannot be used in Server Components". haus#71.

       Asserted on the clone rather than on the DOM, deliberately. jsdom does
       not enforce the RSC rules and `renderToString` does not either, so no
       unit test here can reproduce the throw. What can be checked is the thing
       that caused it: whether a ref was handed to the child at all. */
    const clone = vi.spyOn(React, 'cloneElement')
    render(
      <Button asChild>
        <a href="/x">Go</a>
      </Button>,
    )
    const props = clone.mock.calls[0]?.[1] as { ref?: unknown }
    expect(props).toBeDefined()
    expect(props.ref).toBeUndefined()
    clone.mockRestore()
  })

  it('still merges when a ref is actually present', () => {
    const clone = vi.spyOn(React, 'cloneElement')
    const ref = createRef<HTMLAnchorElement>()
    render(
      <Button asChild ref={ref}>
        <a href="/x">Go</a>
      </Button>,
    )
    const props = clone.mock.calls[0]?.[1] as { ref?: unknown }
    expect(typeof props.ref).toBe('function')
    expect(ref.current?.tagName).toBe('A')
    clone.mockRestore()
  })

  it('gives the node to both refs, Button own and the child own', () => {
    // The first version of asChild passed only Button's ref into cloneElement,
    // which silently threw the child's away. Neither is more entitled.
    const onButton = createRef<HTMLAnchorElement>()
    const onChild  = createRef<HTMLAnchorElement>()
    render(
      <Button asChild ref={onButton}>
        <a href="/x" ref={onChild}>Go</a>
      </Button>,
    )
    expect(onButton.current?.tagName).toBe('A')
    expect(onChild.current?.tagName).toBe('A')
    expect(onButton.current).toBe(onChild.current)
  })

  it('does not typecheck with loading, href or target', () => {
    // The guard is the type, so this is the only place it can be asserted.
    // If any of these ever start compiling, tsc fails on the unused directive
    // and this test file is what reports it.
    // @ts-expect-error asChild has no busy state to announce
    const a = <Button asChild loading><a href="/x">Go</a></Button>
    // @ts-expect-error the child carries its own destination
    const b = <Button asChild href="/x"><a href="/x">Go</a></Button>
    // @ts-expect-error the child carries its own target
    const c = <Button asChild target="_blank"><a href="/x">Go</a></Button>
    expect([a, b, c]).toHaveLength(3)
  })

  it('appends the external glyph after the child own children', () => {
    render(
      <Button asChild external>
        <a href="https://example.com">Out</a>
      </Button>,
    )
    // The label is still readable, and the glyph is aria-hidden so it does not
    // reach the accessible name.
    expect(screen.getByRole('link', { name: 'Out' })).toBeInTheDocument()
  })

  it('puts no asChild-only prop on the DOM', () => {
    render(
      <Button asChild>
        <a href="/x">Go</a>
      </Button>,
    )
    const link = screen.getByRole('link')
    for (const attr of ['aschild', 'loading', 'target']) {
      expect(link.hasAttribute(attr)).toBe(false)
    }
  })

  it('still renders a button when asChild is not set', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })
})
