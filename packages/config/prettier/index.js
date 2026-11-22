/**
 * The hipuku Prettier base: 100 columns, Prettier's own defaults otherwise.
 *
 * Two styles are in use across the repos as of 2026-11-23 and neither is
 * wrong. drift, core, kern and drift-tests set only `printWidth: 100`, which is
 * this file. haus and vault also drop semicolons and use single quotes, which
 * is `./wide.js`. maple and tokenise set nothing at all.
 *
 * They are kept apart rather than merged because switching a repo from one to
 * the other reformats every file it has, which buries the next real diff. A
 * repo adopts the preset that matches what it already does, and converging on
 * one is a separate decision with its own pull request.
 */
export default {
  printWidth: 100,
}
