/**
 * The names check is the one gate in this repo whose failure mode is a leak
 * rather than an untidy file, so its own behaviour is tested rather than
 * assumed. It went un-suited for longer than its sibling and collected more
 * defects for it: two of the five findings on haus#145 were in this script,
 * and a third turned up while this file was being written.
 *
 * Every case builds a throwaway git repo. That is not ceremony: the script
 * reads `git ls-files`, `git diff --cached` and `git var`, and the review
 * findings were all in how it treats what git told it rather than in the
 * matching itself.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, symlinkSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const CHECK = join(dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'check-names.mjs')

/* A word that is not anybody's name, standing in for one that is. The real
   blocked words exist only as hashes so that the list does not publish what it
   protects, which also means no test may write one. The script's
   HIPUKU_NAMES_TEST_HASHES seam exists for this and nothing else. */
const SENTINEL = 'zzsentinelzz'
const SENTINEL_HASH = createHash('sha256').update(SENTINEL).digest('hex')

const git = (dir, ...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' })

/** A git repo with the given files, and a clean identity. The identity matters:
 *  the check reads `git var GIT_AUTHOR_IDENT`, and the machine running these
 *  tests may well have a blocked name in its own global config, which would
 *  fail every case here for the wrong reason. */
function repo(files = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'names-'))
  git(dir, 'init', '-q')
  git(dir, 'config', 'user.name', 'Test Runner')
  git(dir, 'config', 'user.email', 'runner@example.invalid')
  write(dir, files)
  return dir
}

function write(dir, files) {
  for (const [name, text] of Object.entries(files)) {
    const path = join(dir, name)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, text)
  }
}

const run = (dir, ...args) => {
  const r = spawnSync(process.execPath, [CHECK, ...args], {
    cwd: dir,
    encoding: 'utf8',
    env: { ...process.env, HIPUKU_NAMES_TEST_HASHES: SENTINEL_HASH },
  })
  return { code: r.status, out: r.stdout + r.stderr }
}

const clean = dir => rmSync(dir, { recursive: true, force: true })

// ---------------------------------------------------------------- the basics

test('passes a clean repo', () => {
  const dir = repo({ 'README.md': 'Nothing to see.\n' })
  const { code, out } = run(dir)
  assert.equal(code, 0, out)
  assert.match(out, /Names check passed/)
  clean(dir)
})

test('fails on a blocked word, in an untracked file', () => {
  // --others --exclude-standard: nothing here is committed or even added.
  const dir = repo({ 'notes.md': `A line about ${SENTINEL} here.\n` })
  const { code, out } = run(dir)
  assert.equal(code, 1)
  assert.match(out, /notes\.md:1/)
  clean(dir)
})

test('never prints the word it found', () => {
  /* The whole reason the list is hashed. A check that echoed the match would
     put the name in CI logs, which are more public than the repo. */
  const dir = repo({ 'notes.md': `Mentions ${SENTINEL}.\n` })
  const { out } = run(dir)
  assert.doesNotMatch(out, new RegExp(SENTINEL, 'i'))
  clean(dir)
})

test('reports the line the word is on, not just the file', () => {
  const dir = repo({ 'notes.md': `one\ntwo\n${SENTINEL}\nfour\n` })
  const { out } = run(dir)
  assert.match(out, /notes\.md:3/)
  clean(dir)
})

test('matches regardless of case, since the scan lowercases', () => {
  const dir = repo({ 'notes.md': `${SENTINEL.toUpperCase()}\n` })
  assert.equal(run(dir).code, 1)
  clean(dir)
})

test('matches a word inside punctuation, not only a bare one', () => {
  // The scan splits on /[a-z0-9]+/, so an email or a path still matches.
  const dir = repo({ 'notes.md': `contact(${SENTINEL})@example.com\n` })
  assert.equal(run(dir).code, 1)
  clean(dir)
})

test('does not match a word the blocked one is merely part of', () => {
  const dir = repo({ 'notes.md': `prefix${SENTINEL}suffix\n` })
  assert.equal(run(dir).code, 0)
  clean(dir)
})

