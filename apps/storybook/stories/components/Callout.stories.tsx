import type { Meta, StoryObj } from '@storybook/react-vite'
import { Callout } from 'haus-components'

const meta = {
  title: 'Components/Callout',
  component: Callout,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'An inline notice attached to the thing it is about. Not a Toast: a toast ' +
          'is transient, floats, and is about an event.\n\n' +
          '`live` is the prop this component exists for. drift puts `role="alert"` on ' +
          'every callout it renders, so a static notice interrupts a screen reader on ' +
          'every render; vault puts `role="note"` on every one, so a validation ' +
          'message that appears after a failed save is never announced. axe flags ' +
          'neither — the markup is valid and wrong in context.',
      },
    },
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['neutral', 'info', 'success', 'warning', 'error'] },
    live: { control: 'inline-radio', options: ['off', 'polite', 'assertive'] },
  },
  args: { tone: 'info', live: 'off', children: 'Audited a cached crawl from 3 September.' },
} satisfies Meta<typeof Callout>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Tones: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--haus-space-3)', maxWidth: 480 }}>
      {(['neutral', 'info', 'success', 'warning', 'error'] as const).map((tone) => (
        <Callout key={tone} {...args} tone={tone}>
          {tone}
        </Callout>
      ))}
    </div>
  ),
}

export const WithoutGlyph: Story = {
  name: 'No glyph',
  args: { icon: false, children: 'Sometimes the copy is the whole notice.' },
}
