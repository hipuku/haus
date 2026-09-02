import type { Meta, StoryObj } from '@storybook/react-vite'
import React, { useRef, useState } from 'react'
import { Button, Modal } from 'haus-components'

const meta = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A dialog that traps focus and gives it back. The types require either ' +
          'a `title` or an `aria-label`, because a dialog with no accessible name ' +
          'is announced as nothing.\n\n' +
          '`initialFocus` points focus at the action rather than the container, ' +
          'and `dismissOnBackdrop` can refuse a backdrop click — worth turning ' +
          'off for anything destructive or anything holding unsaved input.',
      },
    },
  },
  argTypes: {
    title: { control: 'text' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    dismissOnBackdrop: { control: 'boolean' },
  },
  args: { title: 'Delete workspace', size: 'md', dismissOnBackdrop: true, open: true },
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

/** Opened from a button, so the focus restore is visible rather than described. */
function Demo({ children, ...args }: React.ComponentProps<typeof Modal>) {
  const [open, setOpen] = useState(false)
  const confirm = useRef<HTMLButtonElement>(null)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open the dialog</Button>
      <Modal
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        initialFocus={args.initialFocus === undefined ? undefined : confirm}
        footer={
          <div style={{ display: 'flex', gap: 'var(--haus-space-2)', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button ref={confirm} tone="error" onClick={() => setOpen(false)}>Delete</Button>
          </div>
        }
      >
        {children}
      </Modal>
    </>
  )
}

export const Playground: Story = {
  render: (args) => <Demo {...args}>This cannot be undone.</Demo>,
}

export const FocusTheAction: Story = {
  name: 'Focus starts on the action',
  render: (args) => (
    <Demo {...args} initialFocus={{ current: null }}>
      Focus lands on Delete rather than on the dialog, so a confirm with one
      obvious action does not make you tab to it.
    </Demo>
  ),
}

export const NoBackdropDismiss: Story = {
  name: 'Refuses a backdrop click',
  args: { dismissOnBackdrop: false },
  render: (args) => (
    <Demo {...args}>A misplaced click should not discard what you were doing.</Demo>
  ),
}

export const Sizes: Story = {
  render: (args) => <Demo {...args} size="lg">A larger dialog.</Demo>,
  args: { size: 'lg' },
}
