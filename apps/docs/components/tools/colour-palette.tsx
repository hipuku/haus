'use client'

import {
  analysePalette,
  clusterByPerceptualDistance,
  deltaE,
  NEAR_IDENTICAL_DELTA_E,
  oklch,
  toHex,
} from '@hipuku/colour'
import { Badge, Textarea } from 'haus-components'
import { useMemo, useState } from 'react'
import { Swatch } from './swatch'
import { Panel, ToolView } from './tool-view'
import styles from './tool.module.css'

/*
 * A palette, analysed every way the package can: every pair's contrast as a
 * matrix, each colour placed by its lightness, the colours that look alike
 * grouped, and how even its lightness, consistent its chroma and wide its hue
 * are. Each chart is also a table or a list, so nothing is carried by
 * position or colour alone.
 */

/** Colours separated by spaces, commas or new lines, split only outside brackets. */
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

const LIGHTNESS = {
  uniform: { tone: 'success', meaning: 'The steps between lightnesses are even.' },
  moderate: { tone: 'warning', meaning: 'Some steps are much larger than others.' },
  uneven: { tone: 'error', meaning: 'The lightness steps are irregular.' },
} as const

const CHROMA = {
  tight: { tone: 'success', meaning: 'The colours share a similar saturation.' },
  moderate: { tone: 'warning', meaning: 'Saturation varies somewhat.' },
  wide: { tone: 'info', meaning: 'Saturation varies widely, from greys to vivid colours.' },
} as const

/* The furthest apart any two members of a group are: what makes it one group. */
function widest(members: string[]): number {
  let out = 0
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) out = Math.max(out, deltaE(members[i], members[j]))
  }
  return out
}

