import { createGenerator } from 'fumadocs-typescript'
import path from 'node:path'
import { withInlineCode } from './api-table'

const generator = createGenerator()

const packagesDir = path.resolve(process.cwd(), '../../packages')

/**
 * A package's exports as a plain table, as a component's props are drawn: the
 * export, its signature, and the first paragraph of its doc comment, which is
 * what it does. The rest of a long comment is the reference, linked from the
 * page. Generated from the entry file, so the table is whatever the entry
 * actually exports; type-only exports have no value and do not appear.
 */
export async function ModuleApi({ file }: { file: string }) {
  const base = path.posix.basename(file).replace(/\.ts$/, '.js')
  const [doc] = await generator.generateTypeTable(
    { path: file, name: 'Api', type: `typeof import('./${base}')` },
    { basePath: packagesDir },
  )
  const entries = doc?.entries ?? []
  if (!entries.length) return null
  const lead = (text: string) =>
    text
      .split(/\n\s*\n/)[0]
      .replace(/\s*\n\s*/g, ' ')
      .trim()
  const described = entries.some(entry => entry.description)

  return (
    <table className="haus-api">
      <thead>
        <tr>
          <th>Export</th>
          <th>Signature</th>
          {described && <th>Description</th>}
        </tr>
      </thead>
      <tbody>
        {entries.map(entry => (
          <tr key={entry.name}>
            <td>
              <code className="haus-api-name">{entry.name}</code>
            </td>
            <td>
              <code className="haus-api-type haus-api-signature">{entry.type}</code>
            </td>
            {described && <td>{withInlineCode(lead(entry.description))}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
