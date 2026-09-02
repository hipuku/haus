/**
 * Shared primitives for token story pages.
 * Not exported from the package. Internal documentation only.
 */
import React, { useState } from 'react'

/* ─── Copy-to-clipboard chip ─────────────────────────────────────────────── */

/**
 * The token name, as documentation and as something to paste.
 *
 * `name` is the suffix — `color-surface-default` — and the namespace is added
 * here. Every caller passes it that way, so putting the prefix in one place is
 * what stopped these pages handing out `var(--color-surface-default)` after
 * ruling A3 namespaced everything: a name that no longer exists, on the page
 * whose entire job is to tell you the name.
 */
export function CopyChip({ name }: { name: string }) {
  const property = `--haus-${name}`
  const [flash, setFlash] = useState(false)

  function copy() {
    void navigator.clipboard.writeText(`var(${property})`)
    setFlash(true)
    setTimeout(() => setFlash(false), 1400)
  }

  return (
    <button
      onClick={copy}
      title={`Copy var(${property})`}
      style={{
        all: 'unset',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--haus-space-1)',
        fontFamily: 'var(--haus-font-mono)',
        fontSize: 'var(--haus-type-mono-size)',
        fontWeight: 'var(--haus-weight-medium)' as React.CSSProperties['fontWeight'],
        color: flash ? 'var(--haus-color-success-emphasis)' : 'var(--haus-color-ink-primary)',
        cursor: 'pointer',
        transition: 'color 150ms',
        whiteSpace: 'nowrap',
        borderRadius: 'var(--haus-radius-sm)',
        padding: '1px var(--haus-space-1)',
        background: flash ? 'var(--haus-color-success-subtle)' : 'transparent',
      }}
    >
      <span style={{
        fontSize: 'var(--haus-type-label-xs-size)',
        opacity: flash ? 1 : 0,
        transition: 'opacity 150ms',
        color: 'var(--haus-color-success-emphasis)',
      }}>✓</span>
      {flash ? 'copied' : property}
    </button>
  )
}

/* ─── Page wrapper ───────────────────────────────────────────────────────── */

export const pageWrap: React.CSSProperties = {
  fontFamily: 'var(--haus-font-sans)',
  padding: 'var(--haus-space-8)',
  background: 'var(--haus-color-surface-default)',
  maxWidth: 960,
  minHeight: '100vh',
  boxSizing: 'border-box',
}

/* ─── Page title ─────────────────────────────────────────────────────────── */

export const pageTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--haus-font-sans)',
  fontSize: 'var(--haus-type-heading-lg-size)',
  fontWeight: 'var(--haus-type-heading-lg-weight)' as React.CSSProperties['fontWeight'],
  lineHeight: 'var(--haus-type-heading-lg-leading)',
  letterSpacing: 'var(--haus-type-heading-lg-tracking)',
  color: 'var(--haus-color-ink-primary)',
  margin: '0 0 var(--haus-space-1)',
}

/* ─── Page description ───────────────────────────────────────────────────── */

export const pageDescStyle: React.CSSProperties = {
  fontSize: 'var(--haus-type-body-size)',
  fontWeight: 'var(--haus-type-body-weight)' as React.CSSProperties['fontWeight'],
  lineHeight: 'var(--haus-type-body-leading)',
  color: 'var(--haus-color-ink-secondary)',
  margin: '0 0 var(--haus-space-6)',
  maxWidth: 640,
}

/* ─── Column label ───────────────────────────────────────────────────────── */

export const colLabelStyle: React.CSSProperties = {
  fontSize: 'var(--haus-type-label-xs-size)',
  fontWeight: 'var(--haus-weight-semibold)' as React.CSSProperties['fontWeight'],
  letterSpacing: 'var(--haus-tracking-widest)',
  textTransform: 'uppercase',
  color: 'var(--haus-color-ink-secondary)',
  whiteSpace: 'nowrap',
}

/**
 * Column header label with a leading Font Awesome icon.
 * Use inside tableHeader() wrappers in place of bare <span style={colLabelStyle}>.
 * icon: full FA class string, e.g. "fa-solid fa-tag"
 */
export function ColLabel({ icon, children }: { icon?: string; children?: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', ...colLabelStyle }}>
      {icon && <i className={icon} style={{ opacity: 0.75 }} />}
      {children}
    </span>
  )
}

/* ─── Token name + value ─────────────────────────────────────────────────── */

export const tokenNameStyle: React.CSSProperties = {
  fontFamily: 'var(--haus-font-mono)',
  fontSize: 'var(--haus-type-mono-size)',
  fontWeight: 'var(--haus-weight-medium)' as React.CSSProperties['fontWeight'],
  color: 'var(--haus-color-ink-primary)',
  whiteSpace: 'nowrap',
}

