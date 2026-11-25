'use client'

import { classifyDeltaE, deltaE, suggestTextColour, toHex, wcagContrast, type DeltaEBand } from '@hipuku/colour'
import { Input } from 'haus-components'
import { useMemo, useState } from 'react'
import { swatchPrefix } from './swatch'
import { Hero, Panel, ToolView } from './tool-view'
import styles from './tool.module.css'

/*
 * Two colours, and the two questions asked of a pair. Distance: can a person
 * tell them apart (CIEDE2000)? Contrast: can one carry text on the other
 * (WCAG)? A pair can be easy to tell apart and still fail as text, or the
 * reverse, which is why both are shown side by side.
 */

const INKS = ['#ffffff', '#111113']

const BAND: Record<DeltaEBand, { label: string; meaning: string }> = {
  imperceptible: { label: 'Imperceptible', meaning: 'A person cannot tell these apart.' },
  'just-noticeable': { label: 'Just noticeable', meaning: 'Only side by side, on a careful look.' },
  noticeable: { label: 'Noticeable', meaning: 'Different at a glance, but related.' },
  distinct: { label: 'Distinct', meaning: 'Clearly two colours.' },
  different: { label: 'Very different', meaning: 'Nothing alike.' },
}

/* The three WCAG levels, each with what it asks and of what. */
const LEVELS = [
  { label: 'AA', needs: 4.5, of: 'body text' },
  { label: 'AAA', needs: 7, of: 'body text' },
  { label: 'AA large', needs: 3, of: '18pt, or 14pt bold' },
]

export function CompareColours() {
  /* A pair that is easy to tell apart and still fails as text, which is the
     case the page exists to make. */
  const [a, setA] = useState('#7653ab')
  const [b, setB] = useState('#a98fcf')
  const ha = toHex(a)
  const hb = toHex(b)

  const result = useMemo(() => {
    if (!ha || !hb) return null
    const distance = deltaE(ha, hb)
    return { distance, band: BAND[classifyDeltaE(distance)], contrast: wcagContrast(ha, hb) }
  }, [ha, hb])

  const controls = (
    <div className={styles.pair}>
      <Input
        error={ha ? undefined : 'Not a colour this can read.'}
        hint="Hex, rgb() or oklch()."
        label="First colour"
        onChange={event => setA(event.target.value)}
        prefix={swatchPrefix(ha)}
        value={a}
      />
      <Input
        error={hb ? undefined : 'Not a colour this can read.'}
        hint="Hex, rgb() or oklch()."
        label="Second colour"
        onChange={event => setB(event.target.value)}
        prefix={swatchPrefix(hb)}
        value={b}
      />
    </div>
  )

  if (!result || !ha || !hb) return <ToolView controls={controls} />

  const { contrast, distance, band } = result

  return (
    <ToolView controls={controls}>
      {/* The pair itself, meeting along one edge: the question is whether the
          seam shows, and a gap between two chips answers it for you. */}
      <div className={styles.stack}>
        <Hero
          faces={[
            { hex: ha, ink: suggestTextColour(ha, INKS), label: ha.toUpperCase() },
            { hex: hb, ink: suggestTextColour(hb, INKS), label: hb.toUpperCase() },
          ]}
          note={`ΔE ${distance.toFixed(2)}`}
        />
        <div className={styles.answer}>
          <h2 className={styles.answerName}>{band.label}</h2>
        </div>
      </div>

      <div className={styles.pair}>
        <Panel label="Distance, ΔE 2000">
          <span className={styles.factValue}>{distance.toFixed(2)}</span>
          <p className={styles.factNote}>
            {band.meaning} CIEDE2000 measures how far apart two colours look rather than how far apart their numbers
            are, so about 1 is the smallest difference a person can see.
          </p>
        </Panel>

        <Panel label="Contrast, WCAG 2">
          <span className={styles.factValue}>{contrast.ratio}:1</span>
          <ul className={styles.rows}>
            {LEVELS.map(level => {
              const pass = contrast.ratio >= level.needs
              return (
                <li key={level.label}>
                  <span className={styles.rowName}>
                    {level.label}, {level.of}
                  </span>
                  <span className={styles.rowValue}>{level.needs}:1</span>
                  <span className={styles.verdict} data-pass={pass ? 'yes' : 'no'}>
                    {pass ? 'Pass' : 'Fail'}
                  </span>
                </li>
              )
            })}
          </ul>
        </Panel>
      </div>

      {/* Each colour as text on the other, because a ratio is a number and
          this is the thing the number is about. */}
      <div className={styles.pair}>
        <div className={styles.sample} style={{ background: hb, color: ha }}>
          <span className={styles.sampleLarge}>First on second</span>
          <span>The quick brown fox jumps over the lazy dog.</span>
        </div>
        <div className={styles.sample} style={{ background: ha, color: hb }}>
          <span className={styles.sampleLarge}>Second on first</span>
          <span>The quick brown fox jumps over the lazy dog.</span>
        </div>
      </div>
    </ToolView>
  )
}
