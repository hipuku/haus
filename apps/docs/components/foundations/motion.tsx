'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Tabs } from 'haus-components'
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
 * The three motion modes as a segmented Tabs, the mode switch Tabs documents.
 * The list of roles is the panel, and it carries the chosen mode as
 * `data-haus-motion`, so each row reads and plays that mode's own values.
 * Choosing a mode replays every role.
 */
const MODES = [
  { label: 'Default', value: 'subtle' },
  { label: 'Expressive', value: 'expressive' },
  { label: 'Reduced', value: 'reduced' },
]

export function MotionRoles() {
  const [mode, setMode] = useState('subtle')
  const [playing, setPlaying] = useState(0)

  return (
    <div className={styles.roles}>
      <Tabs
        appearance="segmented"
        aria-label="Motion mode"
        items={MODES}
        onValueChange={next => {
          setMode(next)
          setPlaying(n => n + 1)
        }}
        size="sm"
        value={mode}
      >
        <div className={styles.modePanel} data-haus-motion={mode}>
          {ROLES.map(({ role, what }) => (
            <MotionRole key={role} mode={mode} play={playing} role={role} what={what} />
          ))}
        </div>
      </Tabs>
    </div>
  )
}

/*
 * A spring is compiled to a `linear()` ramp of forty-odd samples, which is the
 * right thing to hand a browser and the wrong thing to print in a row. The name
 * of the shape goes on the page and the whole value stays on the title.
 */
function shortEasing(value: string): string {
  if (!value) return 'not set'
  return value.startsWith('linear(') && value.length > 40 ? 'linear(…), a spring' : value
}

function MotionRole({ role, what, play, mode }: { role: string; what: string; play: number; mode: string }) {
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
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, { attributeFilter: ['class', 'data-theme', 'data-haus-motion'] })
    // Reduced is a system setting as well as a toolbar one, so the page has to
    // answer a reader turning it on while they are reading.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.addEventListener('change', read)
    return () => {
      observer.disconnect()
      reduced.removeEventListener('change', read)
    }
  }, [role, mode])

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
    <div className={styles.row}>
      <div className={styles.meta}>
        <code className={styles.name}>{role}</code>
        <span className={styles.what}>{what}</span>
        <span className={styles.values} title={values.easing}>
          {values.duration || 'not set'} · {shortEasing(values.easing)}
        </span>
      </div>
      <div className={styles.stage}>
        <div
          className={`${styles.sample} ${styles.playing}`}
          data-role={role}
          ref={sample}
          style={
            {
              animationDuration: `var(--haus-motion-${role}-duration)`,
              animationTimingFunction: `var(--haus-motion-${role}-easing)`,
              // The role's own travel and scale, so a role with neither, press
              // and highlight, is still and a sheet moves the distance the
              // token says. A fixed offset in the keyframe showed every role
              // doing the same thing at different speeds.
              '--offset': `var(--haus-motion-${role}-offset, 0px)`,
              '--scale': `var(--haus-motion-${role}-scale, 1)`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  )
}
