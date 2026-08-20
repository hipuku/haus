import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import {
  CopyChip, ColLabel,
  pageWrap, pageTitleStyle, pageDescStyle,
  tokenNameStyle,
  TableGrid, TH, TD, TableDivider,
} from './_shared'

/* ─── Local constants ────────────────────────────────────────────────────── */

const TYPE_COLS = 'auto auto auto 1fr'
const ICON_COLS = 'auto auto auto 1fr'

const tokenMeta: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.6875rem',
  color: 'var(--color-ink-secondary)',
  whiteSpace: 'nowrap',
}

/* ─── Data ───────────────────────────────────────────────────────────────── */

type TypeEntry = {
  token: string
  size: string; weight: string; lineHeight: string; tracking: string
  trackingDisplay: string
  sample: string
  family?: 'sans' | 'mono'
}

const typeScale: TypeEntry[] = [
  { token: 'label-xs',   size: 'var(--type-label-xs-size)',   weight: 'var(--type-label-xs-weight)',   lineHeight: 'var(--type-label-xs-leading)',   tracking: 'var(--type-label-xs-tracking)',   trackingDisplay: '0.08em',  sample: 'REQUIRED' },
  { token: 'label-sm',   size: 'var(--type-label-sm-size)',   weight: 'var(--type-label-sm-weight)',   lineHeight: 'var(--type-label-sm-leading)',   tracking: 'var(--type-label-sm-tracking)',   trackingDisplay: '0.02em',  sample: 'Sort by date' },
  { token: 'label',      size: 'var(--type-label-size)',      weight: 'var(--type-label-weight)',      lineHeight: 'var(--type-label-leading)',      tracking: 'var(--type-label-tracking)',      trackingDisplay: '—',       sample: 'Email address' },
  { token: 'body-sm',    size: 'var(--type-body-sm-size)',    weight: 'var(--type-body-sm-weight)',    lineHeight: 'var(--type-body-sm-leading)',    tracking: 'var(--type-body-sm-tracking)',    trackingDisplay: '—',       sample: 'You have 3 unread messages.' },
  { token: 'body',       size: 'var(--type-body-size)',       weight: 'var(--type-body-weight)',       lineHeight: 'var(--type-body-leading)',       tracking: 'var(--type-body-tracking)',       trackingDisplay: '—',       sample: 'The quick brown fox jumps over the lazy dog.' },
  { token: 'body-lg',    size: 'var(--type-body-lg-size)',    weight: 'var(--type-body-lg-weight)',    lineHeight: 'var(--type-body-lg-leading)',    tracking: 'var(--type-body-lg-tracking)',    trackingDisplay: '—',       sample: 'Designed for teams who ship fast.' },
  { token: 'heading-sm', size: 'var(--type-heading-sm-size)', weight: 'var(--type-heading-sm-weight)', lineHeight: 'var(--type-heading-sm-leading)', tracking: 'var(--type-heading-sm-tracking)', trackingDisplay: '−0.01em', sample: 'Recent activity' },
  { token: 'heading',    size: 'var(--type-heading-size)',    weight: 'var(--type-heading-weight)',    lineHeight: 'var(--type-heading-leading)',    tracking: 'var(--type-heading-tracking)',    trackingDisplay: '−0.01em', sample: 'Settings' },
  { token: 'heading-lg', size: 'var(--type-heading-lg-size)', weight: 'var(--type-heading-lg-weight)', lineHeight: 'var(--type-heading-lg-leading)', tracking: 'var(--type-heading-lg-tracking)', trackingDisplay: '−0.01em', sample: 'Welcome back' },
  { token: 'display',    size: 'var(--type-display-size)',    weight: 'var(--type-display-weight)',    lineHeight: 'var(--type-display-leading)',    tracking: 'var(--type-display-tracking)',    trackingDisplay: '−0.01em', sample: 'Haus.' },
  { token: 'mono',       size: 'var(--type-mono-size)',       weight: 'var(--type-mono-weight)',       lineHeight: 'var(--type-mono-leading)',       tracking: 'var(--type-mono-tracking)',       trackingDisplay: '—',       sample: 'var(--color-ink-primary)', family: 'mono' },
]

