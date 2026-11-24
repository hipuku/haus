import type React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Divider } from 'haus-components'
import { Item, Stack } from '../helpers'

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
  render: args => (
    <div style={{ maxWidth: 420 }}>
      <p style={{ margin: 0 }}>Above the rule.</p>
      <Divider {...args} />
      <p style={{ margin: 0 }}>Below the rule.</p>
    </div>
  ),
}

const story = (text: string) => ({ docs: { description: { story: text } } })

const line: React.CSSProperties = {
  margin: 0,
  fontFamily: 'var(--haus-font-sans)',
  fontSize: 'var(--haus-type-body-sm-size)',
  color: 'var(--haus-color-ink-primary)',
}

export const Spacing: Story = {
  parameters: story('The space above and below the rule, on the stack scale.'),
  render: args => (
    <Stack>
      {(['none', 'sm', 'md', 'lg'] as const).map(spacing => (
        <Item key={spacing} label={spacing}>
          <div style={{ inlineSize: '100%' }}>
            <p style={line}>Above the rule.</p>
            <Divider {...args} spacing={spacing} />
            <p style={line}>Below the rule.</p>
          </div>
        </Item>
      ))}
    </Stack>
  ),
}

export const Vertical: Story = {
  name: 'Vertical, in a toolbar',
  parameters: story('Between items in a row. Decorative by default there, so it is not announced.'),
  render: args => (
    <div style={{ ...line, display: 'flex', alignItems: 'center' }}>
      <span>Copy</span>
      <Divider {...args} orientation="vertical" />
      <span>Rename</span>
      <Divider {...args} orientation="vertical" />
      <span>Delete</span>
    </div>
  ),
}
