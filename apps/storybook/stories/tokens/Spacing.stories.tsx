import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import {
  CopyChip, ColLabel,
  pageWrap, pageTitleStyle, pageDescStyle,
  tokenValueStyle,
  TableGrid, TH, TD, TableDivider,
} from './_shared'

/* ─── Space ──────────────────────────────────────────────────────────────── */

const SPACE_COLS   = 'auto auto 1fr'
const BORDER_COLS  = 'auto auto auto 1fr'

const spacing = [
  { name: 'space-1',  rem: '0.25rem', px: '4px'  },
  { name: 'space-2',  rem: '0.5rem',  px: '8px'  },
  { name: 'space-3',  rem: '0.75rem', px: '12px' },
  { name: 'space-4',  rem: '1rem',    px: '16px' },
  { name: 'space-5',  rem: '1.25rem', px: '20px' },
  { name: 'space-6',  rem: '1.5rem',  px: '24px' },
  { name: 'space-7',  rem: '1.75rem', px: '28px' },
  { name: 'space-8',  rem: '2rem',    px: '32px' },
  { name: 'space-10', rem: '2.5rem',  px: '40px' },
  { name: 'space-12', rem: '3rem',    px: '48px' },
  { name: 'space-16', rem: '4rem',    px: '64px' },
  { name: 'space-20', rem: '5rem',    px: '80px' },
]

const radius = [
  { name: 'radius-none', value: '0',       px: '0'    },
  { name: 'radius-sm',   value: '0.25rem', px: '4px'  },
  { name: 'radius-md',   value: '0.5rem',  px: '8px'  },
  { name: 'radius-lg',   value: '0.75rem', px: '12px' },
  { name: 'radius-xl',   value: '1rem',    px: '16px' },
  { name: 'radius-2xl',  value: '1.5rem',  px: '24px' },
  { name: 'radius-full', value: '9999px',  px: '∞'    },
]

const spaceRoles = [
  { name: 'space-inset-2xs', alias: 'space-1', px: '4px',  use: 'Button' },
  { name: 'space-inset-xs',  alias: 'space-2', px: '8px',  use: 'Badge, Button, Checkbox, Input, Select, Textarea' },
  { name: 'space-inset-sm',  alias: 'space-3', px: '12px', use: 'Button, Input, Select, Textarea, Toast' },
  { name: 'space-inset-md',  alias: 'space-4', px: '16px', use: 'Button, Checkbox, Modal, Toast' },
  { name: 'space-inset-lg',  alias: 'space-5', px: '20px', use: 'Button, Card, Modal' },
  { name: 'space-inset-xl',  alias: 'space-6', px: '24px', use: 'Modal' },
  { name: 'space-inset-2xl', alias: 'space-8', px: '32px', use: 'Select' },
  { name: 'space-gap-2xs',   alias: 'space-1', px: '4px',  use: 'Badge, Input, Radio, Select, Textarea, Toast' },
  { name: 'space-gap-xs',    alias: 'space-2', px: '8px',  use: 'Button, Checkbox, Input, Radio' },
  { name: 'space-gap-sm',    alias: 'space-3', px: '12px', use: 'Modal, Radio, Toast, Toggle' },
  { name: 'space-gap-md',    alias: 'space-4', px: '16px', use: 'Modal, Radio' },
  { name: 'space-stack-2xs', alias: 'space-1', px: '4px',  use: 'Checkbox, Input, Radio, Select, Textarea' },
  { name: 'space-stack-xs',  alias: 'space-2', px: '8px',  use: 'Radio' },
]

const radiusRoles = [
  { name: 'radius-control', alias: 'radius-md',   value: '0.5rem',  use: 'Button, Input, Select, Textarea' },
  { name: 'radius-surface', alias: 'radius-lg',   value: '0.75rem', use: 'Card, Toast' },
  { name: 'radius-overlay', alias: 'radius-xl',   value: '1rem',    use: 'Modal' },
  { name: 'radius-marker',  alias: 'radius-sm',   value: '0.25rem', use: 'Checkbox, Modal and Toast icons' },
  { name: 'radius-pill',    alias: 'radius-full', value: '9999px',  use: 'Badge, Toggle track' },
]

