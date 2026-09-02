import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar } from 'haus-components'

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Initials from a name, an image when there is one, and a fallback ' +
          'glyph when there is neither. The colour is derived from the name, so ' +
          'the same person is the same colour everywhere without anyone storing ' +
          'a choice. Keeps `xs` and `xl` beyond the shared size scale: an avatar ' +
          'is a picture rather than a control, and a 16px one has a use a 16px ' +
          'button does not.',
      },
    },
  },
  argTypes: {
    name: { control: 'text', description: 'Drives the initials and the colour.' },
    src: { control: 'text', description: 'An image, which wins over initials.' },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    status: {
      control: 'inline-radio',
      options: [undefined, 'online', 'away', 'busy', 'offline'],
    },
  },
  args: { name: 'Ada Lovelace', size: 'md' },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--haus-space-3)', alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Avatar key={size} {...args} size={size} />
      ))}
    </div>
  ),
}

export const ColourFollowsTheName: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--haus-space-3)' }}>
      {['Ada Lovelace', 'Grace Hopper', 'Katherine Johnson', 'Radia Perlman'].map((name) => (
        <Avatar key={name} {...args} name={name} />
      ))}
    </div>
  ),
}

export const Statuses: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--haus-space-3)' }}>
      {(['online', 'away', 'busy', 'offline'] as const).map((status) => (
        <Avatar key={status} {...args} status={status} />
      ))}
    </div>
  ),
}

export const NoName: Story = {
  name: 'With no name at all',
  parameters: {
    docs: {
      description: {
        story: 'Renders the fallback glyph. It used to throw: `initials("")` indexed into nothing.',
      },
    },
  },
  args: { name: '' },
}
