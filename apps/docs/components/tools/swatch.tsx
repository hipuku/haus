'use client'

import styles from './tool.module.css'

/*
 * A colour drawn as a chip, for the colour tools. The colour itself is the
 * one value that cannot be a token, since it is the reader's input; the chip's
 * size, corner and edge are all tokens. The edge is what keeps a colour that
 * matches the page from vanishing into it.
 */
export function Swatch({ hex, size = 'md' }: { hex: string; size?: 'sm' | 'md' | 'lg' }) {
  return <span aria-hidden="true" className={styles.swatch} data-size={size} style={{ background: hex }} />
}

/*
 * A colour field with its swatch beside it. haus's Input takes a `prefix`, so
 * the swatch sits inside the field rather than next to it.
 */
export const swatchPrefix = (hex: string | null) => (hex ? <Swatch hex={hex} size="sm" /> : null)