const borderWidths = [
  { name: 'border-width-default', value: '1px', use: 'Inputs, dividers, cards' },
  { name: 'border-width-thick',   value: '2px', use: 'Active inputs, selected states' },
]

/* ─── Pages ──────────────────────────────────────────────────────────────── */

function SpacePage() {
  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Space</h1>
      <p style={pageDescStyle}>
        4px grid. Every token is a multiple of 4. <code style={{ fontFamily: 'var(--haus-font-mono)' }}>space-1</code> through <code style={{ fontFamily: 'var(--haus-font-mono)' }}>space-6</code> for component internals: gaps, padding, inline spacing. <code style={{ fontFamily: 'var(--haus-font-mono)' }}>space-8</code> and above for layout: section margins, page gutters.
      </p>

      <TableGrid columns={SPACE_COLS}>
        <TH><ColLabel icon="fa-solid fa-ruler-horizontal">Scale</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-tag">Token</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-hashtag">Value</ColLabel></TH>
        <TableDivider />
        {spacing.map(({ name, rem, px }) => (
          <React.Fragment key={name}>
            <TD>
              <div style={{ display: 'flex', alignItems: 'center', minWidth: 80 }}>
                <div style={{
                  height: 12,
                  width: px,
                  maxWidth: '100%',
                  background: 'var(--haus-color-primary-default)',
                  borderRadius: 'var(--haus-radius-sm)',
                }} />
              </div>
            </TD>
            <TD><CopyChip name={name} /></TD>
            <TD><span style={tokenValueStyle}>{rem} · {px}</span></TD>
          </React.Fragment>
        ))}
      </TableGrid>
    </div>
  )
}

