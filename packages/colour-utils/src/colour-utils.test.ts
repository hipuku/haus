import { describe, it, expect } from 'vitest'
import chroma from 'chroma-js'
import { generateLightnessScale }        from './lightnessScale'
import { wcagContrast, isLight, suggestTextColour } from './contrast'
import { clusterByPerceptualDistance }   from './cluster'
import { nearestNamedColour }            from './namedColour'

describe('generateLightnessScale', () => {
  it('returns the requested number of steps', () => {
    const scale = generateLightnessScale('#3b82f6', { steps: 10 })
    expect(scale).toHaveLength(10)
  })

  it('returns valid hex strings', () => {
    const scale = generateLightnessScale('#e11d48', { steps: 5 })
    for (const hex of scale) {
      expect(hex).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('goes from light to dark', () => {
    const scale = generateLightnessScale('#7c3aed', { steps: 5 })
    const first = chroma(scale[0]).luminance()
    const last  = chroma(scale[4]).luminance()
    expect(first).toBeGreaterThan(last)
  })
})

describe('wcagContrast', () => {
  it('black on white passes AAA', () => {
    const result = wcagContrast('#000000', '#ffffff')
    expect(result.ratio).toBeGreaterThan(20)
    expect(result.passAA).toBe(true)
    expect(result.passAAA).toBe(true)
  })

  it('light grey on white fails AA', () => {
    const result = wcagContrast('#cccccc', '#ffffff')
    expect(result.passAA).toBe(false)
  })

  it('ratio is rounded to 2 decimal places', () => {
    const result = wcagContrast('#000000', '#ffffff')
    expect(result.ratio).toBe(Math.round(result.ratio * 100) / 100)
  })
})

describe('isLight', () => {
  it('white is light', () => expect(isLight('#ffffff')).toBe(true))
  it('black is not light', () => expect(isLight('#000000')).toBe(false))
  it('mid grey is not light (below 0.35 luminance)', () => {
    expect(isLight('#808080')).toBe(false)
  })
})

describe('suggestTextColour', () => {
  it('returns black for a light background from palette', () => {
    const result = suggestTextColour('#ffffff', ['#000000', '#ffffff', '#888888'])
    expect(result).toBe('#000000')
  })

  it('falls back to white on dark background when palette is empty', () => {
    expect(suggestTextColour('#000000', [])).toBe('#ffffff')
  })

  it('falls back to black on light background when palette is empty', () => {
    expect(suggestTextColour('#ffffff', [])).toBe('#000000')
  })
})

describe('clusterByPerceptualDistance', () => {
  it('returns empty array for empty input', () => {
    expect(clusterByPerceptualDistance([])).toEqual([])
  })

  it('groups near-identical colours into one cluster', () => {
    const clusters = clusterByPerceptualDistance(['#ff0000', '#fe0000', '#fd0000'])
    expect(clusters).toHaveLength(1)
    expect(clusters[0].size).toBe(3)
  })

  it('keeps perceptually distinct colours separate', () => {
    const clusters = clusterByPerceptualDistance(['#ff0000', '#0000ff', '#00ff00'])
    expect(clusters.length).toBeGreaterThanOrEqual(2)
  })

  it('deduplicates identical hexes', () => {
    const clusters = clusterByPerceptualDistance(['#ff0000', '#ff0000', '#ff0000'])
    expect(clusters).toHaveLength(1)
    expect(clusters[0].size).toBe(1)
  })

  it('representative is a valid hex', () => {
    const clusters = clusterByPerceptualDistance(['#c0392b', '#e74c3c'])
    expect(clusters[0].representative).toMatch(/^#[0-9a-f]{6}$/i)
  })
})

describe('nearestNamedColour', () => {
  it('returns topN results', () => {
    const matches = nearestNamedColour('#ff0000', 3)
    expect(matches).toHaveLength(3)
  })

  it('nearest match for pure red is "red"', () => {
    const matches = nearestNamedColour('#ff0000', 1)
    expect(matches[0].name).toBe('red')
  })

  it('nearest match for pure blue is "blue"', () => {
    const matches = nearestNamedColour('#0000ff', 1)
    expect(matches[0].name).toBe('blue')
  })

  it('results are sorted by distance ascending', () => {
    const matches = nearestNamedColour('#ff8800', 5)
    for (let i = 1; i < matches.length; i++) {
      expect(matches[i].distance).toBeGreaterThanOrEqual(matches[i - 1].distance)
    }
  })

  it('each match has a valid hex', () => {
    for (const m of nearestNamedColour('#123456', 5)) {
      expect(m.hex).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})
