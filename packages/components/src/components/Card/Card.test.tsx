import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import React, { createRef } from 'react'
import { Card } from './Card'
import type { CardAsChildProps, CardOwnProps } from './Card'

describe('Card', () => {
  it('renders the element the document needs', () => {
    // A card is often a list item or an article. A <div> in those places is a
    // hole in the document outline that no amount of styling fixes, and there
    // was no way to say so: no `as`, no `asChild`, no ElementType anywhere in
    // the package.
    const { container } = render(
      <ul>
        <Card as="li">Body</Card>
      </ul>,
    )
    expect(container.querySelector('li')).not.toBeNull()
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('keeps its classes on whatever element it becomes', () => {
    render(<Card as="article" data-testid="c">Body</Card>)
    const el = screen.getByTestId('c')
    expect(el.tagName).toBe('ARTICLE')
    expect(el.className).toContain('card')
  })

  it('renders its children', () => {
    render(<Card>Contents</Card>)
    expect(screen.getByText('Contents')).toBeInTheDocument()
  })

  it('applies the variant class', () => {
    const { rerender } = render(<Card variant="elevated">Surface</Card>)
    expect(screen.getByText('Surface').className).toContain('elevated')

    rerender(<Card variant="outlined">Surface</Card>)
    expect(screen.getByText('Surface').className).toContain('outlined')
  })

  it('is padded by default', () => {
    render(<Card>Padded</Card>)
    expect(screen.getByText('Padded').className).toContain('padded')
  })

  it('drops padding when asked, for flush content like tables', () => {
    render(<Card padding={false}>Flush</Card>)
    expect(screen.getByText('Flush').className).not.toContain('padded')
  })

  it('merges className rather than replacing the component classes', () => {
    render(<Card className="custom">Merged</Card>)
    const card = screen.getByText('Merged')
    expect(card).toHaveClass('custom')
    expect(card.className).toContain('card')
  })

  it('spreads native div attributes', () => {
    render(<Card data-testid="panel" aria-label="Summary">Contents</Card>)
    expect(screen.getByTestId('panel')).toHaveAttribute('aria-label', 'Summary')
  })

  it('does not interfere with the semantics of its children', async () => {
    // Card is a plain container. If it introduced a role, headings and controls
    // inside it would be reported under the wrong structure.
    render(
      <Card>
        <h2>Title</h2>
        <button>Action</button>
      </Card>,
    )
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })

  it('has no axe violations across variants', async () => {
    const { container } = render(
      <>
        <Card variant="default"><h2>Default</h2></Card>
        <Card variant="elevated"><h2>Elevated</h2></Card>
        <Card variant="outlined"><h2>Outlined</h2></Card>
        <Card padding={false}><h2>Flush</h2></Card>
      </>,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})

describe('asChild', () => {
  it('renders the caller element, which as cannot reach', () => {
    // The case that made haus#69 a pattern: a clickable card is a router link,
    // and `as="a"` would render haus's anchor rather than the router's.
    render(
      <Card asChild>
        <a href="/decisions/1">
          <h3>A decision</h3>
        </a>
      </Card>,
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/decisions/1')
    expect(screen.getByRole('heading', { name: 'A decision' })).toBeInTheDocument()
  })

  it('keeps the child own children, unlike IconButton', () => {
    // A Card is a wrapper around content and the content is the caller's. That
    // is the opposite of IconButton, where the component supplies the only
    // child it has, and the two components answer it differently on purpose.
    render(
      <Card asChild>
        <a href="/x">
          <span>one</span>
          <span>two</span>
        </a>
      </Card>,
    )
    const link = screen.getByRole('link')
    expect(link).toHaveTextContent('one')
    expect(link).toHaveTextContent('two')
  })

  it('gives the child the card box, and lets the child className win', () => {
    render(
      <Card asChild variant="elevated" className="sys">
        <a href="/x" className="mine">body</a>
      </Card>,
    )
    const link = screen.getByRole('link')
    expect(link.className).toContain('sys')
    expect(link.className).toContain('mine')
    expect(link.className.indexOf('mine')).toBeGreaterThan(link.className.indexOf('sys'))
  })

  it('gives the node to both refs', () => {
    const own = createRef<HTMLElement>()
    const child = createRef<HTMLAnchorElement>()
    render(
      <Card asChild ref={own}>
        <a href="/x" ref={child}>body</a>
      </Card>,
    )
    expect(own.current).toBe(screen.getByRole('link'))
    expect(child.current).toBe(screen.getByRole('link'))
  })

  it('puts no asChild-only prop on the DOM', () => {
    render(<Card asChild><a href="/x">body</a></Card>)
    const link = screen.getByRole('link')
    expect(link).not.toHaveAttribute('asChild')
    expect(link).not.toHaveAttribute('as')
  })

  it('does not typecheck with as', () => {
    // The child supplies the element and `as` names one. Both is a contradiction.
    // @ts-expect-error the child is the element, so there is no element to name
    const x = <Card asChild as="article"><a href="/x">body</a></Card>
    expect(x).toBeTruthy()
  })

  it('keeps as for the outline cases it was built for', () => {
    // asChild does not replace `as`. Decision 0022 keeps both, and the argument
    // in CardElement's comment against a generic polymorphic `as` still stands.
    render(<Card as="article">body</Card>)
    expect(document.querySelector('article')).toBeInTheDocument()
  })

  it('exports both halves of the union by name', () => {
    const own: CardOwnProps = { as: 'li', children: 'body' }
    const cloned: CardAsChildProps = { asChild: true, children: <a href="/x">body</a> }
    expect([own.as, cloned.asChild]).toEqual(['li', true])
  })

  it('has no axe violations as a link', async () => {
    const { container } = render(
      <Card asChild><a href="/x"><h3>Title</h3></a></Card>,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})
