'use client'

import { useEffect, useRef, useState } from 'react'

/*
 * Every control on the site that copies something, and how it says so.
 *
 * The site had three of them and each said it differently: two swapped their
 * label from "Copy prompt" to "Copied" and the third said nothing at all. A
 * label that changes width moves the controls beside it, and the reader was
 * told twice in one control, once by the word and once by nothing.
 *
 * So the glyph carries it alone: the clipboard becomes a tick and goes back.
 * The label never changes, because what the control does has not changed. This
 * is also what Fumadocs' own code-block button does, so the two agree.
 */

export const COPY =
  'M9 9h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2zM5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1'
export const TICK = 'm5 13 4 4L19 7'

/* An icon beside a Button's label, by composition: Button lays its children
   out in a row with its own gap, so the glyph needs only a size, icon-sm. */
export const Glyph = ({ d }: { d: string }) => (
  <svg
    aria-hidden="true"
    className="haus-button-glyph"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d={d} />
  </svg>
)

/* How long the tick stays before the control goes back to offering the copy. */
const HELD = 2000

/*
 * Copies text and reports whether the tick is showing.
 *
 * The timer is cleared on unmount and before it is set again, so a reader who
 * leaves the page mid-tick, or presses twice, does not get a setState on a
 * gone component or a tick that clears early.
 */
export function useCopied() {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // No clipboard, or permission refused. Nothing was copied, so nothing is
      // claimed: the control stays as it was rather than ticking falsely.
      return
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), HELD)
  }

  return { copied, copy }
}

/* The clipboard, or the tick while it is held. */
export const CopyGlyph = ({ copied }: { copied: boolean }) => <Glyph d={copied ? TICK : COPY} />
