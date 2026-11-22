#!/usr/bin/env node
// Fails when a blocked personal or employer name appears in the repository.
//
// The blocked words are stored as SHA-256 hashes so that the list itself does
// not publish the names it protects. Every word in the scanned text is
// lowercased, hashed and looked up; a match prints the file and line but never
// the word.
//
// Rescued from nimki on 2026-11-23, which was the only repo that had it, and
// which is being deleted. Every public repo should run it.
//
// Usage:
//   hipuku-check-names                 files on disk, and every commit
//                                      message and identity in the history
//   hipuku-check-names --staged        files staged for commit, plus identity
//   hipuku-check-names --message FILE  a commit message, plus identity
//
// Files are listed with `git ls-files --cached --others --exclude-standard`, so
// a new file is checked before it is ever added. Runs from the current working
// directory, so it checks the repo that calls it.

import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

/* The words are stored only as hashes, which is the point of the whole design:
   the list does not publish the names it protects. It also means a test cannot
   write a blocked word in order to check that it is caught, so without a seam
   the matching itself is the one part of this script that cannot be tested.

   This is that seam, and it is named for what it is rather than offered as
   configuration. The suite puts the hash of a harmless sentinel word here and
   asserts both that the word is found and that it is never printed. A repo that
   genuinely wants to block a further name should get a package.json key and a
   decision record, not an environment variable set in CI. */
const TEST_HASHES = (process.env.HIPUKU_NAMES_TEST_HASHES ?? '')
  .split(',')
  .map(h => h.trim().toLowerCase())
  .filter(Boolean)

const BLOCKED = new Set([
  'd7a98e7d5ce496e71555c4599b1f613b2e5fbc16c52586d5f951ce1fe993e0de',
  '891b6b5e36a41a89930df5c8b68eb5b339271c327e5da736b5b7a1f528f4808e',
  'b1fca1e43b68200b66ecdbd4cab9d6d80f6d0f55d480db6e8d27ac1c876d7edb',
  '5e32cab3fba457f8fe24614ee789967cb011cbb50783f37f21c514673d0543a2',
  'bca6cc053dd0e20c7c4b71d0e46e1994b9d45250f35a2b65a5f2fd1b7423f04e',
  ...TEST_HASHES,
])

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })

const hash = word => createHash('sha256').update(word).digest('hex')

/* Data files whose words are not anybody's prose. A list of 31,900 colour names
   contains most of the English language, so a collision with a blocked word is
   certain and means nothing: found on 2026-11-23, when this check first ran in
   haus and stopped on packages/colour-names. Skipping the file is right, and
   skipping by default is not: the repo says which of its files are data.

   Plain paths, not patterns, for the reason check-prose.mjs records: the first
   version built a regular expression from the option and CodeQL flagged the
   injection. A value is an exact repo-relative path, or a directory when it
   ends in a slash.

     "hipuku": { "names": { "skip": ["packages/colour-names/src/"] } }  */
/* node_modules, always, and not negotiable per repo. Every real repo gitignores
   it, so `--exclude-standard` drops it and this never fires there. A repo
   without a .gitignore is not hypothetical though, and check-prose.mjs already
   carries this pattern for exactly that reason. This script did not, which is
   the sort of gap that opens when two checks are written as a pair and only one
   of them learns something: found on 2026-11-23 while giving this file its
   first test suite, with a dependency's own source triggering the check. */
const NEVER = /(^|\/)node_modules\//

const skipped = (() => {
  const fromFlag = process.argv.filter((a, i) => process.argv[i - 1] === '--skip')
  let fromPkg = []
  try {
    fromPkg = JSON.parse(readFileSync('package.json', 'utf8')).hipuku?.names?.skip ?? []
  } catch {
    /* no package.json, or no key */
  }
  const all = [...fromFlag, ...fromPkg]
  const exact = new Set(all.filter(p => !p.endsWith('/')))
  const dirs = all.filter(p => p.endsWith('/'))
  return path => NEVER.test(path) || exact.has(path) || dirs.some(d => path.startsWith(d))
})()

const findings = []

function scan(text, where) {
  text.split('\n').forEach((line, index) => {
    for (const word of line.toLowerCase().match(/[a-z0-9]+/g) ?? []) {
      if (BLOCKED.has(hash(word))) {
        findings.push(`${where}:${index + 1}`)
        return
      }
    }
  })
}

function scanFile(path, read) {
  const buffer = read(path)
  if (buffer.includes(0)) return // binary
  scan(buffer.toString('utf8'), path)
}

function scanIdentity() {
  scan(git('var', 'GIT_AUTHOR_IDENT'), 'author identity')
  scan(git('var', 'GIT_COMMITTER_IDENT'), 'committer identity')
}

const args = process.argv.slice(2)

if (args[0] === '--message') {
  scan(readFileSync(args[1], 'utf8'), 'commit message')
  scanIdentity()
} else if (args[0] === '--staged') {
  // ACMR plus T. A tracked symlink replaced by a regular file is a type
  // change, and without T its new contents are never read.
  const staged = git('diff', '--cached', '--name-only', '--diff-filter=ACMRT', '-z').split('\0').filter(Boolean)
  for (const path of staged) {
    if (skipped(path)) continue
    scanFile(path, p => execFileSync('git', ['show', `:${p}`], { maxBuffer: 64 * 1024 * 1024 }))
  }
  scanIdentity()
} else {
  const files = git('ls-files', '--cached', '--others', '--exclude-standard', '-z').split('\0').filter(Boolean)
  for (const path of files) {
    if (skipped(path)) continue
    try {
      scanFile(path, p => readFileSync(p))
    } catch (error) {
      // ENOENT: deleted but not yet staged. EISDIR: a submodule, which
      // `ls-files --cached` lists as a gitlink and which has no contents to
      // read from this repo. check-prose.mjs skips the same entries by stat.
      if (error.code !== 'ENOENT' && error.code !== 'EISDIR') throw error
    }
  }
  // Commit messages and every author and committer name and email.
  const hasCommits = (() => {
    try {
      execFileSync('git', ['rev-parse', '--verify', '--quiet', 'HEAD'], { stdio: 'ignore' })
      return true
    } catch {
      return false
    }
  })()
  if (hasCommits) {
    scan(git('log', '--all', '--format=%H %an <%ae> %cn <%ce>%n%B'), 'history')
  }
}

if (findings.length > 0) {
  console.error('Blocked name found. Remove it before committing:')
  for (const where of findings) console.error(`  ${where}`)
  process.exit(1)
}
console.log('Names check passed.')
