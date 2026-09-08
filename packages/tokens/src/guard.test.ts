import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { findFallbackTokens, findUndefinedTokens, findRestatedTokens } from './guard'

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

  it('finds no undefined role in the vault brand', () => {
    const { missing } = findUndefinedTokens({
      reads: [read('brands/vault.css')],
      defines: [read('primitives.css'), read('brands/vault.css')],
    })
    expect(missing).toEqual([])
  })
})

describe('findRestatedTokens', () => {
  const HAUS = [
    `:root {
       --haus-z-400: 400;
       --haus-space-4: 1rem;
       --haus-z-modal: var(--haus-z-400);
       --haus-space-inset-md: var(--haus-space-4);
       --haus-radius-control: var(--haus-radius-md);
     }`,
  ]

  it('finds a declaration restated as the same text', () => {
    // 77 of drift's 148 are this: haus's own line, retyped.
    const found = findRestatedTokens({
      defines: [`:root { --haus-space-inset-md: var(--haus-space-4); }`],
      upstream: HAUS,
    })
    expect(found.map((f) => [f.name, f.kind])).toEqual([['--haus-space-inset-md', 'identical']])
  })

  it('finds a value hardcoded to what our chain resolves to', () => {
    // The kind vault's hand-written rule could not see, because it compares
    // declaration text and this text differs. 12 of drift's are this shape:
    // --haus-z-modal: 400 against var(--haus-z-400), where --haus-z-400 is 400.
    const found = findRestatedTokens({
      defines: [`:root { --haus-z-modal: 400; }`],
      upstream: HAUS,
    })
    expect(found.map((f) => [f.name, f.kind])).toEqual([['--haus-z-modal', 'resolved']])
  })

  it('says nothing about a real override', () => {
    // The assertion that stops this being a rule against overriding at all. A
    // consumer may hold any role at a different value, and three of vault's do.
    const found = findRestatedTokens({
      defines: [`:root { --haus-z-modal: 900; --haus-space-inset-md: var(--haus-space-8); }`],
      upstream: HAUS,
    })
    expect(found).toEqual([])
  })

  it('says nothing about a property we do not ship', () => {
    const found = findRestatedTokens({
      defines: [`:root { --drift-shadow-sm: 0 1px 2px black; }`],
      upstream: HAUS,
    })
    expect(found).toEqual([])
  })

  it('is not fooled by spelling: a copy stays a copy through comments and spacing', () => {
    // The whole value of normalising. Written with inner spaces and a trailing
    // comment, this is still haus's declaration, and a comparison that only
    // matched exact text would call it an override and say nothing.
    const found = findRestatedTokens({
      defines: [`:root {\n  --haus-space-inset-md:   var( --haus-space-4 ) /* same */ ;\n}`],
      upstream: HAUS,
    })
    expect(found.map((f) => f.name)).toEqual(['--haus-space-inset-md'])
  })

  it('reports each property once, however often it is declared', () => {
    const found = findRestatedTokens({
      defines: [`:root { --haus-z-modal: 400; } .x { --haus-z-modal: 400; }`],
      upstream: HAUS,
    })
    expect(found).toHaveLength(1)
  })

  it('survives a reference cycle rather than hanging', () => {
    // Depth-limited rather than cycle-tracked. A partially resolved value
    // compares unequal, so a cycle reports nothing instead of guessing.
    const found = findRestatedTokens({
      defines: [`:root { --a: var(--b); }`],
      upstream: [`:root { --a: var(--b); --b: var(--a); }`],
    })
    expect(found.map((f) => f.kind)).toEqual(['identical'])
  })
})
