'use client'

import {
  createNamedColourMatcher,
  generateLightnessScale,
  hueFamily,
  isLight,
  oklch,
  suggestTextColour,
  toHex,
  type NamedColourMatch,
} from '@hipuku/colour'
import { Badge, Button, Callout, Card, Input, Spinner } from 'haus-components'
import { useEffect, useState } from 'react'
import { Swatch, swatchPrefix } from './swatch'
import styles from './tool.module.css'

type Matcher = (hex: string, topN?: number) => NamedColourMatch[]

/*
 * One colour, read every way the package can: its nearest names, its OKLCH
 * coordinates, its hue family, whether it is light, which ink reads on it, and
 * the lightness scale it seeds. The 31,900 names are close to 1MB, so they
 * load on this page only.
 */
export function InspectColour() {
  const [input, setInput] = useState('#4f84ba')
  const [matcher, setMatcher] = useState<Matcher | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setFailed(false)
    import('@hipuku/colour/names')
      .then(({ colourNameEntries }) => setMatcher(() => createNamedColourMatcher(colourNameEntries())))
      .catch(() => setFailed(true))
  }, [attempt])

  const hex = toHex(input)
  const lch = hex ? oklch(hex) : null
  const names = hex && matcher ? matcher(hex, 5) : []
  const light = hex ? isLight(hex) : false
  const ink = hex ? suggestTextColour(hex, ['#ffffff', '#111113']) : null
  const scale = hex ? generateLightnessScale(hex) : []

  return (
    <div className={`not-prose ${styles.stack}`}>
      <Input
        error={hex ? undefined : 'Not a colour this can read.'}
        hint="Hex, rgb() or oklch()."
        label="Colour"
        onChange={event => setInput(event.target.value)}
        prefix={swatchPrefix(hex)}
        value={input}
      />

      {hex && lch && (
        <div className={styles.pair}>
          <Card>
            <div className={styles.fact}>
              <Swatch hex={hex} size="lg" />
              <span className={styles.factLabel}>Nearest name</span>
              {failed ? (
                <Callout tone="error">
                  The colour names did not load.{' '}
                  <Button onClick={() => setAttempt(n => n + 1)} size="sm" variant="secondary">
                    Retry
                  </Button>
                </Callout>
              ) : !matcher ? (
                <span className={styles.factNote}>
                  <Spinner label="Loading 31,900 colour names" size="sm" /> Loading 31,900 names
                </span>
              ) : (
                <>
                  <span className={styles.factValue}>{names[0]?.name}</span>
                  <ul className={styles.names}>
                    {names.slice(1).map(match => (
                      <li key={match.hex + match.name}>
                        <Swatch hex={match.hex} size="sm" />
                        <span>{match.name}</span>
                        <code>ΔE {match.distance}</code>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </Card>

          <Card>
            <div className={styles.fact}>
              <span className={styles.factLabel}>OKLCH</span>
              <dl className={styles.coords}>
                <div>
                  <dt>Lightness</dt>
                  <dd>{(lch.l * 100).toFixed(1)}%</dd>
                </div>
                <div>
                  <dt>Chroma</dt>
                  <dd>{lch.c.toFixed(3)}</dd>
                </div>
                <div>
                  <dt>Hue</dt>
                  <dd>{lch.h === null ? 'none' : `${lch.h.toFixed(1)}°`}</dd>
                </div>
              </dl>
              <div className={styles.badges}>
                <Badge tone="info">{hueFamily(hex) ?? 'Neutral'}</Badge>
                <Badge>{light ? 'Light' : 'Dark'}</Badge>
              </div>
              {ink && (
                <div className={styles.sample} style={{ background: hex, color: ink }}>
                  <span>Text reads best in {ink === '#ffffff' ? 'white' : 'near-black'} on this colour.</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {scale.length > 0 && (
        <div className={styles.fact}>
          <span className={styles.factLabel}>Lightness scale from this colour</span>
          <ol aria-label="Lightness scale" className={styles.scale}>
            {scale.map((step, i) => (
              <li key={step}>
                <span className={styles.scaleChip} style={{ background: step }} />
                <code>{i === 0 ? 50 : i * 100}</code>
                <code>{step}</code>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
