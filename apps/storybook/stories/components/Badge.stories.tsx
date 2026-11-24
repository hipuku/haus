import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from 'haus-components'
import { Grid, Item, Row } from '../helpers'

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A status word. `tone` is the meaning and `appearance` is how solidly ' +
          'it is expressed, the pair Button and Toast share. `as` exists because ' +
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

const story = (text: string) => ({ docs: { description: { story: text } } })

export const Tone: Story = {
  parameters: story('What the badge says about the thing it labels.'),
  render: args => (
    <Row>
      {TONES.map(tone => (
        <Item key={tone} label={tone}>
          <Badge {...args} tone={tone} />
        </Item>
      ))}
    </Row>
  ),
}

export const Appearance: Story = {
  parameters: story('How strongly the tone is expressed.'),
  render: args => (
    <Row>
      {(['subtle', 'solid'] as const).map(appearance => (
        <Item key={appearance} label={appearance}>
          <Badge {...args} appearance={appearance} />
        </Item>
      ))}
    </Row>
  ),
}

export const ToneByAppearance: Story = {
  name: 'Tone × Appearance',
  parameters: story("Every combination. Solid takes each tone's AA-safe fill."),
  render: args => (
    <Grid
      rows={TONES}
      columns={['subtle', 'solid'] as const}
      render={(tone, appearance) => <Badge {...args} tone={tone} appearance={appearance} />}
    />
  ),
}

export const Content: Story = {
  parameters: story('A dot for a live status, and a label long enough to test the pill.'),
  render: args => (
    <Row>
      <Item label="dot">
        <Badge {...args} dot tone="success" children="Online" />
      </Item>
      <Item label="long label">
        <Badge {...args} children="Awaiting review by a maintainer" />
      </Item>
    </Row>
  ),
}
