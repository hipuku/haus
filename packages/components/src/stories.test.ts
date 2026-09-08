import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Every component has a Storybook story.
 *
 * `IconButton` and `Listbox` shipped in 2.1.0 with none, and nothing reported
 * it: the stories directory is a list beside a components directory, and the
 * two had been kept in step by hand for nineteen components until they were
 * not.
 *
 * Same shape as `barrel.test.ts` and the same fix: **read both directories**. A
 * check with a hardcoded list of component names would be the third copy of the
 * thing that keeps going wrong.
 *
 * The story file is named for the component with one deliberate exception,
 * `RadioGroup.stories.tsx` for `Radio`, which is recorded below rather than
 * worked around silently.
 */

const COMPONENTS = join(process.cwd(), 'src', 'components')
const STORIES = join(process.cwd(), '..', '..', 'apps', 'storybook', 'stories', 'components')

/** Component directory name -> story file basename, where they differ. */
const RENAMED: Record<string, string> = {
  // The component is `Radio` and the story is `RadioGroup`, because the
  // component renders a whole group from `options` rather than one input.
  Radio: 'RadioGroup',
}

const dirs = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .filter(d => existsSync(join(COMPONENTS, d.name, `${d.name}.tsx`)))
  .map(d => d.name)

describe('every component has a story', () => {
  it.skipIf(!existsSync(STORIES))('the stories directory covers the components directory', () => {
    const stories = new Set(
      readdirSync(STORIES)
        .filter(f => f.endsWith('.stories.tsx'))
        .map(f => f.replace('.stories.tsx', '')),
    )
    const missing = dirs.filter(d => !stories.has(RENAMED[d] ?? d))
    expect(missing, `no story for: ${missing.join(', ')}`).toEqual([])
  })

  it.skipIf(!existsSync(STORIES))('no story names a component that no longer exists', () => {
    // The other direction, which is how a story outlives a deletion.
    const known = new Set(dirs.map(d => RENAMED[d] ?? d))
    const orphans = readdirSync(STORIES)
      .filter(f => f.endsWith('.stories.tsx'))
      .map(f => f.replace('.stories.tsx', ''))
      .filter(name => !known.has(name))
    expect(orphans, `story with no component: ${orphans.join(', ')}`).toEqual([])
  })
})
