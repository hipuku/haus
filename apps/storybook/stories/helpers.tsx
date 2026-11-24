import { Button, Divider } from 'haus-components'
import { ColLabel } from './tokens/_shared'
import React, { useState } from 'react'

/**
 * Layout for stories, so every component's stories are laid out and labelled
 * the same way. STORIES.md is the standard these serve.
 *
 * **Labels are outlined pills.** A label in plain text is set in the same type
 * as the component it names and reads as part of the content; an outlined,
 * monospaced pill is visibly furniture. Every label goes through `Label`.
 */

/**
 * The one way a story labels something. Badge-shaped but outlined and never
 * filled, so it reads as the workbench's furniture even on Badge's own
 * stories, where a filled label sat among the Badges it named (owner, 4.5).
 * Story-only, so it is drawn here rather than added to Badge's appearances.
 */
const labelStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  boxSizing: 'border-box',
  paddingBlock: 'var(--haus-space-0-5)',
  paddingInline: 'var(--haus-space-2)',
  border: 'var(--haus-border-width-default) dashed var(--haus-color-border-control)',
  borderRadius: 'var(--haus-radius-pill)',
  background: 'transparent',
  color: 'var(--haus-color-ink-secondary)',
  fontFamily: 'var(--haus-font-mono)',
  fontSize: 'var(--haus-type-label-xs-size)',
  lineHeight: 'var(--haus-type-label-xs-leading)',
  letterSpacing: 'var(--haus-type-label-xs-tracking)',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
}

export function Label({ children }: { children: React.ReactNode }) {
  return <span style={labelStyle}>{children}</span>
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

/**
 * Items side by side, wrapping, aligned on their top edge.
 *
 * `still` is for a States story: the items are inert, so each shows exactly
 * the state it is drawn in, as a Figma frame would, and the pointer or the
 * keyboard cannot change it (owner, 4.5). The states themselves are forced by
 * the pseudo-states add-on (`parameters.pseudo`).
 */
export function Row({
  children,
  stretch = false,
  still = false,
}: {
  children: React.ReactNode
  stretch?: boolean
  still?: boolean
}) {
  return (
    <div
      inert={still || undefined}
      data-story-still={still || undefined}
      style={{
        pointerEvents: still ? 'none' : undefined,
        display: stretch ? 'grid' : 'flex',
        gridTemplateColumns: stretch ? 'repeat(auto-fit, minmax(16rem, 1fr))' : undefined,
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        gap: 'var(--haus-space-8)',
      }}
    >
      {still && <style>{STILL_CSS}</style>}
      {children}
    </div>
  )
}

/**
 * A still row shows each state as drawn, at once: no transition into it and no
 * enter animation, so it reads as a set of frames rather than as motion.
 */
export const STILL_CSS =
  '[data-story-still], [data-story-still] * { transition: none !important; animation: none !important; }'

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
 * model. A table takes the token pages' column titles, not story pills.
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
          <ColLabel>{c}</ColLabel>
        </span>
      ))}
      {rows.map(r => (
        <React.Fragment key={r}>
          <span>
            <ColLabel>{r}</ColLabel>
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
 * or an animation that never stops. Either way a divider and a line of
 * `hint` say what to do, so every Motion story reads the same way.
 */
export function MotionCompare({
  render,
  remount = true,
  layout = 'row',
  replay = true,
  hint,
}: {
  render: (mode: Mode, run: number) => React.ReactNode
  remount?: boolean
  layout?: 'row' | 'column'
  replay?: boolean
  /** What to do to see the motion, under the divider. Every Motion story says it. */
  hint: string
}) {
  const [run, setRun] = useState(0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--haus-space-6)' }}>
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
      <Divider spacing="none" decorative />
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--haus-space-4)' }}
      >
        <span
          style={{
            fontFamily: 'var(--haus-font-sans)',
            fontSize: 'var(--haus-type-body-sm-size)',
            lineHeight: 'var(--haus-type-body-sm-leading)',
            color: 'var(--haus-color-ink-secondary)',
          }}
        >
          {hint}
        </span>
        {replay && (
          <Button size="sm" variant="secondary" onClick={() => setRun(n => n + 1)}>
            Replay
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * For a component that portals out of the story (Modal, Drawer): while it is
 * open, the page takes this column's motion mode, because a portal sits
 * outside the column's `data-haus-motion` scope. The previous mode comes back
 * once the exit has had time to run.
 */
export function usePageMotion(mode: Mode | undefined, open: boolean) {
  React.useEffect(() => {
    if (!mode || !open) return
    const root = document.documentElement
    const previous = root.dataset.hausMotion
    root.dataset.hausMotion = mode
    return () => {
      setTimeout(() => {
        if (previous === undefined) delete root.dataset.hausMotion
        else root.dataset.hausMotion = previous
      }, 1000)
    }
  }, [mode, open])
}

/**
 * Storybook's args, on their way into a component whose props are a
 * discriminated union.
 *
 * `Button`, `IconButton` and `Card` take either their own element or a child
 * (`asChild?: never` against `asChild: true`), and `Modal` and `Tabs` take
 * either a visible title or an `aria-label`. Args are a wide, all-optional
 * object, so spreading them gives TypeScript no branch to pick and every such
 * story failed to compile. The story passes the discriminant explicitly beside
 * the spread; this says the rest is the rest, in one place with the reason,
 * rather than a cast repeated down the file.
 */
export const rest = (args: object | undefined) => (args ?? {}) as Record<string, never>
