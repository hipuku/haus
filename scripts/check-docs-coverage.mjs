#!/usr/bin/env node
// Every component the registry ships, and every package in packages/, has a
// docs page. Fails naming each one that does not.
//
// Keyed off registry.json rather than packages/components, because a
// component is shipped when it is a registry item, and 19 of the 20 in the
// package are not yet. A separate list of "components still to document"
// would be a second list beside a directory, which is the drift this repo
// already has a test for (barrel.test.ts).

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

/** The registry items of type registry:ui with no page under `pagesDir`. */
export function findUndocumented(root, pagesDir = 'apps/docs/content/docs/components') {
  const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'))
  return registry.items
    .filter(item => item.type === 'registry:ui')
    .map(item => item.name)
    .filter(name => !existsSync(join(root, pagesDir, `${name}.mdx`)))
}

/**
 * The packages under packages/ with no page under `pagesDir`, keyed by
 * directory name. packages/components is left out: its components are
 * documented one page per registry item, above.
 */
export function findUndocumentedPackages(root, pagesDir = 'apps/docs/content/docs/packages') {
  return readdirSync(join(root, 'packages'), { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name !== 'components')
    .filter(entry => existsSync(join(root, 'packages', entry.name, 'package.json')))
    .map(entry => entry.name)
    .filter(name => !existsSync(join(root, pagesDir, `${name}.mdx`)))
}

// Compared as URLs: import.meta.url encodes a space as %20 and a hand-built
// `file://` string does not, so in a path with a space the check ran nothing
// and exited 0.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const missing = findUndocumented(process.cwd())
  const packages = findUndocumentedPackages(process.cwd())
  for (const name of missing) console.error(`  ${name}: add apps/docs/content/docs/components/${name}.mdx`)
  for (const name of packages) console.error(`  ${name}: add apps/docs/content/docs/packages/${name}.mdx`)
  if (missing.length || packages.length) {
    console.error('\nEvery registry component and every package needs a docs page.')
    process.exit(1)
  }
  console.log('Every registry component and every package has a docs page.')
}
