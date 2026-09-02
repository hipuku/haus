import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select } from 'haus-components'

const meta = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A native `<select>` in haus’s clothing. The closed control is fully ' +
          'themed; **the open list is not, and cannot be** — the popup is drawn ' +
          'by the operating system and no CSS reaches inside it. That is the ' +
          'trade rather than an omission: the platform gives back keyboard ' +
          'handling that is correct everywhere, a wheel picker on iOS, and ' +
          'assistive behaviour a custom listbox has to reimplement and keep ' +
          'correct. See decision 0011.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Role',
    placeholder: 'Choose a role',
    options: [
      { value: 'author', label: 'Author' },
      { value: 'maintainer', label: 'Maintainer' },
      { value: 'observer', label: 'Observer', disabled: true },
    ],
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const WithHint: Story = { args: { hint: 'Maintainers can accept and reject.' } }
export const WithError: Story = {
  args: { error: 'Pick a role to continue.' },
  parameters: {
    docs: {
      description: {
        story:
          'The error ring is its own colour. Select had an `.error` class and no ' +
          'error-focus rule, so focusing an invalid select showed the ordinary ring.',
      },
    },
  },
}
export const Disabled: Story = { args: { disabled: true } }
