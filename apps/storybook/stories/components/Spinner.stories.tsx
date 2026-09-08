import type { Meta, StoryObj } from '@storybook/react-vite'
import { Spinner } from 'haus-components'

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A busy indicator. The CSS is a keyframe and is not the point: the ' +
          'contract is whether the wait is announced, and whether it is announced ' +
          'twice when the text beside it already says so. Promoted on evidence ' +
          '(haus#55): all three products built one, plus Button inside haus, and ' +
          'they gave three different answers. One announced nothing at all, one ' +
          'hid itself outright, one was correct. `announcedBy` is that defect ' +
          'turned into a prop, and it takes the text that speaks instead of a ' +
          'boolean, so silencing requires naming what covers it.',
      },
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['text', 'sm', 'md'] },
    label: { control: 'text' },
    announcedBy: { control: 'text' },
  },
  args: { size: 'md', label: 'Loading' },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <span style={{ fontSize: 13 }}>
        <Spinner size="text" /> text
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <Spinner size="sm" /> sm
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <Spinner size="md" /> md
      </span>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`text` is 1em, so a spinner in a line of text matches the text rather ' +
          'than picking a step. That is the case Button has.',
      },
    },
  },
}

export const SilentBesideText: Story = {
  render: () => (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <Spinner size="sm" announcedBy="Extracting colours" />
      <span>Extracting colours</span>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The legitimate silent case, and vault has it. Without `announcedBy` a ' +
          'reader hears the wait twice, once for the ring and once for the text. ' +
          'The prop takes that text rather than a boolean, because every product ' +
          'that got this wrong got it wrong by silencing the spinner and putting ' +
          'nothing in its place.',
      },
    },
  },
}
