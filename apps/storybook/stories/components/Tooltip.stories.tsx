import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Tooltip } from 'haus-components'
import { Item, MotionCompare, Row } from '../helpers'

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A short description attached to a control. The least-used of the six ' +
          'promotions and the easiest to get wrong.\n\n' +
          'WCAG 1.4.13 in full: dismissible with Escape without moving focus, ' +
          'hoverable so the pointer can reach the bubble, and persistent with no ' +
          'timeout. Plus the part that is not WCAG and is the most common bug: it ' +
          'appears on **focus** as well as hover. Tab to the button below rather ' +
          'than hovering it.\n\n' +
          '**A tooltip is not a Popover.** If it takes focus, holds a link, or runs ' +
          'past a line, it is a Popover: `content` is typed `string` so that stays ' +
          'true rather than being a convention. And it must never be the only place ' +
          'a piece of information lives: touch users have no hover.',
      },
    },
  },
  argTypes: {
    placement: { control: 'inline-radio', options: ['top', 'bottom'] },
    delay: { control: { type: 'number', min: 0, step: 100 } },
  },
  args: { content: 'Copies the hex value to the clipboard', placement: 'top', delay: 0 },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

const story = (text: string) => ({ docs: { description: { story: text } } })
const frame = { padding: 'var(--haus-space-12) var(--haus-space-4)' }

export const Playground: Story = {
  render: args => (
    <div style={frame}>
      <Tooltip {...args}>
        <Button>Copy</Button>
      </Tooltip>
    </div>
  ),
}

export const Placement: Story = {
  parameters: story('Hover or focus each. `top` by default; `bottom` for a trigger at the top of the viewport.'),
  render: args => (
    <Row>
      {(['top', 'bottom'] as const).map(placement => (
        <Item key={placement} label={placement}>
          <div style={frame}>
            <Tooltip {...args} placement={placement}>
              <Button variant="secondary">Copy</Button>
            </Tooltip>
          </div>
        </Item>
      ))}
    </Row>
  ),
}

export const Motion: Story = {
  parameters: story(
    'Hover each. Subtle fades in and drifts 4px from the trigger; expressive springs 16px; reduced fades. It ' +
      'leaves at once, so it never covers what the pointer moved on to.',
  ),
  render: args => (
    <MotionCompare
      hint="Hover over or tab to each button to compare the tooltip."
      replay={false}
      render={() => (
        <div style={frame}>
          <Tooltip {...args}>
            <Button variant="secondary">Copy</Button>
          </Tooltip>
        </div>
      )}
    />
  ),
}

export const Content: Story = {
  parameters: story('A long tooltip wraps at the tooltip width rather than running across the page.'),
  render: args => (
    <div style={frame}>
      <Tooltip
        {...args}
        content="Copies the value in the format the export settings name, which is hex unless the workspace changed it"
      >
        <Button variant="secondary">Copy</Button>
      </Tooltip>
    </div>
  ),
}

export const OnFocus: Story = {
  name: 'Reachable by keyboard',
  parameters: story('Tab to Copy: the tooltip shows on focus with no delay, and Escape dismisses it.'),
  render: args => (
    <div style={{ ...frame, display: 'flex', gap: 'var(--haus-space-4)' }}>
      <Button>Before</Button>
      <Tooltip {...args}>
        <Button>Copy</Button>
      </Tooltip>
      <Button>After</Button>
    </div>
  ),
}
