import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select } from 'haus-components'
import React from 'react'

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
  return (
    <Select
      options={roles}
      value={value}
      onChange={setValue}
      label="Role"
      {...(props as Record<string, never>)}
    />
  )
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
          'it replaces was retired. Measured across core, drift, vault and loom, ' +
          'nothing imported the native one, while two products built this and ' +
          'wrote down the same reason. core: *"a styled listbox standing in for ' +
          "`<select>`, whose native popup can't be themed\"*. vault: *\"a custom " +
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
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  args: { options: roles, value: 'author', onChange: () => {}, label: 'Role', size: 'md' },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { render: () => <Controlled /> }

export const WithHints: Story = {
  render: () => <Controlled />,
  parameters: {
    docs: {
      description: {
        story:
          'Open it. Each row carries a label and a hint, which is the case a ' +
          'native select cannot draw and the reason this component exists.',
      },
    },
  },
}

export const LabelOnly: Story = {
  render: () => {
    function Plain() {
      const [value, setValue] = React.useState('a')
      return <Select options={plain} value={value} onChange={setValue} label="Sort" />
    }
    return <Plain />
  },
  parameters: {
    docs: {
      description: {
        story:
          'Without hints it is a themed select, and the third option is ' +
          'disabled. A disabled option is skipped by the keyboard and refuses ' +
          'the click rather than looking pressable.',
      },
    },
  },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 320 }}>
      <Controlled size="sm" />
      <Controlled size="md" />
      <Controlled size="lg" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Three trigger heights, `sm` / `md` / `lg`, matching the other form ' +
          'controls so a Select sits in a row of inputs without stepping out of it.',
      },
    },
  },
}

export const InAForm: Story = {
  render: () => <Controlled name="role" />,
  parameters: {
    docs: {
      description: {
        story:
          '`name` renders a hidden input, so the control still submits inside a ' +
          'plain `<form action>` with no JavaScript wiring. Omit it for a purely ' +
          'controlled use.',
      },
    },
  },
}

export const Disabled: Story = { render: () => <Controlled disabled /> }
