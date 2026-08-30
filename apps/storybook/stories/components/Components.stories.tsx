import type { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'
import {
  Button,
  Input,
  Card,
  Select,
  Textarea,
  Badge,
  Avatar,
  Toast,
  Modal,
} from 'haus-components'
import { pageWrap, pageTitleStyle, pageDescStyle } from '../tokens/_shared'

/* ─── Layout helpers ─────────────────────────────────────────────────────── */

const sectionHead: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--type-label-xs-size)',
  fontWeight: 500,
  letterSpacing: 'var(--tracking-widest)',
  textTransform: 'uppercase',
  color: 'var(--color-ink-secondary)',
  margin: 'var(--space-8) 0 var(--space-4)',
  paddingBottom: 'var(--space-2)',
  borderBottom: '1px solid var(--color-border-subtle)',
}

const Row = ({ children, gap = 'var(--space-3)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap }}>{children}</div>
)

/* ─── Buttons page ───────────────────────────────────────────────────────── */

function ButtonsPage() {
  const [loading, setLoading] = useState(false)

  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Button</h1>
      <p style={pageDescStyle}>
        Six variants, three sizes, loading and disabled states. The primary variant uses aronia.
        Ghost is for secondary actions where a border would add visual noise. Text is for inline
        actions, inheriting colour from context, hover thickens the underline. External matches Text
        but appends a diagonal arrow and adds rel="noopener noreferrer" automatically.
      </p>

      <h2 style={sectionHead}>Variants</h2>
      <Row gap="var(--space-3)">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="text">Text</Button>
        <Button variant="external">External</Button>
      </Row>

      <h2 style={sectionHead}>Text + external, in context</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-sans)', fontSize: 'var(--type-body-sm-size)', color: 'var(--color-ink-secondary)' }}>
          Showing results 1–20 of 84.
          <Button variant="text" size="sm">Load more</Button>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-surface-inverse)', borderRadius: 'var(--radius-lg)', color: 'var(--color-ink-inverse)', fontFamily: 'var(--font-sans)', fontSize: 'var(--type-label-size)' }}>
          Colour deleted
          <Button variant="text" size="sm">Undo</Button>
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--type-body-sm-size)', color: 'var(--color-ink-secondary)' }}>
          Learn more in the{' '}
          <Button variant="external" size="sm" href="#" target="_blank">documentation</Button>
          {' '}or view the{' '}
          <Button variant="external" size="sm" href="#" target="_blank">source on GitHub</Button>
        </div>
      </div>

      <h2 style={sectionHead}>Sizes</h2>
      <Row>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </Row>

      <h2 style={sectionHead}>States</h2>
      <Row>
        <Button disabled>Disabled</Button>
        <Button variant="secondary" disabled>Disabled</Button>
        <Button
          loading={loading}
          onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000) }}
        >
          {loading ? 'Loading…' : 'Click to load'}
        </Button>
      </Row>

      <h2 style={sectionHead}>As link</h2>
      <Row>
        <Button href="https://hipuku.dev" target="_blank" variant="secondary">
          Open link ↗
        </Button>
      </Row>
    </div>
  )
}

/* ─── Form controls page ────────────────────────────────────────────────── */

function FormControlsPage() {
  const [value, setValue] = useState('')

  return (
    <div style={{ ...pageWrap, maxWidth: 680 }}>
      <h1 style={pageTitleStyle}>Form Controls</h1>
      <p style={pageDescStyle}>
        Input, Select, and Textarea all share the same label/hint/error pattern.
        Focus ring uses the primary colour. Error state overrides the border colour and focus ring.
      </p>

      <h2 style={sectionHead}>Input states</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input label="Default" placeholder="Enter a value" />
        <Input label="With hint" hint="This is a hint message" placeholder="Enter a value" />
        <Input label="With error" error="This field is required" value="" readOnly />
        <Input label="Disabled" disabled placeholder="Cannot edit" />
        <Input label="Required" required placeholder="Required field" />
        <Input label="With prefix" prefix="$" placeholder="0.00" />
        <Input label="With suffix" suffix=".hipuku.dev" placeholder="subdomain" />
      </div>

      <h2 style={sectionHead}>Select</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Select
          label="Role"
          placeholder="Choose a role"
          options={[
            { value: 'engineer', label: 'Engineer' },
            { value: 'designer', label: 'Designer' },
            { value: 'manager', label: 'Manager' },
          ]}
        />
        <Select label="With error" error="Please select an option" options={[
          { value: 'a', label: 'Option A' }
        ]} />
      </div>

      <h2 style={sectionHead}>Textarea</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Textarea
          label="Notes"
          hint="Up to 500 characters"
          placeholder="Write something…"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <Textarea label="With error" error="This field cannot be empty" />
        <Textarea label="Disabled" disabled placeholder="Read only" />
      </div>
    </div>
  )
}

