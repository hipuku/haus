import { wcagContrast } from './contrast.js'
import { deltaE } from './deltaE.js'
import { oklch } from './oklch.js'

/**
 * Palette analysis: how evenly a set of colours steps in lightness, how
 * consistent its chroma is, how much of the hue wheel it covers, which colours
 * are near-duplicates, and the contrast of every pair. Moved from hexicon's
 * palette analyser, where it ran the palette view.
 */

/** A colour in OKLCH. `h` is null for a grey, as in `oklch()`. */
export interface PalettePoint {
  hex: string
  l: number
  c: number
  h: number | null
}

export interface LightnessUniformity {
  /** The palette sorted from dark to light. */
  sortedHexes: string[]
  /** Lightness step between neighbours in that order, on a 0 to 100 scale. */
  steps: number[]
  stdDev: number
  rating: 'uniform' | 'moderate' | 'uneven'
}

export interface ChromaCoherence {
  mean: number
  stdDev: number
  rating: 'tight' | 'moderate' | 'wide'
}

export interface HueArc {
  /** Degrees of the hue wheel the chromatic colours span; 0 with fewer than two. */
  totalAngle: number
  /** True when the hues, in the palette's order, never turn back round the wheel. */
  isMonotonic: boolean
  /** True when the palette holds at least one grey, which has no hue to place. */
  hasAchromatic: boolean
}

export interface NearIdenticalPair {
  a: string
  b: string
  /** CIEDE2000, rounded to one decimal place. */
  deltaE: number
}

export interface ContrastPair {
  a: string
  b: string
  /** As `wcagContrast` reports it, rounded to two decimal places. */
  ratio: number
  /** The verdicts compare the exact ratio, as `wcagContrast` does. */
  passAA: boolean
  passAAA: boolean
}

export interface PaletteAnalysis {
  hexes: string[]
  points: PalettePoint[]
  lightness: LightnessUniformity
  chroma: ChromaCoherence
  hueArc: HueArc
  nearIdentical: NearIdenticalPair[]
  contrast: ContrastPair[]
}

/** Below this chroma a colour is treated as a grey when placing hues. */
export const PALETTE_ACHROMATIC_CHROMA = 0.04

/** Pairs closer than this CIEDE2000 distance are reported as near-identical. */
export const NEAR_IDENTICAL_DELTA_E = 2.5

function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  return Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length)
}

/** Signed shortest angular difference, from one hue to another. */
function angularDiff(from: number, to: number): number {
  let d = (((to - from) % 360) + 360) % 360
  if (d > 180) d -= 360
  return d
}

function lightness(points: PalettePoint[]): LightnessUniformity {
  const sorted = [...points].sort((a, b) => a.l - b.l)
  const steps = sorted.slice(1).map((p, i) => (p.l - sorted[i].l) * 100)
  const sd = stdDev(steps)
  return {
    sortedHexes: sorted.map(p => p.hex),
    steps,
    stdDev: sd,
    rating: sd < 5 ? 'uniform' : sd < 12 ? 'moderate' : 'uneven',
  }
}

function chromaCoherence(points: PalettePoint[]): ChromaCoherence {
  const values = points.map(p => p.c)
  const sd = stdDev(values)
  return {
    mean: values.reduce((sum, v) => sum + v, 0) / values.length,
    stdDev: sd,
    rating: sd < 0.04 ? 'tight' : sd < 0.1 ? 'moderate' : 'wide',
  }
}

function hueArc(points: PalettePoint[]): HueArc {
  const chromatic = points.filter(p => p.c >= PALETTE_ACHROMATIC_CHROMA && p.h !== null).map(p => p.h as number)
  const hasAchromatic = chromatic.length < points.length
  if (chromatic.length < 2) return { totalAngle: 0, isMonotonic: true, hasAchromatic }

  // The arc is the complement of the largest gap between neighbouring hues,
  // the wrap-around gap included.
  const hues = [...chromatic].sort((a, b) => a - b)
  let maxGap = hues[0] + 360 - hues[hues.length - 1]
  for (let i = 1; i < hues.length; i++) maxGap = Math.max(maxGap, hues[i] - hues[i - 1])

  // Walked in the palette's own order. hexicon walked the sorted hues, which
  // turn one way by construction, so it reported every palette as monotonic.
  const steps = chromatic.slice(1).map((h, i) => angularDiff(chromatic[i], h))
  return {
    totalAngle: Math.round(360 - maxGap),
    isMonotonic: steps.every(s => s >= 0) || steps.every(s => s <= 0),
    hasAchromatic,
  }
}

function pairs<T>(hexes: string[], make: (a: string, b: string) => T | undefined): T[] {
  const out: T[] = []
  for (let i = 0; i < hexes.length; i++) {
    for (let j = i + 1; j < hexes.length; j++) {
      const pair = make(hexes[i], hexes[j])
      if (pair) out.push(pair)
    }
  }
  return out
}

/**
 * Analyse a palette. Colours that cannot be parsed are left out; null when
 * fewer than two remain, since every measure here compares colours.
 */
export function analysePalette(hexes: string[]): PaletteAnalysis | null {
  const points: PalettePoint[] = []
  for (const hex of hexes) {
    const colour = oklch(hex)
    if (colour) points.push({ hex, ...colour })
  }
  if (points.length < 2) return null
  const valid = points.map(p => p.hex)

  return {
    hexes: valid,
    points,
    lightness: lightness(points),
    chroma: chromaCoherence(points),
    hueArc: hueArc(points),
    nearIdentical: pairs(valid, (a, b) => {
      const de = deltaE(a, b)
      return de < NEAR_IDENTICAL_DELTA_E ? { a, b, deltaE: Math.round(de * 10) / 10 } : undefined
    }),
    contrast: pairs(valid, (a, b) => {
      const { ratio, passAA, passAAA } = wcagContrast(a, b)
      return { a, b, ratio, passAA, passAAA }
    }),
  }
}

/** How visible a CIEDE2000 difference is. */
export type DeltaEBand = 'imperceptible' | 'just-noticeable' | 'noticeable' | 'distinct' | 'different'

/**
 * The band a CIEDE2000 distance falls in: under 1 imperceptible, under 2 just
 * noticeable, under 10 noticeable at a glance, under 50 distinct, and beyond
 * that different colours.
 */
export function classifyDeltaE(distance: number): DeltaEBand {
  if (distance < 1) return 'imperceptible'
  if (distance < 2) return 'just-noticeable'
  if (distance < 10) return 'noticeable'
  if (distance < 50) return 'distinct'
  return 'different'
}
