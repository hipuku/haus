import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, Badge, Card } from 'haus-components'
import { Item, MotionCompare, Row } from '../helpers'

/**
 * What a card usually holds: a title, a line about it, a status, who owns it.
 * One line of text showed a box and said nothing about how a card carries
 * content (owner, 4.5).
 */
function Content({ title = 'Quarterly plan' }: { title?: string }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--haus-space-3)', minInlineSize: '14rem' }}>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--haus-space-3)' }}
      >
        <strong
          style={{
            fontFamily: 'var(--haus-font-sans)',
            fontSize: 'var(--haus-type-heading-sm-size)',
            fontWeight: 'var(--haus-type-heading-sm-weight)',
            lineHeight: 'var(--haus-type-heading-sm-leading)',
            letterSpacing: 'var(--haus-type-heading-sm-tracking)',
          }}
        >
          {title}
        </strong>
        <Badge tone="success" appearance="subtle" dot>
          Accepted
        </Badge>
      </div>
      <span
        style={{
          fontFamily: 'var(--haus-font-sans)',
          fontSize: 'var(--haus-type-body-sm-size)',
          lineHeight: 'var(--haus-type-body-sm-leading)',
          color: 'var(--haus-color-ink-secondary)',
        }}
      >
        Three decisions, last changed on Tuesday.
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--haus-space-2)' }}>
        <Avatar name="Ada Lovelace" size="xs" />
        <span
          style={{
            fontFamily: 'var(--haus-font-sans)',
            fontSize: 'var(--haus-type-label-sm-size)',
            color: 'var(--haus-color-ink-secondary)',
          }}
        >
          Ada Lovelace
        </span>
      </div>
    </div>
  )
}

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
  args: { variant: 'default', padding: true, children: <Content /> },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const story = (text: string) => ({ docs: { description: { story: text } } })

const link = (args: Story['args'], props: Record<string, string> = {}, extra: Record<string, unknown> = {}) => (
  <Card {...args} {...extra} asChild>
    <a href="#card" {...props}>
      <Content />
    </a>
  </Card>
)

export const Variant: Story = {
  parameters: story('A bordered surface, a raised one, and a strong outline for a selected or highlighted card.'),
  render: args => (
    <Row>
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
      'A card that is a link. Hover takes the strongest edge and lifts the card; focus takes the outline every ' +
        'control uses; pressed scales it. Forced, so they can be reviewed without a pointer.',
    ),
    pseudo: {
      hover: ['#state-hover', '#state-hover-elevated'],
      focusVisible: ['#state-focus'],
      active: ['#state-pressed'],
    },
  },
  render: args => (
    <Row still>
      <Item label="rest">{link(args)}</Item>
      <Item label="hover">{link(args, { id: 'state-hover' })}</Item>
      <Item label="hover, elevated">{link(args, { id: 'state-hover-elevated' }, { variant: 'elevated' })}</Item>
      <Item label="focus">{link(args, { id: 'state-focus' })}</Item>
      <Item label="pressed">{link(args, { id: 'state-pressed' })}</Item>
    </Row>
  ),
}

export const Motion: Story = {
  parameters: story(
    'Hover each card. Subtle lifts it 1.5px with an ease; expressive lifts it 4px on a spring that settles; ' +
      'reduced only changes the edge.',
  ),
  render: args => <MotionCompare replay={false} render={() => link(args)} />,
}

export const InContext: Story = {
  name: 'In context',
  parameters: story('Cards as list items: `as="li"` keeps the list a list for a screen reader.'),
  render: args => (
    <ul
      style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--haus-space-3)', maxWidth: 420 }}
    >
      {['Quarterly plan', 'Hiring loop', 'Pricing review'].map(title => (
        <Card key={title} {...args} as="li">
          <Content title={title} />
        </Card>
      ))}
    </ul>
  ),
}