/* ─── Card page ──────────────────────────────────────────────────────────── */

function CardPage() {
  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Card</h1>
      <p style={pageDescStyle}>
        Three variants. Elevated uses shadow for depth; no border. Outlined uses a thicker border
        for emphasis. Default is the everyday container.
      </p>

      <h2 style={sectionHead}>Variants</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-5)' }}>
        <Card variant="default">
          <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--type-body-sm-size)', color: 'var(--color-ink-secondary)' }}>
            Default card, bordered, with a surface-raised background.
          </p>
        </Card>
        <Card variant="elevated">
          <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--type-body-sm-size)', color: 'var(--color-ink-secondary)' }}>
            Elevated card, with a shadow and no border.
          </p>
        </Card>
        <Card variant="outlined">
          <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--type-body-sm-size)', color: 'var(--color-ink-secondary)' }}>
            Outlined card, with a thick border and no shadow.
          </p>
        </Card>
      </div>

      <h2 style={sectionHead}>Without padding</h2>
      <div style={{ maxWidth: 320 }}>
        <Card padding={false}>
          <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 'var(--type-label-size)' }}>Card header</span>
          </div>
          <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
            <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--type-body-sm-size)', color: 'var(--color-ink-secondary)' }}>
              Using padding=false lets you control spacing per-section.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ─── Badge page ─────────────────────────────────────────────────────────── */

function BadgePage() {
  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Badge</h1>
      <p style={pageDescStyle}>
        Six colour variants × two appearances (subtle / solid). Subtle for status indicators
        in context; solid for standalone tags and labels.
      </p>

      <h2 style={sectionHead}>Subtle (default)</h2>
      <Row>
        <Badge variant="neutral">Neutral</Badge>
        <Badge variant="primary">Primary</Badge>
        <Badge variant="info">Info</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="error">Error</Badge>
      </Row>

      <h2 style={sectionHead}>Solid</h2>
      <Row>
        <Badge variant="neutral"  appearance="solid">Neutral</Badge>
        <Badge variant="primary"  appearance="solid">Primary</Badge>
        <Badge variant="info"     appearance="solid">Info</Badge>
        <Badge variant="success"  appearance="solid">Success</Badge>
        <Badge variant="warning"  appearance="solid">Warning</Badge>
        <Badge variant="error"    appearance="solid">Error</Badge>
      </Row>

      <h2 style={sectionHead}>With dot indicator</h2>
      <Row>
        <Badge dot variant="success">Active</Badge>
        <Badge dot variant="warning">Pending</Badge>
        <Badge dot variant="error">Failed</Badge>
        <Badge dot variant="neutral">Inactive</Badge>
      </Row>
    </div>
  )
}

/* ─── Avatar page ────────────────────────────────────────────────────────── */

function AvatarPage() {
  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Avatar</h1>
      <p style={pageDescStyle}>
        Five sizes. Falls back to initials when no image src is provided. Status indicator
        anchors to the bottom-right corner.
      </p>

      <h2 style={sectionHead}>Sizes, with initials fallback</h2>
      <Row gap="var(--space-4)">
        <Avatar size="xs" name="Ada Lovelace" />
        <Avatar size="sm" name="Ada Lovelace" />
        <Avatar size="md" name="Ada Lovelace" />
        <Avatar size="lg" name="Ada Lovelace" />
        <Avatar size="xl" name="Ada Lovelace" />
      </Row>

      <h2 style={sectionHead}>With status</h2>
      <Row gap="var(--space-4)">
        <Avatar size="md" name="Online User"  status="online"  />
        <Avatar size="md" name="Away User"    status="away"    />
        <Avatar size="md" name="Busy User"    status="busy"    />
        <Avatar size="md" name="Offline User" status="offline" />
      </Row>

      <h2 style={sectionHead}>No name (fallback icon)</h2>
      <Row>
        <Avatar size="md" />
        <Avatar size="lg" />
      </Row>
    </div>
  )
}

