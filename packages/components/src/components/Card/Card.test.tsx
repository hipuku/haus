import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { Card } from './Card'

describe('Card', () => {
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
