import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('announces the wait by default', () => {
    // The whole reason this component exists. core renders a lucide SVG with no
    // role and no label, so the busy state reaches assistive technology as
    // nothing at all. Announcing is the default and takes no argument.
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveAccessibleName('Loading')
  })

  it('takes the label the caller gives it', () => {
    render(<Spinner label="Extracting colours" />)
    expect(screen.getByRole('status')).toHaveAccessibleName('Extracting colours')
  })

  it('goes silent only when told what announces instead', () => {
    // The legitimate case, and vault has it: `<Spinner /> Extracting...` would
    // otherwise announce twice, once for the ring and once for the text.
    render(<Spinner announcedBy="Extracting..." />)
    expect(screen.queryByRole('status')).toBeNull()
    expect(document.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })

  it('records what covers it, so a silent spinner is readable in the DOM', () => {
    // drift silences both of its spinners and puts nothing in their place. A
    // boolean prop would make that the easy thing to write; a string makes the
    // substitute nameable, and this asserts it survives to the markup.
    render(<Spinner announcedBy="Crawling 40 pages" />)
    expect(document.querySelector('[data-announced-by]')).toHaveAttribute(
      'data-announced-by',
      'Crawling 40 pages',
    )
  })

  it('is silent completely, with no empty live region left behind', () => {
    // Half-silencing is worse than either: a role="status" with no name is a
    // live region that announces a pause and no reason for it.
    render(<Spinner announcedBy="Saving" />)
    const el = document.querySelector('[data-announced-by]')!
    expect(el).not.toHaveAttribute('role')
    expect(el).not.toHaveAttribute('aria-label')
  })

  it.each(['text', 'sm', 'md'] as const)('draws at %s', (size) => {
    const { container } = render(<Spinner size={size} />)
    expect(container.firstElementChild?.className).toContain(size)
  })

  it('forwards a ref and merges className, like every other component here', () => {
    const ref = { current: null as HTMLSpanElement | null }
    const { container } = render(<Spinner ref={ref} className="mine" />)
    expect(ref.current).toBe(container.firstElementChild)
    expect(container.firstElementChild?.className).toContain('mine')
  })

  it('has no axe violations announcing', async () => {
    const { container } = render(<Spinner />)
    expect((await axe(container)).violations).toEqual([])
  })

  it('has no axe violations silent', async () => {
    const { container } = render(<Spinner announcedBy="Saving" />)
    expect((await axe(container)).violations).toEqual([])
  })
})
