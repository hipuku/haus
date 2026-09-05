import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Tooltip } from 'haus-components'

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

export const Playground: Story = {
  render: (args) => (
    <div style={{ margin: '60px 0' }}>
      <Tooltip {...args}>
        <Button>Copy</Button>
      </Tooltip>
    </div>
  ),
}

export const OnFocus: Story = {
  name: 'Reachable by keyboard',
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--haus-space-4)', margin: '60px 0' }}>
      <Button>Before</Button>
      <Tooltip {...args}><Button>Copy</Button></Tooltip>
      <Button>After</Button>
    </div>
  ),
}
