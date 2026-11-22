#!/usr/bin/env node
/**
 * The em dash check, shared.
 *
 * House style does not use one. Sweeping for them has been done twice and they
 * came back both times, because a sweep fixes a file and a rule fixes a habit.
 *
 * Walks `git ls-files` rather than a source directory, and that is deliberate:
 * the character turns up in `.md`, `.yml`, `.gitignore` and story files as
 * readily as in `.ts`, and a check scoped to `src/` would have said a repo was
 * clean while three of those carried one.
 *
 * Two modes. **Ratcheted** against a baseline, which is the default when a
 * baseline file exists: the count per file can only go down, so adding one
 * fails and removing one fails until the baseline comes down with it. A ceiling
 * alone would let the number rot. **Absolute** when there is no baseline, which
 * is right for a repo that started clean: any occurrence fails.
 *
 *   hipuku-check-prose                       check
 *   hipuku-check-prose --write                record the current state
 *   hipuku-check-prose --baseline <path>      a baseline somewhere else
 *   hipuku-check-prose --absolute             ignore any baseline and fail on all
 *
 * Configuration can also sit in the repo's package.json, which is where a
 * generated-file exclusion belongs because it is a property of the repo:
 *
 *   "hipuku": { "prose": { "generated": ["^AGENTS\\.md$", "^CLAUDE\\.md$"] } }
 *
 * Two forms are looked for: the literal character, and the HTML entity, which
 * survives a search for the character and renders as one.
 *
 * Runs from the current working directory, so it checks the repo that calls it.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const argv = process.argv.slice(2)
const flag = name => argv.includes(`--${name}`)
const option = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback
}

const ROOT = resolve(option('cwd', process.cwd()))
const BASELINE = resolve(ROOT, option('baseline', join('scripts', 'punctuation-baseline.json')))

/** The character, and the entity that renders as it.
 *  Escaped rather than literal, so this file is not the one exception to the
 *  rule it enforces. U+2014 is the em dash. */
const PATTERNS = [/—/g, /&mdash;/gi]

/** Anything whose bytes are not prose. A match inside a lockfile or a binary is
 *  noise, and a lockfile is not somewhere a house style applies. */
/* node_modules, always. Every real repo gitignores it, so `--exclude-standard`
   drops it and this pattern never fires there. A repo without a .gitignore is
   not hypothetical though: a fresh one used to smoke-test this package listed
   the package's own bin shim and failed on it. Relying on the consumer's
   .gitignore for correctness is the wrong place to put the rule. */
const NEVER = /(^|\/)node_modules\//

const SKIP = /(^|\/)(package-lock\.json|pnpm-lock\.yaml|.*\.(png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|pdf|zip))$/i

/* A repo's own copy of this check, during the migration onto this package. A
   tool that defines the forbidden strings necessarily contains them. Once the
   repo deletes its copy this matches nothing, and this file itself is never
   listed because it lives in node_modules, which `--exclude-standard` drops. */
const OWN_COPY = /(^|\/)(check-punctuation|check-prose)\.mjs$/

/** Files a tool regenerates, so their punctuation is not ours to hold to the
 *  house style. `next dev` rewrites AGENTS.md on every startup, and whichever
 *  of AGENTS.md or CLAUDE.md hosts its managed block, with em dashes baked in
 *  by node_modules/next/dist/server/lib/generate-agent-files.js. There is no
 *  opt-out short of patching that vendored file, so linting these only fails CI
 *  on bytes no human here authored. Set per repo, because only the Next repos
 *  have the problem.
 *
 *  Plain paths, not patterns. Each value is either an exact repo-relative path
 *  or, ending in a slash, a directory whose contents are all excluded. The
 *  first version of this took a regular expression and built one from the
 *  option, which CodeQL flagged as a regex injection on 2026-11-23 and was
 *  right to: a value from a flag or a package.json reached `new RegExp`
 *  unescaped. Looking at what the option is actually used for settled it. Both
 *  real uses were literal paths, so a pattern was never needed, and a plain
 *  path is easier to write correctly as well. */
