import chroma from 'chroma-js'
import colornames from './colornames.json'

export interface NamedColourMatch {
  name: string
  hex: string       // the named colour's canonical hex
  distance: number  // CIEDE2000 ΔE
}

interface ColourEntry {
  hex: string
  name: string
  L: number
  a: number
  b: number
}

// Pre-compute Lab values once at module load — no repeated conversions at query time
const COLOUR_LIST: ColourEntry[] = Object.entries(
  colornames as Record<string, string>
).map(([rawHex, name]) => {
  const hex = `#${rawHex.padStart(6, '0')}`
  const [L, a, b] = chroma(hex).lab()
  return { hex, name, L, a, b }
})

// Two-stage search: CIE76 (fast Euclidean in Lab) narrows the dataset to
// candidates within a generous radius; CIEDE2000 re-scores for accuracy.
const CIE76_RADIUS = 28

/**
 * Finds the closest named colour to the given hex using CIEDE2000 distance.
 * Returns the top N matches (default 5).
 */
export function nearestNamedColour(hex: string, topN = 5): NamedColourMatch[] {
  const [L1, a1, b1] = chroma(hex).lab()

  const candidates: ColourEntry[] = []
  for (const entry of COLOUR_LIST) {
    const d = Math.sqrt(
      (L1 - entry.L) ** 2 + (a1 - entry.a) ** 2 + (b1 - entry.b) ** 2
    )
    if (d < CIE76_RADIUS) candidates.push(entry)
  }

  // If nothing in radius, fall back to nearest by CIE76
  const pool = candidates.length > 0 ? candidates : COLOUR_LIST

  return pool
    .map(entry => ({
      name: entry.name,
      hex: entry.hex,
      distance: Math.round(chroma.deltaE(hex, entry.hex) * 10) / 10,
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, topN)
}
