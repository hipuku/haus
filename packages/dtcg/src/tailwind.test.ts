import { describe, expect, it } from 'vitest'
import { read, write } from './convert.js'
import { DEFAULT_OPTIONS, ReadError, joinPath, type Token, type TokenSet } from './types.js'

/*
 * Stylesheets a Tailwind project really contains: components with their own
 * custom properties, responsive blocks, comment markers inside strings, and
 * names that mean one thing to Tailwind and another to a token tree.
 */

const css = (text: string) => [{ name: 'theme.css', text }]
const readCss = (text: string) => read(css(text), 'tailwind')
const at = (set: TokenSet, path: string) => set.tokens.find(t => joinPath(t.path) === path)
const set = (tokens: Token[], modes = ['default']): TokenSet => ({ modes, tokens })

describe('what counts as a mode', () => {
  it('reads .dark and leaves .btn alone', () => {
    const { set: result, losses } = readCss(`
      @theme { --color-ink: #000000; }
      .dark { --color-ink: #ffffff; }
      .btn { --color-ink: #ff0000; --btn-padding: 8px; }
    `)
    expect(result.modes).toEqual(['default', 'dark'])
    expect(at(result, 'color.ink')?.values.dark).toMatchObject({ value: { hex: '#ffffff' } })
    expect(at(result, 'btn-padding')).toBeUndefined()
    expect(losses.find(l => l.token === '.btn')?.detail).toMatch(/2 custom properties/)
  })

  it('takes a qualified class whatever it is called', () => {
    const { set: result } = readCss(`@theme { --color-ink: #000000; }\n:root.sepia { --color-ink: #704214; }`)
    expect(result.modes).toEqual(['default', 'sepia'])
  })

  it('does not read a responsive block as the default', () => {
    const { set: result, losses } = readCss(`
      @theme { --spacing-gutter: 16px; }
      @media (min-width: 40rem) { :root { --spacing-gutter: 24px; } }
    `)
    expect(at(result, 'spacing.gutter')?.values.default).toMatchObject({ value: { value: 16, unit: 'px' } })
    expect(losses.some(l => l.reason === 'dropped-mode')).toBe(true)
  })

  it('reads prefers-color-scheme whatever its case', () => {
    const { set: result } = readCss(`@theme { --color-ink: #000000; }
      @media (prefers-color-scheme: DARK) { :root { --color-ink: #ffffff; } }`)
    expect(result.modes).toEqual(['default', 'dark'])
  })
})

describe('the scanner', () => {
  it('leaves a comment marker inside a string alone', () => {
    const { set: result } = readCss(`@theme { --content-note: "/*"; --color-ink: #000000; }`)
    expect(at(result, 'color.ink')).toBeDefined()
  })

  it('reads an escaped quote as part of the string', () => {
    const { set: result } = readCss(`@theme { --content-note: "a\\"b"; --color-ink: #000000; }`)
    expect(at(result, 'color.ink')).toBeDefined()
  })

  it('says when two names land on one token', () => {
    const { losses } = readCss(`@theme { --spacing: 4px; --spacing-DEFAULT: 8px; }`)
    expect(losses.find(l => l.reason === 'renamed')?.detail).toMatch(/both read as "spacing.DEFAULT"/)
  })
})

describe('the writer', () => {
  const colour = (hex: string) => ({
    kind: 'literal' as const,
    value: { colorSpace: 'srgb', components: [0, 0, 0], hex },
  })

  it('does not put a colour in the text namespace', () => {
    const result = write(
      set([{ path: ['text', 'primary'], type: 'color', values: { default: colour('#000000') } }]),
      'tailwind',
      DEFAULT_OPTIONS,
    )
    expect(result.files[0].text).toContain('--text-primary')
    expect(result.files[0].text).not.toContain('@theme')
  })

  it('writes a namespace Tailwind knows into @theme', () => {
    const result = write(
      set([{ path: ['aspect', 'video'], type: null, values: { default: { kind: 'raw', text: '16 / 9' } } }]),
      'tailwind',
      DEFAULT_OPTIONS,
    )
    expect(result.files[0].text).toMatch(/@theme[^{]*{\n\s+--aspect-video: 16 \/ 9;/)
  })

  it('refuses a raw value that would end the declaration', () => {
    const result = write(
      set([
        {
          path: ['color', 'ink'],
          type: null,
          values: { default: { kind: 'raw', text: 'red; } body { display: none' } },
        },
      ]),
      'tailwind',
      DEFAULT_OPTIONS,
    )
    expect(result.files[0].text).not.toContain('display: none')
    expect(result.losses.map(l => l.reason)).toContain('unrepresentable-value')
  })

  it('does not point var() at a property it never declared', () => {
    const result = write(
      set([
        { path: ['color', 'brand'], type: 'color', values: { default: { kind: 'raw', text: 'red; }' } } },
        { path: ['color', 'ink'], type: 'color', values: { default: { kind: 'reference', ref: ['color', 'brand'] } } },
      ]),
      'tailwind',
      DEFAULT_OPTIONS,
    )
    expect(result.files[0].text).not.toContain('var(--color-brand)')
  })

  it('writes @theme inline when a theme value is a var()', () => {
    const result = write(
      set([
        { path: ['color', 'brand'], type: 'color', values: { default: colour('#7653ab') } },
        { path: ['color', 'ink'], type: 'color', values: { default: { kind: 'reference', ref: ['color', 'brand'] } } },
      ]),
      'tailwind',
      DEFAULT_OPTIONS,
    )
    expect(result.files[0].text).toContain('@theme inline {')
  })

  it('cleans a mode name for a data-theme selector too', () => {
    const result = write(
      set(
        [
          {
            path: ['color', 'ink'],
            type: 'color',
            values: { default: colour('#000000'), 'High Contrast': colour('#ffffff') },
          },
        ],
        ['default', 'High Contrast'],
      ),
      'tailwind',
      DEFAULT_OPTIONS,
    )
    expect(result.files[0].text).toContain('[data-theme="high-contrast"]')
    expect(result.losses.map(l => l.reason)).toContain('renamed')
  })

  it('writes one block when two modes clean to one name, and says so', () => {
    const result = write(
      set(
        [
          {
            path: ['color', 'ink'],
            type: 'color',
            values: { default: colour('#000000'), 'high contrast': colour('#ffffff'), highContrast: colour('#eeeeee') },
          },
        ],
        ['default', 'high contrast', 'highContrast'],
      ),
      'tailwind',
      DEFAULT_OPTIONS,
    )
    expect(result.files[0].text.match(/high-contrast/g)).toHaveLength(1)
    expect(result.losses.some(l => l.reason === 'dropped-mode' && /both select/.test(l.detail))).toBe(true)
  })
})

describe('detection', () => {
  it('refuses a stylesheet and a JSON file together', () => {
    expect(() =>
      read([
        { name: 'theme.css', text: '@theme { --color-ink: #000; }' },
        { name: 'tokens.json', text: '{ "a": { "$value": "1px", "$type": "dimension" } }' },
      ]),
    ).toThrow(ReadError)
  })
})
