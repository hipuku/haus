import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { checkDtcg, tokenPaths } from './check-dtcg'

const here = import.meta.dirname
const tokens = readFileSync(join(here, '..', 'src', 'tokens.json'), 'utf8')
const baseline = JSON.parse(readFileSync(join(here, 'dtcg-baseline.json'), 'utf8')) as string[]

describe('checkDtcg', () => {
  it('holds for this repository', () => {
    const check = checkDtcg(tokens, baseline)
    expect(check).toMatchObject({ unread: [], added: [], removed: [] })
  })

  it('reports a new kind of leniency on a token', () => {
    const json = JSON.parse(tokens)
    json.radius.xl = { $type: 'dimension', $value: 'clamp(1rem, 2vw, 2rem)' }
    const check = checkDtcg(JSON.stringify(json), baseline)
    expect(check.added.some(f => f.startsWith('radius.xl:'))).toBe(true)
    expect(check.removed.some(f => f.startsWith('radius.xl:'))).toBe(true)
  })

  it('reports a malformed value as a new finding', () => {
    const json = JSON.parse(tokens)
    json.radius.broken = { $value: { foo: 1 } }
    expect(checkDtcg(JSON.stringify(json), baseline).added).toEqual([
      'radius.broken: lenient-read: The value does not match the dimension type; kept as written.',
    ])
  })

  it('reports a finding that has gone away', () => {
    const check = checkDtcg(tokens, [...baseline, 'gone.token: lenient-read: Something.'])
    expect(check.removed).toEqual(['gone.token: lenient-read: Something.'])
  })

  it('does not move when only a value changes within the same kind', () => {
    const json = JSON.parse(tokens)
    json.color.aronia['100'].$value = 'oklch(98% 0.010 300)'
    expect(checkDtcg(JSON.stringify(json), baseline)).toMatchObject({ added: [], removed: [] })
  })
})

describe('tokenPaths', () => {
  it('lists tokens and skips metadata', () => {
    expect(tokenPaths({ $schema: 'x', a: { $type: 'color', b: { $value: '#000' }, c: { d: { $value: 1 } } } })).toEqual(
      ['a.b', 'a.c.d'],
    )
  })
})
