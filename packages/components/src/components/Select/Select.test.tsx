import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe } from 'vitest-axe'
import { Select } from './Select'

const OPTIONS = [
  { value: 'aronia', label: 'Aronia' },
  { value: 'damson', label: 'Damson' },
  { value: 'cherry', label: 'Cherry', disabled: true },
]

describe('Select', () => {
  it('associates the label with the select', () => {
    render(<Select label="Palette" options={OPTIONS} />)
    expect(screen.getByLabelText('Palette')).toBeInstanceOf(HTMLSelectElement)
  })

  it('renders every option', () => {
    render(<Select label="Palette" options={OPTIONS} />)
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('marks individually disabled options', () => {
    render(<Select label="Palette" options={OPTIONS} />)
    expect(screen.getByRole('option', { name: 'Cherry' })).toBeDisabled()
  })

  it('renders a placeholder as the leading option', () => {
    render(<Select label="Palette" options={OPTIONS} placeholder="Choose one" />)
    expect(screen.getByRole('option', { name: 'Choose one' })).toBeInTheDocument()
  })

  it('changes value on selection', async () => {
    const onChange = vi.fn()
    render(<Select label="Palette" options={OPTIONS} onChange={onChange} />)
    const select = screen.getByLabelText('Palette')
    await userEvent.selectOptions(select, 'damson')
    expect(select).toHaveValue('damson')
    expect(onChange).toHaveBeenCalled()
  })

  it('points aria-describedby at the hint', () => {
    render(<Select label="Palette" options={OPTIONS} hint="Pick the brand hue" />)
    const select = screen.getByLabelText('Palette')
    expect(select.getAttribute('aria-describedby')).toContain(
      screen.getByText('Pick the brand hue').id,
    )
  })

  it('marks itself invalid and describes the error', () => {
    render(<Select label="Palette" options={OPTIONS} error="Choose a palette" />)
    const select = screen.getByLabelText('Palette')
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(select.getAttribute('aria-describedby')).toContain(
      screen.getByText('Choose a palette').id,
    )
  })

  it('accepts children instead of the options prop', () => {
    // Both APIs exist; the children path is what callers reach for when the
    // options need grouping.
    render(
      <Select label="Manual">
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>,
    )
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  it('forwards a ref to the underlying select', () => {
    const ref = createRef<HTMLSelectElement>()
    render(<Select label="Ref" options={OPTIONS} ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLSelectElement)
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Select label="Plain" options={OPTIONS} />
        <Select label="With hint" options={OPTIONS} hint="Optional" />
        <Select label="With error" options={OPTIONS} error="Required" />
        <Select label="Disabled" options={OPTIONS} disabled />
      </>,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})
