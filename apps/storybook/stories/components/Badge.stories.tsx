import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from 'haus-components'

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A status word. `tone` is the meaning and `appearance` is how solidly ' +
          'it is expressed — the pair Button and Toast share. `as` exists because ' +
          'a count in a definition list is a `<dd>` and a live result is an ' +
          '`<output>`, and a `<span>` in either place is a hole in the outline.',
      },
    },
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'primary', 'info', 'success', 'warning', 'error'],
      description: 'The shared vocabulary plus `primary`, the brand itself.',
    },
    appearance: { control: 'inline-radio', options: ['subtle', 'solid'] },
    dot: { control: 'boolean', description: 'A leading dot, for a status list.' },
    as: { control: 'inline-radio', options: ['span', 'output', 'dd', 'li'] },
    children: { control: 'text' },
  },
  args: { children: 'Active', tone: 'neutral', appearance: 'subtle', dot: false },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

const TONES = ['neutral', 'primary', 'info', 'success', 'warning', 'error'] as const

export const Playground: Story = {}

export const Tones: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--haus-space-2)', flexWrap: 'wrap' }}>
      {TONES.map((tone) => (
        <Badge key={tone} {...args} tone={tone}>{tone}</Badge>
      ))}
    </div>
  ),
}

export const Appearances: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--haus-space-3)' }}>
      {(['subtle', 'solid'] as const).map((appearance) => (
        <div key={appearance} style={{ display: 'flex', gap: 'var(--haus-space-2)', flexWrap: 'wrap' }}>
          {TONES.map((tone) => (
            <Badge key={tone} {...args} tone={tone} appearance={appearance}>{tone}</Badge>
          ))}
        </div>
      ))}
    </div>
  ),
}

export const WithDot: Story = { args: { dot: true, tone: 'success', children: 'Online' } }
