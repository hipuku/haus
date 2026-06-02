import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { Checkbox, RadioGroup, Toggle } from '@haus/components'
import { pageWrap, pageTitleStyle, pageDescStyle } from '../tokens/_shared'

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

/* ─── Checkbox page ──────────────────────────────────────────────────────── */

function CheckboxPage() {
  const [checked, setChecked] = useState(false)

  return (
    <div style={{ ...pageWrap, maxWidth: 560 }}>
      <h1 style={pageTitleStyle}>Checkbox</h1>
      <p style={pageDescStyle}>
        Controlled and uncontrolled. Indeterminate state for partial selection.
        Label, hint, and error follow the same pattern as Input.
      </p>

      <h2 style={sectionHead}>States</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Checkbox label="Unchecked" />
        <Checkbox label="Checked" defaultChecked />
        <Checkbox label="Indeterminate" indeterminate />
        <Checkbox label="Disabled" disabled />
        <Checkbox label="Disabled checked" disabled defaultChecked />
        <Checkbox label="With error" error="This field is required" />
      </div>

      <h2 style={sectionHead}>With hint</h2>
      <Checkbox
        label="Send me product updates"
        hint="We'll email you about new features and improvements."
      />

      <h2 style={sectionHead}>Required</h2>
      <Checkbox
        label="I agree to the terms of service"
        required
      />

      <h2 style={sectionHead}>Controlled</h2>
      <Checkbox
        label={checked ? 'Checked' : 'Unchecked'}
        checked={checked}
        onChange={setChecked}
      />
    </div>
  )
}

/* ─── RadioGroup page ────────────────────────────────────────────────────── */

function RadioPage() {
  const [plan, setPlan] = useState('monthly')
  const [role, setRole] = useState('')

  return (
    <div style={{ ...pageWrap, maxWidth: 560 }}>
      <h1 style={pageTitleStyle}>Radio</h1>
      <p style={pageDescStyle}>
        Always rendered as a RadioGroup — individual radios without a group are inaccessible.
        Supports vertical (default) and horizontal orientation. Hint text per option.
      </p>

      <h2 style={sectionHead}>Vertical (default)</h2>
      <RadioGroup
        name="plan"
        label="Billing period"
        value={plan}
        onChange={setPlan}
        options={[
          { value: 'monthly', label: 'Monthly',  hint: '$12/month' },
          { value: 'yearly',  label: 'Yearly',   hint: '$99/year — save 31%' },
          { value: 'lifetime', label: 'Lifetime', hint: 'One-time $299' },
        ]}
      />

      <h2 style={sectionHead}>Horizontal</h2>
      <RadioGroup
        name="size"
        label="Size"
        defaultValue="md"
        orientation="horizontal"
        options={[
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
          { value: 'lg', label: 'Large' },
        ]}
      />

      <h2 style={sectionHead}>With error</h2>
      <RadioGroup
        name="role"
        label="Your role"
        required
        value={role}
        onChange={setRole}
        error={!role ? 'Please select a role' : undefined}
        options={[
          { value: 'engineer',  label: 'Engineer' },
          { value: 'designer',  label: 'Designer' },
          { value: 'manager',   label: 'Manager' },
        ]}
      />

      <h2 style={sectionHead}>With disabled option</h2>
      <RadioGroup
        name="tier"
        label="Tier"
        defaultValue="free"
        options={[
          { value: 'free',       label: 'Free' },
          { value: 'pro',        label: 'Pro' },
          { value: 'enterprise', label: 'Enterprise', hint: 'Contact sales', disabled: true },
        ]}
      />
    </div>
  )
}

/* ─── Toggle page ────────────────────────────────────────────────────────── */

function TogglePage() {
  const [notifs, setNotifs]     = useState(true)
  const [autoSave, setAutoSave] = useState(false)

  return (
    <div style={{ ...pageWrap, maxWidth: 560 }}>
      <h1 style={pageTitleStyle}>Toggle</h1>
      <p style={pageDescStyle}>
        Uses <code style={{ fontFamily: 'var(--font-mono)' }}>role="switch"</code> for
        correct ARIA semantics. Two sizes. Label can sit left or right of the track.
      </p>

      <h2 style={sectionHead}>States</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Toggle label="Off (default)" />
        <Toggle label="On" defaultChecked />
        <Toggle label="Disabled off" disabled />
        <Toggle label="Disabled on" disabled defaultChecked />
      </div>

      <h2 style={sectionHead}>With description</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <Toggle
          label="Push notifications"
          description="Receive alerts for mentions and replies."
          checked={notifs}
          onChange={setNotifs}
        />
        <Toggle
          label="Auto-save"
          description="Save changes automatically every 30 seconds."
          checked={autoSave}
          onChange={setAutoSave}
        />
      </div>

      <h2 style={sectionHead}>Sizes</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
        <Toggle size="sm" label="Small" defaultChecked />
        <Toggle size="md" label="Medium" defaultChecked />
      </div>

      <h2 style={sectionHead}>Label position</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: 300 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
          <Toggle label="Dark mode" labelPosition="right" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
          <Toggle label="Compact view" labelPosition="right" defaultChecked />
        </div>
      </div>
    </div>
  )
}

/* ─── Meta ───────────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Components',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj
export const Checkboxes:   Story = { render: () => <CheckboxPage /> }
export const RadioButtons: Story = { render: () => <RadioPage /> }
export const Toggles:      Story = { render: () => <TogglePage /> }
