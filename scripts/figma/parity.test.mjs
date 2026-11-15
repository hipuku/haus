import { afterEach, describe, expect, it, vi } from 'vitest'
import { diff, accept, applyExceptions } from './diff.mjs'
import { normaliseValue, figmaItems, variableToProperty } from './normalise.mjs'
import { retryDelay, fetchComponents, FigmaUnavailable } from './rest.mjs'
import { resolve, unionAliases, variantProps, statesOf } from './code.mjs'
import { show, report } from './report.mjs'

const kindOf = (code, figma, baseline) => diff({ code, figma, baseline }).findings.map(f => f.kind)

describe('the decision rules', () => {
  const base = { 'axis Button.size': { code: 'md|sm', figma: 'md|sm' } }

  it('reports nothing when both sides match the baseline', () => {
    expect(kindOf({ 'axis Button.size': 'md|sm' }, { 'axis Button.size': 'md|sm' }, base)).toEqual([])
  })

  it('fails code ahead of Figma', () => {
    const r = diff({ code: { 'axis Button.size': 'lg|md|sm' }, figma: { 'axis Button.size': 'md|sm' }, baseline: base })
    expect(r.findings[0].kind).toBe('code-ahead')
    expect(r.failing).toHaveLength(1)
  })

  it('turns code ahead into a warning under figma-later', () => {
    const r = diff({
      code: { 'axis Button.size': 'lg|md|sm' },
      figma: { 'axis Button.size': 'md|sm' },
      baseline: base,
      figmaLater: true,
    })
    expect(r.findings[0].kind).toBe('code-ahead')
    expect(r.failing).toHaveLength(0)
  })

  it('treats something only Figma has as a proposal', () => {
    expect(kindOf({}, { 'axis Modal.size': 'lg|md' }, {})).toEqual(['figma-new'])
  })

  it('asks for a decision when Figma changes something code has', () => {
    expect(kindOf({ 'axis Button.size': 'md|sm' }, { 'axis Button.size': 'md|sm|xs' }, base)).toEqual(['figma-changed'])
  })

  it('fails when both sides change differently, even under figma-later', () => {
    const r = diff({
      code: { 'axis Button.size': 'lg|md|sm' },
      figma: { 'axis Button.size': 'md|sm|xs' },
      baseline: base,
      figmaLater: true,
    })
    expect(r.findings[0].kind).toBe('conflict')
    expect(r.failing).toHaveLength(1)
  })

  it('keeps drift both sides already had as known, and does not fail it', () => {
    const known = { 'axis Popover.align': { code: 'left|right' } }
    const r = diff({ code: { 'axis Popover.align': 'left|right' }, figma: {}, baseline: known })
    expect(r.findings[0].kind).toBe('known')
    expect(r.failing).toHaveLength(0)
  })

  it('asks to advance the baseline when the sides come back together', () => {
    const known = { 'axis Popover.align': { code: 'left|right' } }
    const both = { 'axis Popover.align': 'left|right' }
    expect(kindOf(both, both, known)).toEqual(['advance'])
  })
})

describe('accepting a baseline', () => {
  it('records the current pair for every item', () => {
    const next = accept({ code: { a: '1' }, figma: { a: '2', b: '3' }, baseline: {} })
    expect(next).toEqual({ a: { code: '1', figma: '2' }, b: { code: undefined, figma: '3' } })
  })

  it('accepts only the named items', () => {
    const next = accept({ code: { a: '1', b: '1' }, figma: { a: '2', b: '2' }, baseline: {}, keys: ['a'] })
    expect(Object.keys(next)).toEqual(['a'])
  })
})

