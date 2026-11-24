import { describe, expect, it } from 'vitest'
import { write } from './convert.js'
import { DEFAULT_OPTIONS, type Token, type TokenSet } from './types.js'

/*
 * What a writer does with a set it cannot write whole: a value the format has
 * no form for, a path that is a token and a group at once, a mode that differs
 * only on paper, and a name that is also a property of every object.
 */

const set = (tokens: Token[], modes = ['default']): TokenSet => ({ modes, tokens })
const json = (text: string) => JSON.parse(text) as Record<string, never>

describe('the DTCG writer', () => {
  it('omits a dimension it cannot say in px or rem, and reports it', () => {
    const result = write(
      set([
        {
          path: ['space'],
          type: 'dimension',
          values: { default: { kind: 'literal', value: { value: 2, unit: 'em' } } },
        },
      ]),
      'dtcg',
      DEFAULT_OPTIONS,
    )
    expect(json(result.files[0].text)).toEqual({})
    expect(result.losses).toEqual([
      expect.objectContaining({
        reason: 'unrepresentable-value',
        token: 'space',
        detail: expect.stringMatching(/px or rem/),
      }),
    ])
  })

  it('keeps an alias to whichever of a colliding pair is written', () => {
    // `space` is written first, so `space.large` is the one setAtPath turns
    // away: an alias to `space` is good and an alias to `space.large` is not.
    const result = write(
      set([
        {
          path: ['space'],
          type: 'dimension',
          values: { default: { kind: 'literal', value: { value: 8, unit: 'px' } } },
        },
        {
          path: ['space', 'large'],
          type: 'dimension',
          values: { default: { kind: 'literal', value: { value: 16, unit: 'px' } } },
        },
        { path: ['gap'], type: 'dimension', values: { default: { kind: 'reference', ref: ['space'] } } },
        { path: ['inset'], type: 'dimension', values: { default: { kind: 'reference', ref: ['space', 'large'] } } },
      ]),
      'dtcg',
      DEFAULT_OPTIONS,
    )
    const file = json(result.files[0].text)
    expect(file.gap).toEqual({ $type: 'dimension', $value: '{space}' })
    expect(file.inset).toEqual({ $type: 'dimension', $value: { value: 16, unit: 'px' } })
    expect(result.losses.map(l => l.reason)).toContain('resolved-alias')
  })

  it('drops an alias chain that ends at a value it cannot write', () => {
    const result = write(
      set([
        {
          path: ['bad'],
          type: 'dimension',
          values: { default: { kind: 'literal', value: { value: 2, unit: 'em' } } },
        },
        { path: ['middle'], type: 'dimension', values: { default: { kind: 'reference', ref: ['bad'] } } },
        { path: ['gap'], type: 'dimension', values: { default: { kind: 'reference', ref: ['middle'] } } },
      ]),
      'dtcg',
      DEFAULT_OPTIONS,
    )
    expect(json(result.files[0].text)).toEqual({})
  })

  it('leaves out a mode override that is written the same way as the default', () => {
    // `ink` has no type, so it is not in the output and both values resolve to
    // its colour. The two modes differ as they were read and not as they are
    // written.
    const result = write(
      set(
        [
          { path: ['ink'], type: null, values: { light: { kind: 'raw', text: '#ff0000' } } },
          {
            path: ['text'],
            type: 'color',
            values: {
              light: { kind: 'reference', ref: ['ink'] },
              dark: { kind: 'literal', value: { colorSpace: 'srgb', components: [1, 0, 0], hex: '#ff0000' } },
            },
          },
        ],
        ['light', 'dark'],
      ),
      'dtcg',
      DEFAULT_OPTIONS,
    )
    const resolver = json(result.files[0].text)
    expect(
      (resolver.modifiers as never as Record<string, { contexts: Record<string, unknown[]> }>).mode.contexts.dark,
    ).toEqual([{}])
  })

  it('keeps a token named __proto__ as data', () => {
    const result = write(
      set([{ path: ['__proto__', 'a'], type: 'number', values: { default: { kind: 'literal', value: 1 } } }]),
      'dtcg',
      DEFAULT_OPTIONS,
    )
    expect(result.files[0].text).toContain('__proto__')
    expect(Object.prototype).not.toHaveProperty('a')
  })

  it('keeps a mode named __proto__ as data', () => {
    const result = write(
      set(
        [
          {
            path: ['a'],
            type: 'number',
            values: { default: { kind: 'literal', value: 1 }, __proto__: { kind: 'literal', value: 2 } },
          },
        ],
        ['default', '__proto__'],
      ),
      'dtcg',
      DEFAULT_OPTIONS,
    )
    const resolver = json(result.files[0].text)
    const contexts = (resolver.modifiers as never as Record<string, { contexts: Record<string, unknown> }>).mode
      .contexts
    expect(Object.keys(contexts)).toEqual(['default', '__proto__'])
  })
})

describe('the Figma writer', () => {
  it('does not alias a variable it is not writing', () => {
    const result = write(
      set([
        {
          path: ['space', 'fluid'],
          type: 'dimension',
          values: { default: { kind: 'raw', text: 'clamp(1rem, 2vw, 2rem)' } },
        },
        { path: ['gap'], type: 'dimension', values: { default: { kind: 'reference', ref: ['space', 'fluid'] } } },
      ]),
      'figma',
      DEFAULT_OPTIONS,
    )
    expect(result.files[0].text).not.toContain('{space.fluid}')
    expect(result.losses.filter(l => l.token === 'gap')).not.toEqual([])
  })

  it('keeps an alias to a variable it is writing', () => {
    const result = write(
      set([
        {
          path: ['space', 'small'],
          type: 'dimension',
          values: { default: { kind: 'literal', value: { value: 8, unit: 'px' } } },
        },
        { path: ['gap'], type: 'dimension', values: { default: { kind: 'reference', ref: ['space', 'small'] } } },
      ]),
      'figma',
      DEFAULT_OPTIONS,
    )
    expect(json(result.files[0].text).gap).toEqual({ $type: 'dimension', $value: '{space.small}' })
  })
})
