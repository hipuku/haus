import type { Meta, StoryObj } from '@storybook/react-vite'
import { Textarea } from 'haus-components'
import { Item, MotionCompare, Row, Stack } from '../helpers'

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Input’s multi-line sibling, with the same label, hint and error wiring.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    rows: { control: { type: 'number', min: 2, max: 12 } },
  },
  args: { label: 'Notes', placeholder: 'Anything we should know?', rows: 4 },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const story = (text: string) => ({ docs: { description: { story: text } } })

export const States: Story = {
  parameters: {
    ...story('Every state side by side. Hover and focus are forced, so they can be reviewed without a pointer.'),
    pseudo: { hover: ['#state-hover'], focusVisible: ['#state-focus'] },
  },
  render: args => (
    <Row stretch>
      <Item label="rest">
        <Textarea {...args} />
      </Item>
      <Item label="hover">
        <Textarea {...args} id="state-hover" />
      </Item>
      <Item label="focus">
        <Textarea {...args} id="state-focus" />
      </Item>
      <Item label="error">
        <Textarea {...args} error="This field is required." />
      </Item>
      <Item label="disabled">
        <Textarea {...args} disabled defaultValue="Locked." />
      </Item>
    </Row>
  ),
}

export const Motion: Story = {
  parameters: story("The error growing in, as Input's: with the border in subtle, after it on a spring in expressive."),
  render: args => (
    <MotionCompare render={() => <Textarea {...args} hint="Markdown is fine." error="This field is required." />} />
  ),
}

export const Content: Story = {
  parameters: story('A hint, an error with its hint kept, and a long value that scrolls inside the field.'),
  render: args => (
    <Stack>
      <Item label="hint">
        <Textarea {...args} hint="Markdown is fine." />
      </Item>
      <Item label="error, hint kept">
        <Textarea {...args} hint="Markdown is fine." error="This field is required." />
      </Item>
      <Item label="long value">
        <Textarea
          {...args}
          defaultValue={
            'Line one of a longer note.\nLine two.\nLine three.\nLine four.\nLine five, past the visible rows.'
          }
        />
      </Item>
    </Stack>
  ),
}