describe('normalising values', () => {
  it('reads lengths in px, with rem at 16px, and bare numbers as numbers', () => {
    expect(normaliseValue('0.5rem')).toBe('8')
    expect(normaliseValue('18px')).toBe('18')
    expect(normaliseValue(18)).toBe('18')
    expect(normaliseValue('400')).toBe('400')
  })

  it('reads an OKLCH colour as the hex Figma stores', () => {
    expect(normaliseValue('oklch(52% 0.138 300)')).toBe('#7653ab')
    expect(normaliseValue({ hex: '#7653AB' })).toBe('#7653ab')
  })

  it('reads relative colour syntax as the colour at that alpha', () => {
    expect(normaliseValue('oklch(from oklch(100% 0 0) l c h / 0.30)')).toBe('#ffffff4d')
  })

  it('keeps a function value whole, commas and all', () => {
    expect(normaliseValue('cubic-bezier(0.2, 0, 0, 1)')).toBe('cubic-bezier(0.2, 0, 0, 1)')
  })

  it('compares the first family of a font stack', () => {
    expect(normaliseValue('"Manrope", system-ui, sans-serif')).toBe('Manrope')
  })

  it('maps a variable to its CSS property by code syntax, then by name', () => {
    expect(variableToProperty({ name: 'spacing/4', codeSyntax: { WEB: 'var(--haus-space-4)' } })).toBe('--haus-space-4')
    expect(variableToProperty({ name: 'color/shadow/6' })).toBe('--color-shadow-6')
  })
})

describe('reading the Figma file', () => {
  const items = figmaItems({
    variables: [{ name: 'opacity/disabled', codeSyntax: { WEB: 'var(--haus-opacity-disabled)' }, value: 40 }],
    components: [
      {
        name: 'Button',
        inSet: false,
        props: [
          { name: 'Variant', type: 'VARIANT', options: ['primary', 'Ghost'] },
          { name: 'State', type: 'VARIANT', options: ['Default', 'Hover', 'Focus', 'Open'] },
          { name: 'Disabled', type: 'VARIANT', options: ['false', 'true'] },
          { name: 'Label#1:0', type: 'TEXT', options: [] },
        ],
      },
      { name: '_Button content', inSet: false, props: [] },
    ],
  })

  it('reads an opacity percentage as the fraction CSS holds', () => {
    expect(items['token --haus-opacity-disabled']).toBe('0.4')
  })

  it('keeps variant axes in lower case, drops booleans, text and construction parts', () => {
    expect(items['component Button']).toBe('present')
    expect(items['axis Button.variant']).toBe('ghost|primary')
    expect(items['states Button']).toBe('focus|hover')
    expect(Object.keys(items).filter(k => k.includes('_Button') || k.includes('disabled'))).toEqual([
      'token --haus-opacity-disabled',
    ])
  })
})

describe('axis names', () => {
  it('refuses two Figma axes that read the same without case or spaces', () => {
    const components = [
      {
        name: 'Toggle',
        inSet: false,
        props: [
          { name: 'Label position', type: 'VARIANT', options: ['left', 'right'] },
          { name: 'Label-position', type: 'VARIANT', options: ['start', 'end'] },
        ],
      },
    ]
    expect(() => figmaItems({ components })).toThrow(/two axes/)
  })

  it('refuses two components of the same name', () => {
    const one = { name: 'Badge', inSet: false, props: [] }
    expect(() => figmaItems({ components: [one, { ...one }] })).toThrow(/two components/)
  })

  it('refuses two State axes too, rather than letting one replace the other', () => {
    const components = [
      {
        name: 'Button',
        inSet: false,
        props: [
          { name: 'State', type: 'VARIANT', options: ['Default', 'Hover'] },
          { name: 'S-tate', type: 'VARIANT', options: ['Default', 'Disabled'] },
        ],
      },
    ]
    expect(() => figmaItems({ components })).toThrow(/two axes/)
  })
})

