import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { axe } from 'vitest-axe'
import { Select } from './Select'

const options = [
  { value: 'author', label: 'Author', hint: 'Can propose and revise' },
  { value: 'maintainer', label: 'Maintainer', hint: 'Can also accept' },
  { value: 'viewer', label: 'Viewer' },
]

function Harness(props: Partial<React.ComponentProps<typeof Select>> = {}) {
  const [value, setValue] = React.useState('author')
  return (
    <Select
      options={options}
      value={value}
      onChange={setValue}
      label="Role"
      {...(props as Record<string, never>)}
    />
  )
}

const open = async () => {
  await userEvent.click(screen.getByRole('combobox'))
  return screen.getByRole('listbox')
}

describe('Select', () => {
  it('is a combobox that names itself, because its contents cannot', () => {
    render(<Harness />)
    expect(screen.getByRole('combobox', { name: 'Role' })).toBeInTheDocument()
  })

  it('shows the hint a native option cannot carry', async () => {
    render(<Harness />)
    await open()
    expect(screen.getByText('Can propose and revise')).toBeInTheDocument()
  })

  it('keeps focus on the trigger and points aria-activedescendant at the row', async () => {
    // The whole reason the options are <li role="option"> and not buttons: if
    // anything between the listbox and the option could hold focus, the
    // structure would be invalid.
    render(<Harness />)
    const trigger = screen.getByRole('combobox')
    await userEvent.click(trigger)
    expect(trigger).toHaveFocus()
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger).toHaveFocus()
    const active = trigger.getAttribute('aria-activedescendant')
    expect(active).toBeTruthy()
    expect(document.getElementById(active!)).toHaveAttribute('role', 'option')
  })

  it('commits with Enter and returns focus to the trigger', async () => {
    render(<Harness />)
    const trigger = screen.getByRole('combobox')
    await userEvent.click(trigger)
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(trigger).toHaveTextContent('Maintainer')
    expect(trigger).toHaveFocus()
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('opens on the current selection rather than the top of the list', async () => {
    render(<Harness />)
    const trigger = screen.getByRole('combobox')
    // Move to the third, commit, reopen.
    await userEvent.click(trigger)
    fireEvent.keyDown(trigger, { key: 'End' })
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(trigger).toHaveTextContent('Viewer')
    await userEvent.click(trigger)
    const active = document.getElementById(trigger.getAttribute('aria-activedescendant')!)
    expect(active).toHaveTextContent('Viewer')
  })

  it('jumps by typeahead', async () => {
    render(<Harness />)
    const trigger = screen.getByRole('combobox')
    await userEvent.click(trigger)
    fireEvent.keyDown(trigger, { key: 'v' })
    const active = document.getElementById(trigger.getAttribute('aria-activedescendant')!)
    expect(active).toHaveTextContent('Viewer')
  })

  it('marks the selected option, and only it', async () => {
    render(<Harness />)
    await open()
    const selected = screen.getAllByRole('option', { selected: true })
    expect(selected).toHaveLength(1)
    expect(selected[0]).toHaveTextContent('Author')
  })

  it('will not commit a disabled option', async () => {
    const onChange = vi.fn()
    render(
      <Select
        options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B', disabled: true }]}
        value="a"
        onChange={onChange}
        label="Pick"
      />,
    )
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByRole('option', { name: 'B' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('submits inside a plain form when given a name', () => {
    render(<Harness name="role" />)
    const hidden = document.querySelector('input[type="hidden"][name="role"]')
    expect(hidden).toHaveValue('author')
  })

  it('renders no hidden input without a name', () => {
    render(<Harness />)
    expect(document.querySelector('input[type="hidden"]')).toBeNull()
  })

  it('closes on Escape, which Popover owns', async () => {
    render(<Harness />)
    const trigger = screen.getByRole('combobox')
    await userEvent.click(trigger)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('reports expanded state', async () => {
    render(<Harness />)
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('has no axe violations, open', async () => {
    // The structural one that matters: role="option" has to be owned by the
    // listbox, and the <ul> in between is role="none" so it is not.
    const { container } = render(<Harness />)
    await open()
    expect((await axe(container)).violations).toEqual([])
  })
})
