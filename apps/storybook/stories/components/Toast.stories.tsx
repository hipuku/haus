import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toast } from 'haus-components'

const meta = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The surface of a notice, and deliberately only that. **No provider, ' +
          'no queue, no positioning, no timer, and there will not be** — a toast ' +
          '*system* is an application concern that owns global state, a portal ' +
          'and a policy about stacking, and a design system that ships one is ' +
          'shipping an opinion most consumers fight. Decision 0008.\n\n' +
          'What it does own: how one looks, and that it is announced — it carries ' +
          'its own `role="status"`, so a notice dropped into your container is ' +
          'still read out.',
      },
    },
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['neutral', 'info', 'success', 'warning', 'error'] },
    title: { control: 'text' },
    description: { control: 'text' },
  },
  args: { tone: 'success', title: 'Saved', description: 'Your changes are live.' },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Tones: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--haus-space-3)', maxWidth: 380 }}>
      {(['neutral', 'info', 'success', 'warning', 'error'] as const).map((tone) => (
        <Toast key={tone} {...args} tone={tone} title={tone} />
      ))}
    </div>
  ),
}

export const TitleOnly: Story = { args: { description: undefined } }
export const Dismissable: Story = { args: { onClose: () => {} } }
