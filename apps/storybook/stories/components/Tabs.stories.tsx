import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs, type TabItem } from 'haus-components'
import { Item, MotionCompare, rest, Stack } from '../helpers'

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
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    appearance: { control: 'inline-radio', options: ['underline', 'segmented'] },
  },
  args: {
    items: ITEMS,
    value: 'overview',
    size: 'md',
    appearance: 'underline',
    'aria-label': 'Audit sections',
  },
} satisfies Meta<typeof Tabs>

export default meta
/* The stories render `Controlled`, which owns the selected tab, so the args a
   story sets are its props rather than Tabs' required `value` and `onChange`. */
type Story = StoryObj<typeof Controlled>

const ENABLED = ITEMS.filter(item => !item.disabled).map(item => item.value)

/**
 * `step`, when given, selects the next enabled tab each time it changes, so a
 * Motion story's Replay moves the marker rather than doing nothing.
 */
function Controlled(props: Partial<React.ComponentProps<typeof Tabs>> & { initial?: string; step?: number }) {
  const { initial = 'overview', step, ...rest } = props
  const [value, setValue] = useState(initial)
  React.useEffect(() => {
    if (step === undefined || step === 0) return
    setValue(ENABLED[step % ENABLED.length]!)
  }, [step])
  return (
    <Tabs
      items={ITEMS}
      aria-label="Sections"
      {...(rest as Record<string, never>)}
      value={value}
      onValueChange={setValue}
    >
      The {value} panel.
    </Tabs>
  )
}

const story = (text: string) => ({ docs: { description: { story: text } } })

export const Playground: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(args.value ?? ITEMS[0]!.value)
    return (
      <div style={{ maxWidth: 560 }}>
        <Tabs {...rest(args)} items={ITEMS} aria-label="Sections" value={value} onValueChange={setValue}>
          The {value} panel. Tab once more to reach it: the tablist is a single stop.
        </Tabs>
      </div>
    )
  },
}

export const Appearance: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A second appearance (haus#60), and it is a shape rather than a ' +
          'weight. `underline` stays the default so nothing existing moves. ' +
          '\n\n' +
          '`segmented` exists because a two-way mode switch is not a set of ' +
          "sections. core's editor toggles between Write and Preview, and a row " +
          'of underlined words does not say *these are the two states of one ' +
          'control* the way a filled segment does. ' +
          '\n\n' +
          'It is deliberately **not** the shared `Appearance` union, which is ' +
          '`subtle | solid` and means fill weight on Badge and Toast. Reusing ' +
          'that name would put two unrelated meanings on one type.',
      },
    },
  },
  render: () => (
    <Stack>
      <Item label="underline">
        <Controlled />
      </Item>
      <Item label="segmented">
        <Controlled appearance="segmented" />
      </Item>
    </Stack>
  ),
}

export const Size: Story = {
  parameters: story('Each size reads its label role whole: label-sm, label-md, label-lg.'),
  render: () => (
    <Stack>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <Item key={size} label={size}>
          <Controlled size={size} />
        </Item>
      ))}
    </Stack>
  ),
}

export const Motion: Story = {
  parameters: story(
    'Replay moves every instance to the next tab. Subtle slides the marker with a short ease; expressive ' +
      'slides it on a spring that settles; reduced jumps.',
  ),
  render: () => (
    <MotionCompare
      hint="Replay moves every instance to the next tab, or click a tab yourself."
      remount={false}
      layout="column"
      render={(_mode, run) => (
        <Stack>
          <Controlled step={run} />
          <Controlled step={run} appearance="segmented" />
        </Stack>
      )}
    />
  ),
}

export const Content: Story = {
  parameters: story('A disabled tab, which the arrows skip, and labels of different lengths.'),
  render: () => (
    <Controlled
      items={[
        { value: 'overview', label: 'Overview' },
        { value: 'decisions', label: 'Decisions and their history' },
        { value: 'archived', label: 'Archived', disabled: true },
        { value: 'settings', label: 'Settings' },
      ]}
    />
  ),
}

export const OneTabStop: Story = {
  name: 'The tablist is one tab stop',
  parameters: story(
    'Tab into the list, use the arrows to move, Home and End to jump, and Tab once more to reach the panel. ' +
      'Every tab being its own tab stop is what the pattern exists to prevent.',
  ),
  render: () => <Controlled />,
}
