import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toggle } from 'haus-components'
import { Item, MotionCompare, Row, Stack } from '../helpers'

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A switch, announced as one rather than as a checkbox. Two sizes, ' +
          'because two are what it has designs for. The shared scale is ' +
          '`sm md lg` and an `lg` that rendered at `md` would not be a size.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    description: { control: 'text', description: 'A description, not part of the name.' },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    labelPosition: { control: 'inline-radio', options: ['left', 'right'] },
    disabled: { control: 'boolean' },
  },
  args: { label: 'Notifications', size: 'md', labelPosition: 'left' },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const story = (text: string) => ({ docs: { description: { story: text } } })

export const Size: Story = {
  parameters: story('md is the default; sm sits in a dense settings list.'),
  render: args => (
    <Row>
      {(['sm', 'md'] as const).map(size => (
        <Item key={size} label={size}>
          <Toggle {...args} size={size} />
        </Item>
      ))}
    </Row>
  ),
}

export const States: Story = {
  parameters: {
    ...story('Every state side by side. Hover and focus are forced, so they can be reviewed without a pointer.'),
    pseudo: { hover: ['#state-hover label'], focusVisible: ['#state-focus input'] },
  },
  render: args => (
    <Row>
      <Item label="off">
        <Toggle {...args} />
      </Item>
      <Item label="hover">
        <Toggle {...args} id="state-hover" />
      </Item>
      <Item label="focus">
        <Toggle {...args} id="state-focus" />
      </Item>
      <Item label="on">
        <Toggle {...args} defaultChecked />
      </Item>
      <Item label="disabled">
        <Toggle {...args} disabled />
      </Item>
    </Row>
  ),
}

export const Motion: Story = {
  parameters: story(
    'Switch each one. Subtle eases the thumb across; expressive springs it and lets it settle at the far ' +
      'end; reduced jumps.',
  ),
  render: args => (
    <MotionCompare
      remount={false}
      render={(_mode, run) => <Toggle {...args} checked={run % 2 === 1} onChange={() => {}} />}
    />
  ),
}

export const Content: Story = {
  parameters: story('A description under the label, and the label on either side.'),
  render: args => (
    <Stack>
      <Item label="description">
        <Toggle {...args} description="Sends a push to every signed-in device." />
      </Item>
      <Item label="label right">
        <Toggle {...args} labelPosition="right" />
      </Item>
    </Stack>
  ),
}
