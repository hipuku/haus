'use client'

import { Card, IconButton } from 'haus-components'
import type { CSSProperties, ReactNode } from 'react'
import { CopyGlyph, useCopied } from '../copy'
import styles from './tool.module.css'

/*
 * The furniture the four tool pages share.
 *
 * These are the arrangements the standalone tools were built on, rebuilt here
 * as the docs app's own code. None of them is a candidate for
 * haus-components: a tool page is one consumer, and a component earns its
 * place in the system by appearing in several. They are held to the system's
 * rules all the same, so every value below is a `--haus-*` token and every
 * colour is a semantic role rather than a shade. The one exception is a colour
 * the reader typed, which cannot be a token because it is data.
 */

/*
 * A tool's body: the controls, then the result, on one rhythm.
 *
 * The heading and the lede are the page's, drawn from frontmatter and markdown
 * above this, so there is no header slot here. The standalone tools carried
 * their own title because they had no page around them to do it.
 */
export function ToolView({ controls, children }: { controls: ReactNode; children?: ReactNode }) {
  return (
    <div className={`not-prose ${styles.view}`}>
      <div className={styles.controls}>{controls}</div>
      {children}
    </div>
  )
}

/*
 * A labelled box of related facts: the label at the start, room for a verdict
 * at the end, the facts below.
 *
 * A Card with its own heading row. Card holds the surface, the edge and the
 * inset; the row is the part Card has no slot for.
 */
export function Panel({ label, aside, children }: { label: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <Card>
      <div className={styles.panel}>
        <div className={styles.panelTop}>
          <span className={styles.panelLabel}>{label}</span>
          {aside}
        </div>
        {children}
      </div>
    </Card>
  )
}

/*
 * A share of a whole, as a label, a filled track and a count.
 *
 * The fill is the primary role rather than an accent of its own: a bar on a
 * docs page is reporting a measurement, not introducing a second brand.
 */
export function Meter({ label, count, total }: { label: string; count: number; total: number }) {
  const share = total > 0 ? Math.max(1, (count / total) * 100) : 0
  return (
    <div className={styles.meter}>
      <code className={styles.value}>{label}</code>
      <span className={styles.meterTrack}>
        <span className={styles.meterFill} style={{ inlineSize: `${share}%` }} />
      </span>
      <code className={styles.value}>{count}</code>
    </div>
  )
}

/*
 * The subject of a colour page, drawn large: one colour, or two side by side
 * when the page is about a pair, with their values on the colour itself.
 *
 * The standalone tool put those values in a black scrim with a blur, which
 * works in one theme on one ground. Here each face picks its own ink against
 * its own colour, so a near-white colour and a near-black colour both carry a
 * readable label without the page knowing which theme it is in.
 */
export type HeroFace = { hex: string; ink: string; label: string }

export function Hero({ faces, note }: { faces: HeroFace[]; note?: string }) {
  return (
    <div className={styles.hero}>
      {faces.map(face => (
        <div
          className={styles.heroFace}
          key={face.hex + face.label}
          style={{ '--face': face.hex, '--face-ink': face.ink } as CSSProperties}
        >
          <span className={styles.heroChip}>{face.label}</span>
        </div>
      ))}
      {note && <span className={styles.heroNote}>{note}</span>}
    </div>
  )
}

/*
 * One value a reader wants out of the page, next to the thing it names.
 *
 * Ghost rather than secondary: the value beside it is the thing to read, and a
 * filled control next to a heading reads as the page's main action. Icon only,
 * so IconButton rather than Button: it owns the square box and requires the
 * label the glyph cannot provide.
 *
 * Ghost is safe here because these sit on the page background. A ghost control
 * on a Card is the open defect in the tracker: in dark mode its hover fill and
 * `surface-raised` are the same shade, so the hover draws nothing.
 */
export function CopyValue({ text }: { text: string }) {
  const { copied, copy } = useCopied()
  return (
    <IconButton
      icon={<CopyGlyph copied={copied} />}
      label={`Copy ${text}`}
      onClick={() => void copy(text)}
      size="md"
      variant="ghost"
    />
  )
}
