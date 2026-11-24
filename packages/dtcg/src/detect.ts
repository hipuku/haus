import { isRecord, parseJson, type InputDocument } from './document.js'
import { isResolverDocument } from './dtcgRead.js'
import { hasFigmaExtensions } from './figma.js'
import { looksLikeTailwind } from './tailwind.js'
import { looksLikeTokensStudio } from './tokensStudio.js'
import { ReadError, type FormatId } from './types.js'

/**
 * Which format the input is, from its shape. Order matters: Figma's export is
 * valid DTCG, so the Figma extensions are checked before plain DTCG, and a
 * Tokens Studio file in W3C mode also has `$value`, so its own markers come
 * before DTCG as well.
 */
export function detectFormat(documents: readonly InputDocument[]): FormatId {
  const nonEmpty = documents.filter(d => d.text.trim())
  if (!nonEmpty.length) throw new ReadError('There is nothing to read.')

  // Which documents are JSON and which are stylesheets, by their first
  // character. A set that mixes the two is two formats pasted together, and
  // reading it as either one dropped half the input or failed with a JSON
  // parse error about a stylesheet.
  const isJson = (text: string) => /^[[{]/.test(text.trimStart())
  const stylesheets = nonEmpty.filter(d => !isJson(d.text))
  if (stylesheets.length && stylesheets.length !== nonEmpty.length) {
    throw new ReadError(
      `This is a stylesheet and a JSON file together (${stylesheets.map(d => d.name).join(', ')} against ${nonEmpty
        .filter(d => isJson(d.text))
        .map(d => d.name)
        .join(', ')}). Convert one format at a time.`,
    )
  }
  if (stylesheets.length) {
    if (nonEmpty.every(d => looksLikeTailwind(d.text))) return 'tailwind'
    throw new ReadError('This is neither JSON nor a stylesheet with custom properties.')
  }

  const parsed = nonEmpty.map(parseJson)
  if (parsed.some(isResolverDocument)) return 'dtcg'
  if (parsed.some(hasFigmaExtensions)) return 'figma'
  if (parsed.some(looksLikeTokensStudio) || nonEmpty.some(d => /^\$(themes|metadata)(\.json)?$/.test(d.name))) {
    return 'tokens-studio'
  }
  if (parsed.some(json => isRecord(json) && JSON.stringify(json).includes('"$value"'))) return 'dtcg'
  throw new ReadError('No tokens found: no $value, value or custom property declarations.')
}
