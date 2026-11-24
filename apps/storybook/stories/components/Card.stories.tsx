import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card } from 'haus-components'
import { Item, Row } from '../helpers'

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

const story = (text: string) => ({ docs: { description: { story: text } } })

export const Variant: Story = {
  parameters: story('A bordered surface, a raised one, and a strong outline for a selected or highlighted card.'),
  render: args => (
    <Row stretch>
      {(['default', 'elevated', 'outlined'] as const).map(variant => (
        <Item key={variant} label={variant}>
          <Card {...args} variant={variant} />
        </Item>
      ))}
    </Row>
  ),
}

export const States: Story = {
  parameters: {
    ...story(
      'A card that is a link. Hover strengthens the edge (and the shadow, when elevated); focus takes the ' +
        'outline every control uses. Forced, so they can be reviewed without a pointer.',
    ),
    pseudo: { hover: ['#state-hover', '#state-hover-elevated'], focusVisible: ['#state-focus'] },
  },
  render: args => (
    <Row stretch>
      <Item label="link, rest">
        <Card {...args} asChild>
          <a href="#rest">Quarterly plan</a>
        </Card>
      </Item>
      <Item label="link, hover">
        <Card {...args} asChild>
          <a href="#hover" id="state-hover">
            Quarterly plan
          </a>
        </Card>
      </Item>
      <Item label="elevated link, hover">
        <Card {...args} variant="elevated" asChild>
          <a href="#hover-elevated" id="state-hover-elevated">
            Quarterly plan
          </a>
        </Card>
      </Item>
      <Item label="link, focus">
        <Card {...args} asChild>
          <a href="#focus" id="state-focus">
            Quarterly plan
          </a>
        </Card>
      </Item>
    </Row>
  ),
}

export const InContext: Story = {
  name: 'In context',
  parameters: story('Cards as list items: `as="li"` keeps the list a list for a screen reader.'),
  render: args => (
    <ul
      style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--haus-space-3)', maxWidth: 420 }}
    >
      {['First', 'Second', 'Third'].map(label => (
        <Card key={label} {...args} as="li">
          {label}
        </Card>
      ))}
    </ul>
  ),
}
