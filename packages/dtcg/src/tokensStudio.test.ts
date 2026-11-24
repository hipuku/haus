import { describe, expect, it } from 'vitest'
import { convert, read, write } from './convert.js'
import { DEFAULT_OPTIONS, joinPath, type Token, type TokenSet } from './types.js'

/*
 * Tokens Studio files that are ordinary for that tool and were read or written
 * wrongly here: a theme that reads one set and owns another, a leading written
 * as a percentage, a mode whose name is already a key in the file, and a group
 * underneath a token.
 */

const doc = (text: unknown) => [{ name: 'tokens.json', text: JSON.stringify(text) }]
const set = (tokens: Token[], modes = ['default']): TokenSet => ({ modes, tokens })
const json = (text: string) => JSON.parse(text) as Record<string, never>
const at = (s: TokenSet, path: string) => s.tokens.find(t => joinPath(t.path) === path)

describe('a theme that reads one set and owns another', () => {
  it('merges the source set first, whatever the order says', () => {
    const { set: result } = read(
      doc({
        base: { ink: { value: '#000000', type: 'color' } },
        brand: { ink: { value: '#ff0000', type: 'color' } },
        $themes: [
          {
            id: 'light',
            name: 'light',
            // tokenSetOrder puts brand first, and the theme owns it: its value
            // is the answer, and base is only read underneath it.
            selectedTokenSets: { brand: 'enabled', base: 'source' },
          },
        ],
        $metadata: { tokenSetOrder: ['brand', 'base'] },
      }),
      'tokens-studio',
    )
    expect(at(result, 'ink')?.values.light).toMatchObject({ value: { hex: '#ff0000' } })
  })
})

describe('a leading', () => {
  it('comes back as the percentage it was written as', () => {
    const { files } = convert(
      doc({
        type: {
          body: {
            type: 'typography',
            value: { fontSize: '16', lineHeight: '150%', paragraphIndent: '8' },
          },
        },
      }),
      'tokens-studio',
    )
    const body = json(files[0].text).type as never as Record<string, { value: Record<string, unknown> }>
    expect(body.body.value.lineHeight).toBe('150%')
    expect(body.body.value.paragraphIndent).toBe('8')
  })

  it('keeps a length as a length', () => {
    const { set: result } = read(
      doc({ type: { body: { type: 'typography', value: { lineHeight: '24' } } } }),
      'tokens-studio',
    )
    const value = at(result, 'type.body')?.values.default
    expect(value).toMatchObject({ kind: 'literal', value: { lineHeight: { value: 24, unit: 'px' } } })
  })
})

describe('the writer', () => {
  it('gives a mode named global a set of its own', () => {
    const result = write(
      set(
        [
          {
            path: ['ink'],
            type: 'color',
            values: {
              default: { kind: 'literal', value: { colorSpace: 'srgb', components: [0, 0, 0], hex: '#000000' } },
              global: { kind: 'literal', value: { colorSpace: 'srgb', components: [1, 1, 1], hex: '#ffffff' } },
            },
          },
        ],
        ['default', 'global'],
      ),
      'tokens-studio',
      DEFAULT_OPTIONS,
    )
    const file = json(result.files[0].text)
    const order = (file.$metadata as never as { tokenSetOrder: string[] }).tokenSetOrder
    expect(order).toEqual(['global', 'global-2'])
    expect((file as Record<string, { ink?: { value: string } }>)['global-2'].ink?.value).toBe('#ffffff')
    expect((file as Record<string, { ink?: { value: string } }>).global.ink?.value).toBe('#000000')
  })

  it('refuses to write a group inside a token', () => {
    const result = write(
      set([
        { path: ['space'], type: 'dimension', values: { default: { kind: 'literal', value: { value: 8, unit: 'px' } } } },
        {
          path: ['space', 'large'],
          type: 'dimension',
          values: { default: { kind: 'literal', value: { value: 16, unit: 'px' } } },
        },
      ]),
      'tokens-studio',
      DEFAULT_OPTIONS,
    )
    const file = json(result.files[0].text)
    expect(file.space).toEqual({ value: '8px', type: 'dimension' })
    expect(result.losses.map(l => l.reason)).toContain('renamed')
  })
})
