import type { Meta, StoryObj } from '@storybook/react-vite'
import { RadioGroup } from 'haus-components'
import { Item, MotionCompare, Row } from '../helpers'

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A group, not a radio. The arrows move the selection and the whole ' +
          'group is one tab stop, which comes free from the native inputs sharing ' +
          'a name. Option ids are indexed rather than built from the value: ' +
          '`"extra large"` or `"50%"` made an id `htmlFor` matched but no selector ' +
          'could address.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    error: { control: 'text' },
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    required: { control: 'boolean' },
  },
  args: {
    name: 'size',
    label: 'Size',
    defaultValue: 'md',
    options: [
      { value: 'sm', label: 'Small', hint: 'Fits a toolbar' },
      { value: 'md', label: 'Medium' },
      { value: 'lg', label: 'Large' },
      { value: 'xl', label: 'Extra large', disabled: true },
    ],
  },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const story = (text: string) => ({ docs: { description: { story: text } } })

export const Orientation: Story = {
  parameters: story('Vertical by default; horizontal for two or three short options.'),
  render: args => (
    <Row>
      <Item label="vertical">
        <RadioGroup {...args} name="o-vertical" />
      </Item>
      <Item label="horizontal">
        <RadioGroup {...args} name="o-horizontal" orientation="horizontal" />
      </Item>
    </Row>
  ),
}

export const States: Story = {
  parameters: {
    ...story('The group in each state. An option can be disabled on its own (Extra large).'),
    pseudo: { hover: ['#state-hover label'], focusVisible: ['#state-focus input'] },
  },
  render: args => (
    <Row>
      <Item label="rest">
        <RadioGroup {...args} name="s-rest" />
      </Item>
      <Item label="focus">
        <RadioGroup {...args} name="s-focus" id="state-focus" />
      </Item>
      <Item label="error">
        <RadioGroup {...args} name="s-error" error="Choose a size to continue." />
      </Item>
    </Row>
  ),
}

export const Motion: Story = {
  parameters: story(
    'Pick an option in each. Subtle shows the dot; expressive grows it in on a spring and springs the circle ' +
      'back from the press; reduced shows it at once.',
  ),
  render: args => (
    <MotionCompare
      remount={false}
      render={(mode, run) => (
        <RadioGroup {...args} name={`m-${mode}`} value={['sm', 'md', 'lg'][run % 3]} onChange={() => {}} />
      )}
    />
  ),
}

export const ArrowsMoveTheSelection: Story = {
  name: 'The arrows move the selection, one tab stop',
  parameters: story(
    'Tab into the group, then use the arrow keys. The group is one tab stop and the arrows change the ' +
      'selection, which comes free from native inputs sharing a name. Disabled options are skipped.',
  ),
}
