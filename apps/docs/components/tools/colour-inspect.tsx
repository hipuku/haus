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
  wcagContrast,
  type NamedColourMatch,
} from '@hipuku/colour'
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock'
import { Badge, Button, Callout, Input, Spinner } from 'haus-components'
import { useDeferredValue, useEffect, useState } from 'react'
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
  const deferredDeclaration = useDeferredValue(declaration)

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
        {/* The hue family and light-or-dark are readings the package derives
            from the same three numbers, so they sit in the grid with them
            rather than as Badges. A neutral subtle Badge is also invisible on
            a Card in dark mode: both are damson-800, which is the surface gap
            the tracker already has open against the ghost hover. */}
        <Panel label="OKLCH">
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
            <div>
              <dt>Family</dt>
              <dd>{hueFamily(hex) ?? 'Neutral'}</dd>
            </div>
            <div>
              <dt>Reads as</dt>
              <dd>{isLight(hex) ? 'Light' : 'Dark'}</dd>
            </div>
          </dl>
          {/* The three readings above are what the numbers are; this is the
              line a reader came to the page for, in the form they paste.

              The site's code block, the same one the install command on every
              component page uses, rather than a field and a copy control of
              this page's own: copyable code is already a thing this site
              draws. Deferred because the block re-highlights as the value
              changes, and without it React shows the Suspense fallback on
              every keystroke instead of the line that is already there. */}
          <DynamicCodeBlock code={deferredDeclaration} lang="css" />
          <p className={styles.factNote}>
            Lightness and chroma are perceptual, so an even step in lightness looks like an even step. Chroma has no
            fixed maximum: how far it can go depends on the hue and the screen.
          </p>
        </Panel>

        {/* The sample asserts an ink; these rows are why it was picked. Both
            candidates are measured against the colour, so a reader can see
            the suggestion is the higher of two numbers rather than a
            judgement. Verdicts are coloured text rather than Badges, which is
            what the contrast matrix on the palette page already does, and it
            avoids a neutral Badge on a Card going invisible in dark mode. */}
        <Panel label="Text on this colour">
          <div className={styles.sample} style={{ background: hex, color: ink }}>
            <span className={styles.sampleLarge}>The quick brown fox</span>
            <span>Set in {ink === '#ffffff' ? 'white' : 'near-black'}, the ink the package suggests.</span>
          </div>
          <ul className={styles.rows}>
            {INKS.map(candidate => {
              const { ratio, passAA, passAAA, passAALarge } = wcagContrast(candidate, hex)
              const verdict = passAAA ? 'AAA' : passAA ? 'AA' : passAALarge ? 'AA large only' : 'Fails'
              return (
                <li key={candidate}>
                  <Swatch hex={candidate} size="sm" />
                  <span className={styles.rowName}>
                    {candidate === '#ffffff' ? 'White' : 'Near-black'}
                    {candidate === ink ? ' (suggested)' : ''}
                  </span>
                  <span className={styles.rowValue}>{ratio.toFixed(2)}:1</span>
                  <span className={styles.verdict} data-pass={passAA ? 'yes' : passAALarge ? 'large' : 'no'}>
                    {verdict}
                  </span>
                </li>
              )
            })}
          </ul>
          <p className={styles.factNote}>
            WCAG 2 asks 4.5:1 of body text and 3:1 of text at 18pt, or 14pt bold. AAA raises the first to 7:1.
          </p>
        </Panel>
      </div>

      {scale.length > 0 && (
        <Panel label="Lightness scale from this colour">
          <ol aria-label="Lightness scale" className={styles.scale}>
            {scale.map((step, i) => (
              <li key={step}>
                <span className={styles.scaleChip} style={{ background: step }} />
                <code className={styles.value}>{i === 0 ? 50 : i * 100}</code>
                <code className={styles.value}>{step}</code>
              </li>
            ))}
          </ol>
        </Panel>
      )}
    </ToolView>
  )
}
