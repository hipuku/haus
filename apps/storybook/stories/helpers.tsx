import React, { useState } from 'react'

/**
 * Layout for stories, so every component's stories are laid out and labelled
 * the same way. STORIES.md is the standard these serve.
 *
 * Styles are inline and read haus tokens: these are the workbench's own frame,
 * not components, and a story should show the component and nothing else of
 * ours.
 */

const caption: React.CSSProperties = {
  fontFamily: 'var(--haus-font-sans)',
  fontSize: 'var(--haus-type-label-caption-size)',
  lineHeight: 'var(--haus-type-label-caption-leading)',
  color: 'var(--haus-color-ink-secondary)',
}

/** One labelled item: the component, and the value it shows underneath. */
export function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--haus-space-2)' }}>
      {children}
      <span style={caption}>{label}</span>
    </div>
  )
}

/** Items side by side, wrapping, aligned on their top edge. */
export function Row({ children, stretch = false }: { children: React.ReactNode; stretch?: boolean }) {
  return (
    <div
      style={{
        display: stretch ? 'grid' : 'flex',
        gridTemplateColumns: stretch ? 'repeat(auto-fit, minmax(16rem, 1fr))' : undefined,
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        gap: 'var(--haus-space-6)',
      }}
    >
      {children}
    </div>
  )
}

/** Items stacked, for components that fill their width (fields, toasts). */
export function Stack({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--haus-space-6)', maxInlineSize: '28rem' }}>
      {children}
    </div>
  )
}

/**
 * Two props that compose, as a labelled table: one row per value of the first,
 * one column per value of the second. Button's tone-by-variant table is the
 * model.
 */
export function Grid<R extends string, C extends string>({
  rows,
  columns,
  render,
}: {
  rows: readonly R[]
  columns: readonly C[]
  render: (row: R, column: C) => React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `max-content repeat(${columns.length}, max-content)`,
        alignItems: 'center',
        columnGap: 'var(--haus-space-6)',
        rowGap: 'var(--haus-space-3)',
      }}
    >
      <span />
      {columns.map(c => (
        <span key={c} style={caption}>
          {c}
        </span>
      ))}
      {rows.map(r => (
        <React.Fragment key={r}>
          <span style={caption}>{r}</span>
          {columns.map(c => (
            <div key={c}>{render(r, c)}</div>
          ))}
        </React.Fragment>
      ))}
    </div>
  )
}

const MODES = ['subtle', 'expressive', 'reduced'] as const

/**
 * The three motion modes side by side, each in its own `data-haus-motion`
 * scope, with one button that replays all three. `render` is called again on
 * every replay with a fresh key, so an enter animation runs from the start.
 */
export function MotionCompare({ render }: { render: (mode: (typeof MODES)[number]) => React.ReactNode }) {
  const [run, setRun] = useState(0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--haus-space-4)' }}>
      <div>
        <button
          type="button"
          onClick={() => setRun(n => n + 1)}
          style={{
            ...caption,
            cursor: 'pointer',
            textDecoration: 'underline',
            background: 'none',
            border: 0,
            padding: 0,
          }}
        >
          Replay
        </button>
      </div>
      <Row stretch>
        {MODES.map(mode => (
          <div key={`${mode}-${run}`} data-haus-motion={mode === 'subtle' ? undefined : mode}>
            <Item label={mode}>{render(mode)}</Item>
          </div>
        ))}
      </Row>
    </div>
  )
}
