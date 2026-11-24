import { describe, expect, it } from 'vitest'
import { Losses, mergeTokens } from './document.js'
import { read as readInput } from './convert.js'
import { readDtcg, readDtcgTree } from './dtcgRead.js'
import { valueIn } from './resolve.js'
import { ReadError, joinPath, type Token, type TokenSet } from './types.js'

/*
 * The reader against documents that are valid and are not the shape the happy
 * path assumed: a group with a value of its own, a leaf that is only a pointer,
 * two pasted files with the same name, a modifier context that names a set, and
 * a set listed after the modifier it is meant to override.
 */

const doc = (name: string, json: unknown) => ({ name, text: JSON.stringify(json) })
const read = (documents: ReturnType<typeof doc>[]) => {
  const losses = new Losses()
  return { set: readDtcg(documents, losses), losses: losses.entries }
}
const at = (set: TokenSet, path: string) => set.tokens.find(t => joinPath(t.path) === path)

describe('a group that is also a token', () => {
  it('reads $root at its explicit path, beside the group its children keep', () => {
    const { set } = read([
      doc('tokens.json', {
        spacing: {
          $type: 'dimension',
          $root: { $value: '8px' },
          large: { $value: '16px' },
        },
        gap: { $type: 'dimension', $value: '{spacing.$root}' },
      }),
    ])
    expect(at(set, 'spacing.$root')?.values.default).toEqual({
      kind: 'literal',
      value: { value: 8, unit: 'px' },
    })
    expect(at(set, 'spacing.large')).toBeDefined()
    expect(at(set, 'gap')?.values.default).toEqual({ kind: 'reference', ref: ['spacing', '$root'] })
  })

  it("still skips the group's other metadata", () => {
    const { set } = read([doc('tokens.json', { g: { $type: 'dimension', $description: 'x', a: { $value: '1px' } } })])
    expect(set.tokens.map(t => joinPath(t.path))).toEqual(['g.a'])
  })
})

describe('a leaf that is only a pointer', () => {
  it('reads $ref without $value as a reference', () => {
    const { set } = read([
      doc('tokens.json', {
        base: { $type: 'color', $value: '#fff' },
        alias: { $ref: '#/base/$value' },
      }),
    ])
    expect(at(set, 'alias')?.values.default).toEqual({ kind: 'reference', ref: ['base'] })
  })

  it('keeps a pointer into a value as written, and says why', () => {
    const { set, losses } = read([
      doc('tokens.json', {
        base: { $type: 'color', $value: { colorSpace: 'srgb', components: [1, 1, 1] } },
        channel: { $ref: '#/base/$value/components/0' },
      }),
    ])
    expect(at(set, 'channel')?.values.default).toEqual({ kind: 'raw', text: '#/base/$value/components/0' })
    expect(losses.find(l => l.token === 'channel')?.detail).toMatch(/points inside a value/)
  })
})

describe('a resolver', () => {
  const resolver = (order: unknown[], extra: Record<string, unknown> = {}) =>
    doc('tokens.resolver.json', { name: 'r', resolutionOrder: order, ...extra })

  it('refuses two pasted files that answer to the same name', () => {
    expect(() =>
      read([
        resolver([{ $ref: 'colors.json' }]),
        doc('brand/colors.json', { a: { $type: 'color', $value: '#000' } }),
        doc('product/colors.json', { a: { $type: 'color', $value: '#fff' } }),
      ]),
    ).toThrow(ReadError)
  })

  it('takes the exact name when one document has it', () => {
    const { set } = read([
      resolver([{ $ref: 'brand/colors.json' }]),
      doc('brand/colors.json', { a: { $type: 'color', $value: '#000000' } }),
      doc('product/colors.json', { a: { $type: 'color', $value: '#ffffff' } }),
    ])
    expect(at(set, 'a')?.values.default).toMatchObject({ value: { hex: '#000000' } })
  })

  it('expands a named set inside a modifier context', () => {
    const { set } = read([
      resolver([{ $ref: '#/modifiers/theme' }], {
        sets: { dark: { sources: [{ ink: { $type: 'color', $value: '#ffffff' } }] } },
        modifiers: {
          theme: {
            default: 'light',
            contexts: {
              light: [{ ink: { $type: 'color', $value: '#000000' } }],
              dark: { $ref: '#/sets/dark' },
            },
          },
        },
      }),
    ])
    expect(set.modes).toEqual(['light', 'dark'])
    expect(at(set, 'ink')?.values.dark).toMatchObject({ value: { hex: '#ffffff' } })
  })

  it('applies a source listed after the modifier, not before it', () => {
    const { set } = read([
      resolver([{ $ref: '#/modifiers/theme' }, { ink: { $type: 'color', $value: '#ff0000' } }], {
        modifiers: {
          theme: {
            default: 'light',
            contexts: {
              light: [{ ink: { $type: 'color', $value: '#000000' } }],
              dark: [{ ink: { $type: 'color', $value: '#ffffff' } }],
            },
          },
        },
      }),
    ])
    // The override comes last in the order, so it wins in both modes.
    expect(at(set, 'ink')?.values.light).toMatchObject({ value: { hex: '#ff0000' } })
    expect(at(set, 'ink')?.values.dark).toMatchObject({ value: { hex: '#ff0000' } })
  })
})

