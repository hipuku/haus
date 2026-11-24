import { readFileSync } from 'node:fs'
import path from 'node:path'

/*
 * The brand mark, served from the one file that holds it.
 *
 * `logo.svg` at the root of the repository is the mark: an "h." lettermark
 * whose two colours follow `prefers-color-scheme`, because a file loaded as an
 * image cannot read the page's custom properties. Storybook already serves it,
 * through `staticDirs` in `.storybook/main.ts`, so the two surfaces now show
 * the same tab icon instead of two different ones.
 *
 * A route rather than a copy into `app/icon.svg`: a copied brand asset is a
 * brand asset that goes stale, and this site's whole argument is that a value
 * is read from its source rather than restated.
 */
const mark = readFileSync(path.resolve(process.cwd(), '../../logo.svg'), 'utf8')

export const dynamic = 'force-static'

export function GET() {
  return new Response(mark, {
    headers: {
      'cache-control': 'public, max-age=86400',
      'content-type': 'image/svg+xml',
    },
  })
}
