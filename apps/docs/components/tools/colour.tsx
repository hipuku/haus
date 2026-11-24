'use client'

import {
  analysePalette,
  classifyDeltaE,
  createNamedColourMatcher,
  deltaE,
  toHex,
  wcagContrast,
  type NamedColourMatch,
} from '@hipuku/colour'
import { Badge, Button, Input, Textarea } from 'haus-components'
import { useEffect, useMemo, useState } from 'react'

type Matcher = (hex: string, topN?: number) => NamedColourMatch[]
import styles from './tool.module.css'

const swatch = (hex: string) => (
  <span
    aria-hidden
    style={{
      display: 'inline-block',
      width: '1em',
      height: '1em',
      borderRadius: 'var(--haus-radius-marker)',
      background: hex,
      border: '1px solid var(--haus-color-border-default)',
      verticalAlign: 'middle',
    }}
  />
)

/** Name a colour against the 31,900-name set, loaded on this page only. */
export function NameColour() {
  const [input, setInput] = useState('#4f84ba')
  const [matcher, setMatcher] = useState<Matcher | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    // The names subpath is 764KB; importing it here keeps it off every other page.
    // A failed load (a dropped connection, say) offers a retry rather than
    // leaving the loading line up for good.
    setLoadFailed(false)
    import('@hipuku/colour/names')
      .then(({ colourNameEntries }) => setMatcher(() => createNamedColourMatcher(colourNameEntries())))
      .catch(() => setLoadFailed(true))
  }, [attempt])

  const hex = toHex(input)
  const matches = hex && matcher ? matcher(hex) : []

  return (
    <div className={`not-prose ${styles.stack}`}>
      <Input
        label="Colour"
        hint="Any CSS colour: hex, rgb(), oklch()."
        value={input}
        onChange={event => setInput(event.target.value)}
        error={hex ? undefined : 'Not a colour this can read.'}
      />
      {hex && !matcher && !loadFailed && <p>Loading 31,900 names…</p>}
      {loadFailed && (
        <p role="alert">
          The colour names did not load.{' '}
          <Button variant="secondary" size="sm" onClick={() => setAttempt(n => n + 1)}>
            Retry
          </Button>
        </p>
      )}
      {matches.length > 0 && (
        <ol className={styles.losses}>
          {matches.map(m => (
            <li key={m.hex + m.name}>
              {swatch(m.hex)} {m.name} <code>{m.hex}</code>, ΔE {m.distance}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

/** Two colours: how far apart they look, and their contrast. */
export function CompareColours() {
  const [a, setA] = useState('#3366cc')
  const [b, setB] = useState('#3467cc')
  const ha = toHex(a)
  const hb = toHex(b)
  const result = useMemo(() => {
    if (!ha || !hb) return null
    const distance = deltaE(ha, hb)
    return { distance, band: classifyDeltaE(distance), contrast: wcagContrast(ha, hb) }
  }, [ha, hb])

  return (
    <div className={`not-prose ${styles.stack}`}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="First" value={a} onChange={e => setA(e.target.value)} error={ha ? undefined : 'Not a colour.'} />
        <Input label="Second" value={b} onChange={e => setB(e.target.value)} error={hb ? undefined : 'Not a colour.'} />
      </div>
      {result && (
        <p>
          {swatch(ha!)} {swatch(hb!)} ΔE {result.distance.toFixed(2)}, <Badge>{result.band}</Badge>. Contrast{' '}
          {result.contrast.ratio}:1,{' '}
          <Badge tone={result.contrast.passAA ? 'success' : 'error'}>
            {result.contrast.passAA ? 'passes' : 'fails'} AA
          </Badge>
        </p>
      )}
    </div>
  )
}

/**
 * Colours separated by spaces, commas or new lines, split only outside
 * brackets, so `rgb(255, 0, 0)` stays one colour.
 */
function splitColours(text: string): string[] {
  const out: string[] = []
  let depth = 0
  let current = ''
  for (const char of text) {
    if (char === '(') depth++
    if (char === ')') depth = Math.max(0, depth - 1)
    if (depth === 0 && /[\s,]/.test(char)) {
      if (current) out.push(current)
      current = ''
    } else current += char
  }
  if (current) out.push(current)
  return out
}

/** A palette's lightness steps, chroma spread, hue arc, near-duplicates and contrast. */
export function PaletteAnalysis() {
  const [text, setText] = useState('#161616 #484848 #808080 #bebebe #ffffff #3366cc #3467cc #cc6633')
  const hexes = useMemo(
    () =>
      splitColours(text)
        .map(toHex)
        .filter((h): h is string => Boolean(h)),
    [text],
  )
  const result = useMemo(() => analysePalette(hexes), [hexes])

  return (
    <div className={`not-prose ${styles.stack}`}>
      <Textarea
        label="Palette"
        hint="Colours separated by spaces, commas or new lines."
        value={text}
        onChange={e => setText(e.target.value)}
        rows={3}
        error={result ? undefined : 'Give at least two colours.'}
      />
      {result && (
        <ul className={styles.losses}>
          <li>
            Lightness steps: <Badge>{result.lightness.rating}</Badge> (spread {result.lightness.stdDev.toFixed(1)})
          </li>
          <li>
            Chroma: <Badge>{result.chroma.rating}</Badge> (mean {result.chroma.mean.toFixed(3)})
          </li>
          <li>
            Hue arc: {result.hueArc.totalAngle}°{result.hueArc.isMonotonic ? '' : ', turns back'}
            {result.hueArc.hasAchromatic ? ', includes greys' : ''}
          </li>
          <li>
            Near-identical:{' '}
            {result.nearIdentical.length
              ? result.nearIdentical.map(p => `${p.a} and ${p.b} (ΔE ${p.deltaE})`).join('; ')
              : 'none'}
          </li>
          <li>
            Pairs passing AA: {result.contrast.filter(p => p.passAA).length} of {result.contrast.length}
          </li>
        </ul>
      )}
    </div>
  )
}
