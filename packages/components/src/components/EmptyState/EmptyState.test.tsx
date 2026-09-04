import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders its title as a real heading', () => {
    // vault renders its title as a <p>. It looks like a heading and is not one,
    // so a screen-reader user navigating by heading skips straight past the
    // only thing that says why the region is empty.
    render(<EmptyState title="Add your first colour" />)
    expect(screen.getByRole('heading', { name: 'Add your first colour' })).toBeInTheDocument()
  })

  it('takes the heading level from the caller, because only the caller knows it', () => {
    const { rerender } = render(<EmptyState title="Nothing yet" />)
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()

    rerender(<EmptyState title="Nothing yet" headingLevel={2} />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('is silent by default', () => {
    // An empty list that was always empty is not news. Announcing every one on
    // mount is how a live region stops being listened to.
    render(<EmptyState title="No colours yet" />)
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('announces politely when it appeared in response to something', () => {
    // vault renders load failures through its EmptyState — "Couldn't open your
    // library" — and they reach assistive technology as nothing at all.
    render(<EmptyState title="Couldn’t open your library" live="polite" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders the description when there is one', () => {
    render(<EmptyState title="No colours match this filter" description="Try a wider search." />)
    expect(screen.getByText('Try a wider search.')).toBeInTheDocument()
  })

  it('omits the description entirely rather than rendering an empty node', () => {
    const { container } = render(<EmptyState title="Nothing yet" />)
    expect(container.querySelectorAll('p')).toHaveLength(0)
  })

  it('renders an action when the reader can do something about it', () => {
    render(<EmptyState title="No colours yet" action={<button>Add a colour</button>} />)
    expect(screen.getByRole('button', { name: 'Add a colour' })).toBeInTheDocument()
  })

  it('has no action when nothing the reader can do would help', () => {
    // A filtered-to-nothing state and a permissions one both want no button.
    render(<EmptyState title="No results" />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('hides the illustration from the accessibility tree', () => {
    const { container } = render(
      <EmptyState title="Nothing yet" icon={<svg data-testid="glyph" />} />,
    )
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
    expect(screen.getByTestId('glyph')).toBeInTheDocument()
  })

  it('merges className rather than replacing the component classes', () => {
    render(<EmptyState title="Nothing" className="custom" data-testid="e" />)
    const el = screen.getByTestId('e')
    expect(el).toHaveClass('custom')
    expect(el.className).toContain('empty')
  })

  it('has no axe violations across the three situations it stands in for', async () => {
    const { container } = render(
      // Level 2 rather than the default 3, because these sit directly under the
      // h1. Written with the default first, and axe failed it for heading-order
      // — which is the whole argument for the prop: the right level is a fact
      // about the page, the component cannot know it, and getting it wrong is
      // invisible until something checks.
      <main>
        <h1>Colours</h1>
        <EmptyState
          headingLevel={2}
          title="Add your first colour"
          description="Add by hex or extract from an image."
          action={<button>Add a colour</button>}
        />
        <EmptyState headingLevel={2} title="No colours match this filter" />
        <EmptyState headingLevel={2} title="Couldn’t open your library" live="polite" />
      </main>,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})
