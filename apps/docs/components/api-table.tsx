import { createGenerator } from 'fumadocs-typescript'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const generator = createGenerator()

const componentsSrc = path.resolve(process.cwd(), '../../packages/components/src')

/** Every key of the attribute set, less the ones the component redefines. */
const keys = (attributes: string, kept?: string) =>
  kept ? `Exclude<keyof ${attributes}, ${kept}>` : `keyof ${attributes}`

export type ApiTableProps = {
  file: string
  name: string
  element?: string
  /**
   * The attribute set to leave out, when the component extends more than
   * `HTMLAttributes`. A button also has `disabled`, `form` and `formAction`
   * from `ButtonHTMLAttributes`, and listing those as the component's API
   * buries the four props that are.
   */
  attributes?: string
  /**
   * Attributes that stay in the table, comma separated, beyond the ones the
   * component's source redefines, which are found without being listed.
   */
  keep?: string
}

/**
 * The attributes a component defines for itself, which stay in the table
 * although they share a name with an HTML attribute. Two ways to do that, and
 * both dropped the prop without a word when the table left the whole attribute
 * set out:
 *
 * - taken out and redefined, `Omit<React.HTMLAttributes<HTMLDivElement>,
 *   'onChange'>`: Select's required `onChange`, Tooltip's `content`
 * - narrowed in place, `title: string` over the attribute's `title?: string`:
 *   EmptyState's required `title`
 *
 * So the keys named in an `Omit` of an attribute set, and every key declared
 * in an interface or object type in the file. A key that is not in the props
 * type adds no row, so over-collecting costs nothing.
 */
function redefined(file: string) {
  const source = readFileSync(path.join(componentsSrc, file), 'utf8')
  const omitted = [...source.matchAll(/Omit<\s*React\.\w*Attributes<\w+>\s*,([^>]+)>/g)].flatMap(([, keys]) =>
    [...keys.matchAll(/'([^']+)'/g)].map(([, key]) => key),
  )
  const declared = [...source.matchAll(/(?:interface\s+\w+[^{]*|=\s*)\{([^{}]*)\}/g)].flatMap(([, body]) =>
    [...body.matchAll(/^\s*(?:readonly\s+)?'?([\w-]+)'?\??:/gm)].map(([, key]) => key),
  )
  return [...omitted, ...declared]
}

/**
 * What the table is generated from. Shared with the markdown the llms routes
 * serve, so the page and the text an agent reads list the same props.
 */
export function apiTableSource({ file, name, element = 'HTMLElement', attributes, keep }: ApiTableProps) {
  const kept = [...new Set([...(keep?.split(',').map(attribute => attribute.trim()) ?? []), ...redefined(file)])]
    .map(attribute => `'${attribute}'`)
    .join(' | ')
  return {
    generator,
    basePath: componentsSrc,
    props: {
      path: file,
      name: 'Api',
      type: `Omit<${name}, ${keys(attributes ?? `React.HTMLAttributes<${element}>`, kept)}>`,
    },
  }
}

/**
 * The props a component adds, generated from its source. The element's own
 * HTML attributes are left out because they are standard and would bury the
 * few props that are the component's API.
 *
 * `file` is relative to packages/components/src. The generator appends the
 * `Omit` below to that file's own source, so it resolves `React` and the
 * props type the way the component does: the file must import React as
 * `React`, which every component in the package does.
 */
/*
 * The props as a plain table, from the same generator: the prop, its full
 * type, and what it is for. It is an ordinary table in the page's prose, so it
 * takes the site's table styling, one rule colour and the header row's ground,
 * rather than Fumadocs' card of expandable rows, whose collapsed Type column
 * read "union" until opened.
 */
export async function ApiTable(props: ApiTableProps) {
  const { generator, basePath, props: table } = apiTableSource(props)
  const [doc] = await generator.generateTypeTable(table, { basePath })
  const entries = doc?.entries ?? []
  if (!entries.length) return <p>No props beyond the element’s own attributes.</p>
  const fallbackOf = (entry: (typeof entries)[number]) =>
    entry.tags.find(tag => tag.name === 'default' || tag.name === 'defaultValue')?.text
  // A column with nothing in it is left out rather than drawn empty.
  const described = entries.some(entry => entry.description || fallbackOf(entry))

  return (
    <table className="haus-api">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          {described && <th>Description</th>}
        </tr>
      </thead>
      <tbody>
        {entries.map(entry => {
          const fallback = fallbackOf(entry)
          return (
            <tr key={entry.name}>
              <td>
                <code className="haus-api-name">{entry.name}</code>
                {entry.required && <span className="haus-api-required">required</span>}
              </td>
              <td>
                <code className="haus-api-type">{entry.type.replace(/ \| undefined$/, '')}</code>
              </td>
              {described && (
                <td>
                  {entry.description}
                  {fallback && (
                    <span className="haus-api-default">
                      Default <code className="haus-api-type">{fallback}</code>
                    </span>
                  )}
                </td>
              )}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
