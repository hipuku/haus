'use client'

import { classifyDeltaE, deltaE, toHex, wcagContrast, type DeltaEBand } from '@hipuku/colour'
import { Badge, Card, Input } from 'haus-components'
import { useMemo, useState } from 'react'
import { swatchPrefix } from './swatch'
import styles from './tool.module.css'

/*
 * Two colours, and the two questions asked of a pair. Distance: can a person
 * tell them apart (CIEDE2000)? Contrast: can one carry text on the other
 * (WCAG)? A pair can be easy to tell apart and still fail as text, or the
 * reverse, which is why both are shown side by side.
 */

const BAND: Record<DeltaEBand, { label: string; tone: 'success' | 'info' | 'warning' | 'neutral'; meaning: string }> = {
  imperceptible: { label: 'Imperceptible', tone: 'neutral', meaning: 'A person cannot tell these apart.' },
  'just-noticeable': { label: 'Just noticeable', tone: 'warning', meaning: 'Only side by side, on a careful look.' },
  noticeable: { label: 'Noticeable', tone: 'info', meaning: 'Different at a glance, but related.' },
  distinct: { label: 'Distinct', tone: 'success', meaning: 'Clearly two colours.' },
  different: { label: 'Very different', tone: 'success', meaning: 'Nothing alike.' },
}

const Pass = ({ ok, label }: { ok: boolean; label: string }) => (
  <Badge tone={ok ? 'success' : 'error'}>
    {label} {ok ? 'pass' : 'fail'}
  </Badge>
)

export function CompareColours() {
  const [a, setA] = useState('#3366cc')
  const [b, setB] = useState('#f5f4f9')
  const ha = toHex(a)
  const hb = toHex(b)

  const result = useMemo(() => {
    if (!ha || !hb) return null
    const distance = deltaE(ha, hb)
    return { distance, band: BAND[classifyDeltaE(distance)], contrast: wcagContrast(ha, hb) }
  }, [ha, hb])

  return (
    <div className={`not-prose ${styles.stack}`}>
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

      {result && ha && hb && (
        <div className={styles.pair}>
          <Card>
            <div className={styles.fact}>
              <span className={styles.factLabel}>Distance, ΔE 2000</span>
              <span className={styles.factValue}>{result.distance.toFixed(2)}</span>
              <Badge tone={result.band.tone}>{result.band.label}</Badge>
              <p className={styles.factNote}>{result.band.meaning}</p>
            </div>
          </Card>
          <Card>
            <div className={styles.fact}>
              <span className={styles.factLabel}>Contrast, WCAG 2</span>
              <span className={styles.factValue}>{result.contrast.ratio}:1</span>
              <div className={styles.badges}>
                <Pass label="AA" ok={result.contrast.passAA} />
                <Pass label="AAA" ok={result.contrast.passAAA} />
                <Pass label="AA large" ok={result.contrast.passAALarge} />
              </div>
              <p className={styles.factNote}>AA needs 4.5:1 for body text, AAA 7:1, and large text 3:1.</p>
            </div>
          </Card>
        </div>
      )}

      {result && ha && hb && (
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
      )}
    </div>
  )
}
