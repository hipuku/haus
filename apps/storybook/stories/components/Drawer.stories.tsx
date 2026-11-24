import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Drawer, Input, Select, Toggle } from 'haus-components'
import React, { useState } from 'react'
import { Item, MotionCompare, Row, usePageMotion, type Mode } from '../helpers'

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "A panel that slides in from the edge of the page, over it: settings, a record's details, a filter " +
          'set. It is a Modal anchored to an edge, so it traps and returns focus, closes on Escape, keeps the ' +
          'page behind still, and leaves on its exit. It enters on the sheet motion role.',
      },
    },
  },
  args: { open: false, onClose: () => {}, title: 'Workspace settings', side: 'end', size: 'sm', children: null },
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

const story = (text: string) => ({ docs: { description: { story: text } } })

/** A settings form: what a drawer usually holds. */
function Settings() {
  const [role, setRole] = useState('author')
  return (
    <div style={{ display: 'grid', gap: 'var(--haus-space-6)' }}>
      <Input label="Workspace name" defaultValue="Quarterly planning" />
      <Select
        label="Default role for new members"
        value={role}
        onChange={setRole}
        options={[
          { value: 'author', label: 'Author', hint: 'Can propose and revise' },
          { value: 'viewer', label: 'Viewer', hint: 'Read only' },
        ]}
      />
      <Toggle label="Email me when a decision is accepted" defaultChecked />
    </div>
  )
}

function Demo({
  trigger = 'Open settings',
  motion,
  ...props
}: Partial<React.ComponentProps<typeof Drawer>> & { trigger?: string; motion?: Mode }) {
  const [open, setOpen] = useState(false)
  usePageMotion(motion, open)
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {trigger}
      </Button>
      <Drawer
        title="Workspace settings"
        {...(props as Record<string, never>)}
        open={open}
        onClose={() => setOpen(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--haus-space-2)' }}>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Save</Button>
          </div>
        }
      >
        <Settings />
      </Drawer>
    </>
  )
}

export const Playground: Story = { render: args => <Demo side={args.side} size={args.size} /> }

export const Side: Story = {
  parameters: story(
    '`end` by default, for details and settings; `start` for navigation or filters that read before the ' +
      'content. Logical, so they follow the writing direction.',
  ),
  render: () => (
    <Row>
      <Item label="end">
        <Demo side="end" trigger="From the end" />
      </Item>
      <Item label="start">
        <Demo side="start" trigger="From the start" />
      </Item>
    </Row>
  ),
}

export const Size: Story = {
  parameters: story("Modal's widths: sm (400px) for a short form, md (560px) for most, lg (720px) for a record."),
  render: () => (
    <Row>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <Item key={size} label={size}>
          <Demo size={size} trigger={`Open, ${size}`} />
        </Item>
      ))}
    </Row>
  ),
}

export const Motion: Story = {
  parameters: story(
    'Open each drawer and close it again. Subtle slides it in from its edge; expressive slides it on a spring ' +
      'that settles; reduced fades it in place.',
  ),
  render: () => (
    <MotionCompare
      replay={false}
      hint="Open each drawer and close it again to compare the modes."
      render={mode => <Demo motion={mode} trigger={`Open, ${mode}`} />}
    />
  ),
}
