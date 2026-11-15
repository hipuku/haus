/* The Figma parity check.

     pnpm run figma:check                       compare, print, exit 1 if failing
     pnpm run figma:check --report out.md       also write the markdown report
     pnpm run figma:check --json out.json       also write the findings
     pnpm run figma:check --compact             known drift as a count (for pull requests)
     pnpm run figma:accept                      accept every current pair as the baseline
     pnpm run figma:accept "axis Popover.align" accept one item
     pnpm run figma:check --refresh             save live components into the snapshot
     pnpm run figma:check --plugin-code         print the export code to run in Figma
     pnpm run figma:check --save out.json       store that code's result as the snapshot

   With FIGMA_TOKEN set, components are read live from the REST API; without it,
   everything comes from figma/snapshot/haus.json. Variables always come from the
   snapshot (see rest.mjs). FIGMA_LATER=1 is the `figma-later` waiver. */

import fs from 'fs'
import { FIGMA_FILE, PATHS } from './config.mjs'
import { codeItems } from './code.mjs'
import { figmaItems } from './normalise.mjs'
import { diff, accept, applyExceptions } from './diff.mjs'
import { report } from './report.mjs'
import { FigmaUnavailable, fetchComponents } from './rest.mjs'
import { pluginCode } from './plugin-export.mjs'

const args = process.argv.slice(2)
const flag = name => args.includes(name)
const option = name => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined)

const token = flag('--offline') ? undefined : process.env.FIGMA_TOKEN
const figmaLater = /^(1|true)$/i.test(process.env.FIGMA_LATER ?? '')

function readSnapshot() {
  if (!fs.existsSync(PATHS.snapshot))
    throw new Error(`No snapshot at ${PATHS.snapshot}. Export it with the code from --plugin-code.`)
  return JSON.parse(fs.readFileSync(PATHS.snapshot, 'utf8'))
}
const writeJson = (p, data) => fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n')

async function figmaSide() {
  const warnings = []
  const snapshot = readSnapshot()
  const day = snapshot.exportedAt.slice(0, 10)
  let components = snapshot.components
  let source = 'the snapshot'
  let isLive = false
  let variablesFresh = false

  if (token) {
    try {
      const live = await fetchComponents(FIGMA_FILE.key, token)
      components = live.components
      isLive = true
      // The same response the components came from, so the two cannot disagree.
      variablesFresh = new Date(live.file.lastModified) <= new Date(snapshot.exportedAt)
      if (!variablesFresh) {
        warnings.push(
          `The variables snapshot was exported ${snapshot.exportedAt} and the file changed ${live.file.lastModified}. ` +
            'Variables were compared against the snapshot; re-export it to compare the current file.',
        )
      }
      source = 'the REST API for components, the snapshot for variables'
      if (flag('--refresh')) {
        writeJson(PATHS.snapshot, { ...snapshot, componentsAt: new Date().toISOString(), components })
      }
    } catch (e) {
      if (!(e instanceof FigmaUnavailable) || flag('--refresh')) throw e
      const why = e.status ? `HTTP ${e.status}` : 'unreachable'
      warnings.push(
        `Figma could not be read (${why}), so components were compared from the snapshot of ${day}. ` +
          'Re-run the check once Figma answers to compare live data.',
      )
      source = 'the snapshot, because the REST API could not be reached'
    }
  } else {
    warnings.push(`No FIGMA_TOKEN, so Figma was read from the committed snapshot (${day}).`)
  }
  return {
    items: figmaItems({ variables: snapshot.variables, components }),
    warnings,
    source,
    live: isLive,
    variablesFresh,
  }
}

async function main() {
  if (flag('--plugin-code')) {
    process.stdout.write(pluginCode())
    return
  }
  if (flag('--save')) {
    const exported = JSON.parse(fs.readFileSync(option('--save'), 'utf8'))
    writeJson(PATHS.snapshot, {
      // The capture time, not the save time: Figma may have changed in between.
      exportedAt: exported.capturedAt ?? new Date().toISOString(),
      source: 'plugin',
      file: FIGMA_FILE,
      variables: exported.variables,
      components: exported.components,
    })
    console.log(`Saved ${PATHS.snapshot}.`)
    return
  }

  const read = p => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {})
  const exceptions = read(PATHS.exceptions).items ?? {}
  const side = await figmaSide()
  const { warnings, source, live, variablesFresh } = side
  const { code, figma, baseline, stale } = applyExceptions({
    code: codeItems(),
    figma: side.items,
    baseline: read(PATHS.baseline).items ?? {},
    exceptions,
  })
  for (const key of stale) {
    warnings.push(`The exception for \`${key}\` is no longer needed: remove it from ${PATHS.exceptions}.`)
  }

  if (flag('--accept')) {
    const keys = args.filter(a => !a.startsWith('--'))
    const items = accept({ code, figma, baseline, keys })
    writeJson(PATHS.baseline, { acceptedAt: new Date().toISOString(), items })
    console.log(
      `Baseline updated: ${keys.length ? keys.join(', ') : 'every item'} (${Object.keys(items).length} items).`,
    )
    return
  }

  const result = diff({ code, figma, baseline, figmaLater })
  const md = report({
    ...result,
    warnings,
    figmaLater,
    source,
    compact: flag('--compact'),
    exceptions: Object.keys(exceptions).length,
  })
  process.stdout.write(md)
  if (option('--report')) fs.writeFileSync(option('--report'), md)
  // `live` says whether components came from Figma itself, and `variablesFresh`
  // whether the variables snapshot is as new as the file. issues.mjs uses both.
  if (option('--json')) writeJson(option('--json'), { ...result, warnings, live, variablesFresh })
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md)
  if (result.failing.length) process.exitCode = 1
}

main().catch(err => {
  console.error(err.message)
  process.exitCode = 2
})
