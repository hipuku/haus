/**
 * The prose check gates CI in every hipuku repo, so its own behaviour is
 * tested rather than assumed. Each case builds a throwaway git repo, because
 * the check reads `git ls-files` and that is the part most easily got wrong:
 * the version this one replaced could not see an untracked file.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const CHECK = join(dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'check-prose.mjs')
/* Both forms are built from parts rather than written out, so this file is not
   itself a violation of the rule it tests. A formatter will happily turn a
   unicode escape back into the character, so a constructor is the only form
   that survives `prettier --write`. */
const DASH = String.fromCharCode(0x2014)
const ENTITY = `&${'mdash'};`

/** A git repo with the given files, so `git ls-files` has something to list. */
function repo(files) {
  const dir = mkdtempSync(join(tmpdir(), 'prose-'))
  execFileSync('git', ['init', '-q'], { cwd: dir })
  for (const [name, text] of Object.entries(files)) {
    const path = join(dir, name)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, text)
  }
  return dir
}

const run = (dir, ...args) => {
  const r = spawnSync(process.execPath, [CHECK, '--cwd', dir, ...args], { encoding: 'utf8' })
  return { code: r.status, out: r.stdout + r.stderr }
}

test('passes a clean repo', () => {
  const dir = repo({ 'README.md': 'No dashes here.\n' })
  const { code } = run(dir)
  assert.equal(code, 0)
  rmSync(dir, { recursive: true, force: true })
})

test('fails on the character, in an untracked file', () => {
  // The whole point of --others --exclude-standard: nothing is committed here.
  const dir = repo({ 'README.md': `A sentence ${DASH} and more.\n` })
  const { code, out } = run(dir)
  assert.equal(code, 1)
  assert.match(out, /README\.md: 1 em dash/)
  rmSync(dir, { recursive: true, force: true })
})

test('fails on the HTML entity as well as the character', () => {
  const dir = repo({ 'a.md': `${ENTITY}\n` })
  assert.equal(run(dir).code, 1)
  rmSync(dir, { recursive: true, force: true })
})

test('a baseline allows what it records', () => {
  const dir = repo({
    'README.md': `One ${DASH} here.\n`,
    'scripts/punctuation-baseline.json': '{"README.md":1}\n',
  })
  assert.equal(run(dir).code, 0)
  rmSync(dir, { recursive: true, force: true })
})

test('a count above the baseline fails', () => {
  const dir = repo({
    'README.md': `Two ${DASH} of them ${DASH} here.\n`,
    'scripts/punctuation-baseline.json': '{"README.md":1}\n',
  })
  const { code, out } = run(dir)
  assert.equal(code, 1)
  assert.match(out, /baseline allows 1/)
  rmSync(dir, { recursive: true, force: true })
})

test('a count below the baseline fails, so the ratchet cannot rot', () => {
  const dir = repo({
    'README.md': 'None left.\n',
    'scripts/punctuation-baseline.json': '{"README.md":2}\n',
  })
  const { code, out } = run(dir)
  assert.equal(code, 1)
  assert.match(out, /still allows 2\. Run --write/)
  rmSync(dir, { recursive: true, force: true })
})

test('--absolute ignores a baseline', () => {
  const dir = repo({
    'README.md': `One ${DASH} here.\n`,
    'scripts/punctuation-baseline.json': '{"README.md":1}\n',
  })
  assert.equal(run(dir, '--absolute').code, 1)
  rmSync(dir, { recursive: true, force: true })
})

test('--write records the current state', () => {
  const dir = repo({ 'README.md': `One ${DASH} here.\n` })
  mkdirSync(join(dir, 'scripts'), { recursive: true })
  assert.equal(run(dir, '--write').code, 0)
  assert.equal(run(dir).code, 0)
  rmSync(dir, { recursive: true, force: true })
})

test('node_modules is never scanned, with or without a .gitignore', () => {
  const dir = repo({ 'node_modules/.bin/thing': `${DASH}\n`, 'README.md': 'Clean.\n' })
  assert.equal(run(dir).code, 0)
  rmSync(dir, { recursive: true, force: true })
})

test('a lockfile is not prose', () => {
  const dir = repo({ 'package-lock.json': `{"x":"${DASH}"}\n` })
  assert.equal(run(dir).code, 0)
  rmSync(dir, { recursive: true, force: true })
})

test('a generated directory is excluded when the path ends in a slash', () => {
  const dir = repo({
    'generated/a.md': `From a tool ${DASH} not us.\n`,
    'src/b.md': 'Clean.\n',
    'package.json': JSON.stringify({ hipuku: { prose: { generated: ['generated/'] } } }),
  })
  assert.equal(run(dir).code, 0)
  rmSync(dir, { recursive: true, force: true })
})

test('an exclusion is a plain path, so regex metacharacters are not patterns', () => {
  // 'a.md' as a regex would match 'axmd'. As a path it matches only itself.
  const dir = repo({
    axmd: `Not excluded ${DASH} here.\n`,
    'package.json': JSON.stringify({ hipuku: { prose: { generated: ['a.md'] } } }),
  })
  const { code, out } = run(dir)
  assert.equal(code, 1)
  assert.match(out, /axmd/)
  rmSync(dir, { recursive: true, force: true })
})

test('generated files are excluded when the repo says so', () => {
  const dir = repo({
    'AGENTS.md': `Written by a tool ${DASH} not by us.\n`,
    'package.json': JSON.stringify({ hipuku: { prose: { generated: ['AGENTS.md'] } } }),
  })
  assert.equal(run(dir).code, 0)
  rmSync(dir, { recursive: true, force: true })
})
