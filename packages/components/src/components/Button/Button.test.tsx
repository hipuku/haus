import { readFileSync } from 'node:fs'
import { join } from 'node:path'
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

  it('tone and variant compose, rather than one winning outright', () => {
    // The defect this guards is a CSS one and jsdom runs with `css: false`, so
    // asserting it through the DOM is not possible: both classes always landed
    // on the element, and the bug was that `.error` set background, border and
    // colour outright and won on source order whatever the variant said —
    // `variant="ghost" tone="error"` rendered solid. Reading the stylesheet is
    // the assertion that can actually fail, and the rule it encodes is the one
    // the design depends on: a tone rule may remap custom properties and may
    // decide nothing else.
    const css = readFileSync(join(process.cwd(), 'src/components/Button/Button.module.css'), 'utf8')
    const rules = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].map((m) => ({
      selectors: m[1].split(',').map((sel) => sel.trim()),
      body: m[2],
    }))

    for (const tone of ['info', 'success', 'warning', 'error']) {
      // Every rule that names the tone on its own — the grouped one and the
      // solitary one both count, and matching only the first is how an earlier
      // version of this test passed while the defect was present.
      const toneRules = rules.filter((rule) => rule.selectors.includes(`.${tone}`))
      expect(toneRules.length, `no rule selects .${tone} alone`).toBeGreaterThan(0)

      for (const rule of toneRules) {
        const declared = [...rule.body.matchAll(/(?:^|;)\s*([\w-]+)\s*:/g)].map((m) => m[1])
        expect(declared.length).toBeGreaterThan(0)
        const direct = declared.filter((prop) => !prop.startsWith('--'))
        expect(direct, `.${tone} sets ${direct.join(', ')} directly`).toEqual([])
      }
    }
  })

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
