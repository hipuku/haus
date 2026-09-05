import React from 'react'
import type { Tone } from '../types'

/**
 * The severity glyphs, drawn rather than named as icon-font classes.
 *
 * The package declares `haus-tokens` and the two React peers and nothing else,
 * so a consumer without Font Awesome loaded would get an empty element where
 * the severity indicator belongs, with no error to say why. Both products that
 * built a Callout reached for Font Awesome; neither could have used haus's if
 * haus had one that did the same.
 *
 * Shared rather than copied. Toast drew these first and Callout needs the same
 * five: two components with the same five glyphs, drawn twice, is the defect
 * the promotions in step 7 exist to remove, and introducing it while removing
 * it elsewhere would be hard to defend.
 *
 * One stroke idiom throughout, `currentColor`, 1.5 units, round caps, so the
 * colour is set by whatever `.icon` rule the component declares, and no glyph
 * carries a fill of its own.
 */
export const TONE_ICONS: Record<Tone, React.ReactNode> = {
  /* Neutral and info are the same mark on purpose: an unstyled notice and an
     informational one differ in colour, not in meaning. */
  neutral: (
    <>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.25v4" />
      <path d="M8 4.9v.1" />
    </>
  ),
  info: (
    <>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.25v4" />
      <path d="M8 4.9v.1" />
    </>
  ),
  success: (
    <>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M5.4 8.2l1.9 1.9 3.3-3.9" />
    </>
  ),
  warning: (
    <>
      <path d="M8 1.9L15 14.1H1L8 1.9Z" />
      <path d="M8 6.2v3.4" />
      <path d="M8 11.7v.1" />
    </>
  ),
  error: (
    <>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M6 6l4 4M10 6l-4 4" />
    </>
  ),
}

/** The wrapper the glyphs are drawn in. `className` picks up the component's
 *  own `.icon` rule, which is where the tone colour lands. */
export function ToneIcon({ tone, className }: { tone: Tone; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {TONE_ICONS[tone]}
    </svg>
  )
}
