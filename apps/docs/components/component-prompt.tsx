import { readFileSync } from 'node:fs'
import path from 'node:path'
import { CopyPrompt } from './copy-prompt'
import { gitConfig } from '@/lib/shared'

const registry = JSON.parse(readFileSync(path.resolve(process.cwd(), '../../registry.json'), 'utf8')) as {
  items: { name: string }[]
}

const served = new Set(registry.items.map(item => item.name))

/*
 * Builds the prompt for one component page, on the server, so the registry is
 * read once at build rather than shipped to the browser.
 */
export function ComponentPrompt({ name, slug, description }: { name: string; slug: string; description?: string }) {
  const source = `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/apps/docs/content/docs/components/${slug}.mdx`

  const install = served.has(slug)
    ? `Install it with \`npx shadcn add @hipuku/${slug}\`, which copies it into my repository as source.`
    : `It is not in the registry yet, so copy it from packages/components/src/components/${name} in the haus repository rather than installing it.`

  const prompt = [
    `I am working with the haus design system's ${name} component.${description ? ` ${description}` : ''}`,
    '',
    install,
    `Its documentation, including the full prop table and the reasons it behaves the way it does, is at ${source}.`,
    '',
    'Rules that apply to every haus component:',
    '- Read semantic token roles. Never write a colour, length, duration, radius or z-index as a literal: use the matching `--haus-*` custom property. A literal fails the stylelint gate.',
    '- `variant` is visual weight, `tone` is meaning (neutral, info, success, warning, error), `appearance` is subtle or solid, and `size` is sm, md or lg. Do not combine them into one prop.',
    '- The component renders its own label, hint and error where it has them. Do not re-implement those or wire the accessibility by hand.',
    '- Do not hardcode light or dark values. Dark is the same roles with a second colour map, applied by `data-theme` on the root.',
  ].join('\n')

  return <CopyPrompt prompt={prompt} />
}
