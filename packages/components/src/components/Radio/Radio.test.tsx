import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { RadioGroup } from './Radio'
import styles from './Radio.module.css'

const OPTIONS = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large', disabled: true },
]

describe('RadioGroup', () => {
  it('gives every option a usable id, whatever the value is', () => {
    // Ids were `${groupId}-${opt.value}`, so a value with a space, a slash or a
    // percent produced an id that htmlFor still matched but that no CSS or
    // querySelector could address — and two values differing only in whitespace
    // collided outright, leaving one label pointing at the other's input.
    render(
      <RadioGroup
        name="size"
        options={[
          { value: 'extra large', label: 'Extra large' },
          { value: 'extra  large', label: 'Extra  large' },
          { value: '50%', label: 'Half' },
        ]}
      />,
    )
    const ids = screen.getAllByRole('radio').map(el => el.id)
    expect(new Set(ids).size).toBe(3)
    for (const id of ids) {
      expect(id).toMatch(/^[A-Za-z0-9\-_:.]+$/)
      expect(document.querySelectorAll(`#${CSS.escape(id)}`)).toHaveLength(1)
    }
  })

  it('still labels each option after the id change', () => {
    render(
      <RadioGroup name="size" options={[{ value: 'a b', label: 'Spaced' }]} />,
    )
    // The point of an id here is htmlFor. If that broke, the label would stop
    // naming the radio and this would find nothing.
    expect(screen.getByRole('radio', { name: 'Spaced' })).toBeInTheDocument()
  })

  it('moves selection with the arrow keys, as its role promises', async () => {
    // The container claims role="radiogroup", and a radio group is expected to
    // move selection with the arrows and hold one tab stop. Nothing tested it:
    // this comes free from the native inputs sharing a name, and free is worth
    // asserting precisely because nobody wrote it.
    const onChange = vi.fn()
    render(<RadioGroup name="size" options={OPTIONS} defaultValue="sm" onChange={onChange} />)

    await userEvent.tab()
    expect(screen.getByRole('radio', { name: 'Small' })).toHaveFocus()

    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('radio', { name: 'Medium' })).toBeChecked()
    expect(onChange).toHaveBeenLastCalledWith('md', expect.objectContaining({ target: expect.anything() }))
  })

  it('is one tab stop, not three', async () => {
    render(
      <>
        <RadioGroup name="size" options={OPTIONS} defaultValue="sm" />
        <button type="button">after</button>
      </>,
    )
    await userEvent.tab()
    expect(screen.getByRole('radio', { name: 'Small' })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'after' })).toHaveFocus()
  })

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
    expect(onChange).toHaveBeenCalledWith('md', expect.objectContaining({ target: expect.anything() }))
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

  it('moves the drawn dot, not only the native input', async () => {
    // The regression this exists for. `toBeChecked()` reads the input, and the
    // browser updates that itself whatever the component does — so the two
    // assertions above passed for as long as the dot was stuck on defaultValue.
    // The dot is drawn by the `checked` class on the label, so that is what has
    // to be asserted for the visible control to be under test at all.
    const { container } = render(
      <RadioGroup name="size" options={OPTIONS} defaultValue="sm" />,
    )
    // Compared against the module's own export rather than the string
    // 'checked': CSS Modules hash the name, so a literal silently matches
    // nothing and the assertion passes for the wrong reason.
    const dotted = () =>
      [...container.querySelectorAll('label')]
        .filter(el => el.className.split(' ').includes(styles.checked))
        .map(el => el.textContent)

    expect(dotted()).toEqual(['Small'])
    await userEvent.click(screen.getByRole('radio', { name: 'Medium' }))
    expect(dotted()).toEqual(['Medium'])
  })

  it('does not manage its own state when controlled', async () => {
    const onChange = vi.fn()
    render(<RadioGroup name="size" options={OPTIONS} value="sm" onChange={onChange} />)
    await userEvent.click(screen.getByRole('radio', { name: 'Medium' }))
    expect(onChange).toHaveBeenCalledWith('md', expect.objectContaining({ target: expect.anything() }))
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
