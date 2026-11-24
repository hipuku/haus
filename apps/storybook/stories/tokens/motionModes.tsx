import { Button, Toast } from 'haus-components'
import React, { useEffect, useRef, useState } from 'react'
import { MODES, MotionCompare, type Mode } from '../helpers'
import { ColLabel, SectionHead, pageDescStyle, pageTitleStyle, pageWrap } from './_shared'

/** Table headers take the token pages' titles with an icon; a pill is for story labels only (owner, 4.5). */
const ICONS = {
  axis: 'fa-solid fa-sliders',
  role: 'fa-solid fa-tag',
  subtle: 'fa-solid fa-feather',
  expressive: 'fa-solid fa-wand-magic-sparkles',
  reduced: 'fa-solid fa-pause',
} as const

/**
 * Subtle, expressive and reduced, explained and shown side by side.
 *
 * The values in the table are read from the page, not typed here: each mode's
 * scope is rendered off-screen and its custom properties read back, so the
 * table is what the browser applies and cannot drift from motion.css.
 */

const ROLES = [
  ['press', 'A press: the scale while held'],
  ['highlight', 'Colour and focus changes: an effect, never bounces'],
  ['feedback', 'A state appearing in place: an effect, never bounces'],
  ['layout', 'Size and position changes, and a press springing back'],
  ['indicator', 'One element travelling between positions: a selected tab, a highlighted option'],
  ['draw', 'A stroke drawing itself: a tick, an icon ring'],
  ['popover-enter', 'Menus, tooltips and Select panels appearing'],
  ['dialog-enter', 'A dialog appearing'],
  ['sheet-enter', 'A sheet appearing'],
  ['toast-enter', 'A toast appearing'],
] as const

const AXES = [
  [
    'Physics',
    'Eased curves that settle without overshoot',
    'Springs on movement, with a visible settle',
    'No movement at all',
  ],
  ['Distance', 'Travels 4 to 8px', 'Travels 16 to 24px, grows from 0.9', 'None'],
  ['Time', 'Short: 150 to 280ms', 'About 1.6 times subtle', 'Fades of at most 120ms; colour instant'],
  ['Sequence', 'Everything at once', 'Container first, then its parts, 40ms apart', 'Everything at once'],
  ['Continuity', 'An indicator glides, a tick draws briefly', 'The same, on springs, with more travel', 'States swap'],
] as const

const text: React.CSSProperties = {
  fontFamily: 'var(--haus-font-sans)',
  fontSize: 'var(--haus-type-body-sm-size)',
  lineHeight: 'var(--haus-type-body-sm-leading)',
  color: 'var(--haus-color-ink-primary)',
}
const cell: React.CSSProperties = {
  ...text,
  padding: 'var(--haus-space-2) var(--haus-space-3)',
  borderBlockEnd: 'var(--haus-border-width-default) solid var(--haus-color-border-subtle)',
  textAlign: 'start',
  verticalAlign: 'top',
}
const mono: React.CSSProperties = { fontFamily: 'var(--haus-font-mono)', fontSize: 'var(--haus-type-label-sm-size)' }

/** Reads one role's values in one mode's scope. */
function useRoleValues() {
  const refs = useRef<Record<Mode, HTMLDivElement | null>>({ subtle: null, expressive: null, reduced: null })
  const [values, setValues] = useState<Record<string, Record<Mode, string>>>({})
  useEffect(() => {
    const read = (mode: Mode, name: string) =>
      refs.current[mode] ? getComputedStyle(refs.current[mode]!).getPropertyValue(name).trim() : ''
    const out: Record<string, Record<Mode, string>> = {}
    for (const [role] of ROLES) {
      out[role] = {} as Record<Mode, string>
      for (const mode of MODES) {
        const duration = read(mode, `--haus-motion-${role}-duration`)
        const easing = read(mode, `--haus-motion-${role}-easing`)
        const offset = read(mode, `--haus-motion-${role}-offset`)
        const scale = read(mode, `--haus-motion-${role}-scale`)
        // A spring is compiled to linear(); it overshoots only if a stop passes 1.
        const overshoots = easing.startsWith('linear(') && /\b1\.0*[1-9]/.test(easing)
        const curve = overshoots
          ? 'spring, settles'
          : easing === 'linear' || duration === '0ms'
            ? 'none'
            : 'eased, no overshoot'
        out[role][mode] = [duration, curve, offset && `${offset}`, scale && `× ${scale}`].filter(Boolean).join(' · ')
      }
    }
    setValues(out)
  }, [])
  const scopes = (
    <div aria-hidden="true" style={{ position: 'absolute', inlineSize: 0, blockSize: 0, overflow: 'hidden' }}>
      {MODES.map(mode => (
        <div key={mode} data-haus-motion={mode} ref={node => void (refs.current[mode] = node)} />
      ))}
    </div>
  )
  return { values, scopes }
}

