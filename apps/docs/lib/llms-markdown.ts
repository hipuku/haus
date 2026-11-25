import { apiTableSource, type ApiTableProps } from '@/components/api-table'
import { served, registryName } from '@/components/install'

/*
 * The text the llms routes serve is the page's processed MDX, so a component
 * written as JSX reaches an agent as the bare tag: `<ApiTable ... />` with no
 * props listed, `<Install ... />` with no command. These carry what an agent
 * most needs from a component page, so they are written out as markdown here.
 * Any other tag is left as it is.
 *
 * The four tool tags are here for the opposite reason. A tool is a running app
 * and there is no markdown that is the same thing, so the tag becomes a line
 * saying where it runs rather than reaching an agent as `<InspectColour />`,
 * which reads as a component the page forgot to render.
 */
const TOOLS = ['InspectColour', 'CompareColours', 'PaletteAnalysis', 'ConverterWorkspace'] as const

const attributes = (tag: string) =>
  Object.fromEntries([...tag.matchAll(/(\w+)="([^"]*)"/g)].map(([, key, value]) => [key, value]))

const cell = (text: string) =>
  text
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/\s*\n\s*/g, ' ')
    .trim()

async function apiTable(props: ApiTableProps) {
  const { generator, basePath, props: table } = apiTableSource(props)
  const [doc] = await generator.generateTypeTable(table, { basePath })
  if (!doc?.entries.length) return 'No props beyond the element’s own attributes.'
  return [
    '| Prop | Type | Required | Description |',
    '| ---- | ---- | -------- | ----------- |',
    ...doc.entries.map(
      entry =>
        `| \`${entry.name}\` | \`${cell(entry.type)}\` | ${entry.required ? 'yes' : 'no'} | ${cell(entry.description)} |`,
    ),
  ].join('\n')
}

function install(name: string) {
  const item = registryName(name)
  return served.has(item)
    ? `\`\`\`bash\nnpx shadcn add @hipuku/${item}\n\`\`\``
    : 'Not in the registry yet, so there is no command to run.'
}

export async function toMarkdown(text: string, url: string) {
  const replacements = await Promise.all(
    [
      ...text.matchAll(
        new RegExp(`<(ApiTable|Install|ComponentExamples|${TOOLS.join('|')})\\b(?:"[^"]*"|[^>"])*\\/>`, 'g'),
      ),
    ].map(async ([tag, kind]) => {
      const props = attributes(tag)
      if (kind === 'Install') return [tag, install(props.name)] as const
      if (kind === 'ComponentExamples') return [tag, `Live examples are on the page: ${url}`] as const
      if (TOOLS.includes(kind as (typeof TOOLS)[number])) {
        return [tag, `The tool runs on the page itself: ${url}`] as const
      }
      return [tag, await apiTable(props as ApiTableProps)] as const
    }),
  )
  return replacements.reduce((out, [tag, markdown]) => out.replace(tag, markdown), text)
}
