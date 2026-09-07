import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toast, Button } from 'haus-components'

const meta = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The surface of a notice, and deliberately only that. **No provider, ' +
          'no queue, no positioning, no timer, and there will not be** — a toast ' +
          '*system* is an application concern that owns global state, a portal ' +
          'and a policy about stacking, and a design system that ships one is ' +
          'shipping an opinion most consumers fight. Decision 0008.\n\n' +
          'What it does own: how one looks, and that it is announced — it carries ' +
          'its own `role="status"`, so a notice dropped into your container is ' +
          'still read out.',
      },
    },
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['neutral', 'info', 'success', 'warning', 'error'] },
    appearance: {
      control: 'inline-radio',
      options: ['subtle', 'solid'],
      description:
        'How solidly the tone is expressed. Toast already had both and no word ' +
        'for them: `neutral` painted a dark solid surface while the other four ' +
        'painted tinted ones. Ruling A5.',
      table: { defaultValue: { summary: 'subtle' } },
    },
    title: { control: 'text' },
    description: { control: 'text' },
  },
  args: {
    tone: 'success',
    appearance: 'subtle',
    title: 'Saved',
    description: 'Your changes are live.',
  },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Tones: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--haus-space-3)', maxWidth: 380 }}>
      {(['neutral', 'info', 'success', 'warning', 'error'] as const).map((tone) => (
        <Toast key={tone} {...args} tone={tone} title={tone} />
      ))}
    </div>
  ),
}

export const Appearances: Story = {
  name: 'Appearance is separate from tone',
  parameters: {
    docs: {
      description: {
        story:
          'Both columns, because the point is that the choice is now yours to make. ' +
          'A `neutral` toast used to be the dark one and the other four tinted, with ' +
          'no way to ask for the opposite. `subtle` is the default, matching Badge.\n\n' +
          'The accent edge only appears on the tinted appearance: a stripe of the ' +
          'same colour family against a solid surface reads as an artefact, so the ' +
          'icon carries the tone there instead.',
      },
    },
  },
  render: (args) => (
    // Column-major: the flat list below is appearance-then-tone, so the rows
    // have to be fixed and the flow turned, or the two appearances interleave.
    <div
      style={{
        display: 'grid',
        gridTemplateRows: 'repeat(5, auto)',
        gridAutoFlow: 'column',
        gap: 'var(--haus-space-3)',
      }}
    >
      {(['subtle', 'solid'] as const).map((appearance) =>
        (['neutral', 'info', 'success', 'warning', 'error'] as const).map((tone) => (
          <Toast
            key={`${appearance}-${tone}`}
            {...args}
            tone={tone}
            appearance={appearance}
            title={`${tone} ${appearance}`}
          />
        )),
      )}
    </div>
  ),
}

export const TitleOnly: Story = { args: { description: undefined } }
export const Dismissable: Story = { args: { onClose: () => {} } }

export const WithAction: Story = {
  name: 'With an action',
  parameters: {
    docs: {
      description: {
        story:
          'The `action` slot renders in the title row, beside the title, baseline ' +
          'aligned. It is the one place the button goes, and until this story the ' +
          'only place in the repository it had ever been drawn was the variant ' +
          'sheet, by hand. On a `solid` toast a `.solid .action` override keeps the ' +
          'button legible against the filled surface, which is why both are shown.',
      },
    },
  },
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--haus-space-3)', maxWidth: 380 }}>
      <Toast
        {...args}
        appearance="subtle"
        title="Message archived"
        description={undefined}
        action={<Button size="sm" variant="ghost">Undo</Button>}
      />
      <Toast
        {...args}
        appearance="solid"
        title="Message archived"
        description={undefined}
        action={<Button size="sm" variant="ghost">Undo</Button>}
      />
    </div>
  ),
}
