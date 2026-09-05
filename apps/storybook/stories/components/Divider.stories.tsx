import type { Meta, StoryObj } from '@storybook/react-vite'
import { Divider } from 'haus-components'

const meta = {
  title: 'Components/Divider',
  component: Divider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A rule between things. Always an `<hr>`, including when vertical: it ' +
          'carries `separator` implicitly and stays a break when the document is ' +
          'read with styles off. `decorative` is the interesting prop: the markup ' +
          'cannot tell a structural break from a line drawn because a panel looked ' +
          'crowded, so the caller says which this is.',
      },
    },
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    spacing: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] },
    decorative: { control: 'boolean' },
  },
  args: { orientation: 'horizontal', spacing: 'md', decorative: false },
} satisfies Meta<typeof Divider>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <p style={{ margin: 0 }}>Above the rule.</p>
      <Divider {...args} />
      <p style={{ margin: 0 }}>Below the rule.</p>
    </div>
  ),
}

export const Spacing: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      {(['none', 'sm', 'md', 'lg'] as const).map((spacing) => (
        <div key={spacing}>
          <p style={{ margin: 0, fontSize: 13 }}>{spacing}</p>
          <Divider {...args} spacing={spacing} />
        </div>
      ))}
    </div>
  ),
}

export const Vertical: Story = {
  name: 'Vertical, in a toolbar',
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      <span>Copy</span>
      <Divider {...args} orientation="vertical" />
      <span>Rename</span>
      <Divider {...args} orientation="vertical" />
      <span>Delete</span>
    </div>
  ),
}
