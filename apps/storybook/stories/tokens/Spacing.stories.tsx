import type { Meta, StoryObj } from '@storybook/react'
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
        4px grid. Every token is a multiple of 4. <code style={{ fontFamily: 'var(--font-mono)' }}>space-1</code> through <code style={{ fontFamily: 'var(--font-mono)' }}>space-6</code> for component internals — gaps, padding, inline spacing. <code style={{ fontFamily: 'var(--font-mono)' }}>space-8</code> and above for layout — section margins, page gutters.
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
                  background: 'var(--color-primary-default)',
                  borderRadius: 'var(--radius-sm)',
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
        Seven steps from sharp to pill. <code style={{ fontFamily: 'var(--font-mono)' }}>radius-md</code> for interactive elements, <code style={{ fontFamily: 'var(--font-mono)' }}>radius-lg</code> for cards and panels, <code style={{ fontFamily: 'var(--font-mono)' }}>radius-2xl</code> for dialogs. Use <code style={{ fontFamily: 'var(--font-mono)' }}>radius-none</code> to explicitly clear corners — never hardcode 0.
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
        {radius.map(({ name, value, px }) => (
          <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{
              width: 96, height: 60,
              background: 'var(--color-primary-subtle)',
              border: '1px solid var(--color-primary-default)',
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

function BorderWidthPage() {
  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Border Width</h1>
      <p style={pageDescStyle}>
        Two widths. <code style={{ fontFamily: 'var(--font-mono)' }}>default</code> (1px) for structure — inputs, dividers, cards. <code style={{ fontFamily: 'var(--font-mono)' }}>thick</code> (2px) for active and selected states only. Never introduce a third.
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
                <div style={{ width: 44, borderBottom: `${value} solid var(--color-ink-primary)` }} />
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
  title: 'Tokens/Spacing',
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj
export const Space:       Story = { render: () => <SpacePage /> }
export const Radius:      Story = { render: () => <RadiusPage /> }
export const BorderWidth: Story = { name: 'Border Width', render: () => <BorderWidthPage /> }
