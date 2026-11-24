import React, { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Popover } from 'haus-components'
import { MotionCompare } from '../helpers'

const meta = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A floating panel anchored to a trigger. The primitive several other ' +
          "things are built on: haus's own `Select` panel is one, and so are the " +
          'product menus a native popup could never theme.\n\n' +
          "`triggerRef` is required, and that is the point. vault's version leaves " +
          'focus to the caller and none of its six call sites does it, so Escape ' +
          'drops focus onto `<body>` and the next Tab starts at the top of the ' +
          'document. WCAG 2.4.3, invisible to axe.\n\n' +
          'Not a focus trap. A modal is modal and the page behind it is inert; a ' +
          'popover sits over live content, so tabbing off the end closes it. There ' +
          'is no collision detection either: that needs a positioning engine, and ' +
          'this package declares `@hipuku/tokens` and the two React peers and nothing ' +
          'else.',
      },
    },
  },
  argTypes: {
    align: { control: 'inline-radio', options: ['start', 'end', 'stretch'] },
    placement: { control: 'inline-radio', options: ['bottom', 'top'] },
    width: { control: 'inline-radio', options: ['auto', 'trigger', 'sm', 'md', 'lg', 'xl'] },
    role: { control: 'inline-radio', options: ['dialog', 'menu', 'listbox', 'group'] },
  },
  args: { align: 'start', placement: 'bottom', width: 'auto', role: 'dialog' },
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

function Menu(args: Partial<React.ComponentProps<typeof Popover>> & { defaultOpen?: boolean }) {
  const { defaultOpen = false, ...rest } = args
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Button ref={triggerRef} aria-expanded={open} onClick={() => setOpen(o => !o)}>
        Options
      </Button>
      <Popover
        {...(rest as Record<string, never>)}
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        aria-label="Options"
      >
        <div style={{ display: 'grid', gap: 'var(--haus-space-1)', minWidth: 160 }}>
          <Button variant="ghost" size="sm">
            Rename
          </Button>
          <Button variant="ghost" size="sm" tone="error">
            Delete
          </Button>
        </div>
      </Popover>
    </div>
  )
}

const story = (text: string) => ({ docs: { description: { story: text } } })

export const Playground: Story = {
  render: args => (
    <div style={{ margin: 'var(--haus-space-16) 0' }}>
      <Menu {...args} />
    </div>
  ),
}

export const Motion: Story = {
  parameters: story(
    'Open each one, or Replay to see the enter. Subtle is quick with a few pixels of travel; expressive is ' +
      'longer and travels further; reduced is a short fade. Closing runs the exit before the panel leaves.',
  ),
  render: args => (
    <div style={{ minBlockSize: '10rem' }}>
      <MotionCompare render={() => <Menu {...args} defaultOpen />} />
    </div>
  ),
}

export const EscapeReturnsFocus: Story = {
  name: 'Escape returns focus to the trigger',
  parameters: story(
    'Open it, Tab into the panel, press Escape: focus goes back to Options, not to the page. Tabbing past the ' +
      'last item closes it instead of trapping focus.',
  ),
  render: args => (
    <div style={{ margin: 'var(--haus-space-16) 0' }}>
      <Menu {...args} />
    </div>
  ),
}
