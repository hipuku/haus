import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import {
  CopyChip, ColLabel,
  pageWrap, pageTitleStyle, pageDescStyle,
  tokenValueStyle,
  TableGrid, TH, TD, TableDivider,
} from './_shared'

/* ─── Local constants ────────────────────────────────────────────────────── */

const SHADOW_COLS  = 'auto auto 1fr'
const Z_COLS       = 'auto auto 1fr'
const OP_COLS      = 'auto auto auto 1fr'

/* ─── Shadow data ────────────────────────────────────────────────────────── */

const shadows = [
  { name: 'shadow-none',  css: 'none',               use: 'Explicit elevation reset' },
  { name: 'shadow-sm',    css: 'var(--shadow-sm)',    use: 'Subtle card lift, form inputs' },
  { name: 'shadow-md',    css: 'var(--shadow-md)',    use: 'Dropdowns, select menus' },
  { name: 'shadow-lg',    css: 'var(--shadow-lg)',    use: 'Modals, dialogs' },
  { name: 'shadow-xl',    css: 'var(--shadow-xl)',    use: 'Full-page overlays' },
  { name: 'shadow-focus', css: 'var(--shadow-focus)', use: 'Keyboard focus ring — all interactive elements' },
]

function ShadowDemo({ name, css }: { name: string; css: string }) {
  if (name === 'shadow-focus') {
    return (
      <div style={{ width: 112, display: 'flex', alignItems: 'center' }}>
        <input
          aria-label="Focus ring demo"
          value="Focused"
          readOnly
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--type-body-sm-size)',
            color: 'var(--color-ink-primary)',
            background: 'var(--color-surface-default)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-1) var(--space-2)',
            outline: 'none',
            boxShadow: css,
            width: 90,
          }}
        />
      </div>
    )
  }
  if (name === 'shadow-none') {
    return (
      <div style={{ width: 112, height: 72, flexShrink: 0,
        background: 'var(--color-surface-sunken)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--color-border-strong)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span aria-hidden="true" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-ink-secondary)' }}>flat</span>
      </div>
    )
  }
  return (
    <div style={{ width: 112, height: 72, flexShrink: 0,
      background: 'var(--color-surface-sunken)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 76, height: 48,
        background: 'var(--color-surface-default)',
        borderRadius: 'var(--radius-md)',
        boxShadow: css,
      }} />
    </div>
  )
}

/* ─── Z-index data ───────────────────────────────────────────────────────── */

const zEntries = [
  { name: 'z-tooltip',  value: 600, use: 'Tooltips — always on top' },
  { name: 'z-toast',    value: 500, use: 'Toast notifications' },
  { name: 'z-modal',    value: 400, use: 'Dialogs, modals' },
  { name: 'z-overlay',  value: 300, use: 'Sheet backgrounds, scrim' },
  { name: 'z-sticky',   value: 200, use: 'Sticky headers, fixed toolbars' },
  { name: 'z-dropdown', value: 100, use: 'Menus, selects, popovers' },
  { name: 'z-raised',   value: 10,  use: 'Inline elevated elements' },
  { name: 'z-base',     value: 0,   use: 'Default page flow' },
]

/* ─── Opacity data ───────────────────────────────────────────────────────── */

const opacities = [
  { name: 'opacity-disabled', value: '0.4', use: 'Disabled buttons, inputs, labels' },
  { name: 'opacity-overlay',  value: '0.6', use: 'Modal scrim, backdrop' },
]

/* ─── Pages ──────────────────────────────────────────────────────────────── */

