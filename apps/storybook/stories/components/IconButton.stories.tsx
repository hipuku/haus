import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconButton } from 'haus-components'

const Plus = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden width="1em" height="1em">
    <path d="M8 3.5V12.5M3.5 8H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const Trash = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden width="1em" height="1em">
    <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8h6l.5-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: { icon: <Plus />, label: 'Add item', variant: 'secondary', tone: 'neutral', size: 'md' },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <IconButton icon={<Plus />} label="Add, small" size="sm" />
      <IconButton icon={<Plus />} label="Add, medium" size="md" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Two sizes, and both are measured rather than chosen. `md` is 28px, ' +
          'which is what **both** products already draw their default icon ' +
          'button at, agreeing to the pixel, and is already `control-height-sm`. ' +
          '\n\n' +
          'Below that they disagree: core has 22px, vault has 24px and 20px. ' +
          'Three answers from two products is not evidence for any of them, so ' +
          '`sm` takes the one that is also a rule: **24px, the WCAG 2.5.8 AA ' +
          "minimum target size**. That makes core's 22px and vault's 20px both " +
          'under the floor, and neither was ported up.',
      },
    },
  },
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <IconButton icon={<Plus />} label="Primary" variant="primary" />
      <IconButton icon={<Plus />} label="Secondary" variant="secondary" />
      <IconButton icon={<Plus />} label="Ghost" variant="ghost" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`ghost` is the weight both products use most: a bare glyph that only ' +
          'grows a surface on hover.',
      },
    },
  },
}

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {(['primary', 'secondary', 'ghost'] as const).map(variant => (
        <div key={variant} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, width: 80, opacity: 0.7 }}>{variant}</span>
          {(['neutral', 'info', 'success', 'warning', 'error'] as const).map(tone => (
            <IconButton key={tone} icon={<Trash />} label={`${variant} ${tone}`} variant={variant} tone={tone} />
          ))}
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Tone and variant compose, exactly as they do on Button: a tone remaps ' +
          'colour and decides no weight, a variant reads it and decides no ' +
          'meaning. ' +
          '\n\n' +
          '`success` and `warning` take their `solid` role at 700 rather than ' +
          '`default` at 500, because those two 500s fail contrast with white ' +
          'ink. That is the pairing the `solid` role exists for.',
      },
    },
  },
}

export const Loading: Story = {
  args: { loading: true, label: 'Saving' },
  parameters: {
    docs: {
      description: {
        story:
          'The glyph is **replaced** by the Spinner, not joined by it, and ' +
          '`aria-busy` announces the wait. The control is disabled while loading ' +
          'but keeps full opacity: the wait is temporary, and a dimmed control ' +
          'reads as permanently unavailable.',
      },
    },
  },
}
