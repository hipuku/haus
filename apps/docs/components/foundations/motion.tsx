'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from 'haus-components'
import styles from './motion.module.css'

/*
 * Motion is the one foundation a table cannot show. Each role plays here, on a
 * replay, reading the same custom properties a component reads, so the page
 * shows the duration and easing the reader's own mode is set to rather than the
 * numbers the default mode happens to use.
 */
const ROLES = [
  { role: 'micro', what: 'A control answering a press or a hover.' },
  { role: 'feedback', what: 'A state change the eye should catch: a check, a toggle.' },
  { role: 'indicator', what: 'A marker moving between positions, as a tab underline does.' },
  { role: 'popover-enter', what: 'A popover or a menu arriving.' },
  { role: 'dialog-enter', what: 'A modal arriving over a backdrop.' },
  { role: 'sheet-enter', what: 'A drawer coming in from an edge.' },
  { role: 'toast-enter', what: 'A toast arriving at the corner.' },
  { role: 'layout', what: 'A layout settling after something is added or removed.' },
] as const

export function MotionRoles() {
  const [playing, setPlaying] = useState(0)

  return (
    <div className={styles.roles}>
      <div className={styles.toolbar}>
        <Button onClick={() => setPlaying(n => n + 1)} size="sm" variant="secondary">
          Replay
        </Button>
        <span className={styles.note}>Values follow the motion mode: subtle by default, expressive, or reduced.</span>
      </div>
      {ROLES.map(({ role, what }) => (
        <MotionRole key={role} play={playing} role={role} what={what} />
      ))}
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

function MotionRole({ role, what, play }: { role: string; what: string; play: number }) {
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
    return () => observer.disconnect()
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
          style={{
            animationDuration: `var(--haus-motion-${role}-duration)`,
            animationTimingFunction: `var(--haus-motion-${role}-easing)`,
          }}
        />
      </div>
    </div>
  )
}