const typeMetaLabels: Record<string, string> = {
  'label-xs':   '11px · 500 · lh 1.4',
  'label-sm':   '12px · 500 · lh 1.4',
  'label':      '13px · 500 · lh 1.4',
  'body-sm':    '13px · 400 · lh 1.5',
  'body':       '14px · 400 · lh 1.5',
  'body-lg':    '16px · 400 · lh 1.6',
  'heading-sm': '16px · 600 · lh 1.3',
  'heading':    '20px · 600 · lh 1.25',
  'heading-lg': '24px · 600 · lh 1.2',
  'display':    '30px · 700 · lh 1.15',
  'mono':       '13px · 400 · lh 1.6',
}


const iconRows = [
  { name: '--icon-xs', value: '0.75rem', px: '12px', pair: 'label-xs' },
  { name: '--icon-sm', value: '1rem',    px: '16px', pair: 'label, body-sm' },
  { name: '--icon-md', value: '1.25rem', px: '20px', pair: 'body-lg, heading-sm' },
  { name: '--icon-lg', value: '1.5rem',  px: '24px', pair: 'heading' },
  { name: '--icon-xl', value: '2rem',    px: '32px', pair: 'standalone / decorative' },
]

/* ─── Row component ──────────────────────────────────────────────────────── */

function TypeRow({ token, size, weight, lineHeight, tracking, trackingDisplay, sample, family = 'sans' }: TypeEntry) {
  return (
    <>
      <TD><CopyChip name={`type-${token}-size`} /></TD>
      <TD><span style={tokenMeta}>{typeMetaLabels[token]}</span></TD>
      <TD><span style={{ ...tokenMeta, minWidth: '4ch', textAlign: 'right' }}>{trackingDisplay}</span></TD>
      <TD style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: family === 'mono' ? 'var(--font-mono)' : 'var(--font-sans)',
          fontSize: size,
          fontWeight: weight,
          lineHeight,
          letterSpacing: tracking,
          color: 'var(--color-ink-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
          width: '100%',
        }}>
          {sample}
        </div>
      </TD>
    </>
  )
}

/* ─── Pages ──────────────────────────────────────────────────────────────── */

function TypographyScale() {
  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Typography</h1>
      <p style={pageDescStyle}>
        Manrope (variable, UI) and Fira Code (monospace). All four properties together, always — size, weight, leading, tracking. Setting only <code style={{ fontFamily: 'var(--font-mono)' }}>font-size</code> from a type token and guessing the rest is using the system wrong. Roles replace heading levels — <code style={{ fontFamily: 'var(--font-mono)' }}>label-xs</code> through <code style={{ fontFamily: 'var(--font-mono)' }}>display</code>, never h1–h6. Click any token to copy.
      </p>

      <TableGrid columns={TYPE_COLS}>
        <TH><ColLabel icon="fa-solid fa-tag">Token</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-sliders">Specs</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-text-width">Tracking</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-font">Sample</ColLabel></TH>
        <TableDivider />
        {typeScale.map(e => <TypeRow key={e.token} {...e} />)}
      </TableGrid>

    </div>
  )
}

function IconSizes() {
  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Icon Sizes</h1>
      <p style={pageDescStyle}>
        Font Awesome 6 Solid. Set <code style={{ fontFamily: 'var(--font-mono)' }}>font-size</code> on the <code style={{ fontFamily: 'var(--font-mono)' }}>&lt;i&gt;</code> element using the matching icon token. Each size is paired with a type role — icon and adjacent copy must use the same scale step.
      </p>

      <TableGrid columns={ICON_COLS}>
        <TH><ColLabel icon="fa-solid fa-eye">Demo</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-tag">Token</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-hashtag">Value</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-link">Pairs with</ColLabel></TH>
        <TableDivider />
        {iconRows.map(({ name, value, px, pair }) => (
          <React.Fragment key={name}>
            <TD>
              <div style={{ display: 'flex', alignItems: 'center', minWidth: 32 }}>
                <i className="fa-solid fa-bell" style={{ fontSize: value, color: 'var(--color-ink-secondary)' }} />
              </div>
            </TD>
            <TD><CopyChip name={name.slice(2)} /></TD>
            <TD><span style={{ ...tokenNameStyle, whiteSpace: 'nowrap' }}>{value} · {px}</span></TD>
            <TD><span style={{ fontSize: 'var(--type-body-sm-size)', color: 'var(--color-ink-secondary)', whiteSpace: 'nowrap' }}>{pair}</span></TD>
          </React.Fragment>
        ))}
      </TableGrid>
    </div>
  )
}

/* ─── Meta ───────────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Tokens/Typography',
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj
export const TypeScale: Story = { render: () => <TypographyScale /> }
export const Icons:     Story = { render: () => <IconSizes /> }