test('a binary file is not scanned', () => {
  const dir = repo({})
  writeFileSync(join(dir, 'blob.bin'), Buffer.concat([Buffer.from(`${SENTINEL} `), Buffer.from([0])]))
  assert.equal(run(dir).code, 0)
  clean(dir)
})

// ------------------------------------------------------------ the skip list

test('a skipped exact path is not scanned', () => {
  const dir = repo({
    'data.json': `{"name":"${SENTINEL}"}\n`,
    'package.json': JSON.stringify({ hipuku: { names: { skip: ['data.json'] } } }),
  })
  assert.equal(run(dir).code, 0)
  clean(dir)
})

test('a skipped directory covers its contents', () => {
  const dir = repo({
    'data/a.json': `${SENTINEL}\n`,
    'src/b.md': 'Clean.\n',
    'package.json': JSON.stringify({ hipuku: { names: { skip: ['data/'] } } }),
  })
  assert.equal(run(dir).code, 0)
  clean(dir)
})

test('--skip works as a flag as well as a package.json key', () => {
  const dir = repo({ 'data.json': `${SENTINEL}\n` })
  assert.equal(run(dir, '--skip', 'data.json').code, 0)
  clean(dir)
})

test('a skip entry is a plain path, so regex metacharacters are not patterns', () => {
  /* 'a.md' as a regular expression would match 'axmd'. CodeQL flagged the
     version that built one of these from the option, and the fix was to stop
     treating the value as a pattern at all. */
  const dir = repo({
    axmd: `${SENTINEL}\n`,
    'package.json': JSON.stringify({ hipuku: { names: { skip: ['a.md'] } } }),
  })
  const { code, out } = run(dir)
  assert.equal(code, 1)
  assert.match(out, /axmd/)
  clean(dir)
})

test('node_modules is never scanned, even with no .gitignore', () => {
  /* A dependency's own source is not ours to hold to this rule, and a repo
     without a .gitignore is where this bites: --exclude-standard has nothing
     to go on, so every vendored file is listed. check-prose.mjs already
     refused these; this script did not until its tests were written. */
  const dir = repo({
    'node_modules/pkg/index.js': `module.exports = '${SENTINEL}'\n`,
    'src/a.md': 'Clean.\n',
  })
  const { code, out } = run(dir)
  assert.equal(code, 0, out)
  clean(dir)
})

test('a repo with no package.json still runs', () => {
  const dir = repo({ 'a.md': 'Clean.\n' })
  assert.equal(run(dir).code, 0)
  clean(dir)
})

// --------------------------------------------------------- what git reports

test('a file deleted but not yet staged does not crash the check', () => {
  // ls-files --cached still lists it, so the read throws ENOENT.
  const dir = repo({ 'a.md': 'Clean.\n' })
  git(dir, 'add', 'a.md')
  git(dir, 'commit', '-q', '-m', 'add a')
  unlinkSync(join(dir, 'a.md'))
  const { code, out } = run(dir)
  assert.equal(code, 0, out)
  clean(dir)
})

test('a submodule gitlink does not crash the check', () => {
  /* Major finding on haus#145. ls-files --cached lists the gitlink, and
     readFileSync on a directory throws EISDIR, which the handler rethrew
     because it only accepted ENOENT. lint:names aborted outright in any repo
     with an initialised submodule, whether or not a blocked name existed. */
  const inner = repo({ 'x.md': 'Clean.\n' })
  git(inner, 'add', 'x.md')
  git(inner, 'commit', '-q', '-m', 'init')

  const outer = repo({ 'a.md': 'Clean.\n' })
  git(outer, 'add', 'a.md')
  git(outer, 'commit', '-q', '-m', 'init')
  git(outer, '-c', 'protocol.file.allow=always', 'submodule', 'add', '-q', inner, 'vendor')

  assert.ok(git(outer, 'ls-files', '--cached').includes('vendor'), 'the gitlink should be listed')
  const { code, out } = run(outer)
  assert.equal(code, 0, out)
  assert.doesNotMatch(out, /EISDIR/)
  clean(inner)
  clean(outer)
})