/** A panel entering on the popover role, for the side-by-side demo. */
function EnteringPanel() {
  return (
    <div
      style={{
        ...text,
        padding: 'var(--haus-space-4)',
        border: 'var(--haus-border-width-default) solid var(--haus-color-border-default)',
        borderRadius: 'var(--haus-radius-control)',
        background: 'var(--haus-color-surface-overlay)',
        boxShadow: 'var(--haus-elevation-floating)',
        animation:
          'haus-modes-enter var(--haus-motion-popover-enter-duration) var(--haus-motion-popover-enter-easing) both',
      }}
    >
      A panel entering
    </div>
  )
}

/** A marker travelling on the indicator role. */
function Travelling({ run }: { run: number }) {
  return (
    <div
      style={{
        position: 'relative',
        inlineSize: '12rem',
        blockSize: 'var(--haus-space-8)',
        borderRadius: 'var(--haus-radius-control)',
        background: 'var(--haus-color-surface-sunken)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          insetBlock: 'var(--haus-space-1)',
          inlineSize: '33%',
          insetInlineStart: run % 2 === 1 ? '65%' : '2%',
          borderRadius: 'var(--haus-radius-control)',
          background: 'var(--haus-color-primary-default)',
          transition: 'inset-inline-start var(--haus-motion-indicator-duration) var(--haus-motion-indicator-easing)',
        }}
      />
    </div>
  )
}

export function ModesPage() {
  const { values, scopes } = useRoleValues()
  return (
    <div style={pageWrap}>
      <style>{`@keyframes haus-modes-enter { from { opacity: 0; transform: translateY(calc(var(--haus-motion-popover-enter-offset) * -1)) scale(var(--haus-motion-popover-enter-scale)); } }`}</style>
      {scopes}
      <h1 style={pageTitleStyle}>Motion modes</h1>
      <p style={pageDescStyle}>
        Three modes, each designed rather than derived. Subtle is the default: what a well-made product does. Expressive
        is the most motion a product interface can carry: springs, travel and sequence. Reduced moves nothing and still
        gives feedback. A component never asks for a duration; it asks for a role, and the mode decides what the role
        does. Set a mode with <code>data-haus-motion</code> on any element; the user's reduced-motion setting overrides
        both.
      </p>

      <SectionHead>How the modes differ</SectionHead>
      <table style={{ borderCollapse: 'collapse', inlineSize: '100%' }}>
        <thead>
          <tr>
            <th style={cell}>
              <ColLabel icon={ICONS.axis}>Axis</ColLabel>
            </th>
            {MODES.map(mode => (
              <th key={mode} style={cell}>
                <ColLabel icon={ICONS[mode]}>{mode}</ColLabel>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {AXES.map(([axis, ...modes]) => (
            <tr key={axis}>
              <th scope="row" style={{ ...cell, fontWeight: 'var(--haus-weight-emphasis)' }}>
                {axis}
              </th>
              {modes.map((v, i) => (
                <td key={i} style={cell}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <SectionHead>Entering</SectionHead>
      <MotionCompare hint="Replay brings each panel in again." render={() => <EnteringPanel />} />

      <SectionHead>Travelling</SectionHead>
      <MotionCompare
        hint="Replay moves each marker to the other end."
        remount={false}
        render={(_mode, run) => <Travelling run={run} />}
      />

      <SectionHead>Pressing and loading</SectionHead>
      <MotionCompare
        hint="Replay switches loading on and off; press and hold to compare the press."
        remount={false}
        render={(_mode, run) => <Button loading={run % 2 === 1}>Save changes</Button>}
      />

      <SectionHead>A toast arriving</SectionHead>
      <MotionCompare
        hint="Replay brings each toast in again."
        render={() => <Toast tone="success" title="Saved" description="Your changes are live." />}
      />

      <SectionHead>Every role, in every mode</SectionHead>
      <table style={{ borderCollapse: 'collapse', inlineSize: '100%' }}>
        <thead>
          <tr>
            <th style={cell}>
              <ColLabel icon={ICONS.role}>Role</ColLabel>
            </th>
            {MODES.map(mode => (
              <th key={mode} style={cell}>
                <ColLabel icon={ICONS[mode]}>{mode}</ColLabel>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROLES.map(([role, use]) => (
            <tr key={role}>
              <th scope="row" style={cell}>
                <div style={mono}>{role}</div>
                <div style={{ color: 'var(--haus-color-ink-secondary)', fontWeight: 'normal' }}>{use}</div>
              </th>
              {MODES.map(mode => (
                <td key={mode} style={{ ...cell, ...mono }}>
                  {values[role]?.[mode] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