/* ─── Toast page ─────────────────────────────────────────────────────────── */

function ToastPage() {
  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Toast</h1>
      <p style={pageDescStyle}>
        Five variants. Neutral inverts the surface, which suits generic notifications.
        All others use the feedback colour scale. Title is required; description and action
        are optional. Close button appears when onClose is provided.
      </p>

      <h2 style={sectionHead}>Variants</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: 380 }}>
        <Toast variant="neutral" title="Saved"            description="Your changes have been saved." onClose={() => {}} />
        <Toast variant="info"    title="Update available" description="Version 2.0 is ready to install." onClose={() => {}} />
        <Toast variant="success" title="Published"        description="Your post is now live." onClose={() => {}} />
        <Toast variant="warning" title="Expiring soon"    description="Your session will expire in 5 minutes." onClose={() => {}} />
        <Toast variant="error"   title="Upload failed"    description="The file exceeds the 10MB limit." onClose={() => {}} />
      </div>

      <h2 style={sectionHead}>Without close button</h2>
      <div style={{ maxWidth: 380 }}>
        <Toast variant="info" title="Processing" description="This may take a few seconds." />
      </div>

      <h2 style={sectionHead}>With action</h2>
      <div style={{ maxWidth: 380 }}>
        <Toast
          variant="neutral"
          title="Colour deleted"
          action={<Button variant="text" size="sm">Undo</Button>}
          onClose={() => {}}
        />
      </div>
    </div>
  )
}

/* ─── Modal page ─────────────────────────────────────────────────────────── */

function ModalPage() {
  const [open, setOpen] = useState<'sm' | 'md' | 'lg' | null>(null)

  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Modal</h1>
      <p style={pageDescStyle}>
        Three sizes. Renders into a portal at document.body. Closes on Escape, backdrop click,
        or the close button. Focus is trapped inside and restored on close.
      </p>

      <h2 style={sectionHead}>Sizes</h2>
      <Row>
        <Button variant="secondary" onClick={() => setOpen('sm')}>Small</Button>
        <Button variant="secondary" onClick={() => setOpen('md')}>Medium</Button>
        <Button variant="secondary" onClick={() => setOpen('lg')}>Large</Button>
      </Row>

      <Modal size="sm" open={open === 'sm'} onClose={() => setOpen(null)} title="Small modal"
        footer={<><Button variant="ghost" onClick={() => setOpen(null)}>Cancel</Button><Button onClick={() => setOpen(null)}>Confirm</Button></>}
      >
        <p style={{ margin: 0, color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--type-body-sm-size)', lineHeight: 'var(--type-body-sm-leading)' }}>
          A compact modal for short confirmations or quick actions.
        </p>
      </Modal>

      <Modal size="md" open={open === 'md'} onClose={() => setOpen(null)} title="Medium modal"
        footer={<><Button variant="ghost" onClick={() => setOpen(null)}>Cancel</Button><Button onClick={() => setOpen(null)}>Save changes</Button></>}
      >
        <p style={{ margin: 0, color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--type-body-sm-size)', lineHeight: 'var(--type-body-sm-leading)' }}>
          The default size. Use for forms, detail views, and most dialog content.
          This is the size you'll reach for most of the time.
        </p>
      </Modal>

      <Modal size="lg" open={open === 'lg'} onClose={() => setOpen(null)} title="Large modal"
        footer={<><Button variant="ghost" onClick={() => setOpen(null)}>Cancel</Button><Button onClick={() => setOpen(null)}>Apply</Button></>}
      >
        <p style={{ margin: 0, color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--type-body-sm-size)', lineHeight: 'var(--type-body-sm-leading)' }}>
          For complex content that needs more horizontal space: colour import wizards,
          multi-column forms, data tables.
        </p>
      </Modal>
    </div>
  )
}

/* ─── Meta + exports ─────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Components',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj
export const Buttons:      Story = { render: () => <ButtonsPage /> }
export const FormControls: Story = { render: () => <FormControlsPage /> }
export const Cards:        Story = { render: () => <CardPage /> }
export const Badges:       Story = { render: () => <BadgePage /> }
export const Avatars:      Story = { render: () => <AvatarPage /> }
export const Toasts:       Story = { render: () => <ToastPage /> }
export const Modals:       Story = { render: () => <ModalPage /> }
