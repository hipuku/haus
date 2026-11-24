import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from 'haus-components'
import { Grid, Item, MotionCompare, Row } from '../helpers'

/**
 * One file per component, with the props as controls.
 *
 * Storybook showed twelve components and not one prop: ten page-level stories
 * across two files, both declaring `title: 'Components'`, every one of them a
 * `render: () => <Page />` with no `component:`, no `args` and no `argTypes`.
 * A reviewer could look at the components and could not touch them, and the
 * autodocs the config asked for were generated for nothing, because autodocs
 * follows a tag and nothing was tagged.
 */
const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The one button. `variant` is visual weight, `tone` is meaning, and ' +
          '`external` is behaviour: three things that used to be one prop. ' +
          'Renders an `<a>` when given `href`, and a disabled link is really ' +
          'disabled: no `href`, out of the tab order, not activatable.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'ghost', 'text'],
      description: 'Visual weight only. Never meaning.',
      table: { defaultValue: { summary: 'primary' } },
    },
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'info', 'success', 'warning', 'error'],
      description: 'What it means. All five shared tones, composing freely with every weight.',
      table: { defaultValue: { summary: 'neutral' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      table: { defaultValue: { summary: 'md' } },
    },
    external: {
      control: 'boolean',
      description: 'Appends the glyph. Behaviour, so it stacks on any weight.',
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    href: { control: 'text', description: 'Renders an anchor instead of a button.' },
    children: { control: 'text' },
  },
  args: {
    children: 'Save changes',
    variant: 'primary',
    tone: 'neutral',
    size: 'md',
    external: false,
    loading: false,
    disabled: false,
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const VARIANTS = ['primary', 'secondary', 'ghost', 'text'] as const
const TONES = ['neutral', 'info', 'success', 'warning', 'error'] as const
const SIZES = ['sm', 'md', 'lg'] as const

const story = (text: string) => ({ docs: { description: { story: text } } })

export const Variant: Story = {
  parameters: story('Visual weight, from most to least emphasis. Weight only: meaning is `tone`.'),
  render: args => (
    <Row>
      {VARIANTS.map(variant => (
        <Item key={variant} label={variant}>
          <Button {...args} variant={variant} />
        </Item>
      ))}
    </Row>
  ),
}

export const Tone: Story = {
  parameters: story('What the action means. Every tone works at every variant (see Tone × Variant).'),
  render: args => (
    <Row>
      {TONES.map(tone => (
        <Item key={tone} label={tone}>
          <Button {...args} tone={tone} />
        </Item>
      ))}
    </Row>
  ),
}

export const Size: Story = {
  parameters: story('sm is 28px for dense pointer UI, md 36px is the default, lg 44px is the AAA target size.'),
  render: args => (
    <Row>
      {SIZES.map(size => (
        <Item key={size} label={size}>
          <Button {...args} size={size} />
        </Item>
      ))}
    </Row>
  ),
}

export const ToneByVariant: Story = {
  name: 'Tone × Variant',
  parameters: story(
    'Every combination, because the point is that every cell works. A tone remaps custom properties and ' +
      'decides nothing about weight; a variant reads the ones it needs and decides nothing about meaning.',
  ),
  render: args => (
    <Grid
      rows={TONES}
      columns={VARIANTS}
      render={(tone, variant) => <Button {...args} tone={tone} variant={variant} children="Delete" />}
    />
  ),
}

export const States: Story = {
  parameters: {
    ...story(
      'Every state side by side. Hover, focus and pressed are forced, so they can be reviewed without a ' +
        'pointer. Loading keeps the width of the rest state.',
    ),
    pseudo: { hover: ['#state-hover'], focusVisible: ['#state-focus'], active: ['#state-pressed'] },
  },
  render: args => (
    <Row>
      <Item label="rest">
        <Button {...args} />
      </Item>
      <Item label="hover">
        <Button {...args} id="state-hover" />
      </Item>
      <Item label="focus">
        <Button {...args} id="state-focus" />
      </Item>
      <Item label="pressed">
        <Button {...args} id="state-pressed" />
      </Item>
      <Item label="loading">
        <Button {...args} loading />
      </Item>
      <Item label="disabled">
        <Button {...args} disabled />
      </Item>
    </Row>
  ),
}

export const Motion: Story = {
  parameters: story(
    'Press and hold each one, then release. Subtle presses to 0.98 and eases back; expressive presses to 0.95 ' +
      'and springs back with a settle; reduced changes colour only. Replay restarts the loading cross-fade, which ' +
      'expressive sequences.',
  ),
  render: args => (
    <MotionCompare remount={false} render={(_mode, run) => <Button {...args} loading={run % 2 === 1} />} />
  ),
}

export const Content: Story = {
  parameters: story('A long label stays on one line, and the external glyph follows any label.'),
  render: args => (
    <Row>
      <Item label="long label">
        <Button {...args} children="Save changes and continue to the next step" />
      </Item>
      <Item label="external">
        <Button {...args} external children="Documentation" />
      </Item>
    </Row>
  ),
}

export const AsALink: Story = {
  name: 'A disabled link is really disabled',
  parameters: story(
    'A disabled anchor has no `href`, `tabindex="-1"` and no `target`. `aria-disabled` alone announces a ' +
      'state without creating one: the link stayed focusable and still navigated.',
  ),
  render: args => (
    <Row>
      <Item label="link">
        <Button {...args} href="https://haus.hipuku.dev" external children="Documentation" />
      </Item>
      <Item label="disabled link">
        <Button {...args} href="https://haus.hipuku.dev" disabled children="Unavailable" />
      </Item>
    </Row>
  ),
}
