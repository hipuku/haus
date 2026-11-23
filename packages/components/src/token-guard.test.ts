import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
// The source, not `@hipuku/tokens/guard`. That export resolves to `dist/guard.js`,
// which is gitignored, so importing it made the whole suite fail to collect on a
// fresh checkout that had not run a build: "Failed to resolve import". CI builds
// first and was never affected, which is exactly why it needed catching in
// review. The guard is pure functions over strings and `dist` is built from this
// file, so the behaviour is the same, and it now matches the decision already
// made for the token CSS below rather than contradicting it.
import { findFallbackTokens, findUndefinedTokens } from '../../tokens/src/guard'

/**
 * Every custom property these components read is defined somewhere.
 *
 * `@hipuku/tokens` has shipped this guard since haus#19 and **nothing in this
 * repository ran it.** Its only call sites were its own tests, so the check we
 * hand consumers was never applied to us: a consumer who ran it was better
 * protected than we were. Found on 2026-11-23 while preparing the first
 * registry item.
 *
 * It passes, and that is the reason to wire it rather than a reason not to.
 * There is nothing to clean up here, so this is a regression gate from the
 * start: the next component that reads a property nobody defines fails here
 * instead of rendering without it. CSS gives no warning for that. `var(--x)`
 * for an undefined `--x` is invalid at computed-value time, so the declaration
 * is dropped and the property inherits, which looks like a design choice rather
 * than a bug.
 *
 * **The configuration is the whole difficulty**, and getting it wrong reports
 * confident nonsense in either direction:
 *
 * - The token layers alone as `defines` reported 33 missing properties, all of
 *   them component-local: `--haus-btn-bg` is declared by `Button.module.css`
 *   and read two lines later. A component stylesheet defines as well as reads,
 *   so it belongs in both.
 * - Miss the properties set from TSX and two appear in the **fallback** list.
 *   `Avatar` passes its colours in through `style={{ '--haus-avatar-bg': bg }}`,
 *   which no stylesheet can show.
 *
 * `alsoDefined` below changes nothing today, and the comment here said it did
 * until a mutation test proved otherwise. Avatar reads those two properties
 * *with* a fallback, and `findUndefinedTokens` only counts reads without one,
 * so they never reach `missing` whether `alsoDefined` knows them or not. It is
 * kept because it is correct rather than because it is load-bearing: a property
 * set from TSX and read without a fallback would be a false positive without
 * it, and that is a normal thing for the next component to do.
 *
 * Both the guard and the token CSS are read from `packages/tokens/src` rather
 * than `dist`, so this runs on a fresh checkout with no build. The first version
 * did that for the CSS and not for the import, which is the sort of
 * half-application a reviewer catches and the author does not.
 *
 * **Nothing here is a hand-written list.** The stylesheets come from the
 * directory and the TSX-set properties come from the source, because a list
 * beside a directory is the defect `barrel.test.ts` was written for, and that
 * lesson has already failed to travel once in this package.
 */

const COMPONENTS = join(__dirname, 'components')
const TOKENS = join(__dirname, '..', '..', 'tokens', 'src')

/** The layers a consumer loads, as committed. `dist/` is gitignored, so reading
 *  it would make this test depend on a build having run first. */
const LAYERS = ['primitives.css', 'brand.css', 'semantics.css', 'motion.css', 'layers.css']

function componentFiles(extension: string): string[] {
  return readdirSync(COMPONENTS, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .flatMap(entry =>
      readdirSync(join(COMPONENTS, entry.name))
        .filter(file => file.endsWith(extension))
        .map(file => join(COMPONENTS, entry.name, file)),
    )
}

const read = (path: string) => readFileSync(path, 'utf8')

const stylesheets = componentFiles('.module.css')
const componentCss = stylesheets.map(read)
const tokenCss = LAYERS.map(layer => read(join(TOKENS, layer)))

/** Properties a component sets from TSX, which define them on the element. */
const setFromTsx = [
  ...new Set(
    componentFiles('.tsx')
      .filter(path => !path.endsWith('.test.tsx'))
      .flatMap(path => [...read(path).matchAll(/['"](--haus-[a-z0-9-]+)['"]\s*:/g)].map(match => match[1]!)),
  ),
].sort()

describe('the token guard, applied to this package', () => {
  it('reads a plausible number of properties, so a wrong path cannot pass', () => {
    /* The guard's own documentation warns about this and it is not theoretical:
       the first run of this check pointed `defines` at the wrong set and was
       perfectly happy. A check that finds nothing because it looked nowhere
       reports the same green as one that found nothing wrong. */
    const { read, defined } = findUndefinedTokens({ reads: componentCss, defines: tokenCss })
    expect(stylesheets.length).toBeGreaterThanOrEqual(20)
    expect(read.length).toBeGreaterThan(150)
    /* A floor on what the layers define, rather than a per-file check: a layer
       is allowed to define nothing. `layers.css` declares the cascade order and
       no properties at all, which is the first version of this assertion
       failing on correct code. */
    expect(defined.length).toBeGreaterThan(400)
  })

  it('finds the properties set from TSX, so alsoDefined is not a stale list', () => {
    expect(setFromTsx).toContain('--haus-avatar-bg')
    expect(setFromTsx.length).toBeGreaterThan(0)
  })

  it('reads no custom property that nothing defines', () => {
    const { missing } = findUndefinedTokens({
      reads: componentCss,
      // A component stylesheet defines its own locals as well as reading ours.
      defines: [...tokenCss, ...componentCss],
      alsoDefined: setFromTsx,
    })
    expect(missing).toEqual([])
  })

  it('reads no property only ever through a fallback', () => {
    /* A fallback that never loses is a hardcoded value wearing a token's
       clothes. The two that used to appear here, Avatar's bg and fg, are
       genuine: they are set from TSX and the fallback is the default. Once
       alsoDefined knows about them the list is empty, and an entry appearing
       again means a property was invented at a call site. */
    const fallbacks = findFallbackTokens({
      reads: componentCss,
      defines: [...tokenCss, ...componentCss, ...setFromTsx.map(name => `:root{${name}:0}`)],
    })
    expect(fallbacks).toEqual([])
    /* This one does depend on knowing the TSX-set properties, which is what the
       assertion above it is for: drop them and Avatar's two come back. */
    expect(findFallbackTokens({ reads: componentCss, defines: [...tokenCss, ...componentCss] })).toEqual([
      '--haus-avatar-bg',
      '--haus-avatar-fg',
    ])
  })
})
