import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconButton } from 'haus-components'
import { Grid, Item, MotionCompare, Row, rest } from '../helpers'

const Plus = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden width="1em" height="1em">
    <path d="M8 3.5V12.5M3.5 8H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const Trash = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden width="1em" height="1em">
    <path
      d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8h6l.5-8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A control that is an icon and nothing else. Promoted on evidence ' +
          '(haus#58), and the evidence had to be found by behaviour rather than ' +
          'by name: an earlier sweep recorded core as having none, because ' +
          "core's is a CSS class and not a component file. Measured properly, " +
          'core has seven sites and vault a full set, and both independently ' +
          'grew a size axis and a tone axis. ' +
          '\n\n' +
          '**It is not a Button with an icon in it.** Button is a labelled ' +
          'control with inset padding and a 36px minimum, so an icon as its only ' +
          'child gives the wrong box and the wrong target size. ' +
          '\n\n' +
          '`label` is required, and that is the whole accessibility contract: an ' +
          'SVG contributes nothing to the accessible name, so without it the ' +
          'control announces as "button" and nothing else.',
      },
    },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] },
    tone: { control: 'inline-radio', options: ['neutral', 'info', 'success', 'warning', 'error'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: { icon: <Plus />, label: 'Add item', variant: 'primary', tone: 'neutral', size: 'md' },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const story = (text: string) => ({ docs: { description: { story: text } } })

const VARIANTS = ['primary', 'secondary', 'ghost'] as const
const TONES = ['neutral', 'info', 'success', 'warning', 'error'] as const

export const Variant: Story = {
  parameters: story(
    'Visual weight. `ghost` is the one both products use most: a bare glyph that grows a surface on hover.',
  ),
  render: args => (
    <Row>
      {VARIANTS.map(variant => (
        <Item key={variant} label={variant}>
          <IconButton {...args} variant={variant} />
        </Item>
      ))}
    </Row>
  ),
}

export const Tone: Story = {
  parameters: story('What the action means, at every variant (see Tone × Variant).'),
  render: args => (
    <Row>
      {TONES.map(tone => (
        <Item key={tone} label={tone}>
          <IconButton {...args} tone={tone} {...(tone === 'error' ? { icon: <Trash />, label: 'Delete' } : {})} />
        </Item>
      ))}
    </Row>
  ),
}

export const Size: Story = {
  parameters: story(
    'Three sizes, and each is measured rather than chosen. `md` is 28px, ' +
      'which is what **both** products already draw their default icon ' +
      'button at, agreeing to the pixel, and is already `control-height-sm`. ' +
      '\n\n' +
      'Below that they disagree: core has 22px, vault has 24px and 20px. ' +
      'Three answers from two products is not evidence for any of them, so ' +
      '`sm` takes the one that is also a rule: **24px, the WCAG 2.5.8 AA ' +
      "minimum target size**. That makes core's 22px and vault's 20px both " +
      'under the floor, and neither was ported up. ' +
      '\n\n' +
      '`lg` is 36px, `control-height-md`, the height of a default `Button`, ' +
      'so an icon-only action can stand level with a labelled one beside it.',
  ),
  render: args => (
    <Row>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <Item key={size} label={size}>
          <IconButton {...args} size={size} />
        </Item>
      ))}
    </Row>
  ),
}

export const ToneByVariant: Story = {
  name: 'Tone × Variant',
  parameters: story("Every combination works, as Button's does."),
  render: args => (
    <Grid
      rows={TONES}
      columns={VARIANTS}
      render={(tone, variant) => <IconButton {...args} tone={tone} variant={variant} />}
    />
  ),
}

export const States: Story = {
  parameters: {
    ...story(
      'Every state side by side. Hover, focus and pressed are forced, so they can be reviewed without a pointer.',
    ),
    pseudo: { hover: ['#state-hover'], focusVisible: ['#state-focus'], active: ['#state-pressed'] },
  },
  render: args => (
    <Row still>
      <Item label="rest">
        <IconButton {...args} />
      </Item>
      <Item label="hover">
        <IconButton {...args} id="state-hover" />
      </Item>
      <Item label="focus">
        <IconButton {...args} id="state-focus" />
      </Item>
      <Item label="pressed">
        <IconButton {...args} id="state-pressed" />
      </Item>
      <Item label="loading">
        <IconButton {...rest(args)} icon={<Plus />} loading label="Saving" />
      </Item>
      <Item label="disabled">
        <IconButton {...args} disabled />
      </Item>
    </Row>
  ),
}

export const Motion: Story = {
  parameters: story(
    "Press and hold each, then release: Button's press, a spring back in expressive, colour only in reduced.",
  ),
  render: args => (
    <MotionCompare
      hint="Press and hold a button to compare the press. Replay switches loading on and off."
      remount={false}
      render={(_mode, run) => <IconButton {...rest(args)} icon={<Plus />} label="Add item" loading={run % 2 === 1} />}
    />
  ),
}