describe('$extends', () => {
  it('lets two groups extend the same base', () => {
    const losses = new Losses()
    const tokens = readDtcgTree(
      {
        base: { a: { $type: 'dimension', $value: '1px' } },
        one: { $extends: '{base}' },
        two: { $extends: '{base}' },
      },
      'default',
      losses,
      'tokens.json',
    )
    expect(tokens.map(t => joinPath(t.path)).sort()).toEqual(['base.a', 'one.a', 'two.a'])
  })

  it('refuses a group that extends something holding it', () => {
    const losses = new Losses()
    expect(() => readDtcgTree({ a: { $extends: '{a}' } }, 'default', losses, 'tokens.json')).toThrow(ReadError)
  })
})

describe('a value that belongs to one mode', () => {
  const token: Token = {
    path: ['ink'],
    type: 'color',
    values: { dark: { kind: 'raw', text: '#fff' } },
  }

  it('does not stand in for the default mode', () => {
    expect(valueIn(token, 'light', ['light', 'dark'])).toBeUndefined()
    expect(valueIn(token, 'dark', ['light', 'dark'])).toEqual({ kind: 'raw', text: '#fff' })
  })
})

describe('merging two readings of one token', () => {
  it('gives the later token its own type', () => {
    const into = new Map<string, Token>()
    mergeTokens(into, { path: ['a'], type: 'dimension', values: { default: { kind: 'raw', text: '1px' } } })
    mergeTokens(into, { path: ['a'], type: 'duration', values: { default: { kind: 'raw', text: '1s' } } })
    expect(into.get('a')?.type).toBe('duration')
  })

  it('leaves the earlier type standing when the later one has none', () => {
    const into = new Map<string, Token>()
    mergeTokens(into, { path: ['a'], type: 'dimension', values: { default: { kind: 'raw', text: '1px' } } })
    mergeTokens(into, { path: ['a'], type: null, values: { dark: { kind: 'raw', text: '2px' } } })
    expect(into.get('a')?.type).toBe('dimension')
  })
})

describe('a reference leaf', () => {
  it('keeps the description and extensions written beside it', () => {
    const { set } = read([
      doc('tokens.json', {
        base: { $type: 'color', $value: '#ffffff' },
        alias: { $ref: '#/base/$value', $description: 'The page', $extensions: { 'com.example': 1 } },
      }),
    ])
    const alias = at(set, 'alias')
    expect(alias?.description).toBe('The page')
    expect(alias?.extensions).toEqual({ 'com.example': 1 })
  })
})

describe('a document named with a Windows path', () => {
  it('is read under the name the resolver uses', () => {
    const { set } = read([
      doc('tokens.resolver.json', { name: 'r', resolutionOrder: [{ $ref: 'colors.json' }] }),
      { name: String.raw`.\colors.json`, text: JSON.stringify({ a: { $type: 'color', $value: '#000000' } }) },
    ])
    expect(at(set, 'a')).toBeDefined()
  })
})

describe('an untyped alias that exists in one mode', () => {
  it('takes its type from the mode it is in', () => {
    // Through the public read, which is what fills in a reference's type.
    const { set } = readInput([
      doc('tokens.resolver.json', {
        name: 'r',
        resolutionOrder: [{ $ref: '#/modifiers/theme' }],
        modifiers: {
          theme: {
            default: 'light',
            contexts: {
              light: [{ ink: { $type: 'color', $value: '#000000' } }],
              dark: [{ ink: { $type: 'color', $value: '#ffffff' }, text: { $value: '{ink}' } }],
            },
          },
        },
      }),
    ])
    expect(at(set, 'text')?.type).toBe('color')
  })
})
