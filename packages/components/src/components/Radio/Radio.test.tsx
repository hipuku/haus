import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { RadioGroup } from './Radio'

const OPTIONS = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large', disabled: true },
]

describe('RadioGroup', () => {
  it('renders one radio per option, sharing a name', () => {
    // A shared name is what makes them mutually exclusive. Without it every
    // radio toggles independently and the group is meaningless.
    render(<RadioGroup name="size" options={OPTIONS} />)
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(3)
    for (const radio of radios) expect(radio).toHaveAttribute('name', 'size')
  })

  it('selects an option on click and reports its value', async () => {
    const onChange = vi.fn()
    render(<RadioGroup name="size" options={OPTIONS} onChange={onChange} />)
    await userEvent.click(screen.getByRole('radio', { name: 'Medium' }))
    expect(onChange).toHaveBeenCalledWith('md')
  })

  it('honours defaultValue', () => {
    render(<RadioGroup name="size" options={OPTIONS} defaultValue="md" />)
    expect(screen.getByRole('radio', { name: 'Medium' })).toBeChecked()
  })

  it('keeps selection mutually exclusive', async () => {
    render(<RadioGroup name="size" options={OPTIONS} defaultValue="sm" />)
    await userEvent.click(screen.getByRole('radio', { name: 'Medium' }))
    expect(screen.getByRole('radio', { name: 'Small' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Medium' })).toBeChecked()
  })

  it('does not manage its own state when controlled', async () => {
    const onChange = vi.fn()
    render(<RadioGroup name="size" options={OPTIONS} value="sm" onChange={onChange} />)
    await userEvent.click(screen.getByRole('radio', { name: 'Medium' }))
    expect(onChange).toHaveBeenCalledWith('md')
    expect(screen.getByRole('radio', { name: 'Small' })).toBeChecked()
  })

  it('disables individual options', async () => {
    const onChange = vi.fn()
    render(<RadioGroup name="size" options={OPTIONS} onChange={onChange} />)
    const large = screen.getByRole('radio', { name: 'Large' })
    expect(large).toBeDisabled()
    await userEvent.click(large)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('groups the radios under the group label as a radiogroup', () => {
    // radiogroup rather than the generic group role: it tells assistive
    // technology that exactly one of the children will be chosen.
    render(<RadioGroup name="size" options={OPTIONS} label="Size" />)
    expect(screen.getByRole('radiogroup', { name: /Size/ })).toBeInTheDocument()
  })

  it('marks the group required and invalid, not the individual radios', () => {
    // The constraint belongs to the group, where one of N must be chosen, so the
    // ARIA state has to sit on the container.
    render(<RadioGroup name="size" options={OPTIONS} label="Size" required error="Pick a size" />)
    const group = screen.getByRole('radiogroup', { name: /Size/ })
    expect(group).toHaveAttribute('aria-required', 'true')
    expect(group).toHaveAttribute('aria-invalid', 'true')
  })

  it('announces the group error', () => {
    render(<RadioGroup name="size" options={OPTIONS} label="Size" error="Pick a size" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Pick a size')
  })

  it('applies the orientation class', () => {
    const { container } = render(
      <RadioGroup name="size" options={OPTIONS} orientation="horizontal" />,
    )
    expect(container.innerHTML).toContain('horizontal')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <RadioGroup name="a" options={OPTIONS} label="Plain" />
        <RadioGroup name="b" options={OPTIONS} label="With error" error="Required" />
      </>,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})
