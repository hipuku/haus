import chroma from 'chroma-js'

export interface Oklch {
  /** Perceptual lightness, 0 to 1. */
  l: number
  /** Chroma. 0 is a true grey; around 0.37 is the most saturated sRGB can reach. */
  c: number
  /**
   * Hue in degrees, 0 to 360, or null when the colour is achromatic and has no
   * hue to report. Null rather than NaN, so a caller has to decide what a grey
   * means instead of propagating a value that fails every comparison silently.
   */
  h: number | null
}

/**
 * A hex in OKLCH. Returns null if it will not parse.
 *
 * OKLCH separates lightness from chroma in a way HSL does not: HSL saturation
 * inflates at the extremes of lightness, so a near-black or near-white with a
 * slight tint reads as a strongly saturated hue. Every judgement about whether a
 * colour is "a grey" or "a blue" wants chroma, not saturation.
 */
export function oklch(hex: string): Oklch | null {
  let l: number
  let c: number
  let h: number
  try {
    ;[l, c, h] = chroma(hex).oklch()
  } catch {
    return null
  }
  if (!Number.isFinite(l) || !Number.isFinite(c)) return null
  return { l, c, h: Number.isFinite(h) ? ((h % 360) + 360) % 360 : null }
}

/**
 * Chroma below which a colour is treated as a neutral rather than a tinted hue.
 * Sits well clear of both sides: the tinted greys a design system ships measure
 * under 0.02, and the least saturated colour anyone would call a hue is around
 * 0.17.
 */
export const NEUTRAL_CHROMA = 0.03

/** A named hue range. `min` above `max` wraps past 360. */
export interface HueFamily {
  name: string
  min: number
  max: number
}

/**
 * Hue families, ordered round the wheel from red. `min` above `max` wraps.
 *
 * The boundaries are the midpoints between measured OKLCH hues of the colours
 * each family is named after: red 29, orange 71, yellow 110, green 142, cyan
 * 195, blue 264, violet 293, magenta 328, pink 354.
 *
 * They are not the HSL numbers. OKLCH hue is a different wheel, and reusing
 * HSL's boundaries (red 0, yellow 60, green 120, blue 240) offsets every family
 * by roughly one place: it puts #ff0000 in Orange, #ffff00 in Green and #0000ff
 * in Purple. Checked against 27 canonical colours, tailwind's ramps included.
 */
export const HUE_FAMILIES: HueFamily[] = [
  { name: 'Red', min: 11, max: 50 },
  { name: 'Orange', min: 50, max: 90 },
  { name: 'Yellow', min: 90, max: 126 },
  { name: 'Green', min: 126, max: 168 },
  { name: 'Cyan', min: 168, max: 230 },
  { name: 'Blue', min: 230, max: 278 },
  { name: 'Purple', min: 278, max: 310 },
  { name: 'Pink', min: 310, max: 11 },
]

/**
 * Family name for a hex: one of HUE_FAMILIES, or "Neutral" below NEUTRAL_CHROMA.
 * Returns null if the hex will not parse.
 *
 * @param families override the bins to use a different vocabulary
 * @param neutralChroma override the neutral cut
 */
export function hueFamily(
  hex: string,
  families: HueFamily[] = HUE_FAMILIES,
  neutralChroma: number = NEUTRAL_CHROMA,
): string | null {
  const colour = oklch(hex)
  if (!colour) return null
  if (colour.h === null || colour.c < neutralChroma) return 'Neutral'
  for (const family of families) {
    const inBin =
      family.min > family.max
        ? colour.h >= family.min || colour.h < family.max
        : colour.h >= family.min && colour.h < family.max
    if (inBin) return family.name
  }
  return families[0]?.name ?? 'Neutral'
}
