import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox } from 'haus-components'
import { Item, MotionCompare, Row, Stack } from '../helpers'

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Uncontrolled unless you pass `checked`. `onChange` hands back ' +
          '`(checked, event)`: the boolean because it is what you almost always ' +
          'want, the event because without it there was no way to read ' +
          '`event.target.name` in a form with many checkboxes.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    hint: { control: 'text', description: 'A description, not part of the name.' },
    error: { control: 'text' },
    indeterminate: { control: 'boolean', description: 'Has no attribute; set on the node.' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { label: 'Accept the terms' },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const story = (text: string) => ({ docs: { description: { story: text } } })

export const States: Story = {
  parameters: {
    ...story('Every state side by side. Hover and focus are forced, so they can be reviewed without a pointer.'),
    pseudo: { hover: ['#state-hover label'], focusVisible: ['#state-focus input'] },
  },
  render: args => (
    <Row>
      <Item label="unchecked">
        <Checkbox {...args} />
      </Item>
      <Item label="hover">
        <Checkbox {...args} id="state-hover" />
      </Item>
      <Item label="focus">
        <Checkbox {...args} id="state-focus" />
      </Item>
      <Item label="checked">
        <Checkbox {...args} defaultChecked />
      </Item>
      <Item label="indeterminate">
        <Checkbox {...args} indeterminate label="Select all" />
      </Item>
      <Item label="error">
        <Checkbox {...args} error="You have to accept to continue." />
      </Item>
      <Item label="disabled">
        <Checkbox {...args} disabled />
      </Item>
    </Row>
  ),
}

export const Motion: Story = {
  parameters: story(
    'Check each one. Subtle fills the box; expressive draws the tick on and springs the box back from the ' +
      'press; reduced changes colour only.',
  ),
  render: args => (
    <MotionCompare
      remount={false}
      render={(_mode, run) => <Checkbox {...args} checked={run % 2 === 1} onChange={() => {}} />}
    />
  ),
}

export const Content: Story = {
  parameters: story('A hint, a required mark, an error with its hint kept, and a label long enough to wrap.'),
  render: args => (
    <Stack>
      <Item label="hint">
        <Checkbox {...args} hint="You can withdraw at any time." />
      </Item>
      <Item label="required">
        <Checkbox {...args} required />
      </Item>
      <Item label="error, hint kept">
        <Checkbox {...args} hint="You can withdraw at any time." error="You have to accept to continue." />
      </Item>
      <Item label="long label">
        <Checkbox
          {...args}
          label="Send me a summary of every decision made in this workspace, once a week, on Monday morning"
        />
      </Item>
    </Stack>
  ),
}

export const HintOutsideLabel: Story = {
  name: 'The hint is a description, not part of the name',
  parameters: story(
    'The hint sits outside the `<label>`. Inside it, it became part of the accessible name: "Accept the ' +
      'terms You can withdraw at any time" as one string.',
  ),
  args: { hint: 'You can withdraw at any time.' },
}
