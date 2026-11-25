'use client'

import {
  classifyDeltaE,
  createNamedColourMatcher,
  generateLightnessScale,
  hueFamily,
  isLight,
  oklch,
  suggestTextColour,
  toHex,
  type NamedColourMatch,
} from '@hipuku/colour'
import { Badge, Button, Callout, Input, Spinner } from 'haus-components'
import { useEffect, useState } from 'react'
import { Swatch, swatchPrefix } from './swatch'
import { CopyValue, Hero, Meter, Panel, ToolView } from './tool-view'
import styles from './tool.module.css'

type Matcher = (hex: string, topN?: number) => NamedColourMatch[]

/* The ink this colour wants, which is also the ink its hero chip uses. */
const INKS = ['#ffffff', '#111113']

/*
 * How many nearest names to pull back when counting the neighbourhood.
 *
 * The matcher is top-N rather than radius-based, so a band count is exact only
 * while the Nth match is still outside the band being counted. A thousand is
 * past that line for every colour tried; the count is reported as a floor when
 * it is not, rather than quietly reading low.
 */
const NEIGHBOURHOOD = 1000

type Bands = { imperceptible: number; justNoticeable: number; noticeable: number; saturated: boolean }

function neighbourhood(matches: NamedColourMatch[]): Bands {
  const bands = { imperceptible: 0, justNoticeable: 0, noticeable: 0, saturated: false }
  for (const match of matches) {
    const band = classifyDeltaE(match.distance)
    if (band === 'imperceptible') bands.imperceptible += 1
    else if (band === 'just-noticeable') bands.justNoticeable += 1
    else if (band === 'noticeable') bands.noticeable += 1
  }
  const last = matches.at(-1)
  bands.saturated = matches.length >= NEIGHBOURHOOD && last != null && last.distance < 10
  return bands
}

/*
 * One colour, read every way the package can: its nearest names, how crowded
 * that part of the space is, its OKLCH coordinates, its hue family, whether it
 * is light, which ink reads on it, and the lightness scale it seeds.
 *
 * The 31,900 names are close to 1MB, so they load on this page only.
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
  const near = hex && matcher ? matcher(hex, NEIGHBOURHOOD) : []
  const best = near[0]
  const runners = near.slice(1, 6)
  const bands = neighbourhood(near)
  const crowd = bands.imperceptible + bands.justNoticeable
  const ink = hex ? suggestTextColour(hex, INKS) : null
  const scale = hex ? generateLightnessScale(hex) : []
  /* The same coordinates as the panel's three readings, written as CSS. */
  const declaration = lch
    ? `oklch(${(lch.l * 100).toFixed(1)}% ${lch.c.toFixed(3)} ${lch.h === null ? 'none' : lch.h.toFixed(1)})`
    : ''

  const field = (
    <Input
      error={hex ? undefined : 'Not a colour this can read.'}
      hint="Hex, rgb() or oklch()."
      label="Colour"
      onChange={event => setInput(event.target.value)}
      prefix={swatchPrefix(hex)}
      value={input}
    />
  )

  if (!hex || !lch || !ink) return <ToolView controls={field} />

  if (failed) {
    return (
      <ToolView controls={field}>
        <Callout tone="error">
          The colour names did not load.{' '}
          <Button onClick={() => setAttempt(n => n + 1)} size="sm" variant="secondary">
            Retry
          </Button>
        </Callout>
      </ToolView>
    )
  }

  if (!best) {
    return (
      <ToolView controls={field}>
        <p className={styles.summary}>
          <Spinner label="Loading 31,900 colour names" size="sm" /> Loading 31,900 names
        </p>
      </ToolView>
    )
  }

  const exact = best.distance === 0
  const bestInk = suggestTextColour(best.hex, INKS)

  return (
    <ToolView controls={field}>
      <div className={styles.stack}>
        {exact ? (
          <Hero faces={[{ hex, ink, label: 'Exact match' }]} />
        ) : (
          <Hero
            faces={[
              { hex, ink, label: hex.toUpperCase() },
              { hex: best.hex, ink: bestInk, label: best.hex.toUpperCase() },
            ]}
            note={`ΔE ${best.distance}`}
          />
        )}

        <div className={styles.answer}>
          <h2 className={styles.answerName}>{best.name}</h2>
          <CopyValue text={best.name} />
        </div>
      </div>

      <div className={styles.pair}>
        <Panel label="Nearby names">
          <ul className={styles.rows}>
            {runners.map(match => (
              <li key={match.hex + match.name}>
                <Swatch hex={match.hex} size="sm" />
                <span className={styles.rowName}>{match.name}</span>
                <span className={styles.rowValue}>ΔE {match.distance}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          aside={<Badge tone={crowd <= 2 ? 'success' : 'warning'}>{crowd <= 2 ? 'Unambiguous' : 'Contested'}</Badge>}
          label="Neighbourhood"
        >
          <div className={styles.meters}>
            <Meter count={bands.imperceptible} label="ΔE < 1" total={near.length} />
            <Meter count={bands.justNoticeable} label="ΔE 1 to 2" total={near.length} />
            <Meter count={bands.noticeable} label="ΔE 2 to 10" total={near.length} />
          </div>
          <p className={styles.factNote}>
            {crowd === 0
              ? 'No name sits within ΔE 2 of this colour, so it is between named colours rather than near one.'
              : `${bands.saturated ? 'At least ' : ''}${crowd} name${crowd === 1 ? '' : 's'} within ΔE 2, which is where a difference stops being obvious. The name above is the nearest of them, not the only reasonable one.`}
          </p>
        </Panel>
      </div>

      <div className={styles.pair}>
        <Panel
          aside={
            <span className={styles.badges}>
              <Badge tone="info">{hueFamily(hex) ?? 'Neutral'}</Badge>
              <Badge>{isLight(hex) ? 'Light' : 'Dark'}</Badge>
            </span>
          }
          label="OKLCH"
        >
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
          {/* The three readings above are what the numbers are; this is the
              line a reader came to the page for, in the form they paste. */}
          <div className={styles.declaration}>
            <code>{declaration}</code>
            <CopyValue text={declaration} />
          </div>
          <p className={styles.factNote}>
            Lightness and chroma are perceptual, so an even step in lightness looks like an even step. Chroma has no
            fixed maximum: how far it can go depends on the hue and the screen.
          </p>
        </Panel>

        <Panel label="Text on this colour">
          <div className={styles.sample} style={{ background: hex, color: ink }}>
            <span className={styles.sampleLarge}>The quick brown fox</span>
            <span>Set in {ink === '#ffffff' ? 'white' : 'near-black'}, the ink the package suggests.</span>
          </div>
        </Panel>
      </div>

      {scale.length > 0 && (
        <Panel label="Lightness scale from this colour">
          <ol aria-label="Lightness scale" className={styles.scale}>
            {scale.map((step, i) => (
              <li key={step}>
                <span className={styles.scaleChip} style={{ background: step }} />
                <code>{i === 0 ? 50 : i * 100}</code>
                <code>{step}</code>
              </li>
            ))}
          </ol>
        </Panel>
      )}
    </ToolView>
  )
}
