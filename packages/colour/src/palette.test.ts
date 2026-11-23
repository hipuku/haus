import { describe, expect, it } from 'vitest'
import { analysePalette, classifyDeltaE } from './palette.js'

describe('analysePalette', () => {
  it('needs two colours it can read', () => {
    expect(analysePalette([])).toBeNull()
    expect(analysePalette(['#ff0000'])).toBeNull()
    expect(analysePalette(['#ff0000', 'not a colour'])).toBeNull()
  })

  it('leaves out a colour it cannot read and analyses the rest', () => {
    const result = analysePalette(['#ff0000', 'nope', '#0000ff'])
    expect(result?.hexes).toEqual(['#ff0000', '#0000ff'])
  })

  it('sorts by lightness and rates even steps as uniform', () => {
    // OKLCH lightness 0.2, 0.4, 0.6, 0.8 and 1, given out of order.
    const greys = ['#ffffff', '#161616', '#808080', '#484848', '#bebebe']
    const { lightness } = analysePalette(greys)!
    expect(lightness.sortedHexes).toEqual(['#161616', '#484848', '#808080', '#bebebe', '#ffffff'])
    expect(lightness.steps).toHaveLength(4)
    expect(lightness.rating).toBe('uniform')
  })

  it('rates uneven lightness steps as uneven', () => {
    const { lightness } = analysePalette(['#000000', '#0a0a0a', '#ffffff'])!
    expect(lightness.rating).toBe('uneven')
  })

  it('rates chroma by its spread', () => {
    expect(analysePalette(['#777777', '#888888'])!.chroma.rating).toBe('tight')
    expect(analysePalette(['#777777', '#ff0000'])!.chroma.rating).toBe('wide')
  })

  it('measures the hue arc and notices a grey', () => {
    const { hueArc } = analysePalette(['#ff0000', '#ffff00', '#00ff00', '#808080'])!
    expect(hueArc.totalAngle).toBeGreaterThan(100)
    expect(hueArc.totalAngle).toBeLessThan(120)
    expect(hueArc.isMonotonic).toBe(true)
    expect(hueArc.hasAchromatic).toBe(true)
  })

  it('notices hues that turn back, in the order given', () => {
    // Red, green, then yellow: up the wheel to green and back to yellow.
    // hexicon sorted the hues first, so this read as monotonic.
    expect(analysePalette(['#ff0000', '#00ff00', '#ffff00'])!.hueArc.isMonotonic).toBe(false)
    expect(analysePalette(['#ff0000', '#ffff00', '#00ff00'])!.hueArc.isMonotonic).toBe(true)
  })

  it('reports no arc with fewer than two chromatic colours', () => {
    expect(analysePalette(['#ff0000', '#808080'])!.hueArc).toEqual({
      totalAngle: 0,
      isMonotonic: true,
      hasAchromatic: true,
    })
  })

  it('finds near-identical pairs and only those', () => {
    const { nearIdentical } = analysePalette(['#3366cc', '#3467cc', '#ff0000'])!
    expect(nearIdentical).toHaveLength(1)
    expect(nearIdentical[0]).toMatchObject({ a: '#3366cc', b: '#3467cc' })
    expect(nearIdentical[0].deltaE).toBeLessThan(2.5)
  })

  it('reports every pair with contrast verdicts on the exact ratio', () => {
    // 4.478:1. Rounded to one decimal first, this read 4.5 and passed AA,
    // which is the defect hexicon's analyser had and wcagContrast fixed.
    const { contrast } = analysePalette(['#777777', '#ffffff', '#000000'])!
    expect(contrast).toHaveLength(3)
    const grey = contrast.find(p => p.a === '#777777' && p.b === '#ffffff')!
    expect(grey.ratio).toBe(4.48)
    expect(grey.passAA).toBe(false)
    expect(contrast.find(p => p.a === '#ffffff' && p.b === '#000000')).toMatchObject({ passAA: true, passAAA: true })
  })
})

describe('classifyDeltaE', () => {
  it.each([
    [0.5, 'imperceptible'],
    [1, 'just-noticeable'],
    [1.99, 'just-noticeable'],
    [2, 'noticeable'],
    [9.9, 'noticeable'],
    [10, 'distinct'],
    [49, 'distinct'],
    [50, 'different'],
  ])('puts %s in %s', (distance, band) => {
    expect(classifyDeltaE(distance)).toBe(band)
  })
})