function RadiusPage() {
  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Radius</h1>
      <p style={pageDescStyle}>
        Seven steps from sharp to pill. <code style={{ fontFamily: 'var(--haus-font-mono)' }}>radius-md</code> for interactive elements, <code style={{ fontFamily: 'var(--haus-font-mono)' }}>radius-lg</code> for cards and panels, <code style={{ fontFamily: 'var(--haus-font-mono)' }}>radius-2xl</code> for dialogs. Use <code style={{ fontFamily: 'var(--haus-font-mono)' }}>radius-none</code> to explicitly clear corners, and never hardcode 0.
      </p>

      <div style={{ display: 'flex', gap: 'var(--haus-space-6)', flexWrap: 'wrap', marginTop: 'var(--haus-space-2)' }}>
        {radius.map(({ name, value, px }) => (
          <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--haus-space-2)' }}>
            <div style={{
              width: 96, height: 60,
              background: 'var(--haus-color-primary-subtle)',
              border: '1px solid var(--haus-color-primary-default)',
              borderRadius: value,
            }} />
            <CopyChip name={name} />
            <span style={tokenValueStyle}>{px}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const ROLE_COLS = 'auto auto auto 1fr'

function SpaceRolesPage() {
  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Space roles</h1>
      <p style={pageDescStyle}>
        Three roles over one ladder. <code style={{ fontFamily: 'var(--haus-font-mono)' }}>inset</code> is padding, the space inside a component between its edge and its content. <code style={{ fontFamily: 'var(--haus-font-mono)' }}>gap</code> is space between siblings, set by the parent. <code style={{ fontFamily: 'var(--haus-font-mono)' }}>stack</code> is margin, space a component asks for around itself. A step is the same size whichever role reads it, so the roles stay comparable, and splitting them is what lets padding be retuned later without moving page rhythm. Components read these; the ladder below them is for sizes.
      </p>

      <TableGrid columns={ROLE_COLS}>
        <TH><ColLabel icon="fa-solid fa-tag">Token</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-arrow-down-long">Aliases</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-hashtag">Value</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-circle-info">Use</ColLabel></TH>
        <TableDivider />
        {spaceRoles.map(({ name, alias, px, use }) => (
          <React.Fragment key={name}>
            <TD><CopyChip name={name} /></TD>
            <TD><span style={{ ...tokenValueStyle, whiteSpace: 'nowrap' }}>{alias}</span></TD>
            <TD><span style={{ ...tokenValueStyle, whiteSpace: 'nowrap' }}>{px}</span></TD>
            <TD><span style={{ fontSize: 'var(--haus-type-body-sm-size)', color: 'var(--haus-color-ink-secondary)' }}>{use}</span></TD>
          </React.Fragment>
        ))}
      </TableGrid>
    </div>
  )
}

function RadiusRolesPage() {
  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Radius roles</h1>
      <p style={pageDescStyle}>
        Named for what is rounded, so a component asks for the shape of the thing rather than a size off the ramp. Retuning every control is one edit here.
      </p>

      <TableGrid columns={ROLE_COLS}>
        <TH><ColLabel icon="fa-solid fa-eye">Demo</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-tag">Token</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-arrow-down-long">Aliases</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-circle-info">Use</ColLabel></TH>
        <TableDivider />
        {radiusRoles.map(({ name, alias, value, use }) => (
          <React.Fragment key={name}>
            <TD>
              <div style={{
                width: 56, height: 32,
                background: 'var(--haus-color-primary-subtle)',
                border: '1px solid var(--haus-color-primary-default)',
                borderRadius: value,
              }} />
            </TD>
            <TD><CopyChip name={name} /></TD>
            <TD><span style={{ ...tokenValueStyle, whiteSpace: 'nowrap' }}>{alias}</span></TD>
            <TD><span style={{ fontSize: 'var(--haus-type-body-sm-size)', color: 'var(--haus-color-ink-secondary)' }}>{use}</span></TD>
          </React.Fragment>
        ))}
      </TableGrid>
    </div>
  )
}

function BorderWidthPage() {
  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Border Width</h1>
      <p style={pageDescStyle}>
        Two widths. <code style={{ fontFamily: 'var(--haus-font-mono)' }}>default</code> (1px) for structure: inputs, dividers, cards. <code style={{ fontFamily: 'var(--haus-font-mono)' }}>thick</code> (2px) for active and selected states only. Never introduce a third.
      </p>

      <TableGrid columns={BORDER_COLS}>
        <TH><ColLabel icon="fa-solid fa-eye">Demo</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-tag">Token</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-hashtag">Value</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-circle-info">Use</ColLabel></TH>
        <TableDivider />
        {borderWidths.map(({ name, value, use }) => (
          <React.Fragment key={name}>
            <TD>
              <div style={{ display: 'flex', alignItems: 'center', minWidth: 44 }}>
                <div style={{ width: 44, borderBottom: `${value} solid var(--haus-color-ink-primary)` }} />
              </div>
            </TD>
            <TD><CopyChip name={name} /></TD>
            <TD><span style={{ ...tokenValueStyle, whiteSpace: 'nowrap' }}>{value}</span></TD>
            <TD><span style={{ fontSize: 'var(--haus-type-body-sm-size)', color: 'var(--haus-color-ink-secondary)', whiteSpace: 'nowrap' }}>{use}</span></TD>
          </React.Fragment>
        ))}
      </TableGrid>
    </div>
  )
}

/* ─── Meta ───────────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Tokens/Spacing',
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj
export const Space:       Story = { render: () => <SpacePage /> }
export const SpaceRoles:  Story = { name: 'Space roles',  render: () => <SpaceRolesPage /> }
export const Radius:      Story = { render: () => <RadiusPage /> }
export const RadiusRoles: Story = { name: 'Radius roles', render: () => <RadiusRolesPage /> }
export const BorderWidth: Story = { render: () => <BorderWidthPage /> }
