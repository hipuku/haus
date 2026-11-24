import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Input, Select } from 'haus-components'
import React from 'react'
import { Item, MotionCompare, Row, Stack } from '../helpers'

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A text field with its label, hint and error. The hint and the error ' +
          'are wired through `aria-describedby` in reading order, so they are a ' +
          'description rather than part of the name. `required` sets ' +
          '`aria-required` and not the native attribute: this component owns its ' +
          'error display, and the browser bubble would fight it.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text', description: 'Shown above the hint, with role="alert". The hint stays.' },
    prefix: { control: 'text' },
    suffix: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  args: { label: 'Email', placeholder: 'you@example.com' },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const story = (text: string) => ({ docs: { description: { story: text } } })
const HINT = 'We only use it to sign you in.'

export const States: Story = {
  parameters: {
    ...story('Every state side by side. Hover and focus are forced, so they can be reviewed without a pointer.'),
    pseudo: { hover: ['#state-hover [class*="inputWrap"]'], focusVisible: ['#state-focus input'] },
  },
  render: args => (
    <Row stretch>
      <Item label="rest">
        <Input {...args} />
      </Item>
      <Item label="hover">
        <Input {...args} id="state-hover" />
      </Item>
      <Item label="focus">
        <Input {...args} id="state-focus" />
      </Item>
      <Item label="filled">
        <Input {...args} defaultValue="you@example.com" />
      </Item>
      <Item label="error">
        <Input {...args} error="That address is not valid." />
      </Item>
      <Item label="disabled">
        <Input {...args} disabled defaultValue="you@example.com" />
      </Item>
    </Row>
  ),
}

export const Motion: Story = {
  parameters: story(
    'The error growing in. Subtle grows it with the border; expressive drops it in on a spring after the ' +
      'border turns, then draws the icon; reduced shows it at once.',
  ),
  render: args => <MotionCompare render={() => <Input {...args} hint={HINT} error="That address is not valid." />} />,
}

export const Content: Story = {
  parameters: story('A hint, the required mark, adornments, and a value longer than the field.'),
  render: args => (
    <Stack>
      <Item label="hint">
        <Input {...args} hint={HINT} />
      </Item>
      <Item label="required">
        <Input {...args} required />
      </Item>
      <Item label="prefix and suffix">
        <Input {...args} label="Budget" placeholder="0" prefix="£" suffix=".00" />
      </Item>
      <Item label="long value">
        <Input {...args} defaultValue="a.very.long.address.that.runs.past.the.end.of.the.field@example.com" />
      </Item>
    </Stack>
  ),
}

export const InContext: Story = {
  name: 'In context',
  parameters: story('A form row: an Input, a Select and an md Button share one height, label style and corner.'),
  render: function Form(args) {
    const [role, setRole] = React.useState('author')
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--haus-space-3)' }}>
        <Input {...args} />
        <Select
          label="Role"
          value={role}
          onChange={setRole}
          options={[
            { value: 'author', label: 'Author' },
            { value: 'viewer', label: 'Viewer' },
          ]}
        />
        <Button>Invite</Button>
      </div>
    )
  },
}

export const HintStays: Story = {
  name: 'The hint stays when an error appears',
  parameters: story(
    'The error sits above the hint and both describe the field, error first. The hint is what the user ' +
      'needed to get it right, so it is not taken away when they get it wrong.',
  ),
  args: { hint: HINT, error: 'That address is not valid.' },
}
