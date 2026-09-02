import type { Meta, StoryObj } from '@storybook/react-vite'
import { Textarea } from 'haus-components'

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Input’s multi-line sibling, with the same label, hint and error wiring.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    rows: { control: { type: 'number', min: 2, max: 12 } },
  },
  args: { label: 'Notes', placeholder: 'Anything we should know?', rows: 4 },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const WithHint: Story = { args: { hint: 'Markdown is fine.' } }
export const WithError: Story = { args: { error: 'This field is required.' } }
export const Disabled: Story = { args: { disabled: true, value: 'Locked.' } }
