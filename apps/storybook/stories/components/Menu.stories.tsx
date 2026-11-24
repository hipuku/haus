import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Menu, MenuItem, MenuLabel, MenuSeparator } from 'haus-components'
import React, { useRef, useState } from 'react'
import { MotionCompare, STILL_CSS } from '../helpers'

const meta = {
  title: 'Components/Menu',
  component: Menu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A list of actions opened from a trigger. Three products drew their own (vault, core and maple). ' +
          'It is a `Popover` with `role="menu"`, so placement, dismissal and motion are Popover\'s; it adds ' +
          'the menu pattern: focus moves to the first item on open, the arrows move between items and skip ' +
          'disabled ones, and choosing an item closes the menu and returns focus to the trigger.',
      },
    },
  },
  args: { open: false, onClose: () => {}, triggerRef: { current: null }, 'aria-label': 'Options', children: null },
} satisfies Meta<typeof Menu>

export default meta
type Story = StoryObj<typeof meta>

const story = (text: string) => ({ docs: { description: { story: text } } })

const Glyph = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const PENCIL = 'M10.5 3.5l2 2L6 12H4v-2l6.5-6.5Z'
const COPY = 'M5.5 5.5V3.5h7v7h-2M3.5 5.5h7v7h-7z'
const TRASH = 'M3.5 4.5h9M6.5 4.5v-1h3v1M5 4.5l.5 8h5l.5-8'

/**
 * A trigger and its menu. The frame leaves room around the trigger so an
 * open menu stays on the canvas: Popover has no collision detection.
 */
function Demo({
  defaultOpen = false,
  align,
  step,
  children,
}: {
  defaultOpen?: boolean
  align?: 'start' | 'end'
  step?: number
  children?: React.ReactNode
}) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(defaultOpen)
  React.useEffect(() => {
    if (step) setOpen(o => !o)
  }, [step])
  return (
    <div style={{ padding: 'var(--haus-space-4) var(--haus-space-4) calc(var(--haus-space-20) * 2.5)' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Button
          ref={triggerRef}
          variant="secondary"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          Options
        </Button>
        <Menu open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} aria-label="Options" align={align}>
          {children ?? (
            <>
              <MenuItem icon={<Glyph d={PENCIL} />} shortcut="R">
                Rename
              </MenuItem>
              <MenuItem icon={<Glyph d={COPY} />} shortcut="⌘D">
                Duplicate
              </MenuItem>
              <MenuItem disabled>Move to another workspace</MenuItem>
              <MenuSeparator />
              <MenuItem icon={<Glyph d={TRASH} />} tone="error">
                Delete
              </MenuItem>
            </>
          )}
        </Menu>
      </div>
    </div>
  )
}

export const Playground: Story = { render: () => <Demo /> }

export const Content: Story = {
  parameters: story(
    'Items with an icon and a shortcut, a disabled item (skipped by the arrows, still announced), a ' +
      'separator, and a destructive item. One menu is open at a time: focus moves into a menu when it opens, ' +
      'and a menu closes when focus leaves it.',
  ),
  render: () => <Demo defaultOpen />,
}

export const InContext: Story = {
  name: 'In context',
  parameters: story('An account menu at the end of a top bar: aligned to the end, opening with who is signed in.'),
  render: () => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', minInlineSize: '24rem' }}>
      <Demo defaultOpen align="end">
        <MenuLabel>Signed in as ada@example.com</MenuLabel>
        <MenuSeparator />
        <MenuItem>Workspace settings</MenuItem>
        <MenuItem>Keyboard shortcuts</MenuItem>
        <MenuSeparator />
        <MenuItem>Sign out</MenuItem>
      </Demo>
    </div>
  ),
}

export const States: Story = {
  parameters: {
    ...story('An item at rest, hovered or focused (one highlight for both), pressed, disabled, and destructive.'),
    pseudo: { hover: ['#state-hover'], active: ['#state-pressed'], focusVisible: ['#state-error'] },
  },
  render: () => (
    <div inert data-story-still style={{ pointerEvents: 'none' }}>
      <style>{STILL_CSS}</style>
      <Demo defaultOpen>
        <MenuItem>Rest</MenuItem>
        <MenuItem id="state-hover">Hover</MenuItem>
        <MenuItem id="state-pressed">Pressed</MenuItem>
        <MenuItem disabled>Disabled</MenuItem>
        <MenuItem id="state-error" tone="error">
          Destructive, focused
        </MenuItem>
      </Demo>
    </div>
  ),
}

export const Motion: Story = {
  parameters: story(
    'Replay opens and closes each menu. Subtle drops the panel in with its items; expressive grows it from ' +
      'the trigger on a spring and brings the items in one after another; reduced fades.',
  ),
  render: () => (
    <MotionCompare
      hint="Replay opens and closes each menu, or open one yourself."
      remount={false}
      render={(_mode, run) => <Demo step={run} />}
    />
  ),
}

export const Keyboard: Story = {
  name: 'Arrows move, Escape returns focus',
  parameters: story(
    'Open with Enter, move with the arrows (Home and End jump), choose with Enter, or press Escape: focus ' +
      'goes back to Options every time.',
  ),
  render: () => <Demo />,
}
