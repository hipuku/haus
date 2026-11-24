import { Badge, Button } from 'haus-components'
import React, { useState } from 'react'

/**
 * Layout for stories, so every component's stories are laid out and labelled
 * the same way. STORIES.md is the standard these serve.
 *
 * **Labels are Badges.** A label in plain text is set in the same type as the
 * component it names and reads as part of the content; a Badge is visibly
 * furniture. Every label in a story goes through `Label`.
 */

/** The one way a story labels something: a neutral Badge. */
export function Label({ children }: { children: React.ReactNode }) {
  return (
    <Badge tone="neutral" appearance="subtle">
      {children}
    </Badge>
  )
}

/** One labelled item: the label above, the component under it. */
export function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--haus-space-3)' }}>
      <Label>{label}</Label>
      {children}
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
        gap: 'var(--haus-space-8)',
      }}
    >
      {children}
    </div>
  )
}

/** Items stacked, for components that fill their width (fields, toasts, tabs). */
export function Stack({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--haus-space-8)', maxInlineSize: '32rem' }}>
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
        <span key={c}>
          <Label>{c}</Label>
        </span>
      ))}
      {rows.map(r => (
        <React.Fragment key={r}>
          <span>
            <Label>{r}</Label>
          </span>
          {columns.map(c => (
            <div key={c}>{render(r, c)}</div>
          ))}
        </React.Fragment>
      ))}
    </div>
  )
}

export const MODES = ['subtle', 'expressive', 'reduced'] as const
export type Mode = (typeof MODES)[number]

/**
 * The three motion modes side by side, each in its own `data-haus-motion`
 * scope, with one Replay for all three.
 *
 * `render(mode, run)` is called with a run count that Replay increments. A
 * component whose motion plays on mount (a toast, an error) remounts on each
 * run, because the count is in the key. A component whose motion is a change
 * of state (a tab, a checkbox, a press) reads `run` and makes that change, so
 * Replay plays its motion too rather than doing nothing.
 *
 * `remount={false}` keeps the instances mounted, for those state-change
 * components, so the change animates from where it was. `layout="column"`
 * stacks the modes, for components wider than a third of the canvas.
 * `replay={false}` drops the button for motion nothing can replay: a hover,
 * or an animation that never stops.
 */
export function MotionCompare({
  render,
  remount = true,
  layout = 'row',
  replay = true,
}: {
  render: (mode: Mode, run: number) => React.ReactNode
  remount?: boolean
  layout?: 'row' | 'column'
  replay?: boolean
}) {
  const [run, setRun] = useState(0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--haus-space-6)' }}>
      {replay && (
        <div>
          <Button size="sm" variant="secondary" onClick={() => setRun(n => n + 1)}>
            Replay
          </Button>
        </div>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: layout === 'row' ? 'repeat(3, minmax(0, 1fr))' : '1fr',
          alignItems: 'start',
          gap: 'var(--haus-space-8)',
        }}
      >
        {MODES.map(mode => (
          <div key={remount ? `${mode}-${run}` : mode} data-haus-motion={mode}>
            <Item label={mode}>{render(mode, run)}</Item>
          </div>
        ))}
      </div>
    </div>
  )
}
