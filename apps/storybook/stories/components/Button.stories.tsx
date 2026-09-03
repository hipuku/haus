import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from 'haus-components'

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
          '`external` is behaviour — three things that used to be one prop. ' +
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
      description:
        'What it means. All five shared tones, composing freely with every weight.',
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

export const Weights: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--haus-space-3)', flexWrap: 'wrap' }}>
      <Button {...args} variant="primary">Primary</Button>
      <Button {...args} variant="secondary">Secondary</Button>
      <Button {...args} variant="ghost">Ghost</Button>
      <Button {...args} variant="text">Text</Button>
    </div>
  ),
}

const TONES = ['neutral', 'info', 'success', 'warning', 'error'] as const
const WEIGHTS = ['primary', 'secondary', 'ghost', 'text'] as const

export const Tones: Story = {
  name: 'Tone is separate from weight',
  parameters: {
    docs: {
      description: {
        story:
          'The whole grid, because the point is that every cell of it works. A tone remaps ' +
          'a set of custom properties and decides nothing about weight; a weight reads the ' +
          'ones it needs and decides nothing about meaning. Before this, `tone="error"` set ' +
          'background, border and colour outright and won on source order, so the ghost and ' +
          'text columns below rendered as solid buttons.',
      },
    },
  },
  render: (args) => (
    <table style={{ borderCollapse: 'separate', borderSpacing: 'var(--haus-space-3)' }}>
      <thead>
        <tr>
          <th />
          {WEIGHTS.map((weight) => (
            <th
              key={weight}
              style={{
                font: 'inherit',
                fontSize: 'var(--haus-type-label-xs-size)',
                color: 'var(--haus-color-ink-secondary)',
                textAlign: 'start',
                textTransform: 'uppercase',
              }}
            >
              {weight}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {TONES.map((tone) => (
          <tr key={tone}>
            <th
              scope="row"
              style={{
                font: 'inherit',
                fontSize: 'var(--haus-type-label-xs-size)',
                color: 'var(--haus-color-ink-secondary)',
                textAlign: 'start',
                textTransform: 'uppercase',
              }}
            >
              {tone}
            </th>
            {WEIGHTS.map((weight) => (
              <td key={weight}>
                <Button {...args} variant={weight} tone={tone}>
                  Delete
                </Button>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--haus-space-3)', alignItems: 'center' }}>
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
}

export const AsALink: Story = {
  name: 'As a link, and disabled as a link',
  parameters: {
    docs: {
      description: {
        story:
          'A disabled anchor has no `href`, `tabindex="-1"` and no `target`. ' +
          '`aria-disabled` alone announces a state without creating one: the ' +
          'link stayed focusable and still navigated.',
      },
    },
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--haus-space-3)', alignItems: 'center' }}>
      <Button {...args} href="https://haus.hipuku.dev" external>Documentation</Button>
      <Button {...args} href="https://haus.hipuku.dev" disabled>Unavailable</Button>
    </div>
  ),
}

export const Loading: Story = { args: { loading: true } }
export const Disabled: Story = { args: { disabled: true } }
