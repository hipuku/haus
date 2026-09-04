import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { Divider } from './Divider'

describe('Divider', () => {
  it('is an <hr>, so it is still a break with styles off', () => {
    const { container } = render(<Divider />)
    expect(container.querySelector('hr')).not.toBeNull()
  })

  it('is announced as a separator by default', () => {
    render(<Divider />)
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('leaves the accessibility tree when it is decorative', () => {
    // A line drawn because a panel looked crowded is not structure, and
    // announcing it is noise. The distinction is invisible in the markup, so
    // the caller has to be able to say which one this is.
    render(<Divider decorative />)
    expect(screen.queryByRole('separator')).toBeNull()
  })

  it('reports its orientation, and only when that is not the default', () => {
    // aria-orientation defaults to horizontal on a separator, so emitting it
    // for the horizontal case is noise that also hides a real vertical one.
    const { rerender } = render(<Divider orientation="vertical" />)
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')

    rerender(<Divider />)
    expect(screen.getByRole('separator')).not.toHaveAttribute('aria-orientation')
  })

  it('does not claim an orientation it has already hidden', () => {
    const { container } = render(<Divider orientation="vertical" decorative />)
    expect(container.querySelector('hr')).not.toHaveAttribute('aria-orientation')
  })

  it('carries space by default, because a rule with none reads as an underline', () => {
    render(<Divider data-testid="d" />)
    expect(screen.getByTestId('d').className).toContain('space-md')
  })

  it('drops the space when the parent owns it', () => {
    render(<Divider spacing="none" data-testid="d" />)
    expect(screen.getByTestId('d').className).not.toContain('space-')
  })

  it('applies the orientation class', () => {
    const { rerender } = render(<Divider data-testid="d" />)
    expect(screen.getByTestId('d').className).toContain('horizontal')

    rerender(<Divider orientation="vertical" data-testid="d" />)
    expect(screen.getByTestId('d').className).toContain('vertical')
  })

  it('merges className rather than replacing the component classes', () => {
    render(<Divider className="custom" data-testid="d" />)
    const el = screen.getByTestId('d')
    expect(el).toHaveClass('custom')
    expect(el.className).toContain('divider')
  })

  it('spreads native attributes', () => {
    render(<Divider data-testid="d" aria-label="End of section" />)
    expect(screen.getByTestId('d')).toHaveAttribute('aria-label', 'End of section')
  })

  it('has no axe violations in either orientation or either role', async () => {
    const { container } = render(
      <>
        <p>Above</p>
        <Divider />
        <p>Between</p>
        <Divider decorative />
        <div style={{ display: 'flex' }}>
          <span>Left</span>
          <Divider orientation="vertical" />
          <span>Right</span>
        </div>
      </>,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})