function excluded(paths) {
  const exact = new Set(paths.filter(p => !p.endsWith('/')))
  const dirs = paths.filter(p => p.endsWith('/'))
  if (exact.size === 0 && dirs.length === 0) return () => false
  return file => exact.has(file) || dirs.some(d => file.startsWith(d))
}

const GENERATED = excluded([
  ...argv.filter((a, i) => argv[i - 1] === '--generated'),
  ...(existsSync(join(ROOT, 'package.json'))
    ? (JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).hipuku?.prose?.generated ?? [])
    : []),
])

/* Tracked files *and* new ones git is not ignoring.
   `--others --exclude-standard` is what makes a file visible before it is
   committed. Without it a new document passes locally and fails in CI the
   moment it is added, which is not hypothetical: it happened to the original of
   this script, and again on 2026-09-09 to a new decision record. drift-tests
   still carried the unfixed form when this package was written, so its check
   could not see a new file at all.
   `--exclude-standard` keeps .gitignore honoured, so build output and
   node_modules stay out. */
function tracked() {
  return execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
    cwd: ROOT,
    maxBuffer: 32 * 1024 * 1024,
  })
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .filter(f => !NEVER.test(f) && !SKIP.test(f) && !OWN_COPY.test(f) && !GENERATED(f))
}

function count(file) {
  const path = join(ROOT, file)
  // A tracked path can be absent in a worktree mid-rebase, and a directory
  // entry appears for a submodule.
  if (!existsSync(path) || !statSync(path).isFile()) return 0
  const text = readFileSync(path, 'utf8')
  return PATTERNS.reduce((n, p) => n + (text.match(p)?.length ?? 0), 0)
}

const found = new Map()
for (const file of tracked()) {
  const n = count(file)
  if (n > 0) found.set(file, n)
}

const total = () => [...found.values()].reduce((a, b) => a + b, 0)

if (flag('write')) {
  const sorted = Object.fromEntries([...found].sort(([a], [b]) => a.localeCompare(b)))
  // The default baseline sits in scripts/, which a repo adopting this package
  // need not have yet, and a --baseline elsewhere has the same problem.
  mkdirSync(dirname(BASELINE), { recursive: true })
  writeFileSync(BASELINE, JSON.stringify(sorted, null, 2) + '\n')
  console.log(`baseline written: ${found.size} files, ${total()} occurrences`)
  process.exit(0)
}

const hasBaseline = !flag('absolute') && existsSync(BASELINE)
const baseline = hasBaseline ? JSON.parse(readFileSync(BASELINE, 'utf8')) : {}
const problems = []

for (const [file, n] of [...found].sort()) {
  // Own properties only. The baseline is parsed JSON, so a file named
  // `constructor` or `toString` would otherwise read Object.prototype's and
  // compare a count against a function, which is false and passes silently.
  const allowed = Object.hasOwn(baseline, file) ? baseline[file] : 0
  if (n > allowed) {
    problems.push(
      allowed === 0
        ? `  ${file}: ${n} em dash${n > 1 ? 'es' : ''}, and this file had none`
        : `  ${file}: ${n} em dashes, baseline allows ${allowed}`,
    )
  }
}

/* The half that makes it a ratchet rather than a ceiling. Without it the
   baseline records a debt that has already been paid and nothing says so, which
   is how a number goes stale while every check stays green. */
for (const [file, allowed] of Object.entries(baseline).sort()) {
  const n = found.get(file) ?? 0
  if (n < allowed) {
    problems.push(`  ${file}: ${n} em dashes, baseline still allows ${allowed}. Run --write`)
  }
}

if (problems.length === 0) {
  const where = hasBaseline ? 'at the baseline' : 'checked'
  console.log(`prose: ${found.size} files ${where}, ${total()} occurrences, none new`)
  process.exit(0)
}

console.error('House style does not use an em dash.\n')
console.error(problems.join('\n'))
console.error('\nUse a comma, a colon, a full stop or brackets, whichever the sentence wants.')
if (hasBaseline) {
  console.error('Run `hipuku-check-prose --write` once the count has come down.')
}
process.exit(1)
