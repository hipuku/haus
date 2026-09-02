import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card } from 'haus-components'

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A surface. `variant` here is elevation, which is a visual weight, so ' +
          'it keeps the name. `as` is the escape hatch: a card is often a list ' +
          'item or an article, and a `<div>` in those places is a hole in the ' +
          'document outline no styling fixes.',
      },
    },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'elevated', 'outlined'] },
    padding: { control: 'boolean' },
    as: { control: 'inline-radio', options: ['div', 'article', 'section', 'li', 'aside'] },
  },
  args: { variant: 'default', padding: true, children: 'A surface with something on it.' },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--haus-space-4)', maxWidth: 420 }}>
      {(['default', 'elevated', 'outlined'] as const).map((variant) => (
        <Card key={variant} {...args} variant={variant}>{variant}</Card>
      ))}
    </div>
  ),
}

export const AsAListItem: Story = {
  render: (args) => (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--haus-space-3)', maxWidth: 420 }}>
      {['First', 'Second', 'Third'].map((label) => (
        <Card key={label} {...args} as="li">{label}</Card>
      ))}
    </ul>
  ),
}
