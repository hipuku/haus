'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { IconButton } from 'haus-components'
import styles from './motion.module.css'

/*
 * Motion is the one foundation a table cannot show. Each role plays here, on a
 * replay, reading the same custom properties a component reads, so the page
 * shows the duration and easing the reader's own mode is set to rather than the
 * numbers the default mode happens to use.
 */
const ROLES = [
  { role: 'press', what: 'A control answering a press.' },
  { role: 'feedback', what: 'A state change the eye should catch: a check, a toggle.' },
  { role: 'indicator', what: 'A marker moving between positions, as a tab underline does.' },
  { role: 'highlight', what: 'Something drawing attention to itself where it already is.' },
  { role: 'draw', what: 'A mark drawing itself, as a tick does.' },
  { role: 'layout', what: 'A layout settling after something is added or removed.' },
  { role: 'popover-enter', what: 'A popover or a menu arriving.' },
  { role: 'dialog-enter', what: 'A modal arriving over a backdrop.' },
  { role: 'sheet-enter', what: 'A drawer coming in from an edge.' },
  { role: 'toast-enter', what: 'A toast arriving at the corner.' },
] as const

/*
 * Every role in every mode at once, as a grid: a row per role and a column
 * per mode, each cell a stage of its own carrying `data-haus-motion`, so it
 * reads and plays that mode's real duration and easing. The three play side
 * by side, which is the comparison the page is for.
 *
 * A row plays as it scrolls into view, and again each time it comes back, so
 * nothing has finished before the reader reaches it, and has its own play
 * control. A row is three lines that line up across its columns, by subgrid:
 * the play control and the stages, then the role's name and each duration,
 * then what the role is for and each easing.
 */
const MODES = [
  { label: 'Default', value: 'subtle' },
  { label: 'Expressive', value: 'expressive' },
  { label: 'Reduced', value: 'reduced' },
] as const

const PlayGlyph = () => (
  <svg aria-hidden="true" fill="currentColor" height="14" viewBox="0 0 24 24" width="14">
    <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />
  </svg>
)

export function MotionRoles() {
  return (
    <div className={styles.grid} role="table" aria-label="Motion roles in each mode">
      <div className={styles.head} role="row">
        <span role="columnheader">Role</span>
        {MODES.map(mode => (
          <span key={mode.value} role="columnheader">
            {mode.label}
          </span>
        ))}
      </div>
      {ROLES.map(({ role, what }) => (
        <MotionRow key={role} role={role} what={what} />
      ))}
    </div>
  )
}

function MotionRow({ role, what }: { role: string; what: string }) {
  const row = useRef<HTMLDivElement>(null)
  const [play, setPlay] = useState(0)

  useEffect(() => {
    const element = row.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setPlay(n => n + 1)
      },
      { threshold: 0.6 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={styles.row} ref={row} role="row">
      <div className={styles.meta} role="rowheader">
        <IconButton
          icon={<PlayGlyph />}
          label={`Play ${role}`}
          onClick={() => setPlay(n => n + 1)}
          size="sm"
          variant="ghost"
        />
        <code className={styles.name}>{role}</code>
        <span className={styles.what}>{what}</span>
      </div>
      {MODES.map(mode => (
        <MotionCell key={mode.value} label={mode.label} mode={mode.value} play={play} role={role} />
      ))}
    </div>
  )
}

/*
 * A spring is compiled to a `linear()` ramp of forty-odd samples, which is the
 * right thing to hand a browser and the wrong thing to print in a cell. The
 * name of the shape goes on the page and the whole value stays on the title.
 */
function shortEasing(value: string): string {
  if (!value) return 'not set'
  return value.startsWith('linear(') && value.length > 40 ? 'spring' : value
}

function MotionCell({ role, mode, label, play }: { role: string; mode: string; label: string; play: number }) {
  const sample = useRef<HTMLDivElement>(null)
  const [values, setValues] = useState({ duration: '', easing: '' })

  useEffect(() => {
    const element = sample.current
    if (!element) return
    const read = () => {
      const style = getComputedStyle(element)
      setValues({
        duration: style.getPropertyValue(`--haus-motion-${role}-duration`).trim(),
        easing: style.getPropertyValue(`--haus-motion-${role}-easing`).trim(),
      })
    }
    read()
    // Reduced is a system setting as well as a mode, so the page has to answer
    // a reader turning it on while they are reading.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.addEventListener('change', read)
    return () => reduced.removeEventListener('change', read)
  }, [role])

  useEffect(() => {
    const element = sample.current
    if (!element || play === 0) return
    // Restarting an animation needs the class gone for a frame; without the
    // reflow the browser coalesces the two changes and nothing plays.
    element.classList.remove(styles.playing)
    void element.offsetWidth
    element.classList.add(styles.playing)
  }, [play])

  return (
    <div className={styles.cell} data-haus-motion={mode} role="cell">
      <span className={styles.cellMode}>{label}</span>
      <div className={styles.stage}>
        <div
          className={styles.sample}
          data-role={role}
          ref={sample}
          style={
            {
              animationDuration: `var(--haus-motion-${role}-duration)`,
              animationTimingFunction: `var(--haus-motion-${role}-easing)`,
              // The role's own travel and scale, so a role with neither, press
              // and highlight, is still and a sheet moves the distance the
              // token says.
              '--offset': `var(--haus-motion-${role}-offset, 0px)`,
              '--scale': `var(--haus-motion-${role}-scale, 1)`,
            } as React.CSSProperties
          }
        />
      </div>
      <span className={styles.duration}>{values.duration || 'not set'}</span>
      <span className={styles.values} title={values.easing}>
        {shortEasing(values.easing)}
      </span>
    </div>
  )
}
