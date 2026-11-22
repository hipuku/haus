/**
 * The hipuku Prettier base as haus and vault write it: 120 columns, no
 * semicolons, single quotes, trailing commas everywhere, bare arrow parameters.
 *
 * `./index.js` has the other style and the reason both exist.
 */
export default {
  semi: false,
  singleQuote: true,
  printWidth: 120,
  trailingComma: 'all',
  arrowParens: 'avoid',
}
