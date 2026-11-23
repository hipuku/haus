/**
 * Checks that src/tokens.json stays readable as DTCG by @hipuku/dtcg, the
 * reader the tokenise tools and any DTCG consumer of this file would use.
 *
 *   npm run tokens:check        part of the CI gate
 *   npm run tokens:dtcg-write   rewrite the baseline after a deliberate change
 *
 * tokens.json is not strict DTCG 2025.10 today: it writes colours, dimensions
 * and durations as CSS strings, uses some $type values the format does not
 * have, and leaves a few tokens untyped. The reader accepts all of it and
 * records each as a lenient read. Those are written to dtcg-baseline.json, and
 * the check fails on any change to that list: a new kind of leniency on any
 * token, a malformed value included (the reader keeps it as written and says
 * so), or one that has gone away. Like the prose baseline, it moves only on
 * purpose. It also fails if the reader returns fewer tokens than the file has,
 * which today's reader never does; that guard is for a change to the reader.
 *
 * The reader is imported from source, as the motion build imports spring.ts:
 * CI runs this before anything is built.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { read, ReadError, type LossEntry } from '../../dtcg/src/index.ts'

const here = dirname(fileURLToPath(import.meta.url))
const TOKENS = join(here, '..', 'src', 'tokens.json')
const BASELINE = join(here, 'dtcg-baseline.json')

/**
 * A finding without the value it quotes, so editing a value does not move it.
 * The reader quotes the raw value once per message, unescaped, so the span runs
 * from the first double quote to the last: a value that itself contains a
 * double quote, such as `var(--label, "A")`, is still removed whole.
 */
export function findingKey(loss: LossEntry): string {
  const kind = loss.detail.replace(/"[\s\S]*"/, '"…"').replace(/\d+(\.\d+)?/g, 'N')
  return `${loss.token}: ${loss.reason}: ${kind}`
}

/** Every token path in a DTCG tree, skipping `$`-prefixed metadata. */
export function tokenPaths(node: unknown, prefix: string[] = []): string[] {
  if (!node || typeof node !== 'object') return []
  const out: string[] = []
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$') || !child || typeof child !== 'object') continue
    if ('$value' in child) out.push([...prefix, key].join('.'))
    else out.push(...tokenPaths(child, [...prefix, key]))
  }
  return out
}

export interface DtcgCheck {
  /** Tokens in the file the reader did not return. */
  unread: string[]
  /** Findings not in the baseline. */
  added: string[]
  /** Baseline findings the reader no longer reports. */
  removed: string[]
  /** The current findings, sorted, as the baseline would store them. */
  findings: string[]
}

export function checkDtcg(text: string, baseline: string[]): DtcgCheck {
  const result = read([{ name: 'tokens.json', text }], 'dtcg')
  const readPaths = new Set(result.set.tokens.map(t => t.path.join('.')))
  const unread = tokenPaths(JSON.parse(text)).filter(p => !readPaths.has(p))
  const findings = [...new Set(result.losses.map(findingKey))].sort()
  const known = new Set(baseline)
  const now = new Set(findings)
  return {
    unread,
    added: findings.filter(f => !known.has(f)),
    removed: baseline.filter(f => !now.has(f)),
    findings,
  }
}

// Compared as URLs, so a checkout path with a space still runs the check.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const text = readFileSync(TOKENS, 'utf8')
  let check: DtcgCheck
  try {
    check = checkDtcg(text, JSON.parse(readFileSync(BASELINE, 'utf8')) as string[])
  } catch (error) {
    if (error instanceof ReadError) {
      console.error(`✗ tokens.json cannot be read as DTCG: ${error.message}`)
      process.exit(1)
    }
    throw error
  }
  if (process.argv.includes('--write')) {
    writeFileSync(BASELINE, JSON.stringify(check.findings, null, 2) + '\n')
    console.log(`✓ Wrote ${check.findings.length} findings to dtcg-baseline.json`)
  } else if (check.unread.length || check.added.length || check.removed.length) {
    for (const p of check.unread) console.error(`  not read: ${p}`)
    for (const f of check.added) console.error(`  new:      ${f}`)
    for (const f of check.removed) console.error(`  gone:     ${f}`)
    console.error(
      '✗ tokens.json as DTCG has changed.\n' +
        '  A token not read means the reader changed. A new finding may be a malformed value.\n' +
        '  If the change is intended:\n' +
        '  run `npm run tokens:dtcg-write` and commit the baseline.',
    )
    process.exit(1)
  } else {
    console.log(`✓ tokens.json reads as DTCG, ${check.findings.length} lenient reads as in the baseline`)
  }
}