// ------------------------------------------------------------- staged files

test('--staged reads the staged contents, not the working tree', () => {
  /* The point of the pre-commit hook: what is about to be committed is what
     matters. A clean file on disk must not excuse a staged one. */
  const dir = repo({ 'a.md': `${SENTINEL}\n` })
  git(dir, 'add', 'a.md')
  writeFileSync(join(dir, 'a.md'), 'Clean now.\n')
  const { code, out } = run(dir, '--staged')
  assert.equal(code, 1)
  assert.match(out, /a\.md:1/)
  clean(dir)
})

test('--staged ignores a file that is not staged', () => {
  const dir = repo({ 'a.md': `${SENTINEL}\n` })
  assert.equal(run(dir, '--staged').code, 0)
  clean(dir)
})

test('--staged sees a symlink replaced by a regular file', () => {
  /* The other finding on haus#145. git reports this as T, and the filter was
     ACMR, so the new contents were never read and a blocked name in them went
     through the gate untouched. */
  const dir = repo({ 'a.md': 'Clean.\n' })
  symlinkSync('a.md', join(dir, 'link.md'))
  git(dir, 'add', '-A')
  git(dir, 'commit', '-q', '-m', 'init')

  unlinkSync(join(dir, 'link.md'))
  writeFileSync(join(dir, 'link.md'), `${SENTINEL}\n`)
  git(dir, 'add', 'link.md')

  assert.match(git(dir, 'diff', '--cached', '--name-status'), /^T\s/m, 'git should call this a type change')
  const { code, out } = run(dir, '--staged')
  assert.equal(code, 1)
  assert.match(out, /link\.md:1/)
  clean(dir)
})

// --------------------------------------------- commit messages and identity

test('--message reads the commit message file', () => {
  const dir = repo({ 'msg.txt': `Thanks to ${SENTINEL} for this.\n` })
  const { code, out } = run(dir, '--message', join(dir, 'msg.txt'))
  assert.equal(code, 1)
  assert.match(out, /commit message:1/)
  clean(dir)
})

test('--message passes a clean message', () => {
  const dir = repo({ 'msg.txt': 'Fix the thing.\n' })
  assert.equal(run(dir, '--message', join(dir, 'msg.txt')).code, 0)
  clean(dir)
})

test('the configured identity is checked, so a name cannot arrive as an author', () => {
  const dir = repo({ 'a.md': 'Clean.\n' })
  git(dir, 'config', 'user.name', SENTINEL)
  const { code, out } = run(dir, '--staged')
  assert.equal(code, 1)
  assert.match(out, /author identity/)
  assert.match(out, /committer identity/)
  clean(dir)
})

test('the history pass reads commit messages', () => {
  const dir = repo({ 'a.md': 'Clean.\n' })
  git(dir, 'add', 'a.md')
  git(dir, 'commit', '-q', '-m', `Credit to ${SENTINEL}`)
  const { code, out } = run(dir)
  assert.equal(code, 1)
  assert.match(out, /history/)
  clean(dir)
})

test('the history pass does not read historical file contents', () => {
  /* Documented limit rather than a defect, and the README says so. `git log`
     is formatted with %B and the identities, so a name that existed only in a
     since-changed version of a file is not reported. A test pins the claim so
     the README and the script cannot drift apart. */
  const dir = repo({ 'a.md': `${SENTINEL}\n` })
  git(dir, 'add', 'a.md')
  git(dir, 'commit', '-q', '-m', 'init')
  writeFileSync(join(dir, 'a.md'), 'Clean now.\n')
  git(dir, 'add', 'a.md')
  git(dir, 'commit', '-q', '-m', 'clean it')

  const { code, out } = run(dir)
  assert.equal(code, 0, out)
  clean(dir)
})

test('a repo with no commits does not crash the history pass', () => {
  const dir = repo({ 'a.md': 'Clean.\n' })
  const { code, out } = run(dir)
  assert.equal(code, 0, out)
  clean(dir)
})
