import { describe, expect, it } from 'vitest'
import { createNamedColourMatcher } from '../namedColour.js'
import { COLOUR_NAME_COUNT, colourNameEntries, colourNames } from './index.js'

describe('the dataset', () => {
  it('holds 31,900 colours', () => {
    expect(COLOUR_NAME_COUNT).toBe(31900)
  })

  it('keys every entry as six hex digits without a hash', () => {
    for (const key of Object.keys(colourNames)) expect(key).toMatch(/^[0-9a-f]{6}$/i)
  })

  it('names every entry with a non-empty string', () => {
    for (const name of Object.values(colourNames)) expect(name.trim().length).toBeGreaterThan(0)
  })
})

describe('colourNameEntries', () => {
  const all = colourNameEntries()

  it('normalises every hex to #rrggbb, lowercase', () => {
    expect(all).toHaveLength(COLOUR_NAME_COUNT)
    for (const entry of all) expect(entry.hex).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('keeps a leading zero rather than shortening the hex', () => {
    // "00ffff" is a real key. Trimming it to "0ffff" would shift every channel.
    const cyan = all.find(e => e.hex === '#00ffff')
    expect(cyan).toBeDefined()
  })

  it('returns the same array on a second call rather than rebuilding it', () => {
    expect(colourNameEntries()).toBe(all)
  })
})

describe('naming against the full dataset', () => {
  // The behaviours hexicon's own tests held its matcher to, so hexicon can be
  // archived without losing them.
  const nameColour = createNamedColourMatcher(colourNameEntries())

  it.each([
    ['#000000', 'black'],
    ['#ffffff', 'white'],
  ])('names %s exactly, at distance 0', (hex, word) => {
    const [best] = nameColour(hex)
    expect(best.distance).toBe(0)
    expect(best.name.toLowerCase()).toContain(word)
  })

  it('returns the number of matches asked for', () => {
    expect(nameColour('#a1b2c3')).toHaveLength(5)
    expect(nameColour('#a1b2c3', 3)).toHaveLength(3)
  })
})
