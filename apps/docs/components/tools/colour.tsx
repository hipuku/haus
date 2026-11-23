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
import { Badge, Input, Textarea } from 'haus-components'
import { useEffect, useMemo, useState } from 'react'

type Matcher = (hex: string, topN?: number) => NamedColourMatch[]

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

  useEffect(() => {
    // The names subpath is 764KB; importing it here keeps it off every other page.
    import('@hipuku/colour/names').then(({ colourNameEntries }) =>
      setMatcher(() => createNamedColourMatcher(colourNameEntries())),
    )
  }, [])

  const hex = toHex(input)
  const matches = hex && matcher ? matcher(hex) : []

  return (
    <div className="not-prose grid gap-3">
      <Input
        label="Colour"
        hint="Any CSS colour: hex, rgb(), oklch()."
        value={input}
        onChange={event => setInput(event.target.value)}
        error={hex ? undefined : 'Not a colour this can read.'}
      />
      {hex && !matcher && <p>Loading 31,900 names…</p>}
      {matches.length > 0 && (
        <ol className="grid gap-1">
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
    <div className="not-prose grid gap-3">
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

/** A palette's lightness steps, chroma spread, hue arc, near-duplicates and contrast. */
export function PaletteAnalysis() {
  const [text, setText] = useState('#161616 #484848 #808080 #bebebe #ffffff #3366cc #3467cc #cc6633')
  const hexes = useMemo(
    () =>
      text
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(toHex)
        .filter((h): h is string => Boolean(h)),
    [text],
  )
  const result = useMemo(() => analysePalette(hexes), [hexes])

  return (
    <div className="not-prose grid gap-3">
      <Textarea
        label="Palette"
        hint="Colours separated by spaces, commas or new lines."
        value={text}
        onChange={e => setText(e.target.value)}
        rows={3}
        error={result ? undefined : 'Give at least two colours.'}
      />
      {result && (
        <ul className="grid gap-1">
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
