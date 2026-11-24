import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar } from 'haus-components'
import { Item, Row } from '../helpers'

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Initials from a name, and a fallback glyph when there is none. ' +
          'The colour is derived from the name, so ' +
          'the same person is the same colour everywhere without anyone storing ' +
          'a choice. Keeps `xs` and `xl` beyond the shared size scale: an avatar ' +
          'is a picture rather than a control, and a 16px one has a use a 16px ' +
          'button does not.',
      },
    },
  },
  argTypes: {
    name: { control: 'text', description: 'Drives the initials and the colour.' },
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

const story = (text: string) => ({ docs: { description: { story: text } } })

export const Size: Story = {
  parameters: story('Five sizes, 24 to 64px. The initials are centred on the circle at every size.'),
  render: args => (
    <Row>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => (
        <Item key={size} label={size}>
          <Avatar {...args} size={size} />
        </Item>
      ))}
    </Row>
  ),
}

export const Status: Story = {
  parameters: story('The status dot sits outside the clipped circle, so it is never cut off.'),
  render: args => (
    <Row>
      {(['online', 'away', 'busy', 'offline'] as const).map(status => (
        <Item key={status} label={status}>
          <Avatar {...args} status={status} />
        </Item>
      ))}
    </Row>
  ),
}

export const Content: Story = {
  parameters: story(
    'The colour follows the name, so one person is one colour everywhere; with no name, a fallback glyph.',
  ),
  render: args => (
    <Row>
      {['Ada Lovelace', 'Grace Hopper', 'Katherine Johnson', 'Radia Perlman'].map(name => (
        <Item key={name} label={name}>
          <Avatar {...args} name={name} />
        </Item>
      ))}
      <Item label="no name">
        <Avatar {...args} name="" />
      </Item>
    </Row>
  ),
}
