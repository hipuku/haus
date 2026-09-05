import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { findFallbackTokens, findUndefinedTokens } from './guard'

const read = (f: string) => readFileSync(join(__dirname, f), 'utf8')

describe('findUndefinedTokens', () => {
  it('finds a property that is read and never defined', () => {
    // The assertion the whole thing exists for. Written first because a guard
    // whose matcher silently stops matching passes forever and protects nothing.
    const { missing } = findUndefinedTokens({
      reads: ['.a { color: var(--haus-color-ink-primary); gap: var(--not-a-token); }'],
      defines: [':root { --haus-color-ink-primary: black; }'],
    })
    expect(missing).toEqual(['--not-a-token'])
  })

  it('passes when everything read is defined', () => {
    const { missing } = findUndefinedTokens({
      reads: ['.a { color: var(--x); }'],
      defines: [':root { --x: red; }'],
    })
    expect(missing).toEqual([])
  })

  it('ignores a read that carries a fallback', () => {
    // var(--x, 0.2s) is a real value whether or not --x is set, so it cannot
    // fail at computed-value time and is not this function's business.
    const { missing } = findUndefinedTokens({
      reads: ['.a { transition-duration: var(--nope, 0.2s); }'],
      defines: [''],
    })
    expect(missing).toEqual([])
  })

  it('accepts properties defined outside CSS', () => {
    // Avatar sets --haus-avatar-bg inline from JS. No stylesheet will show it.
    const { missing } = findUndefinedTokens({
      reads: ['.a { background: var(--haus-avatar-bg); }'],
      defines: [''],
      alsoDefined: ['--haus-avatar-bg'],
    })
    expect(missing).toEqual([])
  })

  it('reads every source, not just the first', () => {
    // A /g regex is stateful. Reusing one across inputs without resetting
    // lastIndex silently skips the start of every source after the first, and
    // the failure looks like a token that was defined all along.
    const { missing } = findUndefinedTokens({
      reads: ['.a { color: var(--one); }', '.b { color: var(--two); }'],
      defines: [':root { --one: red; }'],
    })
    expect(missing).toEqual(['--two'])
  })

  it('sees a declaration at the start of a source and after a brace', () => {
    const { defined } = findUndefinedTokens({
      reads: [''],
      defines: ['--first: 1;', ':root{--second:2;--third: 3}'],
    })
    expect(defined).toEqual(['--first', '--second', '--third'])
  })

  it('does not mistake a read for a declaration', () => {
    const { defined } = findUndefinedTokens({
      reads: [''],
      defines: ['.a { color: var(--read-only); }'],
    })
    expect(defined).toEqual([])
  })

  it('sorts, so a failing diff is stable', () => {
    const { missing } = findUndefinedTokens({
      reads: ['.a { a: var(--z); b: var(--a); c: var(--m); }'],
      defines: [''],
    })
    expect(missing).toEqual(['--a', '--m', '--z'])
  })
})

describe('findFallbackTokens', () => {
  it('lists a name only ever read with a fallback', () => {
    expect(
      findFallbackTokens({
        reads: ['.a { gap: var(--maybe, 4px); }'],
        defines: [''],
      }),
    ).toEqual(['--maybe'])
  })

  it('says nothing about one that is also defined', () => {
    expect(
      findFallbackTokens({
        reads: ['.a { gap: var(--real, 4px); }'],
        defines: [':root { --real: 8px; }'],
      }),
    ).toEqual([])
  })
})

describe('the guard against this package itself', () => {
  it('finds no undefined role in semantics.css', () => {
    // The contract holding for its own author. semantics.css reads primitives
    // and the brand layer; if it ever reads something neither declares, every
    // consumer inherits the hole.
    //
    // This is also the test that found the guard's own bug: DECLARATION was
    // missing the `m` flag, so `^` matched only the start of the whole string
    // and every indented declaration after a newline was invisible. It reported
    // 41 undefined roles in a file that has none.
    const { missing, read: reads } = findUndefinedTokens({
      reads: [read('semantics.css')],
      // motion.css too: semantics.css reads --haus-duration-slow, which lives
      // there. Leaving it out is what a consumer importing three of the four
      // layers would do, and this reported exactly that: one undefined role.
      defines: ['primitives.css', 'brand.css', 'motion.css', 'semantics.css'].map(read),
    })
    expect(reads.length, 'no reads found: the paths are wrong').toBeGreaterThan(50)
    expect(missing).toEqual([])
  })

  it('finds no undefined role in the ruby brand', () => {
    const { missing } = findUndefinedTokens({
      reads: [read('brands/ruby.css')],
      defines: [read('primitives.css'), read('brands/ruby.css')],
    })
    expect(missing).toEqual([])
  })
})
