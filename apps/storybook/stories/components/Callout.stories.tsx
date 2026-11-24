import type { Meta, StoryObj } from '@storybook/react-vite'
import { Callout } from 'haus-components'
import { Item, Stack } from '../helpers'

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
          'neither: the markup is valid and wrong in context.',
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

const story = (text: string) => ({ docs: { description: { story: text } } })

export const Tone: Story = {
  parameters: story('The tint, edge and icon carry the tone; the copy stays the primary ink in every tone.'),
  render: args => (
    <Stack>
      {(['neutral', 'info', 'success', 'warning', 'error'] as const).map(tone => (
        <Item key={tone} label={tone}>
          <Callout {...args} tone={tone} />
        </Item>
      ))}
    </Stack>
  ),
}

export const Content: Story = {
  parameters: story(
    'Without the glyph, when the copy is the whole notice; and a long notice, where the icon stays on the ' +
      'first line.',
  ),
  render: args => (
    <Stack>
      <Item label="no glyph">
        <Callout {...args} icon={false} children="Sometimes the copy is the whole notice." />
      </Item>
      <Item label="long">
        <Callout
          {...args}
          children="Audited a cached crawl from 3 September. Pages changed since then are not reflected, so run the crawl again before acting on the contrast findings below."
        />
      </Item>
    </Stack>
  ),
}
