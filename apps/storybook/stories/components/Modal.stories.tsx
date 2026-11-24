import type { Meta, StoryObj } from '@storybook/react-vite'
import React, { useRef, useState } from 'react'
import { Button, Modal } from 'haus-components'
import { MotionCompare, usePageMotion, type Mode } from '../helpers'

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
          'and `dismissOnBackdrop` can refuse a backdrop click, worth turning ' +
          'off for anything destructive or anything holding unsaved input.',
      },
    },
  },
  argTypes: {
    title: { control: 'text' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
    dismissOnBackdrop: { control: 'boolean' },
  },
  args: { title: 'Delete workspace', size: 'md', dismissOnBackdrop: true, open: true },
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

/** Opened from a button, so the focus restore is visible rather than described. */
function Demo({
  children,
  trigger = 'Open the dialog',
  motion,
  ...args
}: React.ComponentProps<typeof Modal> & { trigger?: string; motion?: Mode }) {
  const [open, setOpen] = useState(false)
  usePageMotion(motion, open)
  const confirm = useRef<HTMLButtonElement>(null)
  return (
    <>
      <Button onClick={() => setOpen(true)}>{trigger}</Button>
      <Modal
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        initialFocus={args.initialFocus === undefined ? undefined : confirm}
        footer={
          <div style={{ display: 'flex', gap: 'var(--haus-space-2)', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button ref={confirm} tone="error" onClick={() => setOpen(false)}>
              Delete
            </Button>
          </div>
        }
      >
        {children}
      </Modal>
    </>
  )
}

const story = (text: string) => ({ docs: { description: { story: text } } })

export const Playground: Story = {
  render: args => <Demo {...args}>This cannot be undone.</Demo>,
}

const SIZES = [
  { size: 'sm', label: 'Small, 400px', use: 'A confirmation or a short form: one question, one or two fields.' },
  { size: 'md', label: 'Medium, 560px', use: 'The default. Most forms and messages.' },
  { size: 'lg', label: 'Large, 720px', use: 'Code, tables and previews that need the line length.' },
  { size: 'xl', label: 'Extra large, 896px', use: 'Wide dashboards and previews.' },
] as const

export const Size: Story = {
  parameters: story('The four widths, each for a kind of content. Open them one after another to compare.'),
  render: args => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--haus-space-3)' }}>
      {SIZES.map(({ size, label, use }) => (
        <Demo key={size} {...args} size={size} title={label} trigger={label}>
          {use}
        </Demo>
      ))}
    </div>
  ),
}

export const Motion: Story = {
  parameters: story(
    'Open each dialog and close it again. Subtle moves the backdrop and dialog together; expressive leads with ' +
      'the backdrop on the way in, rises 24px on a spring, and brings the header, body and footer in one after ' +
      'another; reduced is a short fade.',
  ),
  render: args => (
    <MotionCompare
      replay={false}
      hint="Open each dialog and close it again to compare the modes."
      render={mode => (
        <Demo {...args} motion={mode} trigger={`Open, ${mode}`}>
          Watch the backdrop and the dialog arrive, then close it.
        </Demo>
      )}
    />
  ),
}

export const FocusTheAction: Story = {
  name: 'Focus starts on the action',
  parameters: story('`initialFocus` points focus at the one obvious action, so a confirmation needs no tabbing.'),
  render: args => (
    <Demo {...args} initialFocus={{ current: null }}>
      Focus lands on Delete rather than on the dialog, so a confirm with one obvious action does not make you tab to it.
    </Demo>
  ),
}

export const NoBackdropDismiss: Story = {
  name: 'Refuses a backdrop click',
  parameters: story('`dismissOnBackdrop={false}` for anything destructive or holding unsaved input.'),
  args: { dismissOnBackdrop: false },
  render: args => <Demo {...args}>A misplaced click should not discard what you were doing.</Demo>,
}