export const tokenValueStyle: React.CSSProperties = {
  fontFamily: 'var(--haus-font-mono)',
  fontSize: 'var(--haus-type-mono-size)',
  color: 'var(--haus-color-ink-secondary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

/* ─── Table, single-grid approach ──────────────────────────────────────── */

/**
 * Parent grid for a token table. All TH + TD children share the same column
 * tracks, so `auto` columns are sized by the widest cell across every row.
 */
export function TableGrid({
  columns,
  children,
  style,
}: {
  columns: string
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: columns,
        columnGap: 'var(--haus-space-4)',
        marginTop: 'var(--haus-space-2)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** Header cell, sits directly inside TableGrid. No bottom border (use TableDivider). */
export function TH({
  children,
  style,
}: {
  children?: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        ...colLabelStyle,
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: 'var(--haus-space-2) 0',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Full-width separator spanning all grid columns.
 * Place once after the TH row for a continuous header border,
 * or between sections for a section divider.
 */
export function TableDivider({ weight = 'header' }: { weight?: 'header' | 'row' }) {
  return (
    <div
      style={{
        gridColumn: '1 / -1',
        height: weight === 'header' ? 'var(--haus-border-width-thick)' : 'var(--haus-border-width-default)',
        background: weight === 'header'
          ? 'var(--haus-color-border-strong)'
          : 'var(--haus-color-border-default)',
        margin: 0,
      }}
    />
  )
}

/** Data cell, sits directly inside TableGrid. */
export function TD({
  children,
  style,
  align = 'center',
}: {
  children?: React.ReactNode
  style?: React.CSSProperties
  align?: 'center' | 'start'
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        padding: 'var(--haus-space-2) 0',
        borderBottom: '1px solid var(--haus-color-border-default)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ─── Section head ───────────────────────────────────────────────────────── */

/**
 * Labelled separator band between groups on a token page.
 * accent draws a left-side colour stripe (pass a CSS colour value).
 */
export function SectionHead({
  children,
  accent,
}: {
  children: React.ReactNode
  accent?: string
}) {
  return (
    <p
      style={{
        fontSize: 'var(--haus-type-label-xs-size)',
        fontWeight: 'var(--haus-weight-medium)' as React.CSSProperties['fontWeight'],
        letterSpacing: 'var(--haus-tracking-widest)',
        textTransform: 'uppercase',
        color: 'var(--haus-color-ink-secondary)',
        margin: `var(--haus-space-8) calc(-1 * var(--haus-space-2)) var(--haus-space-3)`,
        padding: `var(--haus-space-1) var(--haus-space-2)`,
        background: 'var(--haus-color-surface-subtle)',
        borderRadius: 'var(--haus-radius-sm)',
        whiteSpace: 'nowrap',
        ...(accent
          ? { borderLeft: `3px solid ${accent}`, paddingLeft: 'var(--haus-space-3)' }
          : {}),
      }}
    >
      {children}
    </p>
  )
}

/* ─── Callout ────────────────────────────────────────────────────────────── */

type CalloutVariant = 'neutral' | 'info'

const calloutTokens: Record<CalloutVariant, { bg: string; border: string; text: string }> = {
  neutral: {
    bg:     'var(--haus-color-surface-subtle)',
    border: 'var(--haus-color-border-default)',
    text:   'var(--haus-color-ink-secondary)',
  },
  info: {
    bg:     'var(--haus-color-info-subtle)',
    border: 'var(--haus-color-info-border)',
    text:   'var(--haus-color-info-on-subtle)',
  },
}

/**
 * Note box at the bottom of a token page.
 * label renders as an all-caps eyebrow above the content.
 */
export function Callout({
  variant = 'neutral',
  label,
  children,
}: {
  variant?: CalloutVariant
  label?: string
  children: React.ReactNode
}) {
  const t = calloutTokens[variant]
  return (
    <div
      style={{
        marginTop: 'var(--haus-space-10)',
        padding: `var(--haus-space-4) var(--haus-space-5)`,
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: 'var(--haus-radius-lg)',
      }}
    >
      {label && (
        <p
          style={{
            margin: `0 0 var(--haus-space-2)`,
            fontSize: 'var(--haus-type-label-xs-size)',
            fontWeight: 'var(--haus-weight-semibold)' as React.CSSProperties['fontWeight'],
            letterSpacing: 'var(--haus-tracking-widest)',
            textTransform: 'uppercase',
            color: t.text,
          }}
        >
          {label}
        </p>
      )}
      <div
        style={{
          fontSize: 'var(--haus-type-body-sm-size)',
          lineHeight: 'var(--haus-type-body-sm-leading)',
          color: t.text,
        }}
      >
        {children}
      </div>
    </div>
  )
}

/* ─── Play button (motion demos) ─────────────────────────────────────────── */

export function PlayButton({
  onClick,
  compact = false,
}: {
  onClick: () => void
  compact?: boolean
}) {
  return (
    <button
      onClick={onClick}
      aria-label="Play animation"
      style={{
        fontFamily: 'var(--haus-font-mono)',
        fontSize: 'var(--haus-type-label-xs-size)',
        color: 'var(--haus-color-primary-on-subtle)',
        background: 'var(--haus-color-primary-subtle)',
        border: 'none',
        borderRadius: 'var(--haus-radius-sm)',
        padding: compact
          ? `var(--haus-space-1) var(--haus-space-2)`
          : `var(--haus-space-1) var(--haus-space-2)`,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {compact ? '▶' : '▶ Play'}
    </button>
  )
}
