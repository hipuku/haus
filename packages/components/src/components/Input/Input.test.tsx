import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe } from 'vitest-axe'
import { Input } from './Input'

describe('Input', () => {
  it('associates the label with the input without needing an explicit id', () => {
    // The generated id is what makes clicking the label focus the field. If the
    // association breaks, the component still looks correct and is unusable
    // with a screen reader.
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInstanceOf(HTMLInputElement)
  })

  it('respects an explicit id when one is given', () => {
    render(<Input label="Email" id="signup-email" />)
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'signup-email')
  })

  it('survives gaining an id between renders', () => {
    // Regression: the id was once `id ?? React.useId()`, which short-circuits
    // and skips the hook whenever an id is passed. A parent that renders this
    // component without an id and then with one changes the hook count, and
    // React throws "Rendered more hooks than during the previous render".
    // useId is now called unconditionally; this pins that.
    const { rerender } = render(<Input label="Email" />)
    expect(() => rerender(<Input label="Email" id="now-explicit" />)).not.toThrow()
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'now-explicit')
  })

  it('points aria-describedby at the hint', () => {
    render(<Input label="Password" hint="At least 12 characters" />)
    const input = screen.getByLabelText('Password')
    const hint = screen.getByText('At least 12 characters')
    expect(input.getAttribute('aria-describedby')).toContain(hint.id)
  })

  it('marks itself invalid and describes the error when one is present', () => {
    render(<Input label="Email" error="That address is already in use" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input.getAttribute('aria-describedby')).toContain(
      screen.getByText('That address is already in use').id,
    )
  })

  it('is not marked invalid when there is no error', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid', 'true')
  })

  it('accepts typed input and forwards the change', async () => {
    const onChange = vi.fn()
    render(<Input label="Name" onChange={onChange} />)
    await userEvent.type(screen.getByLabelText('Name'), 'Ada')
    expect(screen.getByLabelText('Name')).toHaveValue('Ada')
    expect(onChange).toHaveBeenCalled()
  })

  it('does not accept input while disabled', async () => {
    render(<Input label="Name" disabled />)
    const input = screen.getByLabelText('Name')
    await userEvent.type(input, 'Ada')
    expect(input).toBeDisabled()
    expect(input).toHaveValue('')
  })

  it('renders prefix and suffix content', () => {
    render(<Input label="Amount" prefix={<span>£</span>} suffix={<span>.00</span>} />)
    expect(screen.getByText('£')).toBeInTheDocument()
    expect(screen.getByText('.00')).toBeInTheDocument()
  })

  it('forwards a ref to the underlying input', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input label="Ref" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('has no axe violations, with or without an error', async () => {
    const { container } = render(
      <>
        <Input label="Email" hint="We never share this" />
        <Input label="Password" error="Too short" />
        <Input label="Disabled" disabled />
      </>,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})
