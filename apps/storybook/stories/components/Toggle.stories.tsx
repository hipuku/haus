import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toggle } from 'haus-components'

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A switch, announced as one rather than as a checkbox. Two sizes, ' +
          'because two are what it has designs for — the shared scale is ' +
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
export const WithDescription: Story = {
  args: { description: 'Sends a push to every signed-in device.' },
}
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--haus-space-3)' }}>
      <Toggle {...args} size="sm" label="Small" />
      <Toggle {...args} size="md" label="Medium" />
    </div>
  ),
}
export const LabelOnTheRight: Story = { args: { labelPosition: 'right' } }
export const Disabled: Story = { args: { disabled: true } }
