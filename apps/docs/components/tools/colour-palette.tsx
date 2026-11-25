'use client'

import { analysePalette, clusterByPerceptualDistance, oklch, toHex } from '@hipuku/colour'
import { Badge, Card, Textarea } from 'haus-components'
import { useMemo, useState } from 'react'
import { Swatch } from './swatch'
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

export function PaletteAnalysis() {
  const [text, setText] = useState('#161616 #484848 #808080 #bebebe #ffffff #3366cc #3467cc #cc6633')
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

  return (
    <div className={`not-prose ${styles.stack}`}>
      <Textarea
        error={result ? undefined : 'Give at least two colours.'}
        hint="Colours separated by spaces, commas or new lines."
        label="Palette"
        onChange={e => setText(e.target.value)}
        rows={3}
        value={text}
      />

      {hexes.length > 0 && (
        <ul aria-label="The palette" className={styles.strip}>
          {hexes.map(hex => (
            <li key={hex}>
              <Swatch hex={hex} size="lg" />
              <code>{hex}</code>
            </li>
          ))}
        </ul>
      )}

      {result && (
        <>
          <div className={styles.pair}>
            <Card>
              <div className={styles.fact}>
                <span className={styles.factLabel}>Lightness steps</span>
                <Badge tone={LIGHTNESS[result.lightness.rating].tone}>{result.lightness.rating}</Badge>
                <p className={styles.factNote}>{LIGHTNESS[result.lightness.rating].meaning}</p>
              </div>
            </Card>
            <Card>
              <div className={styles.fact}>
                <span className={styles.factLabel}>Chroma</span>
                <Badge tone={CHROMA[result.chroma.rating].tone}>{result.chroma.rating}</Badge>
                <p className={styles.factNote}>{CHROMA[result.chroma.rating].meaning}</p>
              </div>
            </Card>
            <Card>
              <div className={styles.fact}>
                <span className={styles.factLabel}>Hue range</span>
                <span className={styles.factValue}>{result.hueArc.totalAngle}°</span>
                <p className={styles.factNote}>
                  {result.hueArc.isMonotonic
                    ? 'The hues run one way round the wheel.'
                    : 'The hues turn back on themselves.'}
                  {result.hueArc.hasAchromatic ? ' Includes greys, which have no hue.' : ''}
                </p>
              </div>
            </Card>
          </div>

          <section aria-label="Lightness ladder" className={styles.fact}>
            <span className={styles.factLabel}>Lightness, OKLCH, darkest to lightest</span>
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
            <ol className={styles.ladderList}>
              {result.lightness.sortedHexes.map(hex => (
                <li key={hex}>
                  <Swatch hex={hex} size="sm" />
                  <code>{hex}</code>
                  <span>{((oklch(hex)?.l ?? 0) * 100).toFixed(1)}%</span>
                </li>
              ))}
            </ol>
          </section>

          {clusters.length > 0 && (
            <section aria-label="Colours that look alike" className={styles.fact}>
              <span className={styles.factLabel}>Colours that look alike</span>
              {clusters.map(cluster => (
                <div className={styles.cluster} key={cluster.representative}>
                  {cluster.members.map(hex => (
                    <span className={styles.clusterItem} key={hex}>
                      <Swatch hex={hex} size="md" />
                      <code>{hex}</code>
                    </span>
                  ))}
                  <Badge tone="warning">Look alike</Badge>
                </div>
              ))}
            </section>
          )}

          <section aria-label="Contrast matrix" className={styles.fact}>
            <span className={styles.factLabel}>
              Contrast, every colour as text on every other. Pairs passing AA:{' '}
              {result.contrast.filter(p => p.passAA).length} of {result.contrast.length}
            </span>
            <div className={styles.tableWrap}>
              <table className={styles.matrix}>
                <thead>
                  <tr>
                    <th scope="col">Text on</th>
                    {hexes.map(bg => (
                      <th key={bg} scope="col">
                        <Swatch hex={bg} size="sm" /> <code>{bg}</code>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hexes.map(fg => (
                    <tr key={fg}>
                      <th scope="row">
                        <Swatch hex={fg} size="sm" /> <code>{fg}</code>
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
          </section>
        </>
      )}
    </div>
  )
}
