import type { Meta, StoryObj } from '@storybook/react'
import React, { useCallback, useState } from 'react'
import {
  CopyChip, Callout, PlayButton, SectionHead, ColLabel,
  pageWrap, pageTitleStyle, pageDescStyle,
  TableGrid, TH, TD, TableDivider,
} from './_shared'

/* ─── Duration table ─────────────────────────────────────────────────────── */

const DUR_COLS = 'auto auto auto 1fr'

const durations = [
  { name: 'duration-instant',  value: '50ms',  use: 'Skeleton shimmer, badge counters — imperceptible' },
  { name: 'duration-fast',     value: '100ms', use: 'Checkbox, toggle, icon swap — snappy micro-interactions' },
  { name: 'duration-normal',   value: '200ms', use: 'Hover, focus, most UI state changes' },
  { name: 'duration-moderate', value: '300ms', use: 'Panels, drawers, modals entering' },
  { name: 'duration-slow',     value: '500ms', use: 'Page transitions, complex sequences' },
]

function DurationBar({ ms }: { ms: number }) {
  const [running, setRunning] = useState(false)
  const [key, setKey] = useState(0)

  const play = useCallback(() => {
    setRunning(false)
    setKey(k => k + 1)
    requestAnimationFrame(() => requestAnimationFrame(() => setRunning(true)))
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <div style={{ width: 120, height: 8, background: 'var(--color-border-default)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div
          key={key}
          style={{
            height: '100%',
            background: 'var(--color-primary-default)',
            borderRadius: 'var(--radius-full)',
            width: running ? '100%' : '0%',
            transition: running ? `width ${ms}ms linear` : 'none',
          }}
        />
      </div>
      <PlayButton onClick={play} compact />
    </div>
  )
}

/* ─── Easing demos ───────────────────────────────────────────────────────── */

type EasingEntry = { name: string; css: string; token: string; description: string }

const easings: EasingEntry[] = [
  { name: 'Enter',  token: 'ease-enter',  css: 'cubic-bezier(0.00, 0.00, 0.20, 1.00)', description: 'Start slow, arrive with energy. For elements appearing.' },
  { name: 'Exit',   token: 'ease-exit',   css: 'cubic-bezier(0.40, 0.00, 1.00, 1.00)', description: 'Leave quickly, no lingering. For elements disappearing.' },
  { name: 'Move',   token: 'ease-move',   css: 'cubic-bezier(0.40, 0.00, 0.20, 1.00)', description: 'Balanced, physical. For position changes within the UI.' },
  { name: 'Spring', token: 'ease-spring', css: 'cubic-bezier(0.34, 1.56, 0.64, 1.00)', description: 'Slight overshoot. For interactive feedback that needs snap.' },
  { name: 'Linear', token: 'ease-linear', css: 'linear',                                description: 'No easing. For opacity fades where curves add no value.' },
]


const EASE_COLS = 'auto auto auto 1fr'

function EasingRow({ css, name, token, description }: EasingEntry) {
  const [key, setKey] = useState(0)
  const [active, setActive] = useState(false)

  const play = useCallback(() => {
    setActive(false)
    setKey(k => k + 1)
    requestAnimationFrame(() => requestAnimationFrame(() => setActive(true)))
  }, [])

  return (
    <>
      <TD>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--type-mono-size)', fontWeight: 600, color: 'var(--color-ink-primary)', whiteSpace: 'nowrap' }}>
          {name}
        </span>
      </TD>
      <TD><CopyChip name={token} /></TD>
      <TD>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{ width: 120, height: 36, position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-subtle)', flexShrink: 0 }}>
            <div
              key={key}
              style={{
                position: 'absolute',
                left: active ? 'calc(100% - 28px)' : '0',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 28, height: 28,
                background: 'var(--color-primary-default)',
                borderRadius: 'var(--radius-md)',
                transition: active ? `left 400ms ${css}` : 'none',
              }}
            />
          </div>
          <PlayButton onClick={play} compact />
        </div>
      </TD>
      <TD>
        <span style={{ fontSize: 'var(--type-body-sm-size)', color: 'var(--color-ink-secondary)', lineHeight: 'var(--type-body-sm-leading)' }}>
          {description}
        </span>
      </TD>
    </>
  )
}

/* ─── Composite tokens ───────────────────────────────────────────────────── */

const COMP_COLS = 'auto auto 1fr'

const composites = [
  { name: 'motion-fade-in',    label: 'Fade In',    duration: 200, ease: 'cubic-bezier(0.00, 0.00, 0.20, 1.00)', use: 'Toast appearing, tooltip, popover' },
  { name: 'motion-fade-out',   label: 'Fade Out',   duration: 100, ease: 'cubic-bezier(0.40, 0.00, 1.00, 1.00)', use: 'Toast dismissed, tooltip hidden' },
  { name: 'motion-slide-in',   label: 'Slide In',   duration: 300, ease: 'cubic-bezier(0.00, 0.00, 0.20, 1.00)', use: 'Drawer, modal, panel entering' },
  { name: 'motion-slide-out',  label: 'Slide Out',  duration: 100, ease: 'cubic-bezier(0.40, 0.00, 1.00, 1.00)', use: 'Drawer, modal, panel leaving' },
  { name: 'motion-micro',      label: 'Micro',      duration: 100, ease: 'cubic-bezier(0.40, 0.00, 0.20, 1.00)', use: 'Checkbox tick, toggle thumb' },
  { name: 'motion-interactive',label: 'Interactive',duration: 200, ease: 'cubic-bezier(0.40, 0.00, 0.20, 1.00)', use: 'Hover state, focus ring' },
]

function CompositeRow({ name, duration, ease, use }: typeof composites[number]) {
  const isFade = name.includes('fade')
  const [key, setKey] = useState(0)
  const [active, setActive] = useState(false)

  const play = useCallback(() => {
    setActive(false)
    setKey(k => k + 1)
    requestAnimationFrame(() => requestAnimationFrame(() => setActive(true)))
  }, [])

  return (
    <>
      <TD><CopyChip name={name} /></TD>
      <TD>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{ width: 120, height: 32, position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-subtle)', flexShrink: 0 }}>
            <div
              key={key}
              style={{
                position: 'absolute',
                ...(isFade
                  ? { inset: 0, opacity: active ? 1 : 0, background: 'var(--color-primary-subtle)', transition: active ? `opacity ${duration}ms ${ease}` : 'none' }
                  : { top: 4, bottom: 4, left: active ? 'calc(100% - 28px)' : '4px', width: 24, background: 'var(--color-primary-default)', borderRadius: 'var(--radius-sm)', transition: active ? `left ${duration}ms ${ease}` : 'none' }
                ),
              }}
            />
          </div>
          <PlayButton onClick={play} compact />
        </div>
      </TD>
      <TD><span style={{ fontSize: 'var(--type-body-sm-size)', color: 'var(--color-ink-secondary)' }}>{use}</span></TD>
    </>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

function MotionPage() {
  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Motion</h1>
      <p style={pageDescStyle}>
        Never write raw <code style={{ fontFamily: 'var(--font-mono)' }}>ms</code> or <code style={{ fontFamily: 'var(--font-mono)' }}>cubic-bezier()</code> values in component code. Use composite tokens — they pair the correct duration with the correct easing for each interaction type. All animated properties must collapse to <code style={{ fontFamily: 'var(--font-mono)' }}>var(--duration-reduced)</code> (0ms) inside <code style={{ fontFamily: 'var(--font-mono)' }}>prefers-reduced-motion</code>.
      </p>

      <SectionHead>Durations</SectionHead>
      <TableGrid columns={DUR_COLS}>
        <TH><ColLabel icon="fa-solid fa-tag">Token</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-stopwatch">Value</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-eye">Demo</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-circle-info">Use</ColLabel></TH>
        <TableDivider />
        {durations.map(({ name, value, use }) => (
          <React.Fragment key={name}>
            <TD><CopyChip name={name} /></TD>
            <TD><span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--type-mono-size)', color: 'var(--color-ink-secondary)', whiteSpace: 'nowrap' }}>{value}</span></TD>
            <TD><DurationBar ms={parseInt(value)} /></TD>
            <TD><span style={{ fontSize: 'var(--type-body-sm-size)', color: 'var(--color-ink-secondary)' }}>{use}</span></TD>
          </React.Fragment>
        ))}
      </TableGrid>

      <SectionHead>Easing curves — press ▶ to preview</SectionHead>
      <TableGrid columns={EASE_COLS}>
        <TH><ColLabel icon="fa-solid fa-tag">Name</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-code">Token</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-eye">Demo</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-circle-info">Use</ColLabel></TH>
        <TableDivider />
        {easings.map(e => <EasingRow key={e.name} {...e} />)}
      </TableGrid>

      <SectionHead>Composite tokens — duration + easing pairs</SectionHead>
      <TableGrid columns={COMP_COLS}>
        <TH><ColLabel icon="fa-solid fa-tag">Token</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-eye">Demo</ColLabel></TH>
        <TH><ColLabel icon="fa-solid fa-circle-info">Use</ColLabel></TH>
        <TH />
        <TableDivider />
        {composites.map(c => <CompositeRow key={c.name} {...c} />)}
      </TableGrid>

      <Callout variant="info" label="Reduced motion">
        Set <code style={{ fontFamily: 'var(--font-mono)' }}>transition-duration</code> to <code style={{ fontFamily: 'var(--font-mono)' }}>var(--duration-reduced)</code> (0ms) inside <code style={{ fontFamily: 'var(--font-mono)' }}>@media (prefers-reduced-motion: reduce)</code>. Position and layout changes may remain; opacity and transform animations should collapse.
      </Callout>
    </div>
  )
}

/* ─── Meta ───────────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Tokens/Motion',
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj
export const Overview: Story = { render: () => <MotionPage /> }
