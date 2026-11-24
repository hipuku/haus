'use client'

import { useEffect, useRef, useState } from 'react'
import { toHex, wcagContrast } from '@hipuku/colour'
import styles from './specimens.module.css'

/*
 * The foundations pages show what the page is actually rendering, not a table
 * of values copied out of the token source.
 *
 * Every specimen reads its value from the live document with
 * `getComputedStyle`, so it is the value in the mode and the brand the reader
 * is looking at. A table written by hand goes stale the first time a token
 * moves, and this page would then be the one place in the repository where a
 * token's value is restated and nothing checks it.
 */
/** A colour role: the colour, its name, and what it resolves to in this mode. */
export function Swatches({
  roles,
  on = '--haus-color-surface-default',
}: {
  roles: readonly string[]
  /** The surface the contrast of an ink role is measured against. */
  on?: string
}) {
  const anchor = useRef<HTMLDivElement>(null)
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    const element = anchor.current
    if (!element) return
    const read = () => {
      const style = getComputedStyle(element)
      const next: Record<string, string> = {}
      for (const role of [...roles, on]) next[role] = style.getPropertyValue(role).trim()
      setValues(next)
    }
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, { attributeFilter: ['class', 'data-theme', 'data-haus-theme'] })
    const scheme = window.matchMedia('(prefers-color-scheme: dark)')
    scheme.addEventListener('change', read)
    return () => {
      observer.disconnect()
      scheme.removeEventListener('change', read)
    }
  }, [roles, on])

  const surface = values[on]

  return (
    <div className={styles.swatches} ref={anchor}>
      {roles.map(role => {
        const value = values[role]
        const ratio = isInk(role) && surface && value ? ratioOf(value, surface) : undefined
        return (
          <div className={styles.swatch} key={role}>
            <div className={styles.chip} style={{ background: `var(${role})` }} />
            <div className={styles.meta}>
              <code className={styles.name}>{role.replace('--haus-color-', '')}</code>
              <span className={styles.value} title={value}>
                {readable(value)}
              </span>
              {ratio !== undefined && (
                <span className={styles.value}>
                  {ratio.toFixed(2)}:1 on {on.replace('--haus-color-', '')}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const isInk = (role: string) => role.includes('ink') || role.includes('on-')

/*
 * A browser serialises a computed `oklch()` as `lab(5.2% .27 -.82)`, which is
 * true and unreadable. The hex is what a reader can carry somewhere else; the
 * computed value stays on the title, so nothing is hidden.
 */
function readable(value: string): string {
  if (!value) return 'not set'
  try {
    return toHex(value)?.toUpperCase() ?? value
  } catch {
    return value
  }
}

/* The measurement is the package's own, the one the contrast suite uses, so a
   number on this page cannot disagree with a number in CI. */
function ratioOf(foreground: string, background: string): number | undefined {
  try {
    return wcagContrast(foreground, background).ratio
  } catch {
    return undefined
  }
}

/** A primitive ramp, every step side by side. */
export function Ramp({ name, steps }: { name: string; steps: Record<string, string> }) {
  return (
    <div className={styles.ramp}>
      <code className={styles.rampName}>{name}</code>
      <div className={styles.rampSteps}>
        {Object.entries(steps).map(([step, value]) => (
          <div className={styles.rampStep} key={step}>
            <div className={styles.rampChip} style={{ background: value }} title={value} />
            <span className={styles.rampLabel}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** One type role, set at its own size, with the four values it is made of. */
export function TypeRole({ role, sample }: { role: string; sample: string }) {
  const style = {
    fontSize: `var(--haus-type-${role}-size)`,
    fontWeight: `var(--haus-type-${role}-weight)`,
    letterSpacing: `var(--haus-type-${role}-tracking)`,
    lineHeight: `var(--haus-type-${role}-leading)`,
  }
  return (
    <div className={styles.typeRole}>
      <code className={styles.name}>{role}</code>
      <p className={styles.typeSample} style={style}>
        {sample}
      </p>
    </div>
  )
}

/** A space step, drawn at its own width. */
export function SpaceLadder({ steps }: { steps: readonly string[] }) {
  return (
    <div className={styles.ladder}>
      {steps.map(step => (
        <div className={styles.ladderRow} key={step}>
          <code className={styles.name}>{step.replace('--haus-space-', '')}</code>
          <div className={styles.bar} style={{ inlineSize: `var(${step})` }} />
        </div>
      ))}
    </div>
  )
}

/** A radius or an elevation, on a surface the reader can see the edge of. */
export function SurfaceSamples({ samples }: { samples: readonly { label: string; style: Record<string, string> }[] }) {
  return (
    <div className={styles.surfaces}>
      {samples.map(sample => (
        <div className={styles.surface} key={sample.label} style={sample.style}>
          <code className={styles.name}>{sample.label}</code>
        </div>
      ))}
    </div>
  )
}
