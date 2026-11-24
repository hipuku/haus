import { describe, expect, it } from 'vitest'
import { Losses } from './document.js'
import { readDtcgValue } from './dtcgRead.js'
import {
  fontFamilyToCss,
  parseDimension,
  parseDuration,
  parseFontFamily,
  splitFontFamilies,
  parseFontWeight,
} from './values.js'

/*
 * What a value may look like when a person, rather than a generator, wrote it.
 * Each case here was read wrongly or silently before, and each is ordinary CSS
 * or ordinary DTCG rather than something exotic.
 */

describe('CSS numbers', () => {
  it('reads a sign and an exponent, either way round', () => {
    expect(parseDimension('+1rem')).toEqual({ value: 1, unit: 'rem' })
    expect(parseDimension('-0.5px')).toEqual({ value: -0.5, unit: 'px' })
    expect(parseDuration('1e+2ms')).toEqual({ value: 100, unit: 'ms' })
    expect(parseDuration('2E-1s')).toEqual({ value: 0.2, unit: 's' })
  })

  it('still refuses what is not a number', () => {
    expect(parseDimension('1 rem')).toBeNull()
    expect(parseDimension('++1rem')).toBeNull()
    expect(parseDimension('1e rem')).toBeNull()
    expect(parseDuration('fast')).toBeNull()
  })
})

describe('font families', () => {
  it('keeps a comma that is inside quotes', () => {
    expect(splitFontFamilies(`"Helvetica, Inc", sans-serif`)).toEqual(['Helvetica, Inc', 'sans-serif'])
    expect(parseFontFamily(`'Helvetica, Inc'`)).toBe('Helvetica, Inc')
    expect(parseFontFamily(`DM Sans, sans-serif`)).toEqual(['DM Sans', 'sans-serif'])
  })

  it('quotes a name CSS cannot take unquoted, and escapes what is in it', () => {
    expect(fontFamilyToCss(['DM Sans', 'sans-serif'])).toBe('DM Sans, sans-serif')
    expect(fontFamilyToCss('Helvetica, Inc')).toBe(`'Helvetica, Inc'`)
    expect(fontFamilyToCss("O'Font")).toBe(`'O\\'Font'`)
    expect(fontFamilyToCss('400 Sans')).toBe(`'400 Sans'`)
    expect(fontFamilyToCss('Back\\slash')).toBe(`'Back\\\\slash'`)
  })

  it('round-trips a quoted name whole', () => {
    const written = fontFamilyToCss(parseFontFamily(`"Helvetica, Inc", serif`))
    expect(parseFontFamily(written)).toEqual(['Helvetica, Inc', 'serif'])
  })

  it('reports a quoted single family rather than keeping its quotes', () => {
    const losses = new Losses()
    const { value } = readDtcgValue(`"Helvetica, Inc"`, 'fontFamily', undefined, ['font'], 'default', losses)
    expect(value).toEqual({ kind: 'literal', value: 'Helvetica, Inc' })
    expect(losses.entries[0].detail).toMatch(/quotes are not part of the name/)
  })
})

describe('font weights', () => {
  it('reads a number written as a string, and says it did', () => {
    const losses = new Losses()
    const { value } = readDtcgValue('400', 'fontWeight', undefined, ['weight'], 'default', losses)
    expect(value).toEqual({ kind: 'literal', value: 400 })
    expect(losses.entries).toHaveLength(1)
    expect(losses.entries[0].reason).toBe('lenient-read')
  })

  it('takes a keyword in silence, because 2025.10 allows it', () => {
    const losses = new Losses()
    const { value } = readDtcgValue('semi-bold', 'fontWeight', undefined, ['weight'], 'default', losses)
    expect(value).toEqual({ kind: 'literal', value: 600 })
    expect(losses.entries).toEqual([])
    expect(parseFontWeight('BOLD')).toBe(700)
  })
})

describe('what a quote means in a family name', () => {
  it('keeps an apostrophe that is part of the name', () => {
    expect(parseFontFamily("O'Brien")).toBe("O'Brien")
    expect(splitFontFamilies("O'Brien, serif")).toEqual(["O'Brien", 'serif'])
  })

  it('decodes a CSS escape rather than dropping its backslash', () => {
    expect(splitFontFamilies(String.raw`"O\27 Font", serif`)).toEqual(["O'Font", 'serif'])
    expect(splitFontFamilies(String.raw`"a\"b"`)).toEqual(['a"b'])
  })
})
