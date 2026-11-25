'use client'

import { analysePalette, toHex } from '@hipuku/colour'
import { Badge, Textarea } from 'haus-components'
import { useMemo, useState } from 'react'
import styles from './tool.module.css'

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
