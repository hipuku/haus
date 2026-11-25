import { readFileSync } from 'node:fs'
import path from 'node:path'

/*
 * A package's name, version and source, as one quiet line under the page's
 * introduction, read from its package.json at build time so the version on
 * the page is the one released. All six are on npm under these names.
 */
const read = (dir: string) =>
  JSON.parse(readFileSync(path.resolve(process.cwd(), '../../packages', dir, 'package.json'), 'utf8')) as {
    name: string
    version: string
  }

export function PackageMeta({ dir }: { dir: string }) {
  const pkg = read(dir)
  return (
    <p className="haus-package-meta">
      <code className="haus-api-name">{pkg.name}</code>
      <span aria-hidden="true"> · </span>
      <span>{pkg.version}</span>
      <span aria-hidden="true"> · </span>
      <a href={`https://github.com/hipuku/haus/tree/main/packages/${dir}`} rel="noreferrer" target="_blank">
        Source on GitHub
      </a>
    </p>
  )
}
