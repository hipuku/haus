import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select } from 'haus-components'
import React from 'react'
import { Item, MotionCompare, Row, Stack } from '../helpers'

const roles = [
  { value: 'author', label: 'Author', hint: 'Can propose and revise' },
  { value: 'maintainer', label: 'Maintainer', hint: 'Can also accept, reject, supersede' },
  { value: 'viewer', label: 'Viewer', hint: 'Read only' },
]

const plain = [
  { value: 'a', label: 'Ascending' },
  { value: 'd', label: 'Descending' },
  { value: 'n', label: 'Unsorted', disabled: true },
]

function Controlled(props: Partial<React.ComponentProps<typeof Select>>) {
  const [value, setValue] = React.useState('author')
  return <Select options={roles} value={value} onChange={setValue} label="Role" {...(props as Record<string, never>)} />
}

const meta = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'haus draws this Select: a trigger, and a panel of options. ' +
          '\n\n' +
          '**It was `Listbox` until decision 0025**, where the native `<select>` ' +
          'it replaces was retired. Measured across core, drift and vault, ' +
          'nothing imported the native one, while two products built this and ' +
          'wrote down the same reason. core: *"a styled listbox standing in for ' +
          '`<select>`, whose native popup can\'t be themed"*. vault: *"a custom ' +
          'dropdown replacing native `<select>`"*. ' +
          '\n\n' +
          '**The hint is the whole argument.** An option carries a second line ' +
          'under its label, which a native `<option>` cannot hold because the ' +
          'operating system draws it. ' +
          '\n\n' +
          'Focus stays on the trigger for the entire interaction and the ' +
          'highlighted row is announced through `aria-activedescendant`. That is ' +
          'what lets the options be plain `<li role="option">`: `role="option"` ' +
          'must be owned by the listbox, so anything focusable in between makes ' +
          'the structure invalid. Dismissal composes `Popover`, which already ' +
          'owns outside-click and Escape and is deliberately not a focus trap.',
      },
    },
  },
  argTypes: {
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  args: { options: roles, value: 'author', onChange: () => {}, label: 'Role' },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { render: () => <Controlled /> }

const story = (text: string) => ({ docs: { description: { story: text } } })
const HINT = 'Who can accept a decision in this workspace'

export const States: Story = {
  parameters: {
    ...story(
      'Every state side by side. Hover and focus are forced, so they can be reviewed without a pointer. Open ' +
        'is the Motion story.',
    ),
    pseudo: { hover: ['#state-hover button'], focusVisible: ['#state-focus button'] },
  },
  render: () => (
    <Row stretch still>
      <Item label="rest">
        <Controlled />
      </Item>
      <Item label="hover">
        <Controlled id="state-hover" />
      </Item>
      <Item label="focus">
        <Controlled id="state-focus" />
      </Item>
      <Item label="placeholder">
        <Controlled value="" />
      </Item>
      <Item label="error">
        <Controlled error="Pick a role for this member" />
      </Item>
      <Item label="disabled">
        <Controlled disabled />
      </Item>
    </Row>
  ),
}

export const Motion: Story = {
  parameters: story(
    'Open each one and move through the options. Subtle: the panel drops in and the highlight jumps. ' +
      'Expressive: the panel grows from the field on a spring, the options stagger in, the highlight slides ' +
      'between rows, the chevron turns on a spring and the check draws. Reduced: a short fade. Replay restarts ' +
      'the error growing in.',
  ),
  render: () => <MotionCompare render={() => <Controlled hint={HINT} error="Pick a role for this member" />} />,
}

export const Content: Story = {
  parameters: story(
    'Options with a second line, which a native select cannot draw; plain options with one disabled, which ' +
      'the keyboard skips; and a hint under the field.',
  ),
  render: () => {
    function Plain() {
      const [value, setValue] = React.useState('a')
      return <Select options={plain} value={value} onChange={setValue} label="Sort" />
    }
    return (
      <Stack>
        <Item label="options with hints">
          <Controlled />
        </Item>
        <Item label="plain options, one disabled">
          <Plain />
        </Item>
        <Item label="field hint">
          <Controlled hint={HINT} />
        </Item>
      </Stack>
    )
  },
}

export const SubmitsInAForm: Story = {
  name: 'Submits in a plain form',
  parameters: story(
    '`name` renders a hidden input, so the control submits inside a plain `<form action>` with no ' +
      'JavaScript wiring. Omit it for a purely controlled use.',
  ),
  render: () => <Controlled name="role" />,
}
