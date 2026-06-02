import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import {
  Callout, ColLabel,
  pageWrap, pageTitleStyle, pageDescStyle,
  tokenValueStyle,
  TableGrid, TH, TD, TableDivider,
} from './_shared'

/* ─── Data ───────────────────────────────────────────────────────────────── */

const BP_COLS = 'auto 1fr auto auto'
const MAX_BP  = 1536

const breakpoints = [
  { name: 'breakpoint.sm',  value: 640,  use: 'Large phones, small tablets' },
  { name: 'breakpoint.md',  value: 768,  use: 'Tablets' },
  { name: 'breakpoint.lg',  value: 1024, use: 'Small laptops' },
  { name: 'breakpoint.xl',  value: 1280, use: 'Desktops' },
  { name: 'breakpoint.2xl', value: 1536, use: 'Large screens' },
]

function BpBar({ value }: { value: number }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: 10, background: 'var(--color-border-default)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, height: '100%',
        width: `${(value / MAX_BP) * 100}%`,
        background: 'var(--color-primary-default)',
        borderRadius: 'var(--radius-full)',
      }} />
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

function BreakpointsPage() {
  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Layout</h1>
      <p style={pageDescStyle}>
        JS constants, not CSS custom properties — custom properties can't be used inside <code style={{ fontFamily: 'var(--font-mono)' }}>@media</code> query conditions. Import from <code style={{ fontFamily: 'var(--font-mono)' }}>@haus/tokens</code> and use in Tailwind's <code style={{ fontFamily: 'var(--font-mono)' }}>screens</code> config or style-in-JS.
      </p>

      <TableGrid columns={BP_COLS}>
        <TH><ColLabel icon="fa-solid fa-tag">Token (JS)</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-ruler-horizontal">Scale</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-hashtag">Value</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-circle-info">Use</ColLabel></TH>
        <TableDivider />
        {breakpoints.map(({ name, value, use }) => (
          <React.Fragment key={name}>
            <TD>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--type-mono-size)', fontWeight: 500, color: 'var(--color-ink-primary)', whiteSpace: 'nowrap' }}>
                tokens.{name}
              </span>
            </TD>
            <TD><BpBar value={value} /></TD>
            <TD><span style={{ ...tokenValueStyle, whiteSpace: 'nowrap' }}>{value}px</span></TD>
            <TD><span style={{ fontSize: 'var(--type-body-sm-size)', color: 'var(--color-ink-secondary)', whiteSpace: 'nowrap' }}>{use}</span></TD>
          </React.Fragment>
        ))}
      </TableGrid>

      <Callout label="Usage">
        <pre style={{
          margin: 0,
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--type-mono-size)',
          color: 'var(--color-ink-secondary)',
          lineHeight: 'var(--type-mono-leading)',
          overflowX: 'auto',
        }}>{`import { tokens } from '@haus/tokens'

// Tailwind v4
screens: {
  sm:    tokens.breakpoint.sm,    // '640px'
  md:    tokens.breakpoint.md,    // '768px'
  lg:    tokens.breakpoint.lg,    // '1024px'
  xl:    tokens.breakpoint.xl,    // '1280px'
  '2xl': tokens['breakpoint.2xl'] // '1536px'
}

// CSS-in-JS / vanilla JS
const isMobile = window.innerWidth < parseInt(tokens.breakpoint.sm)`}</pre>
      </Callout>
    </div>
  )
}

/* ─── Meta ───────────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Tokens/Layout',
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj
export const Breakpoints: Story = { render: () => <BreakpointsPage /> }
