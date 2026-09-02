import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox } from 'haus-components'

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Uncontrolled unless you pass `checked`. `onChange` hands back ' +
          '`(checked, event)` — the boolean because it is what you almost always ' +
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
export const WithHint: Story = {
  args: { hint: 'You can withdraw at any time.' },
  parameters: {
    docs: {
      description: {
        story:
          'The hint sits outside the `<label>`. Inside it, it became part of the ' +
          'accessible *name*: "Accept the terms You can withdraw at any time" as one string.',
      },
    },
  },
}
export const Indeterminate: Story = { args: { indeterminate: true, label: 'Select all' } }
export const WithError: Story = { args: { error: 'You have to accept to continue.' } }
export const Disabled: Story = { args: { disabled: true } }
