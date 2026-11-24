import { readFileSync } from 'node:fs'
import path from 'node:path'

/*
 * The haus wordmark, inlined rather than linked.
 *
 * `wordmark.svg` at the root of the repository carries its own `<style>` with
 * a `prefers-color-scheme` query, because a file loaded as an image cannot
 * read the page's custom properties. That is right for a favicon and wrong
 * here: this site has a mode toggle, so a reader on a dark operating system
 * who picks light would have got a wordmark drawn for the other mode.
 *
 * Inlining puts the paths in the document, where the stylesheet can reach
 * them. The classes the file already uses, `mark` and `accent`, are given the
 * roles they stand for, scoped so they cannot touch anything else on the page,
 * and the roles answer to `data-theme` like every other colour here.
 */
const wordmark = readFileSync(path.resolve(process.cwd(), '../../wordmark.svg'), 'utf8')
  .replace(/<style>[\s\S]*?<\/style>/g, '')
  // The file's own width and height would win over the stylesheet.
  .replace(/\s(width|height)="[^"]*"/g, '')

export function Wordmark() {
  return <span aria-label="haus" className="haus-wordmark" dangerouslySetInnerHTML={{ __html: wordmark }} role="img" />
}