function ShadowsPage() {
  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Shadows</h1>
      <p style={pageDescStyle}>
        Shadows are tinted with damson H=290° so they read as depth, not dirt. The focus ring is a two-layer shadow: an inner ring matches the surface colour to punch a visible gap, then the outer ring carries the focus signal via <code style={{ fontFamily: 'var(--font-mono)' }}>--color-border-focus</code>. Demos on a sunken backdrop so shadow-sm is legible.
      </p>

      <TableGrid columns={SHADOW_COLS}>
        <TH><ColLabel icon="fa-solid fa-eye">Demo</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-tag">Token</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-circle-info">Use</ColLabel></TH>
        <TableDivider />
        {shadows.map(s => (
          <React.Fragment key={s.name}>
            <TD style={{ padding: 'var(--space-3) 0' }}><ShadowDemo name={s.name} css={s.css} /></TD>
            <TD style={{ padding: 'var(--space-3) 0' }}><CopyChip name={s.name} /></TD>
            <TD style={{ padding: 'var(--space-3) 0' }}><span style={{ fontSize: 'var(--type-body-sm-size)', color: 'var(--color-ink-secondary)', whiteSpace: 'nowrap' }}>{s.use}</span></TD>
          </React.Fragment>
        ))}
      </TableGrid>
    </div>
  )
}

function ZIndexPage() {
  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Z-Index</h1>
      <p style={pageDescStyle}>
        Fixed stacking order prevents z-index inflation. Bands are intentionally spaced — a sticky header at 200 and its dropdown at 100 coexist without conflict. Reference via <code style={{ fontFamily: 'var(--font-mono)' }}>var(--z-modal)</code> in CSS or <code style={{ fontFamily: 'var(--font-mono)' }}>tokens.zIndex</code> in JS. Never place a component outside its correct band.
      </p>

      <TableGrid columns={Z_COLS}>
        <TH><ColLabel icon="fa-solid fa-tag">Token</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-hashtag">Value</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-circle-info">Use</ColLabel></TH>
        <TableDivider />
        {zEntries.map(({ name, value, use }) => (
          <React.Fragment key={name}>
            <TD><CopyChip name={name} /></TD>
            <TD><span style={{ ...tokenValueStyle, whiteSpace: 'nowrap' }}>{value}</span></TD>
            <TD><span style={{ fontSize: 'var(--type-body-sm-size)', color: 'var(--color-ink-secondary)', whiteSpace: 'nowrap' }}>{use}</span></TD>
          </React.Fragment>
        ))}
      </TableGrid>
    </div>
  )
}

function OpacityPage() {
  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Opacity</h1>
      <p style={pageDescStyle}>
        Two values for two jobs. <code style={{ fontFamily: 'var(--font-mono)' }}>opacity-disabled</code> (0.4) for unavailable elements — visible but non-interactive. <code style={{ fontFamily: 'var(--font-mono)' }}>opacity-overlay</code> (0.6) for modal scrims. Never simulate colour tints with opacity — use the palette's subtle and border steps instead.
      </p>

      <TableGrid columns={OP_COLS}>
        <TH><ColLabel icon="fa-solid fa-eye">Demo</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-tag">Token</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-hashtag">Value</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-circle-info">Use</ColLabel></TH>
        <TableDivider />
        {opacities.map(({ name, value, use }) => (
          <React.Fragment key={name}>
            <TD>
              <div style={{ display: 'flex', gap: 'var(--space-1)', flexShrink: 0 }}>
                <div style={{ width: 22, height: 28, background: 'var(--color-primary-default)', borderRadius: 'var(--radius-sm)', opacity: parseFloat(value), flexShrink: 0 }} />
                <div style={{ width: 22, height: 28, background: 'var(--color-success-default)', borderRadius: 'var(--radius-sm)', opacity: parseFloat(value), flexShrink: 0 }} />
              </div>
            </TD>
            <TD><CopyChip name={name} /></TD>
            <TD><span style={{ ...tokenValueStyle, whiteSpace: 'nowrap' }}>{value}</span></TD>
            <TD><span style={{ fontSize: 'var(--type-body-sm-size)', color: 'var(--color-ink-secondary)', whiteSpace: 'nowrap' }}>{use}</span></TD>
          </React.Fragment>
        ))}
      </TableGrid>
    </div>
  )
}

/* ─── Meta ───────────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Tokens/Elevation',
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj
export const Shadows: Story = { render: () => <ShadowsPage /> }
export const ZIndex:  Story = { name: 'Z-Index',  render: () => <ZIndexPage /> }
export const Opacity: Story = { render: () => <OpacityPage /> }