describe('reading the code', () => {
  it('follows var() chains to the end, fallbacks included', () => {
    const raw = { '--a': 'var(--b)', '--b': 'var(--c)', '--c': '4px' }
    expect(resolve('var(--a)', raw)).toBe('4px')
    expect(resolve('var(--missing, 2px)', raw)).toBe('2px')
  })

  it('resolves a fallback that is itself a var(), and leaves no stray bracket', () => {
    const raw = { '--b': '4px', '--a': '1px' }
    expect(resolve('var(--missing, var(--b))', raw)).toBe('4px')
    expect(resolve('var(--a, var(--b))', raw)).toBe('1px')
    expect(resolve('0 0 0 var(--a) var(--b)', raw)).toBe('0 0 0 1px 4px')
  })

  it('reads a union written over several lines, leading pipe and all', () => {
    const src = "export type Shape =\n  | 'round'\n  | 'square'"
    expect(unionAliases(src, '').Shape).toEqual(['round', 'square'])
  })

  it('merges a prop declared in two halves of a union', () => {
    const src = "type A = {\n  size?: 'sm' | 'md'\n}\ntype B = {\n  size?: 'lg' | 'xl'\n}"
    expect(variantProps(src, {}).size).toEqual(['sm', 'md', 'lg', 'xl'])
  })

  it('resolves union aliases through other aliases, Extract and Exclude', () => {
    const types = "export type Size = 'sm' | 'md' | 'lg'\nexport type Tone = 'neutral' | 'error'"
    const src = [
      "export type BadgeTone = Tone | 'primary'",
      "export type ToggleSize = Extract<Size, 'sm' | 'md'>",
      "type Big = Exclude<Size, 'sm'>",
    ].join('\n')
    const aliases = unionAliases(src, types)
    expect(aliases.BadgeTone).toEqual(['neutral', 'error', 'primary'])
    expect(aliases.ToggleSize).toEqual(['sm', 'md'])
    expect(aliases.Big).toEqual(['md', 'lg'])
  })

  it('reads union props, inline or aliased, and skips structure and wiring', () => {
    const src = "interface P {\n  size?: Size\n  live?: 'off' | 'polite'\n  as?: 'div' | 'li'\n  label: string\n}"
    expect(variantProps(src, { Size: ['sm', 'md'] })).toEqual({ size: ['sm', 'md'], live: ['off', 'polite'] })
  })

  it('reads states from a stylesheet, ignoring one inside :not()', () => {
    const css = '.t:hover:not(:disabled) {}\n.t:focus-visible {}\n.wrapper.disabled {}'
    expect(statesOf(css).sort()).toEqual(['disabled', 'focus', 'hover'])
  })
})

describe('the report', () => {
  it('escapes the pipes in a value, so a table cell holds all of it', () => {
    expect(show('lg|md|sm')).toBe('`lg\\|md\\|sm`')
    expect(show(undefined)).toBe('(none)')
  })

  it('says excepted items were not compared when everything else matches', () => {
    const md = report({ findings: [], failing: [], exceptions: 2 })
    expect(md).toContain('Excepted items are not compared.')
  })
})

describe('exceptions', () => {
  const exceptions = { 'axis Popover.align': 'Position, not appearance.' }

  it('leaves an excepted item out of every side', () => {
    const r = applyExceptions({
      code: { 'axis Popover.align': 'left|right', 'axis Button.size': 'md|sm' },
      figma: { 'axis Button.size': 'md|sm' },
      baseline: { 'axis Popover.align': { code: 'left|right' } },
      exceptions,
    })
    expect(r.code).toEqual({ 'axis Button.size': 'md|sm' })
    expect(r.baseline).toEqual({})
    expect(r.stale).toEqual([])
  })

  it('calls an exception stale once both sides agree', () => {
    const both = { 'axis Popover.align': 'left|right' }
    expect(applyExceptions({ code: both, figma: both, exceptions }).stale).toEqual(['axis Popover.align'])
  })
})

describe('waiting on Figma', () => {
  it('retries a rate limit or a server error, twice', () => {
    expect(retryDelay(429, null, 1)).toBe(15)
    expect(retryDelay(503, null, 2)).toBe(30)
    expect(retryDelay(429, null, 3)).toBeNull()
  })

  it('never retries a bad token or a missing file', () => {
    expect(retryDelay(403, null, 1)).toBeNull()
    expect(retryDelay(404, null, 1)).toBeNull()
  })
})

describe('reading Figma over the network', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('treats a body cut off after the headers as Figma being unavailable', async () => {
    const body = new ReadableStream({
      start(controller) {
        controller.error(new Error('socket hang up'))
      },
    })
    vi.stubGlobal('fetch', async () => new Response(body, { status: 200 }))
    await expect(fetchComponents('key', 'token')).rejects.toBeInstanceOf(FigmaUnavailable)
  })

  it('keeps malformed JSON an error, not a fallback', async () => {
    vi.stubGlobal('fetch', async () => new Response('{not json', { status: 200 }))
    const err = await fetchComponents('key', 'token').catch(e => e)
    expect(err).toBeInstanceOf(SyntaxError)
  })
})
