import type { Meta, StoryObj } from '@storybook/react-vite'
import { RadioGroup } from 'haus-components'

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A group, not a radio — the arrows move the selection and the whole ' +
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
export const Horizontal: Story = { args: { orientation: 'horizontal' } }
export const WithError: Story = { args: { error: 'Choose a size to continue.' } }
