import { readFileSync } from 'node:fs'
import path from 'node:path'
import { Converter, type Example } from './converter'

/*
 * The converter's examples are the package's own test fixtures, one per input
 * format, read at build time: inputs the engine is tested against, each
 * chosen to show a different kind of loss, rather than samples written for
 * the page that nothing checks.
 */
const fixtures = path.resolve(process.cwd(), '../../packages/dtcg/src/fixtures')
const file = (name: string) => ({ name, text: readFileSync(path.join(fixtures, name), 'utf8') })

const EXAMPLES: Example[] = [
  { id: 'dtcg', label: 'DTCG, light and dark', files: [file('modes.dtcg.json')], target: 'tailwind' },
  {
    id: 'figma',
    label: 'Figma variables, two mode files',
    files: [file('figma-Light.tokens.json'), file('figma-Dark.tokens.json')],
    target: 'tailwind',
  },
  {
    id: 'tokens-studio',
    label: 'Tokens Studio, sets and themes',
    files: [file('tokens-studio.json')],
    target: 'figma',
  },
  { id: 'tailwind', label: 'Tailwind v4 stylesheet', files: [file('theme.css')], target: 'figma' },
]

export function ConverterWorkspace() {
  return <Converter examples={EXAMPLES} />
}
