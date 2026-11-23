import { createGenerator } from 'fumadocs-typescript'
import { AutoTypeTable } from 'fumadocs-typescript/ui'
import path from 'node:path'

const generator = createGenerator()

const packagesDir = path.resolve(process.cwd(), '../../packages')

/**
 * A package's exports with their signatures and doc comments, generated from
 * its entry file. `file` is relative to packages/, such as `colour/src/index.ts`.
 * The generator appends `typeof import()` of the file to the file's own source,
 * so the table is whatever the entry actually exports. Type-only exports have no
 * value and do not appear.
 */
export function ModuleApi({ file }: { file: string }) {
  const base = path.posix.basename(file).replace(/\.ts$/, '.js')
  return (
    <AutoTypeTable
      generator={generator}
      options={{ basePath: packagesDir }}
      path={file}
      name="Api"
      type={`typeof import('./${base}')`}
    />
  )
}
