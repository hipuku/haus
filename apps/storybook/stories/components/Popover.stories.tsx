import React, { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Input, Popover } from 'haus-components'
import { Item, MotionCompare, Row } from '../helpers'

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
  },
  args: { align: 'start', placement: 'bottom', width: 'auto' },
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

type PanelProps = Partial<React.ComponentProps<typeof Popover>> & { defaultOpen?: boolean; content?: 'menu' | 'form' }

/**
 * A trigger and its panel. The frame leaves room on every side, so a panel
 * aligned to the end or placed on top stays on the canvas: Popover has no
 * collision detection, by design, so a panel with no room is clipped.
 */
function Panel({ defaultOpen = false, content = 'menu', ...rest }: PanelProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ padding: 'calc(var(--haus-space-20) * 2) var(--haus-space-12)' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Button ref={triggerRef} variant="secondary" aria-expanded={open} onClick={() => setOpen(o => !o)}>
          Options
        </Button>
        <Popover
          {...(rest as Record<string, never>)}
          role={content === 'form' ? 'dialog' : 'menu'}
          open={open}
          onClose={() => setOpen(false)}
          triggerRef={triggerRef}
          aria-label="Options"
        >
          {content === 'form' ? (
            <div style={{ display: 'grid', gap: 'var(--haus-space-3)', padding: 'var(--haus-space-2)' }}>
              <Input label="Name" defaultValue="Quarterly plan" />
              <Button size="sm">Rename</Button>
            </div>
          ) : (
            <div style={{ display: 'grid' }}>
              {/* haus has no menu item yet, so these are ghost Buttons set to
                  start-align: a Menu is a proposed component (4.5 audit). */}
              {['Rename', 'Duplicate', 'Move to…'].map(label => (
                <Button key={label} role="menuitem" variant="ghost" size="sm" style={{ justifyContent: 'flex-start' }}>
                  {label}
                </Button>
              ))}
            </div>
          )}
        </Popover>
      </div>
    </div>
  )
}

const story = (text: string) => ({ docs: { description: { story: text } } })

export const Playground: Story = {
  render: args => <Panel {...args} />,
}

export const Placement: Story = {
  parameters: story(
    'Which side of the trigger the panel opens on. `top` is for a trigger near the bottom of the viewport.',
  ),
  render: args => (
    <Row>
      <Item label="bottom">
        <Panel {...args} placement="bottom" defaultOpen />
      </Item>
      <Item label="top">
        <Panel {...args} placement="top" defaultOpen />
      </Item>
    </Row>
  ),
}

export const Align: Story = {
  parameters: story(
    'Which edge of the trigger the panel lines up with. `end` suits a trigger at the right of a toolbar; ' +
      "`stretch` matches the trigger's width.",
  ),
  render: args => (
    <Row>
      {(['start', 'end', 'stretch'] as const).map(align => (
        <Item key={align} label={align}>
          <Panel {...args} align={align} defaultOpen />
        </Item>
      ))}
    </Row>
  ),
}

export const Width: Story = {
  parameters: story(
    '`auto` fits the content and suits a menu; `trigger` matches the trigger; the four fixed widths are for ' +
      'panels that hold a form.',
  ),
  render: args => (
    <Row>
      {(['auto', 'trigger', 'sm', 'md'] as const).map(width => (
        <Item key={width} label={width}>
          <Panel
            {...args}
            width={width}
            content={width === 'auto' || width === 'trigger' ? 'menu' : 'form'}
            defaultOpen
          />
        </Item>
      ))}
    </Row>
  ),
}

export const Role: Story = {
  parameters: story(
    'What the panel is. `menu` holds actions; `dialog` holds anything else, such as a small form. The role ' +
      'is announced, so a panel that claims `menu` and holds a form misleads a screen reader.',
  ),
  render: args => (
    <Row>
      <Item label="menu">
        <Panel {...args} content="menu" defaultOpen />
      </Item>
      <Item label="dialog">
        <Panel {...args} content="form" width="sm" defaultOpen />
      </Item>
    </Row>
  ),
}

export const Motion: Story = {
  parameters: story(
    'Replay to see the enter. Subtle drops 4px in 150ms; expressive grows out of the trigger on a spring, ' +
      '16px from 0.9 scale; reduced is a short fade. Closing runs the exit before the panel leaves.',
  ),
  render: args => <MotionCompare render={() => <Panel {...args} defaultOpen />} />,
}

export const EscapeReturnsFocus: Story = {
  name: 'Escape returns focus to the trigger',
  parameters: story(
    'Open it, Tab into the panel, press Escape: focus goes back to Options, not to the page. Tabbing past the ' +
      'last item closes it instead of trapping focus.',
  ),
  render: args => <Panel {...args} />,
}
