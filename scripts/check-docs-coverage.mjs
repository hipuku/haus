#!/usr/bin/env node
// Every component the registry ships has a docs page. Fails naming each one
// that does not.
//
// Keyed off registry.json rather than packages/components, because a
// component is shipped when it is a registry item, and 19 of the 20 in the
// package are not yet. A separate list of "components still to document"
// would be a second list beside a directory, which is the drift this repo
// already has a test for (barrel.test.ts).

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** The registry items of type registry:ui with no page under `pagesDir`. */
export function findUndocumented(root, pagesDir = 'apps/docs/content/docs/components') {
  const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'))
  return registry.items
    .filter(item => item.type === 'registry:ui')
    .map(item => item.name)
    .filter(name => !existsSync(join(root, pagesDir, `${name}.mdx`)))
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const missing = findUndocumented(process.cwd())
  if (missing.length) {
    console.error('These registry items have no docs page:\n')
    for (const name of missing) console.error(`  ${name}: add apps/docs/content/docs/components/${name}.mdx`)
    process.exit(1)
  }
  console.log('Every registry component has a docs page.')
}
