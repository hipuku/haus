import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe } from 'vitest-axe'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('associates the label with the textarea', () => {
    render(<Textarea label="Notes" />)
    expect(screen.getByLabelText('Notes')).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('accepts multi-line input', async () => {
    render(<Textarea label="Notes" />)
    const field = screen.getByLabelText('Notes')
    await userEvent.type(field, 'first{Enter}second')
    expect(field).toHaveValue('first\nsecond')
  })

  it('points aria-describedby at the hint', () => {
    render(<Textarea label="Bio" hint="A sentence or two" />)
    expect(screen.getByLabelText('Bio').getAttribute('aria-describedby')).toContain(
      screen.getByText('A sentence or two').id,
    )
  })

  it('marks itself invalid and describes the error', () => {
    render(<Textarea label="Bio" error="Too long" />)
    const field = screen.getByLabelText('Bio')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field.getAttribute('aria-describedby')).toContain(screen.getByText('Too long').id)
  })

  it('does not accept input while disabled', async () => {
    render(<Textarea label="Notes" disabled />)
    const field = screen.getByLabelText('Notes')
    await userEvent.type(field, 'nope')
    expect(field).toBeDisabled()
    expect(field).toHaveValue('')
  })

  it('passes through native textarea attributes', () => {
    render(<Textarea label="Notes" rows={8} maxLength={280} />)
    const field = screen.getByLabelText('Notes')
    expect(field).toHaveAttribute('rows', '8')
    expect(field).toHaveAttribute('maxlength', '280')
  })

  it('forwards a ref to the underlying textarea', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<Textarea label="Ref" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Textarea label="Plain" />
        <Textarea label="With hint" hint="Optional" />
        <Textarea label="With error" error="Required" />
        <Textarea label="Disabled" disabled />
      </>,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})
