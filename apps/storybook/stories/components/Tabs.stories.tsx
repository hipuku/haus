import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs, type TabItem } from 'haus-components'

const ITEMS: TabItem[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'colour', label: 'Colour' },
  { value: 'contrast', label: 'Contrast' },
  { value: 'type', label: 'Type' },
  { value: 'spacing', label: 'Spacing', disabled: true },
]

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A tablist, and the panel it controls.\n\n' +
          'Measured across core, drift and vault: three tablists, **zero** ' +
          '`role="tabpanel"`, **zero** `aria-controls`, **zero** arrow-key handling. ' +
          'Every one announces itself as a tablist and delivers none of what the word ' +
          'promises.\n\n' +
          'The panel is rendered here rather than left to the caller, because the ' +
          'wiring between a tab and its panel is exactly what all three got wrong. ' +
          'Arrow keys move and wrap, Home and End jump, disabled tabs are skipped, ' +
          'and the tablist is one tab stop rather than one per tab.',
      },
    },
  },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  args: { items: ITEMS, value: 'overview', size: 'md', 'aria-label': 'Audit sections' },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <div style={{ maxWidth: 560 }}>
        <Tabs {...args} value={value} onValueChange={setValue}>
          The {value} panel. Tab once more to reach it — the tablist is a single stop.
        </Tabs>
      </div>
    )
  },
}

export const Sizes: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('overview')
    return (
      <div style={{ display: 'grid', gap: 'var(--haus-space-8)', maxWidth: 560 }}>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Tabs key={size} {...args} size={size} value={value} onValueChange={setValue}>
            {size}
          </Tabs>
        ))}
      </div>
    )
  },
}
