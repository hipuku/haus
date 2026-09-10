import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Popover } from 'haus-components'

const meta = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A floating panel anchored to a trigger. The primitive several other ' +
          'things are built on: haus\'s own `Select` panel is one, and so are the ' +
          'product menus a native popup could never theme.\n\n' +
          '`triggerRef` is required, and that is the point. vault\'s version leaves ' +
          'focus to the caller and none of its six call sites does it, so Escape ' +
          'drops focus onto `<body>` and the next Tab starts at the top of the ' +
          'document. WCAG 2.4.3, invisible to axe.\n\n' +
          'Not a focus trap. A modal is modal and the page behind it is inert; a ' +
          'popover sits over live content, so tabbing off the end closes it. There ' +
          'is no collision detection either: that needs a positioning engine, and ' +
          'this package declares `haus-tokens` and the two React peers and nothing ' +
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

export const Playground: Story = {
  render: function Render(args) {
    const triggerRef = useRef<HTMLButtonElement>(null)
    const [open, setOpen] = useState(false)
    return (
      <div style={{ position: 'relative', display: 'inline-block', margin: '80px 0' }}>
        <Button ref={triggerRef} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          Options
        </Button>
        <Popover
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          triggerRef={triggerRef}
          aria-label="Options"
        >
          <div style={{ display: 'grid', gap: 'var(--haus-space-1)', minWidth: 160 }}>
            <Button variant="ghost" size="sm">Rename</Button>
            <Button variant="ghost" size="sm" tone="error">Delete</Button>
          </div>
        </Popover>
      </div>
    )
  },
}
