import chroma from 'chroma-js'

export interface ContrastResult {
  ratio: number
  passAA:      boolean  // 4.5:1 for normal text
  passAAA:     boolean  // 7:1   for normal text
  passAALarge: boolean  // 3:1   for large text (≥18pt or ≥14pt bold)
}

/**
 * Returns the WCAG 2.1 contrast ratio between two colours and AA/AAA pass/fail.
 */
export function wcagContrast(foreground: string, background: string): ContrastResult {
  const ratio = Math.round(chroma.contrast(foreground, background) * 100) / 100
  return {
    ratio,
    passAA:      ratio >= 4.5,
    passAAA:     ratio >= 7.0,
    passAALarge: ratio >= 3.0,
  }
}

/**
 * Returns true if the colour is perceptually light (luminance > 0.35).
 * Use to decide whether to place dark or light text on top.
 */
export function isLight(hex: string): boolean {
  return chroma(hex).luminance() > 0.35
}

/**
 * Given a colour and a palette of candidate text colours, returns the
 * palette colour with the highest WCAG contrast ratio against the base.
 * Falls back to black or white if the palette is empty.
 */
export function suggestTextColour(backgroundHex: string, palette: string[]): string {
  if (palette.length === 0) {
    return isLight(backgroundHex) ? '#000000' : '#ffffff'
  }

  let best = palette[0]
  let bestRatio = chroma.contrast(backgroundHex, best)

  for (let i = 1; i < palette.length; i++) {
    const ratio = chroma.contrast(backgroundHex, palette[i])
    if (ratio > bestRatio) {
      bestRatio = ratio
      best = palette[i]
    }
  }

  return best
}
