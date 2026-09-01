import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('keeps the hint out of the name', () => {
    // The hint used to render inside the <label>, so it was read as part of the
    // name: "Accept terms Read them first" as one string, with nothing left to
    // be a description. aria-describedby pointed only at the error.
    render(<Checkbox label="Accept terms" hint="Read them first" />)
    const box = screen.getByRole('checkbox')
    expect(box).toHaveAccessibleName('Accept terms')
    expect(box).toHaveAccessibleDescription('Read them first')
  })

  it('describes with the hint and the error together, in reading order', () => {
    render(<Checkbox label="Accept terms" hint="Read them first" error="Required" />)
    // The hint is hidden while an error shows, so the description is the error.
    expect(screen.getByRole('checkbox')).toHaveAccessibleDescription('Required')
  })

  it('associates its label with the input', () => {
    render(<Checkbox label="Remember me" />)
    expect(screen.getByRole('checkbox', { name: /Remember me/ })).toBeInTheDocument()
  })

  it('toggles when uncontrolled', async () => {
    render(<Checkbox label="Subscribe" />)
    const box = screen.getByRole('checkbox', { name: /Subscribe/ })
    expect(box).not.toBeChecked()
    await userEvent.click(box)
    expect(box).toBeChecked()
  })

  it('reports the new value to onChange', async () => {
    const onChange = vi.fn()
    render(<Checkbox label="Subscribe" onChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /Subscribe/ }))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('stays put when controlled and the parent does not update', async () => {
    // A controlled checkbox must not manage its own state. If it does, the UI
    // and the parent's value silently disagree.
    const onChange = vi.fn()
    render(<Checkbox label="Locked" checked={false} onChange={onChange} />)
    const box = screen.getByRole('checkbox', { name: /Locked/ })
    await userEvent.click(box)
    expect(onChange).toHaveBeenCalledWith(true)
    expect(box).not.toBeChecked()
  })

  it('sets the indeterminate DOM property, which has no HTML attribute', () => {
    // indeterminate cannot be expressed in markup; it must be assigned to the
    // element, so this is the only way to catch a regression in that effect.
    render(<Checkbox label="Some selected" indeterminate />)
    const box = screen.getByRole('checkbox', { name: /Some selected/ }) as HTMLInputElement
    expect(box.indeterminate).toBe(true)
  })

  it('marks itself invalid and announces the error', () => {
    render(<Checkbox label="Terms" error="You must accept the terms" />)
    const box = screen.getByRole('checkbox', { name: /Terms/ })
    expect(box).toHaveAttribute('aria-invalid', 'true')
    const error = screen.getByRole('alert')
    expect(error).toHaveTextContent('You must accept the terms')
    expect(box.getAttribute('aria-describedby')).toBe(error.id)
  })

  it('hides the hint when an error replaces it', () => {
    render(<Checkbox label="Terms" hint="Read them first" error="Required" />)
    expect(screen.queryByText('Read them first')).not.toBeInTheDocument()
  })

  it('does not toggle while disabled', async () => {
    const onChange = vi.fn()
    render(<Checkbox label="Disabled" disabled onChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /Disabled/ }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Checkbox label="Plain" />
        <Checkbox label="With hint" hint="Optional" />
        <Checkbox label="With error" error="Required" />
        <Checkbox label="Disabled" disabled />
      </>,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})
