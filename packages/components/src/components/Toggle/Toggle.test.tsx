import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Toggle } from './Toggle'

describe('Toggle', () => {
  it('toggles with the keyboard, not only the mouse', async () => {
    // Every interaction test in this package used userEvent.click. A switch that
    // works on click and not on Space is operable by exactly half its users, and
    // clicking a <label> reaches the input by a different route than focusing it
    // and pressing a key — so the click tests could not have caught it.
    const onChange = vi.fn()
    render(<Toggle label="Notifications" onChange={onChange} />)
    const toggle = screen.getByRole('switch')

    await userEvent.tab()
    expect(toggle).toHaveFocus()

    await userEvent.keyboard(' ')
    expect(onChange).toHaveBeenLastCalledWith(true, expect.objectContaining({ target: expect.anything() }))
    expect(toggle).toBeChecked()

    await userEvent.keyboard(' ')
    expect(onChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ target: expect.anything() }))
    expect(toggle).not.toBeChecked()
  })

  it('keeps the description out of the name', async () => {
    // Every assertion below used to match the name with a regex, because the
    // label element wraps both spans and its whole text was the name: the
    // control announced as "Notifications Sends a push to your devices" and no
    // description at all.
    render(<Toggle label="Notifications" description="Sends a push to your devices" />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveAccessibleName('Notifications')
    expect(toggle).toHaveAccessibleDescription('Sends a push to your devices')
  })

  it('exposes itself as a switch, not a checkbox', () => {
    // The visual affordance is a switch; the role has to match or assistive
    // technology announces the wrong control and the wrong state wording.
    render(<Toggle label="Notifications" />)
    expect(screen.getByRole('switch', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('toggles when uncontrolled', async () => {
    render(<Toggle label="Notifications" />)
    const toggle = screen.getByRole('switch', { name: 'Notifications' })
    expect(toggle).not.toBeChecked()
    await userEvent.click(toggle)
    expect(toggle).toBeChecked()
  })

  it('reports the new value to onChange', async () => {
    const onChange = vi.fn()
    render(<Toggle label="Notifications" onChange={onChange} />)
    await userEvent.click(screen.getByRole('switch', { name: 'Notifications' }))
    expect(onChange).toHaveBeenCalledWith(true, expect.objectContaining({ target: expect.anything() }))
  })

  it('honours defaultChecked', () => {
    render(<Toggle label="On by default" defaultChecked />)
    expect(screen.getByRole('switch', { name: /On by default/ })).toBeChecked()
  })

  it('does not manage its own state when controlled', async () => {
    const onChange = vi.fn()
    render(<Toggle label="Locked on" checked onChange={onChange} />)
    const toggle = screen.getByRole('switch', { name: /Locked on/ })
    await userEvent.click(toggle)
    expect(onChange).toHaveBeenCalledWith(false, expect.objectContaining({ target: expect.anything() }))
    expect(toggle).toBeChecked()
  })

  it('does not toggle while disabled', async () => {
    const onChange = vi.fn()
    render(<Toggle label="Disabled" disabled onChange={onChange} />)
    await userEvent.click(screen.getByRole('switch', { name: /Disabled/ }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders a description alongside the label', () => {
    render(<Toggle label="Email" description="Weekly digest only" />)
    expect(screen.getByText('Weekly digest only')).toBeInTheDocument()
  })

  it('applies size and label-position classes', () => {
    const { container } = render(<Toggle label="Small" size="sm" labelPosition="right" />)
    const wrapper = container.querySelector('label')!
    expect(wrapper.className).toContain('sm')
    expect(wrapper.className).toContain('labelRight')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Toggle label="Plain" />
        <Toggle label="With description" description="Extra context" />
        <Toggle label="Checked" defaultChecked />
        <Toggle label="Disabled" disabled />
      </>,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})
