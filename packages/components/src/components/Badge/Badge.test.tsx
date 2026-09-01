import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders its content', () => {
    render(<Badge>Live</Badge>)
    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('applies variant and appearance classes', () => {
    render(<Badge tone="success" appearance="solid">Passed</Badge>)
    const cls = screen.getByText('Passed').className
    expect(cls).toContain('success')
    expect(cls).toContain('solid')
  })

  it('defaults to a neutral subtle badge', () => {
    render(<Badge>Default</Badge>)
    const cls = screen.getByText('Default').className
    expect(cls).toContain('neutral')
    expect(cls).toContain('subtle')
  })

  it('merges className rather than replacing the component classes', () => {
    render(<Badge className="custom">Merged</Badge>)
    const badge = screen.getByText('Merged')
    expect(badge).toHaveClass('custom')
    expect(badge.className).toContain('badge')
  })

  it('spreads native span attributes', () => {
    render(<Badge data-testid="status-badge" title="Build status">Live</Badge>)
    expect(screen.getByTestId('status-badge')).toHaveAttribute('title', 'Build status')
  })

  it('conveys meaning through text, not colour alone', async () => {
    // A badge that carried its meaning only in its variant colour would be
    // unreadable to a colourblind user. The text is the accessible signal.
    render(<Badge tone="error">Failed</Badge>)
    expect(screen.getByText('Failed')).toHaveTextContent('Failed')
  })

  it('has no axe violations across variants', async () => {
    const { container } = render(
      <>
        <Badge tone="neutral">Neutral</Badge>
        <Badge tone="success">Success</Badge>
        <Badge tone="warning">Warning</Badge>
        <Badge tone="error">Error</Badge>
        <Badge tone="info" appearance="solid">Info</Badge>
        <Badge dot>With dot</Badge>
      </>,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})
