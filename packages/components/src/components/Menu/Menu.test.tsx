import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Menu, MenuItem, MenuLabel, MenuSeparator } from './Menu'

function Harness({ onRename = () => {} }: { onRename?: () => void }) {
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const [open, setOpen] = React.useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button ref={triggerRef} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        Options
      </button>
      <Menu open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} aria-label="Options">
        <MenuLabel>Signed in as Ada</MenuLabel>
        <MenuItem onSelect={onRename}>Rename</MenuItem>
        <MenuItem disabled>Archive</MenuItem>
        <MenuItem shortcut="⌘D">Duplicate</MenuItem>
        <MenuSeparator />
        <MenuItem tone="error">Delete</MenuItem>
      </Menu>
    </div>
  )
}

describe('Menu', () => {
  it('is a menu of menu items, named', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('button', { name: 'Options' }))
    expect(screen.getByRole('menu', { name: 'Options' })).toBeInTheDocument()
    expect(screen.getAllByRole('menuitem')).toHaveLength(4)
  })

  it('moves focus to the first item when it opens', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('button', { name: 'Options' }))
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveFocus()
  })

  it('moves with the arrows, skips disabled items, wraps, and jumps with Home and End', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Options' }))
    await user.keyboard('{ArrowDown}')
    // Archive is disabled, so the arrow lands on Duplicate.
    expect(screen.getByRole('menuitem', { name: /Duplicate/ })).toHaveFocus()
    await user.keyboard('{End}')
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus()
    await user.keyboard('{Home}')
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveFocus()
  })

  it('runs the item, closes, and returns focus to the trigger when an item is chosen', async () => {
    const onRename = vi.fn()
    const user = userEvent.setup()
    render(<Harness onRename={onRename} />)
    await user.click(screen.getByRole('button', { name: 'Options' }))
    await user.keyboard('{Enter}')
    expect(onRename).toHaveBeenCalledOnce()
    expect(screen.queryByRole('menu')).toBeNull()
    expect(screen.getByRole('button', { name: 'Options' })).toHaveFocus()
  })

  it('does nothing when a disabled item is clicked', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('button', { name: 'Options' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Archive' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('has no axe violations, open', async () => {
    const { container } = render(<Harness />)
    await userEvent.click(screen.getByRole('button', { name: 'Options' }))
    expect((await axe(container)).violations).toEqual([])
  })
})
