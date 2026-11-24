import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Toast } from 'haus-components'
import { Grid, Item, MotionCompare, Stack } from '../helpers'

const meta = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The surface of a notice, and deliberately only that. **No provider, ' +
          'no queue, no positioning, no timer, and there will not be**. A toast ' +
          '*system* is an application concern that owns global state, a portal ' +
          'and a policy about stacking, and a design system that ships one is ' +
          'shipping an opinion most consumers fight. Decision 0008.\n\n' +
          'What it does own: how one looks, and that it is announced. It carries ' +
          'its own live region, `status` or `alert` for an error, so a notice ' +
          'dropped into your container is still read out.',
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

const TONES = ['neutral', 'info', 'success', 'warning', 'error'] as const
const APPEARANCES = ['subtle', 'solid'] as const
const story = (text: string) => ({ docs: { description: { story: text } } })
const undo = (
  <Button size="sm" variant="text">
    Undo
  </Button>
)

export const Tone: Story = {
  parameters: story('What the notice means. The tint, border and icon carry it; the icon differs in shape per tone.'),
  render: args => (
    <Stack>
      {TONES.map(tone => (
        <Item key={tone} label={tone}>
          <Toast {...args} tone={tone} />
        </Item>
      ))}
    </Stack>
  ),
}

export const Appearance: Story = {
  parameters: story('How strongly the tone is expressed: a tinted surface, or the tone as the surface.'),
  render: args => (
    <Stack>
      {APPEARANCES.map(appearance => (
        <Item key={appearance} label={appearance}>
          <Toast {...args} appearance={appearance} />
        </Item>
      ))}
    </Stack>
  ),
}

export const ToneByAppearance: Story = {
  name: 'Tone × Appearance',
  parameters: story("Every combination. Solid takes each tone's AA-safe fill, so white ink passes on all five."),
  render: args => (
    <Grid
      rows={TONES}
      columns={APPEARANCES}
      render={(tone, appearance) => (
        <Toast {...args} tone={tone} appearance={appearance} title={`${tone} ${appearance}`} />
      )}
    />
  ),
}

export const Motion: Story = {
  parameters: story(
    'Toast owns its entrance. Subtle rises 4px; expressive rises 16px on a spring, then the icon and the ' +
      'text follow one step apart; reduced is a short fade.',
  ),
  render: args => <MotionCompare hint="Replay brings each toast in again." render={() => <Toast {...args} />} />,
}

export const Content: Story = {
  parameters: story(
    'Title only, a long description, a dismiss and an action. The icon and the close stay on the title line ' +
      'however many lines follow. The action is a `text` button so it reads as a link, not a second surface.',
  ),
  render: args => (
    <Stack>
      <Item label="title only">
        <Toast {...args} description={undefined} />
      </Item>
      <Item label="long description, dismissable">
        <Toast
          {...args}
          onClose={() => {}}
          description="Your changes are live for everyone in the workspace, and the previous version is kept in the history."
        />
      </Item>
      <Item label="solid, dismissable">
        <Toast {...args} appearance="solid" tone="neutral" onClose={() => {}} />
      </Item>
      <Item label="action, subtle">
        <Toast {...args} title="Message archived" description={undefined} action={undo} />
      </Item>
      <Item label="action, solid">
        <Toast {...args} appearance="solid" title="Message archived" description={undefined} action={undo} />
      </Item>
    </Stack>
  ),
}

export const ErrorInterrupts: Story = {
  name: 'An error interrupts, a notice waits',
  parameters: story(
    'An error toast is `role="alert"` and assertive, because the user has to act on it. The other tones are ' +
      'polite `status` regions and wait behind whatever the screen reader is saying.',
  ),
  render: args => (
    <Stack>
      <Item label="alert, assertive">
        <Toast {...args} tone="error" title="Could not save" description="Check your connection and try again." />
      </Item>
      <Item label="status, polite">
        <Toast {...args} tone="success" />
      </Item>
    </Stack>
  ),
}
