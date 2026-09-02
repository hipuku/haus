import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from 'haus-components'

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
    error: { control: 'text', description: 'Shown instead of the hint, with role="alert".' },
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
export const WithHint: Story = { args: { hint: 'We only use it to sign you in.' } }
export const WithError: Story = {
  args: { hint: 'We only use it to sign you in.', error: 'That address is not valid.' },
  parameters: {
    docs: { description: { story: 'The error replaces the hint rather than stacking with it.' } },
  },
}
export const Required: Story = { args: { required: true } }
export const Disabled: Story = { args: { disabled: true, value: 'you@example.com' } }
export const WithAdornments: Story = { args: { label: 'Budget', prefix: '£', suffix: '.00' } }
