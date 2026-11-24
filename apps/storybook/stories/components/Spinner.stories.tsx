import type { Meta, StoryObj } from '@storybook/react-vite'
import { Spinner } from 'haus-components'
import { Item, MotionCompare, Row } from '../helpers'

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

const story = (text: string) => ({ docs: { description: { story: text } } })

export const Size: Story = {
  parameters: story('`text` is 1em, so a spinner in a line of text matches the text. That is the case Button has.'),
  render: args => (
    <Row>
      {(['text', 'sm', 'md'] as const).map(size => (
        <Item key={size} label={size}>
          <Spinner {...args} size={size} />
        </Item>
      ))}
    </Row>
  ),
}

export const Motion: Story = {
  parameters: story(
    'Reduced keeps turning at a third of the speed rather than stopping: a still ring reads as broken, not as ' +
      'waiting.',
  ),
  render: args => <MotionCompare render={() => <Spinner {...args} />} />,
}

export const SilentBesideText: Story = {
  name: 'Silent when the text beside it already says it',
  parameters: story(
    'The legitimate silent case, and vault has it. Without `announcedBy` a ' +
      'reader hears the wait twice, once for the ring and once for the text. ' +
      'The prop takes that text rather than a boolean, because every product ' +
      'that got this wrong got it wrong by silencing the spinner and putting ' +
      'nothing in its place.',
  ),
  render: () => (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--haus-space-2)' }}>
      <Spinner size="sm" announcedBy="Extracting colours" />
      <span>Extracting colours</span>
    </div>
  ),
}
