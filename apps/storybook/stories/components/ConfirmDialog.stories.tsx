import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, ConfirmDialog } from 'haus-components'
import React, { useState } from 'react'
import { Item, Row } from '../helpers'

const meta = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '"Are you sure", as one component, on Modal. vault and core each built one. Focus starts on Cancel, ' +
          'so Enter does the safe thing; the confirm button carries the tone of the action; while the action ' +
          'runs the button shows it and the dialog cannot be dismissed; a backdrop click never dismisses it. ' +
          'It is an `alertdialog`, so it is announced as interrupting, with its description.',
      },
    },
  },
  args: {
    open: false,
    title: 'Delete workspace',
    description: 'Every decision in it goes too. This cannot be undone.',
    confirmLabel: 'Delete workspace',
    tone: 'error',
    onConfirm: () => {},
    onCancel: () => {},
  },
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

const story = (text: string) => ({ docs: { description: { story: text } } })

/** Opened from a button, with an action that takes a moment, so pending shows. */
function Demo({ trigger, ...props }: React.ComponentProps<typeof ConfirmDialog> & { trigger: string }) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const confirm = () => {
    setPending(true)
    setTimeout(() => {
      setPending(false)
      setOpen(false)
    }, 1200)
  }
  return (
    <>
      <Button variant={props.tone === 'error' ? 'secondary' : 'primary'} onClick={() => setOpen(true)}>
        {trigger}
      </Button>
      <ConfirmDialog {...props} open={open} pending={pending} onConfirm={confirm} onCancel={() => setOpen(false)} />
    </>
  )
}

export const Playground: Story = {
  render: args => <Demo {...args} trigger="Delete workspace" />,
}

export const Tone: Story = {
  parameters: story(
    "The confirm button carries the action's tone. `error` for what destroys something; `neutral` for a " +
      'consequential step that destroys nothing.',
  ),
  render: args => (
    <Row>
      <Item label="error">
        <Demo {...args} trigger="Delete workspace" />
      </Item>
      <Item label="neutral">
        <Demo
          {...args}
          tone="neutral"
          trigger="Accept decision"
          title="Accept this decision"
          description="An accepted decision can no longer be edited, only superseded."
          confirmLabel="Accept"
        />
      </Item>
    </Row>
  ),
}

export const Kind: Story = {
  parameters: story('`confirm` asks and offers Cancel; `alert` reports and offers one button, focused.'),
  render: args => (
    <Row>
      <Item label="confirm">
        <Demo {...args} trigger="Delete workspace" />
      </Item>
      <Item label="alert">
        <Demo
          {...args}
          kind="alert"
          tone="neutral"
          trigger="Export"
          title="Export finished"
          description="Your palette was saved to Downloads."
          confirmLabel="Done"
        />
      </Item>
    </Row>
  ),
}

export const Pending: Story = {
  name: 'Pending keeps the dialog open',
  parameters: story(
    'Confirm, and the button shows the action running for a moment. Escape and Cancel do nothing until it ' +
      'finishes, so a running action is never abandoned half way.',
  ),
  render: args => <Demo {...args} trigger="Delete workspace" />,
}