export function PaletteAnalysis() {
  const [text, setText] = useState(
    /* A twilight running into a sunset. Chosen so the page has something to
       report in every panel: moderate lightness steps, moderate chroma, a 112
       degree hue arc that turns back on itself, one grey by chroma, and two
       groups that look alike, one of them a pair a reader would not catch. */
    '#1b1033 #3b2167 #6b3fa0 #7653ab #a98fcf #ded4ee #dfd5ef #e08a5f',
  )
  const hexes = useMemo(
    () => [
      ...new Set(
        splitColours(text)
          .map(toHex)
          .filter((h): h is string => Boolean(h)),
      ),
    ],
    [text],
  )
  const result = useMemo(() => analysePalette(hexes), [hexes])
  const clusters = useMemo(() => clusterByPerceptualDistance(hexes).filter(c => c.size > 1), [hexes])

  const contrast = (a: string, b: string) =>
    result?.contrast.find(p => (p.a === a && p.b === b) || (p.a === b && p.b === a))

  const controls = (
    <Textarea
      error={result ? undefined : 'Give at least two colours.'}
      hint="Colours separated by spaces, commas or new lines."
      label="Palette"
      onChange={e => setText(e.target.value)}
      rows={3}
      value={text}
    />
  )

  return (
    <ToolView controls={controls}>
      {/* The palette itself, large, before anything is said about it. */}
      {hexes.length > 0 && (
        <ul aria-label="The palette" className={styles.strip}>
          {hexes.map(hex => (
            <li key={hex}>
              <Swatch hex={hex} size="lg" />
              <code className={styles.value}>{hex}</code>
            </li>
          ))}
        </ul>
      )}

      {result && (
        <>
          {/* The three ratings keep their Badges: each tone here carries a
              ground of its own, and a rating is a verdict, which is the thing
              a Badge is for. */}
          <div className={styles.trio}>
            <Panel
              aside={<Badge tone={LIGHTNESS[result.lightness.rating].tone}>{result.lightness.rating}</Badge>}
              label="Lightness steps"
            >
              <span className={styles.factValue}>±{result.lightness.stdDev.toFixed(1)}</span>
              <p className={styles.factNote}>
                {LIGHTNESS[result.lightness.rating].meaning} The steps run from{' '}
                {Math.min(...result.lightness.steps).toFixed(1)} to {Math.max(...result.lightness.steps).toFixed(1)} on
                a lightness scale of 100, and that is their standard deviation.
              </p>
            </Panel>
            <Panel aside={<Badge tone={CHROMA[result.chroma.rating].tone}>{result.chroma.rating}</Badge>} label="Chroma">
              <span className={styles.factValue}>{result.chroma.mean.toFixed(3)}</span>
              <p className={styles.factNote}>
                {CHROMA[result.chroma.rating].meaning} That is the mean chroma, give or take{' '}
                {result.chroma.stdDev.toFixed(3)}.
              </p>
            </Panel>
            <Panel label="Hue range">
              <span className={styles.factValue}>{result.hueArc.totalAngle}°</span>
              <p className={styles.factNote}>
                {result.hueArc.isMonotonic
                  ? 'The hues run one way round the wheel.'
                  : 'The hues turn back on themselves.'}
                {result.hueArc.hasAchromatic ? ' Includes greys, which have no hue.' : ''}
              </p>
            </Panel>
          </div>

          <Panel label="Lightness, OKLCH, darkest to lightest">
            <div className={styles.ladder}>
              {result.lightness.sortedHexes.map(hex => {
                const l = oklch(hex)?.l ?? 0
                return (
                  <span
                    className={styles.ladderMark}
                    key={hex}
                    style={{ insetInlineStart: `${l * 100}%`, background: hex }}
                    title={`${hex}, ${(l * 100).toFixed(1)}%`}
                  />
                )
              })}
            </div>
            {/* The marks above place each colour; this says what the places
                are. The step column is the gap to the colour on the row
                before, which is the thing the rating above is a rating of. */}
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Colour</th>
                    <th scope="col">Lightness</th>
                    <th scope="col">Step from the row above</th>
                  </tr>
                </thead>
                <tbody>
                  {result.lightness.sortedHexes.map((hex, i) => (
                    <tr key={hex}>
                      <th scope="row">
                        <Swatch hex={hex} size="sm" /> <code className={styles.value}>{hex}</code>
                      </th>
                      <td>{((oklch(hex)?.l ?? 0) * 100).toFixed(1)}%</td>
                      <td>{i === 0 ? '' : `+${result.lightness.steps[i - 1].toFixed(1)}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* One Badge for the panel rather than one per row: the panel's own
              heading already says these look alike, so a badge on every row
              repeats it as many times as there are rows. What a row has to
              carry instead is how close its members are. */}
          {clusters.length > 0 && (
            <Panel
              aside={
                <Badge tone="warning">
                  {clusters.length} {clusters.length === 1 ? 'group' : 'groups'}
                </Badge>
              }
              label="Colours that look alike"
            >
              <ul className={styles.rows}>
                {clusters.map(cluster => (
                  <li key={cluster.representative}>
                    <span className={styles.cluster}>
                      {cluster.members.map(hex => (
                        <span className={styles.clusterItem} key={hex}>
                          <Swatch hex={hex} size="sm" />
                          <code className={styles.value}>{hex}</code>
                        </span>
                      ))}
                    </span>
                    <span className={styles.rowValue}>ΔE up to {widest(cluster.members).toFixed(1)}</span>
                  </li>
                ))}
              </ul>
              <p className={styles.factNote}>
                Anything under ΔE {NEAR_IDENTICAL_DELTA_E} is close enough that a reader is unlikely to see which of
                them they are looking at.
              </p>
            </Panel>
          )}

          <Panel
            aside={
              <span className={styles.factNote}>
                {result.contrast.filter(p => p.passAA).length} of {result.contrast.length} pairs pass AA
              </span>
            }
            label="Contrast, every colour as text on every other"
          >
            <div className={styles.tableWrap}>
              <table className={styles.matrix}>
                <thead>
                  <tr>
                    <th scope="col">Text on</th>
                    {hexes.map(bg => (
                      <th key={bg} scope="col">
                        <Swatch hex={bg} size="sm" /> <code className={styles.value}>{bg}</code>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hexes.map(fg => (
                    <tr key={fg}>
                      <th scope="row">
                        <Swatch hex={fg} size="sm" /> <code className={styles.value}>{fg}</code>
                      </th>
                      {hexes.map(bg => {
                        if (fg === bg)
                          return (
                            <td className={styles.same} key={bg}>
                              Same
                            </td>
                          )
                        const pair = contrast(fg, bg)
                        if (!pair) return <td key={bg} />
                        const verdict = pair.passAAA ? 'AAA' : pair.passAA ? 'AA' : 'Fail'
                        return (
                          <td data-verdict={verdict} key={bg}>
                            <span className={styles.matrixSample} style={{ background: bg, color: fg }}>
                              Aa
                            </span>
                            <span>{pair.ratio}</span>
                            <span className={styles.matrixVerdict}>{verdict}</span>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </ToolView>
  )
}
